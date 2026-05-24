# Chatbot documentation

Internal-only RAG service for habib36.dev. Gemini + LangGraph + Weaviate behind a FastAPI HTTP boundary. Called by `apps/web` over the Docker network with HMAC-signed requests.

## Read in this order

1. [`01-architecture.md`](./01-architecture.md) — 10,000-ft view, package map, ADRs.
2. [`02-langraph-agent.md`](./02-langraph-agent.md) — the agent state machine, every node.
3. [`03-chat-flow.md`](./03-chat-flow.md) — `POST /chat` and `POST /chat/stream`.
4. [`04-ingest-flow.md`](./04-ingest-flow.md) — `POST /ingest` and `DELETE /documents`.
5. [`05-retrieval-rag.md`](./05-retrieval-rag.md) — hybrid retrieval (Weaviate BM25 + vector, RANKED fusion), reranking, citations.
6. [`06-security.md`](./06-security.md) — HMAC, PII, prompt injection, budget.
7. [`07-observability.md`](./07-observability.md) — logging, tracing, metrics, chat_log.
8. [`08-ops-deploy.md`](./08-ops-deploy.md) — Docker, env, migrations, runbook.
9. [`09-glossary.md`](./09-glossary.md) — terms.

## 10-minute fast path

Read **`01-architecture.md`** and **`03-chat-flow.md`**. You'll be able to follow a request end-to-end and know where to dig deeper.

## If you're here to…

- **Change a prompt** → [`02-langraph-agent.md`](./02-langraph-agent.md) (find the node, then edit `chatbot/agent/prompts/<node>.md`).
- **Tune retrieval** → [`05-retrieval-rag.md`](./05-retrieval-rag.md).
- **Debug an HMAC rejection** → [`06-security.md`](./06-security.md).
- **Ship a deploy** → [`08-ops-deploy.md`](./08-ops-deploy.md).
