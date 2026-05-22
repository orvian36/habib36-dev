# chatbot

Internal-only Gemini + LangGraph + pgvector RAG service for habib36.dev.
`apps/web` proxies user traffic over the Docker internal network with HMAC-signed requests.

## Quick start

```bash
# from this directory
uv sync
cp .env.example .env       # fill in GEMINI_API_KEY + HMAC secrets
uv run python -m chatbot.db.migrate
uv run uvicorn chatbot.main:app --reload --port 8001
```

Through Turborepo:

```bash
pnpm --filter chatbot dev
pnpm --filter chatbot test
pnpm --filter chatbot test:integration   # needs TEST_DATABASE_URL
pnpm --filter chatbot test:e2e           # needs GEMINI_API_KEY + TEST_DATABASE_URL
pnpm --filter chatbot lint
```

## Architecture

See `docs/superpowers/specs/2026-05-22-chatbot-langraph-refactor-design.md`.

## HTTP API

| Method | Path | Auth | Purpose |
|---|---|---|---|
| `GET`    | `/health` | — | Liveness. |
| `GET`    | `/metrics` | — | Prometheus exposition. |
| `POST`   | `/chat` | HMAC | JSON RAG response (LangGraph agent). |
| `POST`   | `/chat/stream` | HMAC | SSE: node events + token deltas. |
| `POST`   | `/ingest` | HMAC | Chunk + embed + upsert documents. |
| `DELETE` | `/documents/{collection}/{slug}` | HMAC | Drop all chunks for one document. |
| `POST`   | `/chat/feedback` | HMAC | Record up/down vote per trace_id. |

All write endpoints require HMAC-signed headers (`X-Internal-Auth` / `X-Ingest-Signature`).
See `chatbot/security/hmac.py` for the canonical scheme.

## LangGraph agent

```
START → input_guard → classify_intent
                          ├─ smalltalk → smalltalk_reply → respond
                          ├─ off_topic → refuse_off_topic → respond
                          ├─ unsafe    → refuse_unsafe    → respond
                          └─ about_habibur | tech_concept →
                                rewrite_query → retrieve → grade_chunks
                                                              ├─ no chunks & attempt=0 → rewrite_for_retry → rewrite_query
                                                              ├─ no chunks & attempt=1 → fallback_no_context → respond
                                                              └─ has chunks → generate_answer → check_groundedness
                                                                                                  ├─ ungrounded & gen_attempt=0 → regenerate → generate_answer
                                                                                                  ├─ ungrounded & gen_attempt=1 → fallback_no_context → respond
                                                                                                  └─ grounded | partial → extract_citations → output_guard → respond
```

## Testing tiers

| Tier | Command | Real deps |
|---|---|---|
| Unit | `uv run pytest tests/unit` | None — fakes everywhere |
| Integration | `TEST_DATABASE_URL=... uv run pytest tests/integration` | Postgres + pgvector |
| E2E | `GEMINI_API_KEY=... TEST_DATABASE_URL=... uv run pytest tests/e2e` | Real Gemini + Postgres |
