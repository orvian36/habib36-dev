# 06 – Security

> All source paths below are relative to `apps/chatbot/` (so `chatbot/security/hmac.py` lives on
> disk at `apps/chatbot/chatbot/security/hmac.py`).

---

## 1. HMAC Scheme

Every protected request carries a timestamp (milliseconds since epoch) and an HMAC-SHA256
signature over a **canonical string** that binds the timestamp, the request path, and the
SHA-256 hash of the raw body:

```
{timestamp_ms}.{path}.{sha256_hex(body)}
```

`chatbot/security/hmac.py:18-20` (`_canonical`) builds this string.
`chatbot/security/hmac.py:28-46` (`verify_request`) performs the check.

### Signing algorithm

`HMAC-SHA256(secret.encode(), canonical.encode())`, hex-encoded.
`_hmac.compare_digest` prevents timing attacks (`hmac.py:44`).

### Replay protection

`Settings.replay_window_seconds = 60` (`chatbot/config.py:52`).
The verifier rejects any request whose timestamp falls outside
`[now_ms − window_seconds×1000, now_ms + window_seconds×1000]` (`hmac.py:39`).
Future-dated timestamps are also rejected, which prevents pre-computing signatures.

### Multi-secret rotation

`Settings.internal_hmac_secret` and `Settings.ingest_hmac_secret` accept comma-separated
values (`chatbot/config.py:50-51`). `Settings.internal_secrets()` and `ingest_secrets()`
split them into lists (`config.py:65-72`).

`verify_request` accepts **any** listed secret (`hmac.py:42-45`). Rotation procedure:

1. Append the new secret to the env var (`old,new`), deploy.
2. Switch clients to sign with the new secret.
3. Remove the old secret, redeploy.

No request is rejected during the window between steps 1 and 3.

---

## 2. Two Secrets, Two Endpoint Groups

The service enforces two independent HMAC credentials:

| Header pair | Endpoints | Secret setting | Dependency |
|---|---|---|---|
| `X-Internal-Auth` + `X-Internal-Timestamp` | `POST /chat`, `POST /chat/stream`, `POST /chat/feedback` | `internal_hmac_secret` | `require_internal_hmac` |
| `X-Ingest-Signature` + `X-Ingest-Timestamp` | `POST /ingest`, `DELETE /documents/{collection}/{slug}` | `ingest_hmac_secret` | `require_ingest_hmac` |

Both dependencies are wired as `Depends(...)` on the route decorators
(`chatbot/api/routes.py:66, 127, 171, 180, 192`).
Dependency implementations: `chatbot/api/auth.py:45-68`.

**Why split?** Ingest credentials live only in Payload's server-side environment; chat
credentials live in the web frontend's environment. Compromising one secret does not grant
access to the other endpoint group, and the two can be rotated on independent schedules.

---

## 3. PII Redaction

`chatbot/security/pii.py` defines the `redact(text)` function. Three patterns are applied in
order:

| Pattern | Replacement | Source line |
|---|---|---|
| Email addresses | `<email>` | `pii.py:10, 28` |
| Phone numbers (international-aware) | `<phone>` | `pii.py:11-13, 29` |
| High-entropy tokens ≥ 24 chars (Shannon entropy ≥ 3.5) | `<secret>` | `pii.py:14, 31-34` |

Note: IP addresses are **not** a distinct pattern. Bare IPs that happen to match the phone
regex may be caught; others are not. The high-entropy rule primarily targets API keys and
bearer tokens embedded in queries.

### Where it is applied

`chatbot/api/routes.py:115`:

```python
query_redacted=redact(body.query),
```

This scrubs the value stored in `chat_log.query_redacted` — the persistence layer. The raw
query is passed unchanged to the LLM graph.

### Why not redact the outbound query?

Redacting before retrieval would corrupt vector similarity and keyword matching, degrading
answer quality. Instead, Gemini's built-in safety filter (`Settings.gemini_safety =
"BLOCK_MEDIUM_AND_ABOVE"`, `config.py:33-35`) is the outbound content gate.

---

## 4. Prompt-Injection Detection

`chatbot/security/prompt_injection.py` provides a heuristic `detect(text) -> bool`.
Detection is **regex-only** — there is no LLM call in this layer.

### Patterns checked (`prompt_injection.py:11-19`)

| Pattern | Example trigger |
|---|---|
| `ignore (previous\|prior\|above) (instructions\|prompts?)` | "ignore previous instructions" |
| `system[: >]` or `</system>` | "system: you are now…", `</system>` |
| `{{ … }}` template expressions | `{{jailbreak}}` |
| `you are now` | "you are now DAN" |
| `act as (system\|admin\|root\|developer)` | "act as a developer" |
| `disregard (all\|previous\|prior)` | "disregard all context" |

A secondary check flags **high-entropy tokens ≥ 20 chars** (Shannon entropy ≥ 4.0)
(`prompt_injection.py:20, 33-38`). These could be encoded payloads.

The `classify_intent` node (second pass, LLM-based) is the second line of defense for
subtler attacks — noted in the module docstring (`prompt_injection.py:3-5`).

### Where it fires

`chatbot/agent/nodes/input_guard.py:21-22`:

```python
if detect_injection(cleaned):
    return {**state, "query": cleaned, "is_input_safe": False}
```

`input_guard` also strips non-printable control characters (except tab/LF/CR) and enforces
`max_query_length` (`input_guard.py:7-20`). All three checks set `is_input_safe = False` on
failure.

### What happens on detection

`is_input_safe = False` causes the graph to route to the `refuse_unsafe` node, which returns
a canned refusal without invoking retrieval or the LLM. See
[02-langraph-agent.md](02-langraph-agent.md) for the graph routing logic.

### Known limitation

Heuristics only. A novel phrasing that avoids every listed pattern will not be caught at this
layer. Mitigations outside this module: Gemini safety filters on the response, and Gemini's
own system-prompt handling.

---

## 5. Budget Gates

Two caps prevent runaway Gemini API spend.

### Daily cap

`Settings.daily_token_budget = 1_000_000` (`config.py:55`).
Persisted in `chatbot.usage_budget` (one row per UTC day) by `BudgetRepo`
(`chatbot/db/budget_repo.py:13-24`). The counter is the sum of `tokens_in + tokens_out`
for that day (`budget_repo.py:33-39`).

### Per-request cap

`Settings.per_request_token_cap = 5_000` (`config.py:56`).
Used as a **pre-flight estimate** before the graph is invoked.

### Pre-flight check

`BudgetGate.assert_can_spend(estimated_tokens)` (`chatbot/llm/budget.py:26-29`):

```python
if estimated_tokens > await self.remaining_today():
    raise BudgetExceeded("daily Gemini budget exhausted")
```

`BudgetExceeded` is caught in the route handler and converted to
`HTTPException(503 SERVICE_UNAVAILABLE)` (`routes.py:72-73, 132-133`).

### Post-request accounting

`BudgetGate.record_spend(tokens_in, tokens_out)` increments the daily row via an
`INSERT … ON CONFLICT DO UPDATE` upsert (`budget_repo.py:13-24`). Called after the graph
returns (`routes.py:88, 154`).

### `/chat/stream` wart

In the streaming route, `astream_events` is followed by a second `ainvoke` call on the same
initial state (`routes.py:152`). This runs the graph twice, so `record_spend` accounts for
the second run only; the streaming pass is untracked. See
[03-chat-flow.md](03-chat-flow.md) for details.

---

## 6. Data-Store Trust Boundaries

### Postgres

Postgres is accessed over the Docker internal network via asyncpg. The `chatbot_app` role is limited to the `chatbot` schema and has no access to Payload's `public` schema. No Postgres port is mapped to the host.

### Weaviate

- **Weaviate** runs on the internal Docker network with anonymous access enabled. There is no inbound port mapped to the host. For managed/hosted Weaviate the chatbot supports `WEAVIATE_API_KEY` (passed as `Auth.api_key(...)`) and `WEAVIATE_SECURE=true` for TLS on both HTTP and gRPC.

---

## 7. Threat Model

### Defended against

- **Replay attacks** — `replay_window_seconds = 60` plus per-request signature freshness
  (`hmac.py:39`).
- **Token-exhaustion DoS** — daily cap (1 M tokens) and per-request pre-flight cap (5 k
  tokens) with a 503 response on breach (`budget.py:26-29`, `routes.py:72-73`).
- **Single-client key compromise** — per-endpoint secrets; compromising the chat secret does
  not expose ingest, and vice versa.
- **PII in stored logs** — `redact()` scrubs emails, phone numbers, and high-entropy tokens
  before the `chat_log` row is persisted (`routes.py:115`, `pii.py`).
- **Obvious prompt injection** — heuristic regex + entropy gate blocks known patterns
  (`prompt_injection.py`, `input_guard.py`).

### Explicitly NOT defended against

- **Edge DoS / volumetric attacks** — relies on upstream Cloudflare / Nginx / Docker network
  ACL; no rate limiting inside the service.
- **Timing side-channels** — `compare_digest` is used for HMAC comparison, but no constant-
  time path exists for the timestamp or path-parsing steps.
- **Social engineering / credential phishing** — out of scope for an API service.
- **Compromised Gemini endpoint or rogue model output** — the service trusts Gemini
  unconditionally; response content is passed through with only a length cap
  (`Settings.max_answer_chars`).
- **Sophisticated prompt injection** — novel phrasing not matching any heuristic pattern
  passes `input_guard` unchecked.
- **IP address scrubbing** — `pii.py` has no dedicated IP regex; bare IPs in queries reach
  the LLM and are stored in logs.

---

## 8. See Also

- [03-chat-flow.md](03-chat-flow.md) — budget integration in the chat path; streaming wart
- [04-ingest-flow.md](04-ingest-flow.md) — ingest HMAC usage
- [08-ops-deploy.md](08-ops-deploy.md) — secret injection via Docker / environment variables
