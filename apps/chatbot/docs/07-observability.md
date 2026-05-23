# 07 — Observability

> All source paths below are relative to `apps/chatbot/` (so `chatbot/observability/metrics.py` lives on disk at `apps/chatbot/chatbot/observability/metrics.py`).

---

## 1. Structured logging

**Source:** `chatbot/observability/logger.py`

All log output is JSON on stdout, produced by [structlog](https://www.structlog.org/).
`configure_logging(level)` (called at `chatbot/main.py:49`) wires two things:

- **stdlib `logging`** is routed to stdout with `%(message)s` format so third-party
  libraries that use `logging` also appear in the same stream.
- **structlog** is configured with the following processor chain:

| Order | Processor | Effect |
|-------|-----------|--------|
| 1 | `merge_contextvars` | Merges `structlog.contextvars` thread-local/context vars (e.g. `trace_id`, `node`, `latency_ms`, `tokens_in`, `tokens_out` bound upstream per-request) |
| 2 | `add_log_level` | Adds `"level"` field |
| 3 | `TimeStamper(fmt="iso")` | Adds ISO-8601 `"timestamp"` field |
| 4 | `JSONRenderer` | Serialises to a single JSON object per line |

**`LOG_LEVEL` wiring:** `Settings.log_level` (env var `LOG_LEVEL`, default `"INFO"`) is
read in `create_app()` and forwarded to `configure_logging(settings.log_level)` at
`chatbot/main.py:49`. Both the stdlib `basicConfig` level and the structlog
`make_filtering_bound_logger` level are set to this value.

Call-site fields such as `trace_id`, `node`, `latency_ms`, `tokens_in`, and `tokens_out`
are bound via `structlog.contextvars.bind_contextvars(...)` inside nodes/handlers and are
merged automatically into every log line emitted within that context.

---

## 2. OTel tracing

**Source:** `chatbot/observability/tracing.py`

`configure_tracing(service_name="chatbot")` is called at `chatbot/main.py:50`, immediately
after logging is configured.

**What it does:**

1. Reads `OTEL_EXPORTER_OTLP_ENDPOINT` directly from the process environment
   (`os.environ.get("OTEL_EXPORTER_OTLP_ENDPOINT")`).
2. If the variable is **not set**, the function returns immediately — tracing is a no-op
   and no `TracerProvider` is registered.
3. If the variable **is set**, it:
   - Creates a `TracerProvider` with `Resource({"service.name": service_name})`.
   - Attaches a `BatchSpanProcessor` backed by `OTLPSpanExporter(endpoint=endpoint)`.
   - Installs the provider globally via `trace.set_tracer_provider(provider)`.

**Configuration:** Set the env var `OTEL_EXPORTER_OTLP_ENDPOINT` (e.g.
`http://otel-collector:4318/v1/traces`) to enable export.  
`Settings.otel_endpoint` (same env var, via pydantic-settings) provides the same value
but `configure_tracing()` reads the env directly rather than through `Settings`.

**Span emission:** There are no manual `tracer().start_as_current_span()` calls in the
current codebase. Any span data depends on auto-instrumentation middleware added at
deployment time (e.g. `opentelemetry-instrumentation-fastapi`). The `tracer()` helper in
`tracing.py` is exported for future use.

---

## 3. Prometheus metrics

**Source:** `chatbot/observability/metrics.py`

All metrics are registered on a private `CollectorRegistry` (not the default global one)
to avoid test pollution. `metrics_registry()` returns it.

### Exported helpers

| Helper function | Prometheus metric name | Type | Labels | What it measures |
|---|---|---|---|---|
| `record_request(intent, outcome)` | `chatbot_request_total` | Counter | `intent`, `outcome` | One increment per completed `/chat` call |
| `record_request_duration(intent, ms)` | `chatbot_request_duration_ms` | Histogram | `intent` | End-to-end `/chat` latency (ms) |
| `record_node_duration(node, ms)` | `chatbot_node_duration_ms` | Histogram | `node` | Per-LangGraph-node latency (ms) |
| `record_tokens(model, tokens_in, tokens_out)` | `chatbot_gemini_tokens_total` | Counter | `model`, `direction` (`in`/`out`) | Gemini token consumption, two increments per call |
| `set_budget_remaining(value)` | `chatbot_budget_remaining` | Gauge | _(none)_ | Remaining daily Gemini token budget |
| `record_groundedness(result)` | `chatbot_groundedness_total` | Counter | `result` | Groundedness verdict counts |

> **Note:** `record_node_duration` exists in `metrics.py` but is not called from
> `routes.py` — it is available for individual graph nodes to import and use directly.

### `/metrics` endpoint

Defined at `chatbot/api/routes.py:58–63`:

```python
@router.get("/metrics")
async def metrics() -> Response:
    from prometheus_client import CONTENT_TYPE_LATEST, generate_latest
    body = generate_latest(metrics_registry())
    return Response(content=body, media_type=CONTENT_TYPE_LATEST)
```

Serves `text/plain; version=0.0.4` (the value of `CONTENT_TYPE_LATEST`). No
authentication required.

### Metric calls in `/chat` handler (`routes.py:80–91`)

| Line | Call |
|------|------|
| 83 | `record_groundedness(grounded)` — only if `grounded` is truthy |
| 84 | `record_request(intent=intent, outcome="ok")` |
| 85 | `record_request_duration(intent=intent, ms=elapsed_ms)` |
| 89 | `record_tokens(ctx.pro_model, tokens_in=..., tokens_out=...)` |
| 90 | `set_budget_remaining(await ctx.budget.remaining_today())` |

---

## 4. `chat_log` evaluation substrate

**Source:** `chatbot/db/chat_log_repo.py`

Every successful `/chat` response is persisted to `chatbot.chat_logs` as a `ChatLogRow`.
The row is written at `chatbot/api/routes.py:112–123`.

### `ChatLogRow` fields

| Field | Type | Notes |
|-------|------|-------|
| `trace_id` | `UUID` | Unique identifier for the request |
| `session_id` | `str \| None` | Caller-supplied session grouping |
| `query_redacted` | `str` | PII-scrubbed version of the user query |
| `intent` | `str \| None` | Classified intent from the graph |
| `chunk_ids` | `list[str]` | Source chunk IDs returned to the client |
| `groundedness` | `str \| None` | Groundedness verdict string (or `None`) |
| `latency_ms` | `int` | End-to-end handler latency |
| `tokens_in` | `int` | Gemini input tokens consumed |
| `tokens_out` | `int` | Gemini output tokens consumed |
| `error` | `str \| None` | Error message (always `None` on success path) |
| `feedback` | `str \| None` | Thumbs vote; `None` until feedback endpoint is called |

**Asymmetry — `/chat/stream` does NOT persist a `chat_log` row.** The streaming handler
at `chatbot/api/routes.py:127–168` omits the `ChatLogRepo.insert()` call entirely. This
means feedback and offline evaluation are unavailable for streamed sessions. See
[03-chat-flow.md](03-chat-flow.md) for the full comparison of both paths.

**Purpose:** The table is a substrate for offline evaluation — joining `chunk_ids` with
retrieval quality signals, reviewing groundedness distributions, replaying queries for
regression testing, and attaching human-feedback labels.

---

## 5. Feedback loop

**Source:** `chatbot/db/chat_log_repo.py` (`record_feedback`), `chatbot/api/routes.py:192–197`

`POST /chat/feedback` (protected by `require_internal_hmac`) accepts a `FeedbackRequest`:

```python
class FeedbackRequest(BaseModel):
    trace_id: str
    vote: Literal["up", "down"]
```

The handler at `routes.py:192–197` calls
`ctx.chat_log_repo.record_feedback(UUID(body.trace_id), body.vote)`, which executes:

```sql
UPDATE chatbot.chat_logs SET feedback = $1 WHERE trace_id = $2
```

`record_feedback` returns `True` when one or more rows were updated.  
If no row matches the `trace_id`, the handler raises **HTTP 404** with
`detail="trace_id not found"`.

Valid `vote` values: `"up"` or `"down"`.

---

## 6. See also

- [03-chat-flow.md](03-chat-flow.md) — full `/chat` vs `/chat/stream` path comparison,
  including the `chat_log` asymmetry.
- [06-security.md](06-security.md) — HMAC authentication that protects `/chat/feedback`
  and other internal endpoints.
