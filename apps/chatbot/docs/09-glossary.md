# 09 — Glossary

Short definitions for terms used across the chatbot documentation. Cross-linked from every other doc.

## A

**AgentState** — The LangGraph `TypedDict` carrying everything between nodes: the user query, retrieved chunks, intermediate drafts, the final answer, and routing flags. Defined at `chatbot/agent/state.py:42`. See [`02-langraph-agent.md`](./02-langraph-agent.md).

## B

**BM25** — Best Match 25, a probabilistic keyword-ranking algorithm based on term frequency and inverse document frequency. One of the two signals in hybrid search; complements vector similarity by catching exact-term matches that embeddings paraphrase away. See [`05-retrieval-rag.md`](./05-retrieval-rag.md).

**Budget gate** — In-process daily + per-request token caps enforced before each `/chat` invocation. Daily cap persisted in Postgres (`budgets` table); per-request cap is a pre-flight estimate. Implemented in `chatbot/llm/budget.py`. See [`06-security.md`](./06-security.md).

## C

**chat_log** — Per-request audit row (`chat_logs` table) storing trace_id, redacted query, intent, chunk IDs, groundedness, latency, tokens. Substrate for offline evaluation. Persisted on `/chat` but NOT on `/chat/stream`. See [`07-observability.md`](./07-observability.md).

**Chunk** — A ~700-character window of a document with 100-character overlap; the unit of retrieval. Each chunk is embedded once and stored in `chunks`. See [`05-retrieval-rag.md`](./05-retrieval-rag.md).

**Citation** — A `SourceRef` pointing back to a chunk used in the answer. Emitted by the `extract_citations` node from `[i]` markers in the generated draft. See [`02-langraph-agent.md`](./02-langraph-agent.md).

## E

**Embedding** — A 768-dimensional float32 vector representation of a chunk produced by Gemini's `gemini-embedding-001` model. Cosine similarity in this space approximates semantic similarity. See [`05-retrieval-rag.md`](./05-retrieval-rag.md).

## F

**Flash** — `gemini-2.5-flash`, used for cheap inference nodes: input guard, intent classification, query rewriting, chunk grading, groundedness check, output guard, smalltalk reply. See [`01-architecture.md`](./01-architecture.md) ADR #4 and [`02-langraph-agent.md`](./02-langraph-agent.md).

## G

**Groundedness** — One of `grounded`, `partial`, `ungrounded`. Reflects how well the generated answer is supported by retrieved chunks. Decided by the `check_groundedness` node; drives the regenerate vs accept routing decision. See [`02-langraph-agent.md`](./02-langraph-agent.md).

## H

**HMAC** — Hash-based Message Authentication Code. Both endpoint groups (`/chat*` and `/ingest`/`DELETE`) require HMAC-signed headers with a 60-second replay window. Two distinct secrets (internal vs ingest) allow independent rotation. See [`06-security.md`](./06-security.md).

**HNSW** — Hierarchical Navigable Small World, the pgvector index type used on the `embedding` column. Supports incremental inserts (important for live ingest) and approximate nearest-neighbor search with strong recall. See [`05-retrieval-rag.md`](./05-retrieval-rag.md).

**Hybrid search** — Retrieval strategy combining a lexical signal (tsvector ts_rank) and a vector signal (cosine on the embedding) via Reciprocal Rank Fusion. See [`05-retrieval-rag.md`](./05-retrieval-rag.md).

## I

**Intent** — One of `smalltalk`, `off_topic`, `unsafe`, `about_habibur`, `tech_concept`. Determines the agent's first major routing decision after the input guard. Decided by the `classify_intent` node. See [`02-langraph-agent.md`](./02-langraph-agent.md).

## L

**LangGraph node** — A function `AgentState → AgentState` registered with the compiled graph. Sixteen nodes total: 10 on the main path + 6 fallbacks/helpers. See [`02-langraph-agent.md`](./02-langraph-agent.md).

## P

**PII redaction** — Pattern-based scrubbing of emails, phone numbers, and high-entropy tokens before persistence to `chat_log`. Applied to the stored query only; outbound LLM prompts are not redacted. See [`06-security.md`](./06-security.md).

**Pro** — `gemini-2.5-pro`, used exclusively for the `generate_answer` node where output quality matters most. See [`01-architecture.md`](./01-architecture.md) ADR #4.

**Prompt-injection detection** — Heuristic regex + entropy patterns checked in the `input_guard` node. On detection, sets `is_input_safe = False`, routing the graph to `refuse_unsafe`. See [`06-security.md`](./06-security.md).

## M

**Matryoshka embeddings** — An embedding technique where a single model produces vectors that remain meaningful when truncated to a shorter prefix. The chatbot uses `gemini-embedding-001` with Matryoshka truncation to 768 dimensions, allowing the dimension to be reduced without re-training. See [`05-retrieval-rag.md`](./05-retrieval-rag.md).

## R

**RAG** — Retrieval-Augmented Generation: retrieve relevant chunks from a corpus, then condition the LLM's generation on them. This service is a RAG system. See [`01-architecture.md`](./01-architecture.md).

**Replay window** — `Settings.replay_window_seconds = 60`. HMAC-signed requests with a timestamp outside `[now - 60s, now + 60s]` are rejected as 401. See [`06-security.md`](./06-security.md).

**RRF** — Reciprocal Rank Fusion. Combines multiple ranked lists into a single ranking via `score = Σ 1/(k + rank_i)` with `k = 60`. Used to fuse lexical + vector ranks in hybrid search. See [`05-retrieval-rag.md`](./05-retrieval-rag.md).

## S

**SSE** — Server-Sent Events. The streaming format used by `POST /chat/stream`. Emits four event types: `node`, `token`, `done`, `error`. See [`03-chat-flow.md`](./03-chat-flow.md).

## T

**tsvector** — A Postgres data type that stores a pre-processed, lexeme-normalised representation of a text document, enabling fast full-text search via `@@` and ranking via `ts_rank`. The `chunks.tsv` column is a generated stored column (`to_tsvector('english', content)`) used for the lexical leg of hybrid search. See [`05-retrieval-rag.md`](./05-retrieval-rag.md).

**trace_id** — UUID assigned per chat request. Threads through agent state, structured logs, OTel spans, `chat_log` rows, and `/chat/feedback`. See [`07-observability.md`](./07-observability.md).
