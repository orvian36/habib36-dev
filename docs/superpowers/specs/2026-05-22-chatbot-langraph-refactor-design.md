# Chatbot LangGraph Refactor — Design

**Date:** 2026-05-22
**Status:** Approved (awaiting written-spec review)
**Author:** Brainstorming session
**Replaces:** Initial `apps/chatbot` implementation (LiteLLM + sentence-transformers + ChromaDB)

## 1. Context and Goals

The first cut of `apps/chatbot` was a generic multi-provider RAG service. The portfolio needs something narrower and stronger: a production-grade, Gemini-backed agent that answers questions about Habibur, deployed as an internal Docker service that `apps/web` proxies to. This spec defines the refactor.

### Hard requirements (from user)

1. **Integratable with `apps/web`** — Python is the brain; Next.js proxies to it over the internal Docker network.
2. **Production-grade** — HMAC auth, hybrid search, observability, cost budgeting, defensive guardrails, idempotent ingestion, structured logs, healthchecks.
3. **Gemini only** — `google-genai` SDK; no LiteLLM, no other providers.
4. **Google embeddings** — `gemini-embedding-001` (truncated to 768 dims via Matryoshka representation).
5. **Not generic RAG** — LangGraph agent with adaptive + corrective topology (classify → rewrite → retrieve → grade → retry → generate → groundedness → cite → guard).
6. **Proper guardrails & security** — seven-layer defense in depth from edge to log.

### Non-goals

- No user accounts or auth on `/chat`. It is a public portfolio bot; the chat-session JWT is for rate-limit binding, not identity.
- No fine-tuning. Grounding plus retrieval handles personalization.
- No Redis. Rate limits run at the Next.js edge (Upstash REST); budgets and sessions live in Postgres or are stateless.
- No Coolify. Plain Docker / docker-compose only.

### Migration strategy

Full rewrite of `apps/chatbot` from scratch. The package layout, FastAPI app factory pattern, pytest tiering, and Protocol-based DI seams from the first cut are good ideas and are carried over; everything else is replaced.

## 2. Architecture & Data Flow

The chatbot is an internal-only Python service. Public traffic terminates at `apps/web`; only `apps/web` and Payload's `afterChange`/`afterDelete` hooks ever reach the chatbot, both over an internal Docker network with HMAC-signed requests.

```
                       ┌─────────────────────────────────────────┐
[user] ───── HTTPS ───►│ Next.js (apps/web)                       │
                       │  /api/chat (POST, SSE)                   │
                       │   • CSRF + chat-session JWT              │
                       │   • IP rate limit (Upstash)              │
                       │   • optional response cache (Upstash)    │
                       └───────────────┬─────────────────────────┘
                                       │ internal Docker network
                                       │ HMAC-signed
                                       ▼
                       ┌─────────────────────────────────────────┐
                       │ FastAPI (apps/chatbot) :8001 (internal)  │
                       │  POST /chat, /chat/stream                │
                       │  POST /ingest, /chat/feedback            │
                       │  DELETE /documents/{collection}/{slug}   │
                       │  GET  /health, /metrics                  │
                       │                                          │
                       │  ┌────────── LangGraph agent ─────────┐  │
                       │  │ classify → rewrite → retrieve →    │  │
                       │  │ grade → (retry) → generate →       │  │
                       │  │ groundedness → cite → guard →      │  │
                       │  │ respond                            │  │
                       │  └────────────────┬───────────────────┘  │
                       └────────┬──────────┼──────────────────────┘
                                │          │
                ┌───────────────┘          └────────────┐
                ▼                                       ▼
       ┌────────────────────┐                ┌──────────────────────────┐
       │ Google Gemini API   │                │ Postgres (Supabase)      │
       │  • gemini-2.5-pro   │                │  schema: chatbot          │
       │  • gemini-2.5-flash │                │   • chunks (pgvector)    │
       │  • gemini-embedding │                │   • chat_logs            │
       │    -001 (768 dim)   │                │   • usage_budget         │
       └────────────────────┘                │  schema: public (Payload) │
                                              │   • posts, projects, …   │
                                              └──────────────────────────┘
                                                       ▲
                                                       │ afterChange/afterDelete
                                                       │ HMAC-signed POST
                                              ┌────────┴────────┐
                                              │ Payload hooks   │
                                              │ in apps/web     │
                                              └─────────────────┘
```

**Rationale**

- **Internal-only Python** keeps the public attack surface in Node, where the rest of the auth/rate-limit primitives live. The chatbot service has no public domain or exposed port.
- **Single Postgres** removes a service to operate. Payload owns `public`; chatbot owns `chatbot`; a dedicated `chatbot_app` role scopes privileges to the chatbot schema.
- **Stateless agent + stateless API** make horizontal scaling free and remove the need for a session store.
- **Two Gemini tiers** — `gemini-2.5-flash` for cheap classification/grading nodes, `gemini-2.5-pro` only for the answer node. Happy-path cost lands near $0.002 per query; worst case with both retries ~$0.005.

## 3. LangGraph Agent

### State

```python
class AgentState(TypedDict, total=False):
    # input
    query: str
    history: list[Message]
    trace_id: str

    # routing
    intent: Literal["smalltalk", "off_topic", "about_habibur", "tech_concept", "unsafe"]
    is_input_safe: bool

    # retrieval
    search_query: str               # may differ from `query` after rewrite
    hypothetical_doc: str | None    # HyDE expansion
    chunks: list[ScoredChunk]
    chunk_grades: list[Literal["yes", "partial", "no"]]
    retrieval_attempt: int          # 0 or 1, caps the retry

    # generation
    draft: str | None
    groundedness: Literal["grounded", "partial", "ungrounded"] | None
    generation_attempt: int         # 0 or 1, caps the retry
    answer: str
    sources: list[Source]

    # observability
    node_timings_ms: dict[str, float]
    tokens: dict[str, int]
```

### Nodes

| # | Node | Model | Purpose |
|---|---|---|---|
| 1 | `input_guard` | rules only | Length cap, control-char + zero-width strip, heuristic prompt-injection detection (patterns: `ignore previous`, `system:`, `you are now`, `</system>`, `{{`, high-entropy `[A-Za-z0-9_-]{20,}` strings), language detection (English ≥ 0.7 confidence). Failure → `refuse_unsafe`. |
| 2 | `classify_intent` | flash | Routes to `smalltalk` / `off_topic` / `about_habibur` / `tech_concept` / `unsafe`. |
| 3 | `rewrite_query` | flash | Resolves anaphora using history; expands vague queries; produces an optional HyDE hypothetical document used as a second vector during retrieval. |
| 4 | `retrieve` | embeddings | Hybrid search in Postgres: pgvector cosine + `ts_rank` BM25-equivalent fused via Reciprocal Rank Fusion (k=60), top-8. |
| 5 | `grade_chunks` | flash | One batched call: per-chunk relevance label (`yes` / `partial` / `no`). Drops `no` chunks. |
| 6 | `generate_answer` | **pro** | Drafts answer with strict grounding prompt; inline `[n]` citations referencing the numbered context block. |
| 7 | `check_groundedness` | flash | Verifies every claim in the draft maps to a chunk; returns `grounded` / `partial` / `ungrounded`. |
| 8 | `extract_citations` | pure Python | Parses `[n]` markers and dedupes by document → `Source[]`. |
| 9 | `output_guard` | flash + rules | Gemini built-in safety settings + LLM check for system-prompt regurgitation + regex strip of email/phone/CC patterns + 1500-char cap. |
| 10 | `respond` | terminal | Streams tokens (SSE path) or returns full JSON (sync path). |

### Fallback nodes

- `refuse_unsafe` — `"I can't help with that."`
- `refuse_off_topic` — `"I only answer about Habibur. You might be interested in his projects → /projects."`
- `smalltalk_reply` — flash, brief greeting/thanks reply (no retrieval).
- `fallback_no_context` — `"I don't have info on that, but his resume covers his experience: /resume."`

### Edges

```
START
 │
 ▼
input_guard ──unsafe──► refuse_unsafe ──► respond
 │
 ▼
classify_intent ──smalltalk──► smalltalk_reply ──► output_guard ──► respond
 │              ──off_topic──► refuse_off_topic ──► respond
 │
 ▼ (about_habibur | tech_concept)
rewrite_query
 │
 ▼
retrieve ──► grade_chunks
                │
                ├── all "no" & attempt=0 ──► rewrite_query (with hint)
                ├── all "no" & attempt=1 ──► fallback_no_context ──► respond
                └── relevant chunks
                       │
                       ▼
                  generate_answer
                       │
                       ▼
                  check_groundedness
                       │
                       ├── ungrounded & gen_attempt=0 ──► generate_answer (stricter)
                       ├── ungrounded & gen_attempt=1 ──► fallback_no_context ──► respond
                       └── grounded | partial
                              │
                              ▼
                       extract_citations ──► output_guard ──► respond
```

**Retry caps are hard:** one retrieval retry and one generation retry maximum. Worst-case latency is bounded.

### Streaming model

The graph runs in `astream_events` mode for the SSE endpoint. Every node start/end emits an SSE event (`{"event":"node","name":"retrieve","status":"started"}`); only the `generate_answer` node's tokens are streamed verbatim. The JSON endpoint runs the same graph with `ainvoke` and returns the final state.

## 4. Data Model

### Postgres schema (in a dedicated `chatbot` schema, isolated from Payload tables)

```sql
CREATE SCHEMA IF NOT EXISTS chatbot;
CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE IF NOT EXISTS chatbot.chunks (
    id            text PRIMARY KEY,            -- "{collection}:{slug}:{index}"
    collection    text NOT NULL,
    slug          text NOT NULL,
    chunk_index   int  NOT NULL,
    title         text NOT NULL,
    source_type   text NOT NULL,
    url           text,
    content       text NOT NULL,
    embedding     vector(768) NOT NULL,
    tsv           tsvector GENERATED ALWAYS AS (to_tsvector('english', content)) STORED,
    metadata      jsonb NOT NULL DEFAULT '{}',
    created_at    timestamptz NOT NULL DEFAULT now(),
    updated_at    timestamptz NOT NULL DEFAULT now(),
    UNIQUE (collection, slug, chunk_index)
);
CREATE INDEX IF NOT EXISTS chunks_embedding_idx ON chatbot.chunks USING hnsw (embedding vector_cosine_ops);
CREATE INDEX IF NOT EXISTS chunks_tsv_idx       ON chatbot.chunks USING gin (tsv);
CREATE INDEX IF NOT EXISTS chunks_doc_idx       ON chatbot.chunks (collection, slug);

CREATE TABLE IF NOT EXISTS chatbot.chat_logs (
    id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    trace_id        uuid NOT NULL,
    session_id      text,
    query_redacted  text NOT NULL,         -- PII-scrubbed
    intent          text,
    chunk_ids       text[],
    groundedness    text,
    latency_ms      int,
    tokens_in       int,
    tokens_out      int,
    feedback        text,                  -- "up" | "down" | null
    error           text,
    created_at      timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS chat_logs_created_idx ON chatbot.chat_logs (created_at DESC);
CREATE INDEX IF NOT EXISTS chat_logs_trace_idx   ON chatbot.chat_logs (trace_id);

CREATE TABLE IF NOT EXISTS chatbot.usage_budget (
    day          date PRIMARY KEY,
    tokens_in    bigint NOT NULL DEFAULT 0,
    tokens_out   bigint NOT NULL DEFAULT 0
);
```

### Hybrid search (single SQL query)

```sql
WITH dense AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY embedding <=> $1) AS r
  FROM chatbot.chunks ORDER BY embedding <=> $1 LIMIT 20
),
sparse AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY ts_rank(tsv, plainto_tsquery('english', $2)) DESC) AS r
  FROM chatbot.chunks WHERE tsv @@ plainto_tsquery('english', $2) LIMIT 20
)
SELECT c.*, COALESCE(1.0/(60+d.r),0) + COALESCE(1.0/(60+s.r),0) AS score
FROM chatbot.chunks c
LEFT JOIN dense  d ON d.id = c.id
LEFT JOIN sparse s ON s.id = c.id
WHERE d.r IS NOT NULL OR s.r IS NOT NULL
ORDER BY score DESC LIMIT 8;
```

### Embedding model

`gemini-embedding-001`, truncated to 768 dimensions via Matryoshka representation. Schema stays `vector(768)` so the model can be swapped later if Google releases a successor with the same truncation contract.

## 5. HTTP API

| Method | Path | Auth | Purpose |
|---|---|---|---|
| `POST` | `/chat` | `X-Internal-Auth` HMAC | JSON request/response; runs the full LangGraph. |
| `POST` | `/chat/stream` | `X-Internal-Auth` HMAC | SSE — per-node progress events + token deltas. |
| `POST` | `/ingest` | `X-Ingest-Signature` + `X-Ingest-Timestamp` HMAC | Chunk + embed + upsert documents. |
| `DELETE` | `/documents/{collection}/{slug}` | HMAC | Drop all chunks for one document. |
| `POST` | `/chat/feedback` | `X-Internal-Auth` HMAC | `{trace_id, vote}` — appends to `chat_logs`. |
| `GET` | `/health` | none | Liveness. |
| `GET` | `/metrics` | none (internal port) | Prometheus exposition. |

### Wire shapes

```jsonc
// POST /chat
{
  "query": "What is his RAG experience?",
  "history": [{ "role": "user", "content": "..." }],
  "trace_id": "optional-uuid"
}

// 200 response
{
  "answer": "Habibur built a production RAG pipeline at Makebell [1]...",
  "sources": [
    { "id": "projects:rag-pipeline", "title": "...", "source_type": "project",
      "url": "...", "score": 0.81, "excerpt": "..." }
  ],
  "intent": "about_habibur",
  "trace_id": "uuid",
  "metadata": {
    "groundedness": "grounded",
    "retrieval_attempts": 1,
    "generation_attempts": 1,
    "latency_ms": 1834,
    "tokens": { "in": 2400, "out": 180 }
  }
}
```

```
# POST /chat/stream — SSE
event: node
data: {"name": "classify_intent", "status": "completed", "ms": 110}

event: token
data: {"delta": "Habibur "}

event: done
data: {"sources": [...], "metadata": {...}}
```

### HMAC auth on every Python-bound request

- Headers: `X-Internal-Auth: <hex>` (or `X-Ingest-Signature` for the ingest endpoints) and `X-Internal-Timestamp: <unix-ms>`.
- Signature = `HMAC-SHA256(secret, f"{timestamp}.{request_path}.{sha256(body)}")`.
- Requests with `|now − ts| > 60s` are rejected (replay protection).
- Secrets are read as comma-separated env values so rotation is zero-downtime (overlap window).

### CORS

None. The Python service refuses any browser-origin request — the only valid caller is `apps/web` over the internal Docker network.

## 6. Guardrails & Security

Seven layers of defense in depth.

| # | Layer | Where | What it does |
|---|---|---|---|
| 1 | **Edge** | Next.js `/api/chat` | CSRF token on the form, short-lived chat-session JWT issued when the widget mounts, IP rate limit (5/min, 20/session, 100/day) via Upstash, 1KB body cap, strict same-origin CORS. |
| 2 | **Transport** | Next.js → Python | HMAC + replay-window verification on every request. Python on the internal Docker network only, no public domain. |
| 3 | **Input** | Python `input_guard` node | Length cap (500 chars), control-char + zero-width strip, prompt-injection heuristics, language gate. Failure routes to `refuse_unsafe`. |
| 4 | **Routing** | Python `classify_intent` node | Explicit `unsafe` and `off_topic` branches terminate the graph before reaching retrieval or the answer model. |
| 5 | **Grounding** | Python `check_groundedness` node | Every answer is verified against the retrieved chunks. Ungrounded → regenerate once, then fall back. The single biggest hallucination defense. |
| 6 | **Output** | Python `output_guard` node | Gemini `safety_settings` (HARASSMENT, HATE, SEXUAL, DANGEROUS at `BLOCK_MEDIUM_AND_ABOVE`, configurable). LLM check for system-prompt regurgitation or PII not present in the user's query. Regex strip of email/phone/CC patterns. 1500-char cap. Violations replaced with a safety template and logged. |
| 7 | **Logging** | before `chat_logs` write | PII scrubber: emails → `<email>`, phones → `<phone>`, high-entropy strings → `<secret>`. Only the scrubbed query is persisted. |

### Cost & abuse budget

- **Per-request token cap:** 5000 tokens combined. Requests projected to exceed are refused.
- **Per-day Gemini budget:** tracked in `chatbot.usage_budget`. When exhausted, `/chat` returns `503` with a friendly fallback message. Threshold is configurable.
- **Cost monitoring:** every node logs its token count to `chat_logs.tokens_in/out`. Spend can be analyzed by intent class and by node.

### Secret management

- `GEMINI_API_KEY` — env var, server-side only.
- `INTERNAL_HMAC_SECRET`, `INGEST_HMAC_SECRET` — separate secrets, rotated independently. Comma-separated lists supported for zero-downtime rotation.
- Postgres URL uses a dedicated `chatbot_app` role with privileges scoped via `GRANT USAGE ON SCHEMA chatbot ...` — it cannot read or write Payload's tables even if SQL injection were achieved.

## 7. Package Layout

```
apps/chatbot/
├── pyproject.toml                 # google-genai, langgraph, langchain-core,
│                                  # asyncpg, structlog, prometheus-client, slowapi
├── package.json                   # turbo proxy scripts
├── migrations/
│   └── 0001_init.sql              # schema, vector ext, chunks, chat_logs, usage_budget
├── Dockerfile                     # multi-stage, distroless runtime, HEALTHCHECK
├── docker-entrypoint.sh           # apply_migrations.sh && exec uvicorn …
├── chatbot/
│   ├── main.py                    # FastAPI factory + lifespan (pool, agent, gemini)
│   ├── config.py                  # pydantic-settings
│   ├── api/
│   │   ├── routes.py              # /chat, /chat/stream, /ingest, /chat/feedback, /health, /metrics
│   │   ├── schemas.py             # Pydantic v2 request/response models
│   │   ├── deps.py                # DI providers
│   │   ├── auth.py                # HMAC verify, replay-window check
│   │   └── sse.py                 # SSE event encoder
│   ├── agent/
│   │   ├── graph.py               # build_graph(), node wiring, edge conditions
│   │   ├── state.py               # AgentState TypedDict
│   │   ├── nodes/
│   │   │   ├── input_guard.py
│   │   │   ├── classify_intent.py
│   │   │   ├── rewrite_query.py
│   │   │   ├── retrieve.py
│   │   │   ├── grade_chunks.py
│   │   │   ├── generate_answer.py
│   │   │   ├── check_groundedness.py
│   │   │   ├── extract_citations.py
│   │   │   ├── output_guard.py
│   │   │   └── respond.py
│   │   └── prompts/               # one .md per node, loaded at import
│   ├── llm/
│   │   ├── gemini.py              # google-genai client, pro/flash routing, retries, safety_settings
│   │   └── budget.py              # per-day token budget gate
│   ├── retrieval/
│   │   ├── embedder.py            # gemini-embedding-001 wrapper, batching
│   │   ├── pgvector.py            # hybrid search SQL via asyncpg
│   │   └── chunker.py             # langchain RecursiveCharacterTextSplitter
│   ├── ingest/
│   │   └── service.py             # chunk → embed → upsert; idempotent
│   ├── security/
│   │   ├── hmac.py                # sign + verify (constant-time)
│   │   ├── pii.py                 # redactor (emails, phones, secrets)
│   │   └── prompt_injection.py    # heuristics
│   ├── db/
│   │   ├── pool.py                # asyncpg pool factory (lifespan-managed)
│   │   ├── chunks_repo.py
│   │   ├── chat_log_repo.py
│   │   └── budget_repo.py
│   └── observability/
│       ├── tracing.py             # OpenTelemetry: one span per node
│       ├── metrics.py             # Prometheus collectors
│       └── logger.py              # structlog JSON config
└── tests/
    ├── unit/                      # every node, with fake Gemini + in-memory store
    ├── integration/               # TestClient + ephemeral Postgres+pgvector (Docker)
    └── e2e/                       # real Gemini; gated on GEMINI_API_KEY
```

Every layer is exposed via a `Protocol` so it can be faked. The agent only knows `LLMClient`, `EmbeddingClient`, `VectorStore`, and `ChatLogRepo` — never concrete classes.

## 8. Testing Strategy

| Tier | What runs | Real deps | Speed | Where |
|---|---|---|---|---|
| **Unit** | Each LangGraph node in isolation; PII scrubber; HMAC; prompt-injection heuristics; chunker; ingest service; SQL builders. | None — fakes for Gemini, embedder, DB. | < 1s total. | `tests/unit/` |
| **Integration** | FastAPI TestClient. Full graph runs with a fake Gemini. Real Postgres + pgvector via `docker-compose.test.yml` (or testcontainers). Real ingest→retrieve→answer cycle. | Postgres + pgvector. | ~30s. | `tests/integration/` |
| **E2E** | One smoke test per intent class against real Gemini. Verifies SDK contract, safety settings, streaming. Gated on `GEMINI_API_KEY`. | Real Gemini + Postgres. | ~1–2 min. | `tests/e2e/` |

### Tests that pay rent (must exist, not exhaustive)

- `test_classify_intent_routes_unsafe` — adversarial prompts route to `refuse_unsafe`.
- `test_groundedness_rejects_hallucination` — answers mentioning facts absent from chunks are caught.
- `test_ingest_is_idempotent` — same doc re-ingested keeps chunk count stable.
- `test_hmac_rejects_replay` — stale-timestamp request returns 401.
- `test_budget_exhausted_returns_503` — overspend triggers graceful degradation.
- `test_pii_scrubber_redacts_email_in_log` — query `"contact me at x@y.com"` lands in `chat_logs.query_redacted` as `<email>`.
- `test_hybrid_search_returns_rrf_order` — known seed data, asserted ranking.
- `test_chat_stream_emits_node_events` — SSE consumer sees `node` events before `token` events.

## 9. Observability

- **Structured logs** via `structlog` (JSON to stdout). Every record carries `trace_id`, `node`, `latency_ms`. Shipped through `docker logs` to whatever aggregator is in front of the stack (Loki, Vector, …) — out of scope for v1.
- **Tracing** via OpenTelemetry. Each LangGraph node = one span; spans nest under the request span. OTLP export is opt-in via `OTEL_EXPORTER_OTLP_ENDPOINT`.
- **Metrics** on `/metrics` (Prometheus exposition):
  - `chatbot_request_duration_ms` histogram by `intent`, `outcome`.
  - `chatbot_node_duration_ms` histogram by `node`.
  - `chatbot_groundedness_total` counter by result.
  - `chatbot_gemini_tokens_total` counter by `model`, `direction`.
  - `chatbot_budget_remaining` gauge.
- **Operator dashboard** — a small admin-only page in Next.js queries `chat_logs` for last-24h volume, fallback rate, groundedness rate, top intents.

## 10. Deployment (Docker only)

**Dockerfile** (`apps/chatbot/Dockerfile`)
- Multi-stage build. Stage 1: `python:3.12-slim` with `uv sync --no-dev`. Stage 2: slim runtime; copies the venv and source.
- `HEALTHCHECK CMD curl -fs http://localhost:8001/health || exit 1`
- Non-root user.
- Entrypoint: `apply_migrations.sh && exec uvicorn chatbot.main:app --host 0.0.0.0 --port 8001 --workers 2`.

**docker-compose.yml** (top-level, alongside `apps/`)

```yaml
services:
  web:
    build: ./apps/web
    ports: ["3000:3000"]      # only this service is exposed
    environment:
      CHATBOT_URL: http://chatbot:8001
      INTERNAL_HMAC_SECRET: ${INTERNAL_HMAC_SECRET}
      INGEST_HMAC_SECRET: ${INGEST_HMAC_SECRET}
    depends_on: [chatbot]
    networks: [internal]

  chatbot:
    build: ./apps/chatbot
    # NO ports: — only reachable inside the internal network
    env_file: ./apps/chatbot/.env
    environment:
      DATABASE_URL: ${CHATBOT_DATABASE_URL}
    depends_on:
      postgres:
        condition: service_healthy
    networks: [internal]
    restart: unless-stopped

  postgres:                    # optional, only when not pointing at Supabase
    image: pgvector/pgvector:pg16
    volumes: [pgdata:/var/lib/postgresql/data]
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
    networks: [internal]

networks:
  internal:                    # bridge, not exposed
volumes:
  pgdata:
```

- **`chatbot` has no `ports:` section.** Only `web` is exposed.
- **TLS / public ingress** is whatever sits in front of `web` (nginx, Caddy, a load balancer, Cloudflare Tunnel) — outside chatbot scope.
- **Migrations** — `apply_migrations.sh` runs `psql "$DATABASE_URL" -f migrations/0001_init.sql` at boot. All statements are idempotent (`CREATE TABLE IF NOT EXISTS`, `CREATE INDEX IF NOT EXISTS`). Alembic can replace this later if schema complexity grows.
- **Secrets** — read from `.env` files mounted at build/run time, or from environment variables injected by the orchestrator. Never read from anywhere but the process environment.
- **Logs** — stdout/stderr; `docker logs chatbot` for ad-hoc inspection.
- **Backups** — when on Supabase, nightly snapshots cover `chatbot` for free. When on local Postgres, `pg_dump` via a sidecar cron container — out of scope for v1. `chunks` is rebuildable from Payload content via `pnpm --filter chatbot backfill`.

## 11. Open Items

None blocking. Items deferred to follow-up tickets:

- Drift detection — weekly sample of `chat_logs`, re-run against a fresh deploy, alert on groundedness rate drop.
- Multi-modal answers — chatbot can describe project screenshots once `media` ingestion is wired.
- Light-mode model — separate prompt set if a light mode is added to the site.
- Bengali content (i18n) — would require either a multilingual embedding model or per-language indices.

## 12. Acceptance Criteria

This refactor is done when, all of the following are true:

1. `apps/chatbot` starts via `docker compose up`, applies migrations, and `/health` returns `200`.
2. `apps/web` can `POST /api/chat` through the internal network and get a streamed response.
3. Payload's `afterChange` hook on `Posts`/`Projects` triggers `/ingest` and the new content is retrievable within seconds.
4. The full unit + integration test tier passes locally with `pnpm --filter chatbot test`.
5. The e2e tier passes with `GEMINI_API_KEY` set.
6. A deliberately ungrounded test query returns the fallback rather than a hallucinated answer.
7. An adversarial prompt-injection test query routes to `refuse_unsafe`.
8. `/metrics` returns Prometheus-formatted metrics including node-level latency histograms and token counters.
9. Replaying an HMAC-signed request with a stale timestamp returns `401`.
10. Daily-budget exhaustion (simulated) returns `503` with the fallback message.
