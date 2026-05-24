# chatbot

Internal-only Gemini + LangGraph + Weaviate RAG service for habib36.dev.
`apps/web` proxies user traffic over the Docker internal network with HMAC-signed requests.

## Quick start

```bash
# from this directory
uv sync
cp .env.example .env       # fill in GEMINI_API_KEY + HMAC secrets + Weaviate settings
uv run python -m chatbot.db.migrate
uv run uvicorn chatbot.main:app --reload --port 8001
```

**Required Weaviate env vars** (add to `.env`):

```text
WEAVIATE_HTTP_HOST=localhost
WEAVIATE_HTTP_PORT=8080
WEAVIATE_GRPC_HOST=localhost
WEAVIATE_GRPC_PORT=50051
WEAVIATE_COLLECTION=Chunks
```

Through Turborepo:

```bash
pnpm --filter chatbot dev
pnpm --filter chatbot test
pnpm --filter chatbot test:integration   # needs TEST_DATABASE_URL
pnpm --filter chatbot test:e2e           # needs GEMINI_API_KEY + TEST_DATABASE_URL
pnpm --filter chatbot lint
```

## Documentation

Full docs live in [`docs/`](./docs/README.md). Start there if you're new to this service.

Short index:

- [Architecture](./docs/01-architecture.md)
- [LangGraph agent](./docs/02-langraph-agent.md)
- [`/chat` flow](./docs/03-chat-flow.md)
- [`/ingest` flow](./docs/04-ingest-flow.md)
- [Retrieval & RAG](./docs/05-retrieval-rag.md)
- [Security](./docs/06-security.md)
- [Observability](./docs/07-observability.md)
- [Ops & deploy](./docs/08-ops-deploy.md)
- [Glossary](./docs/09-glossary.md)

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
See [`docs/06-security.md`](./docs/06-security.md) for the canonical scheme.

## Testing tiers

| Tier | Command | Real deps |
|---|---|---|
| Unit | `uv run pytest tests/unit` | None — fakes everywhere |
| Integration | `TEST_DATABASE_URL=... uv run pytest tests/integration` | Postgres + Weaviate |
| E2E | `GEMINI_API_KEY=... TEST_DATABASE_URL=... uv run pytest tests/e2e` | Real Gemini + Postgres + Weaviate |

## Vector storage

Chunks live in a Weaviate collection with `vectorizer: none`. Vectors are produced by the Gemini embedder (`gemini-embedding-001`, truncated to 768 dims) and pushed alongside their text. Retrieval uses Weaviate's native hybrid: BM25 on `content` fused with vector cosine via `HybridFusion.RANKED` (reciprocal rank fusion), `alpha=0.5`, `limit=top_k`.
