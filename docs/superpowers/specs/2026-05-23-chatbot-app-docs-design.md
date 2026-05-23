# Chatbot app documentation — design

**Date:** 2026-05-23
**Status:** Approved — ready for implementation plan
**Owner:** habib
**Scope:** Author a self-contained documentation set inside `apps/chatbot/docs/` that explains the chatbot end-to-end (architecture, LangGraph agent, request flows, security, observability, ops).

---

## 1. Goal and non-goals

**Goal.** Produce navigable docs inside `apps/chatbot/docs/` that let a new contributor (or future-me) understand the service end-to-end without reverse-engineering it from source. Cover: architecture and rationale, the LangGraph agent (every node, every transition, every prompt), what happens when `/chat` and `/ingest` are hit, retrieval/RAG internals, security model, observability, and ops. Tone: explain the **why**, use mermaid diagrams, reference source with `path:line` so readers can jump in.

**Non-goals.**
- Not a FastAPI/Python tutorial — readers are competent Python developers.
- Not a duplicate of `docs/superpowers/specs/2026-05-22-chatbot-langraph-refactor-design.md` (that spec is forward-looking intent; these docs describe the system *as it is* and link to the spec for historical context).
- Not auto-generated API reference — FastAPI's OpenAPI already covers that.

## 2. Audience and tone

Primary reader is a contributor (or future-me, 6 months out) who knows Python and FastAPI but is new to *this* codebase. Each doc explains decisions and tradeoffs, not just mechanics. Code-level detail is provided via `path:line` refs (e.g. `chatbot/agent/graph.py:42`) so the doc stays terse while remaining navigable.

## 3. Format choices

- **Layout:** `docs/` folder with multiple focused files (not one giant `DOCS.md`, not an expanded README).
- **Diagrams:** Mermaid (renders on GitHub and in VS Code; diffable). Use `flowchart`, `sequenceDiagram`, `stateDiagram-v2`, and `erDiagram` as needed.
- **References:** Every claim about behavior cites a `path:line` so a reader can verify.
- **Cross-links:** Glossary terms are hyperlinked from every doc; flows link out to their auxiliary concepts (e.g. chat flow links to security and observability).

## 4. File layout

```
apps/chatbot/
├── README.md                     # trimmed: quickstart, API table, testing tiers, links into docs/
└── docs/
    ├── README.md                 # index + reading order + 10-minute fast path
    ├── 01-architecture.md
    ├── 02-langraph-agent.md
    ├── 03-chat-flow.md
    ├── 04-ingest-flow.md
    ├── 05-retrieval-rag.md
    ├── 06-security.md
    ├── 07-observability.md
    ├── 08-ops-deploy.md
    └── 09-glossary.md
```

The existing `apps/chatbot/README.md` keeps quickstart, the API table, and testing tiers (front-door material) and replaces its ASCII LangGraph diagram with a one-line summary pointing at `docs/02-langraph-agent.md`.

## 5. Per-doc content

Every doc follows the same three-act shape:
1. One-paragraph orientation.
2. The meat — diagrams + walkthroughs + `path:line` refs.
3. Short "see also" footer.

### 5.1 `docs/README.md`
- Elevator pitch (≤3 sentences).
- "Read in this order" list (01 → 09).
- 10-minute fast path: read `01-architecture.md` + `03-chat-flow.md`.
- "If you're here to…" shortcuts: change a prompt → 02; tune retrieval → 05; debug an HMAC rejection → 06; ship a deploy → 08.

### 5.2 `01-architecture.md`
- **What this service is** — RAG service, internal-only, called by `apps/web` over Docker network with HMAC.
- **System context** — mermaid C4-style diagram: user → `apps/web` (Next.js) → chatbot (`/chat`, `/ingest`) → {Postgres+pgvector, Gemini API}. Annotate which arrows are HMAC-signed.
- **Package map** — one-line per top-level package (`agent/`, `api/`, `llm/`, `retrieval/`, `ingest/`, `db/`, `security/`, `observability/`) with the file:line entry-point for each.
- **Lifespan and DI** — how `create_app()` builds `AppContext` (`chatbot/main.py:42`); why tests inject a fake context via the `context` kwarg; the "context flows down via `request.app.state.context`" pattern.
- **Architectural decisions** — 6–10 numbered ADR-style entries (~3 sentences each, *Decision · Why · Tradeoff*):
  1. LangGraph over hand-rolled state machine.
  2. pgvector over a dedicated vector DB (Pinecone/Qdrant/Weaviate).
  3. HMAC over JWT for internal calls.
  4. Gemini Flash for cheap nodes + Pro for generation.
  5. Lifespan-built singletons over per-request init.
  6. In-process budget gate over external rate-limiter.
  7. SSE over WebSocket for streaming.
  8. Delete-then-insert ingest over diffing.

### 5.3 `02-langraph-agent.md` (centerpiece)
- **Mental model** — "the agent is a state machine; each node is `AgentState → AgentState`."
- **`AgentState` reference** — table of every field (name, type, set-by node, read-by node), drawn from `chatbot/agent/state.py`.
- **Graph diagram** — mermaid `stateDiagram-v2` with all nodes, conditional edges, and retry loops; replaces the ASCII tree currently in the top-level README.
- **Node catalog** — one subsection per node:
  - `input_guard`, `classify_intent`, `rewrite_query`, `retrieve`, `grade_chunks`, `generate_answer`, `check_groundedness`, `extract_citations`, `output_guard`, `respond`
  - Fallbacks: `smalltalk_reply`, `refuse_off_topic`, `refuse_unsafe`, `rewrite_for_retry`, `fallback_no_context`, `regenerate`
  - Each subsection: purpose · file path · prompt path (if any) · model (Flash/Pro) · state fields read/written · failure modes & routing.
- **Routing logic** — every conditional edge in plain English with its predicate (e.g. *"after `grade_chunks`: if `state.chunks` is empty and `state.retrieval_attempt == 0` → `rewrite_for_retry`; else if empty → `fallback_no_context`; else → `generate_answer`"*).
- **Retry budgets** — `max_retrieval_retries=1`, `max_generation_retries=1`; why these numbers and the cost implication of changing them.

### 5.4 `03-chat-flow.md`
- **Two endpoints, one graph** — `/chat` (JSON) and `/chat/stream` (SSE) both invoke the same graph.
- **`POST /chat` sequence diagram** — mermaid `sequenceDiagram`: client → FastAPI → HMAC verify → `BudgetGate` → `graph.ainvoke` → `ChatLogRepo.persist` → JSON response. Each arrow annotated with the `path:line` that performs it.
- **Request / response schema** — pulled from `chatbot/api/schemas.py`, with one example each.
- **`POST /chat/stream` sequence diagram** — same shape, but each node emits an event (`node_start`, `node_end`, `token`, `done`, `error`). Document the SSE event JSON shape with samples.
- **Auth path** — what `X-Internal-Auth` carries, the canonical signed string, replay-window behavior. Link to `06-security.md`.
- **Budget path** — where daily cap and per-request cap are enforced; behavior at the boundary (`429`).
- **`POST /chat/feedback`** — thumbs up/down per `trace_id`; how it's stored and how it surfaces in evaluation.
- **Failure modes table** — error → status code → log shape → response body.

### 5.5 `04-ingest-flow.md`
- **Purpose** — `apps/web` calls this when a Project or Post is published in Payload CMS; chatbot becomes the source of truth for retrievable content.
- **`POST /ingest` sequence diagram** — client → HMAC verify (different secret: `X-Ingest-Signature`) → `IngestService.upsert` → chunker → embedder → `ChunksRepo.upsert` (delete-then-insert per `(collection, slug)`).
- **Schema** — request body (collection, slug, title, body, metadata), response (chunks created, tokens consumed).
- **Chunking** — point to `05-retrieval-rag.md` for the algorithm; here just show how it's invoked.
- **`DELETE /documents/{collection}/{slug}`** — drops every chunk for that document; what gets logged.
- **Idempotency** — re-ingesting the same document is safe (delete-then-insert).

### 5.6 `05-retrieval-rag.md`
- **Chunker** — size 700 / overlap 100; why those numbers (token vs character, Gemini context window math). File: `chatbot/retrieval/chunker.py`.
- **Embedder** — Gemini `gemini-embedding-001`, 768 dimensions. File: `chatbot/retrieval/embedder.py`.
- **pgvector schema** — `erDiagram` of `chunks` and any supporting tables (collection, slug, title, content, embedding `vector(768)`, metadata JSONB).
- **Hybrid search** — BM25 + vector similarity fused via Reciprocal Rank Fusion (`k=60`); `top_k=8`. File: `chatbot/retrieval/pgvector.py`. Worked example with toy ranks.
- **Why hybrid vs pure vector** — concrete failure modes pure vector has on this corpus.

### 5.7 `06-security.md`
- **HMAC scheme** — canonical signed string (method, path, body hash, timestamp, nonce), replay window (`replay_window_seconds=60`), multi-secret rotation (CSV in env). File: `chatbot/security/hmac.py`.
- **Two secrets, two endpoints** — `X-Internal-Auth` for `/chat*`, `X-Ingest-Signature` for `/ingest`/`DELETE`; rationale for the split.
- **PII redaction** — what gets redacted before logging. File: `chatbot/security/pii.py`.
- **Prompt-injection detection** — heuristics and where they fire in the graph. File: `chatbot/security/prompt_injection.py`.
- **Budget gates** — daily cap + per-request cap; persisted via `BudgetRepo`.
- **Threat model** — what we defend against; explicit list of what we don't (DoS at the edge, traffic analysis, side-channels).

### 5.8 `07-observability.md`
- **Structured logging** — JSON fields (`trace_id`, `node`, `latency_ms`, `tokens_in`, `tokens_out`); how `path:line` of the formatter.
- **OTel tracing** — span names per node; how to wire `OTEL_ENDPOINT`. File: `chatbot/observability/tracing.py`.
- **Prometheus metrics** — counters and histograms exposed at `/metrics`; what each one measures.
- **`chat_log` repo** — what every chat request persists (full transcript, citations, feedback if any); why it's the substrate for offline evaluation.

### 5.9 `08-ops-deploy.md`
- **Dockerfile walkthrough** — base image choice, multi-stage build, why `uv` for deps, why a non-root user.
- **`docker-entrypoint.sh`** — what runs before uvicorn (migrations, sanity checks).
- **Env reference** — every field on `Settings` (`chatbot/config.py`): default, required-or-not, what it controls.
- **Migrations** — `python -m chatbot.db.migrate`; how migrations are tracked; rolling back.
- **Runbook** — common incidents: Gemini key rotation, daily budget exhausted, pgvector index rebuild, replay-window failures, DB pool exhausted.

### 5.10 `09-glossary.md`
- Short definitions, alphabetized: RAG, RRF, BM25, hybrid search, groundedness, chunk, embedding, HMAC, SSE, LangGraph node, AgentState, Flash, Pro, replay window, budget gate, citation, intent classification.
- Cross-linked from every other doc.

## 6. Source-of-truth rules

- Every diagram has a one-line caption naming the file(s) it depicts; if the code drifts, the caption helps the next maintainer find what to update.
- `path:line` refs use the form `chatbot/agent/graph.py:42`. We accept some bit-rot risk; the alternative (line-less refs) makes navigation worse.
- Where docs and the refactor spec describe the same thing, docs win; if they diverge, the doc is updated (the refactor spec is historical).

## 7. Out of scope (deferred)

- Hosted/rendered docs site (mkdocs, Docusaurus). Markdown on GitHub is sufficient for an internal-only service.
- Per-node prompt text inlined into docs. Prompts live in `chatbot/agent/prompts/*.md` and are linked, not duplicated.
- API client examples in JS/curl for every endpoint. Quickstart `curl` in the trimmed README; OpenAPI covers the rest.

## 8. Acceptance criteria

The documentation set is complete when:
1. All ten markdown files exist at the paths in §4.
2. Each file follows the three-act shape from §5.
3. Every mermaid diagram renders on GitHub (verified by previewing the PR).
4. Every node listed in `02-langraph-agent.md` has its file path and prompt path correctly cited.
5. Every endpoint table row in the README has a corresponding deep-dive section in `03-chat-flow.md` or `04-ingest-flow.md`.
6. `apps/chatbot/README.md` is trimmed (no duplicated architecture content) and links into `docs/`.
7. The glossary defines every acronym that appears in another doc.

## 9. Risks

- **Doc drift.** Code changes; docs don't. Mitigation: `path:line` refs make staleness visible during code review; PR template can prompt "did you touch chatbot? update docs/".
- **Length creep.** The temptation is to inline everything. Mitigation: each doc has a target length cap (architecture ≤400 lines, langraph-agent ≤800, others ≤300); over that, split.
- **Diagram rendering.** Mermaid sometimes fails on complex graphs. Mitigation: keep the LangGraph state diagram at the level of nodes + edges, not internal logic; pre-render in VS Code before commit.
