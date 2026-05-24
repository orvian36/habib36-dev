# Chatbot — replace pgvector with Weaviate

**Date:** 2026-05-24
**Scope:** `apps/chatbot`
**Status:** Design (awaiting review)

## Summary

Replace pgvector-backed chunk storage and hybrid search with a self-hosted Weaviate instance. The Gemini-based embedder, LangGraph agent, ingest pipeline, FastAPI surface, chat-log/budget tables, and overall request flow are unchanged. Only the vector storage layer moves.

## Goals

- All vector storage and hybrid retrieval served by Weaviate.
- Postgres retained for chat logs and token-budget accounting.
- Existing Gemini embedder owns embedding at ingest + query time (Weaviate is configured with `vectorizer: none`).
- Clean cutover: pgvector dependency, extension, table, and HNSW index are fully removed.
- Integration tests run against a real Weaviate container; unit tests stay backend-free.

## Non-goals

- Migrating data out of `chatbot.chunks` (re-ingest after cutover).
- Switching to Weaviate-managed vectorization (`text2vec-google` or similar).
- Adding authentication between the chatbot service and Weaviate beyond an optional API key — internal Docker network is the trust boundary, matching the Postgres posture.
- Dual-running pgvector and Weaviate behind a feature flag.

## Decisions

| Decision | Choice | Reasoning |
|---|---|---|
| Deployment | Self-hosted Weaviate via Docker | Mirrors the current local Postgres setup; offline-capable; no cloud account required. |
| Embeddings | Keep `GeminiEmbeddingClient`, push pre-computed vectors | Zero behavior change to retrieval quality; provider-agnostic; simpler local dev. |
| Schema/data | Clean cutover — drop `chatbot.chunks` and `EXTENSION vector`; re-ingest | No production load yet; avoids dual-write complexity. |
| Tests | Real Weaviate container at `WEAVIATE_TEST_URL` | Catches schema and hybrid-search regressions that mocks would mask. |
| Hybrid fusion | Weaviate native hybrid, default `alpha=0.5`, `fusion_type=RANKED` | RANKED = reciprocal rank fusion, the closest analogue to the current hand-rolled RRF SQL. |

## Architecture

```
                                     ┌────────────────────────┐
                                     │      Postgres 16       │
                                     │  chat_logs             │
                                     │  usage_budget          │
                                     └────────────────────────┘
                                                  ▲
                                                  │ asyncpg pool
                                                  │
┌──────────────┐   embed     ┌────────────────┐   │
│ IngestService│────────────▶│ GeminiEmbedding│   │
└──────┬───────┘             └────────────────┘   │
       │ upsert(records)                          │
       ▼                                          │
┌────────────────────┐                            │
│ WeaviateChunksStore│                            │
└──────┬─────────────┘                            │
       │                                          │
       ▼                                          │
┌────────────────────────┐                        │
│  Weaviate 1.27         │   ◀────hybrid query────┤
│  collection = Chunks   │                        │
│  vectorizer: none      │                ┌───────┴────────┐
│  vector(768) cosine    │   ◀────────────│ HybridSearcher │
│  BM25 on `content`     │                └────────────────┘
└────────────────────────┘
```

### Module boundaries

- **`chatbot/retrieval/`** — owns embedding, chunking, vector storage, hybrid search. Talks to Weaviate.
- **`chatbot/db/`** — owns Postgres-backed concerns: chat logs and the daily token-budget table.
- **`chatbot/ingest/`** — unchanged orchestration: chunk → embed → upsert via the retrieval store.
- **`chatbot/agent/`** — unchanged. The `Searcher` protocol still expects `async search(query: str) -> list[ChunkHit]`.

## Components

### New files

#### `chatbot/retrieval/types.py`

Holds `ChunkRecord` and `ChunkHit` (moved from `chatbot/db/chunks_repo.py`). Same fields, same frozen-dataclass shape. Centralises the retrieval contract in one place.

#### `chatbot/retrieval/weaviate_client.py`

```python
async def create_weaviate_client(
    http_host: str, http_port: int, grpc_host: str, grpc_port: int,
    *, api_key: str | None = None, secure: bool = False,
) -> WeaviateAsyncClient: ...
async def ensure_chunks_collection(client: WeaviateAsyncClient, name: str) -> None: ...
```

- `create_weaviate_client` wraps `weaviate.use_async_with_custom(http_host=..., http_port=..., http_secure=secure, grpc_host=..., grpc_port=..., grpc_secure=secure, auth_credentials=Auth.api_key(api_key) if api_key else None)` then `await client.connect()`. Both HTTP and gRPC endpoints are required by the v4 async client; the gRPC port is what powers `query.hybrid` and `data.insert_many`.
- `ensure_chunks_collection` checks `await client.collections.exists(name)` and calls `client.collections.create(...)` only when missing — avoids exception-based control flow.
- Collection schema (`Chunks`):

  | Property | Type | Tokenization | Indexed |
  |---|---|---|---|
  | `external_id` | TEXT | `field` | filterable |
  | `collection` | TEXT | `field` | filterable |
  | `slug` | TEXT | `field` | filterable |
  | `chunk_index` | INT | — | — |
  | `title` | TEXT | `word` | searchable |
  | `source_type` | TEXT | `field` | filterable |
  | `url` | TEXT | `word` | optional |
  | `content` | TEXT | `word` | searchable (BM25) |
  | `metadata_json` | TEXT | `field` | — |

  Vector: 768 dims, cosine distance, HNSW. `vectorizer_config = Configure.Vectorizer.none()`.

#### `chatbot/retrieval/chunks_store.py`

```python
@dataclass(frozen=True)
class WeaviateChunksStore:
    client: WeaviateAsyncClient
    collection_name: str

    async def upsert(self, records: list[ChunkRecord]) -> None: ...
    async def delete_document(self, collection: str, slug: str) -> int: ...
    async def count(self) -> int: ...
```

- `upsert` builds `DataObject(properties=..., vector=record.embedding, uuid=uuid5(NAMESPACE_URL, record.id))` per record and calls `collection = client.collections.use(name); await collection.data.insert_many([...])`. UUID5 of the external id makes upserts deterministic (re-inserting the same id replaces the prior object).
- `delete_document` uses `await collection.data.delete_many(where=Filter.by_property("collection").equal(c) & Filter.by_property("slug").equal(s))`. The response carries `matches` / `successful`; we return `successful` as the deleted count.
- `count` calls `await collection.aggregate.over_all(total_count=True)` and returns `result.total_count`.
- `metadata` is round-tripped as JSON in `metadata_json`.

#### `chatbot/retrieval/hybrid_search.py`

```python
@dataclass(frozen=True)
class HybridSearcher:
    client: WeaviateAsyncClient
    embedder: EmbeddingClient
    collection_name: str
    top_k: int = 8
    alpha: float = 0.5

    async def search(self, query: str) -> list[ChunkHit]:
        vector = await self.embedder.aembed_query(query)
        collection = self.client.collections.use(self.collection_name)
        res = await collection.query.hybrid(
            query=query,
            vector=vector,
            alpha=self.alpha,
            fusion_type=HybridFusion.RANKED,
            limit=self.top_k,
            return_metadata=MetadataQuery(score=True),
        )
        return [_to_hit(o) for o in res.objects]
```

`_to_hit` reconstructs `ChunkHit` from the Weaviate object, parsing `metadata_json` back into a dict and using `o.metadata.score` for the score field.

#### `apps/chatbot/migrations/0002_drop_chunks.sql`

```sql
DROP TABLE IF EXISTS chatbot.chunks;
DROP EXTENSION IF EXISTS vector;
```

### Modified files

- **`chatbot/config.py`** — add:
  - `weaviate_http_host: str = "localhost"`
  - `weaviate_http_port: int = 8080`
  - `weaviate_grpc_host: str = "localhost"`
  - `weaviate_grpc_port: int = 50051`
  - `weaviate_secure: bool = False`
  - `weaviate_api_key: str | None = None`
  - `weaviate_collection: str = "Chunks"`
- **`chatbot/main.py`** — lifespan: build Weaviate client after the Postgres pool; call `ensure_chunks_collection`; wire `WeaviateChunksStore` (via `IngestService`) and `HybridSearcher`. Close client in the `finally` block alongside `pool.close()`.
- **`chatbot/api/deps.py`** — add `weaviate: WeaviateAsyncClient` to `AppContext`. `HybridSearcher` import path moves to `chatbot.retrieval.hybrid_search`. The `ChunkHit` import switches from `chatbot.db.chunks_repo` to `chatbot.retrieval.types`.
- **`chatbot/agent/graph.py`** — update the `ChunkHit` import to `from ..retrieval.types import ChunkHit`. Otherwise unchanged.
- **`chatbot/db/pool.py`** — delete the `register_vector` initializer and the `pgvector.asyncpg` import. `create_pool` becomes a thin wrapper around `asyncpg.create_pool`.
- **`chatbot/ingest/service.py`** — type annotation change only: `repo: WeaviateChunksStore`. The call surface (`upsert`, `delete_document`) is identical.
- **`apps/chatbot/migrations/0001_init.sql`** — remove `CREATE EXTENSION vector;` and the entire `chatbot.chunks` block (incl. its three indexes). Keep `chat_logs` and `usage_budget` exactly as today.
- **`apps/chatbot/pyproject.toml`** — drop `pgvector>=0.3.6`; add `weaviate-client>=4.9`.
- **`docker-compose.yml`** —
  - Swap `pgvector/pgvector:pg16` → `postgres:16`.
  - Add a `weaviate` service:
    ```yaml
    weaviate:
      image: semitechnologies/weaviate:1.27.0
      environment:
        QUERY_DEFAULTS_LIMIT: 25
        AUTHENTICATION_ANONYMOUS_ACCESS_ENABLED: "true"
        PERSISTENCE_DATA_PATH: /var/lib/weaviate
        DEFAULT_VECTORIZER_MODULE: none
        ENABLE_MODULES: ""
        CLUSTER_HOSTNAME: node1
      # Internal-only; gRPC + HTTP both exposed on the internal network.
      # 8080 = HTTP REST, 50051 = gRPC (required by the v4 async client).
      volumes:
        - weaviate_data:/var/lib/weaviate
      healthcheck:
        test: ["CMD", "wget", "--spider", "-q", "http://localhost:8080/v1/.well-known/ready"]
        interval: 5s
        timeout: 5s
        retries: 10
      networks: [internal]
    ```
  - Add `weaviate: { condition: service_healthy }` to `chatbot.depends_on`.
  - Add to the chatbot env block:
    - `WEAVIATE_HTTP_HOST: weaviate`
    - `WEAVIATE_HTTP_PORT: "8080"`
    - `WEAVIATE_GRPC_HOST: weaviate`
    - `WEAVIATE_GRPC_PORT: "50051"`
  - Add `weaviate_data:` to the `volumes:` map.

### Deleted files

- `chatbot/retrieval/pgvector.py`
- `chatbot/db/chunks_repo.py`

## Hybrid search semantics

| Aspect | Today (pgvector) | Tomorrow (Weaviate) |
|---|---|---|
| Dense | `embedding <=> $1` cosine, HNSW | Vector cosine, HNSW |
| Sparse | Postgres `ts_rank` over generated tsvector | Native BM25 over `content` |
| Fusion | Hand-rolled RRF in SQL, `k=60` | `HybridFusion.RANKED` (RRF) |
| Weighting | Equal contribution (sum of two RRF terms) | `alpha=0.5` |
| Candidate pool | `candidate_pool=20` (config) | Implicit in Weaviate's hybrid pipeline |
| Result count | `top_k=8` | `top_k=8` |
| Score in `ChunkHit` | RRF sum | Weaviate hybrid score (`metadata.score`) |

The score values are not directly comparable across the two systems, but the `ChunkHit.score` field is only used for logging and ordering — order is preserved by Weaviate's own ranking.

## Configuration

| Env var | Default | Purpose |
|---|---|---|
| `WEAVIATE_HTTP_HOST` | `localhost` | Hostname for Weaviate HTTP REST. In docker-compose: `weaviate`. |
| `WEAVIATE_HTTP_PORT` | `8080` | HTTP REST port. |
| `WEAVIATE_GRPC_HOST` | `localhost` | Hostname for Weaviate gRPC (used by v4 client for `query.hybrid`, `insert_many`). |
| `WEAVIATE_GRPC_PORT` | `50051` | gRPC port. |
| `WEAVIATE_SECURE` | `false` | Use TLS for both HTTP and gRPC. |
| `WEAVIATE_API_KEY` | unset | Optional; passed as `Auth.api_key(...)` when set. Reserved for future managed/secured deployments. |
| `WEAVIATE_COLLECTION` | `Chunks` | Production collection name. Tests override to `ChunksTest`. |

Removed: nothing — pgvector had no dedicated env vars beyond `DATABASE_URL`, which stays.

## Error handling and lifecycle

- **Startup** — failure to connect to Weaviate (network, schema mismatch) raises during the FastAPI lifespan, exactly like Postgres pool creation does today. Fail-fast.
- **Shutdown** — `await client.close()` in `finally`, paired with `await pool.close()`.
- **Search-time errors** — bubble up to the LangGraph `retrieve` node, which already has `max_retrieval_retries` and a `fallback_no_context` branch. No new error paths.
- **Idempotent collection ensure** — `ensure_chunks_collection` catches the "collection exists" response from Weaviate and treats it as success.

## Testing

### Fixtures

- `tests/conftest.py` (root, session-scoped):
  - Existing `test_dsn` / `db_pool` fixtures unchanged.
  - New `weaviate_test_endpoints` fixture: skips if any of `WEAVIATE_TEST_HTTP_HOST` / `WEAVIATE_TEST_HTTP_PORT` / `WEAVIATE_TEST_GRPC_HOST` / `WEAVIATE_TEST_GRPC_PORT` are unset (mirrors `TEST_DATABASE_URL`).
  - New `weaviate_client` fixture: yields a connected `WeaviateAsyncClient`; closes on teardown.
- `tests/integration/conftest.py`:
  - Existing autouse Postgres truncate now only truncates `chat_logs` and `usage_budget`.
  - New autouse `_weaviate_reset` fixture: deletes the `ChunksTest` collection (if present) and re-creates it via `ensure_chunks_collection`. Cheaper than per-object deletes.

### Test files

- **Rename + retarget** `tests/integration/test_pgvector_search.py` → `tests/integration/test_hybrid_search.py`. Same three cases (relevant chunk found, sparse fallback, empty corpus) against `HybridSearcher`.
- **Split** `tests/integration/test_repos.py`:
  - `test_chunks_store.py` — the three chunks tests, against `WeaviateChunksStore`.
  - `test_chat_log_and_budget.py` — the remaining chat-log and budget tests, against Postgres.
- **`tests/integration/test_ingest_service.py`** — swap `ChunksRepo(db_pool)` → `WeaviateChunksStore(client, "ChunksTest")`. Assertions unchanged.
- **`tests/integration/test_migrate.py`** — verify `0002_drop_chunks.sql` is applied and that `chatbot.chunks` no longer exists.

### Unit tests

Untouched: `test_gemini_embedder.py`, `test_gemini_client.py`, `test_fake_llm.py`, `test_health_metrics.py`, `test_config.py` (the last one gets one new assertion for `weaviate_url` default).

## Documentation rewrites

Full rewrite of vector-storage sections in:

- `apps/chatbot/README.md` — feature blurb, env vars, quickstart, "Vector store" section.
- `apps/chatbot/docs/01-architecture.md` — Postgres-vs-Weaviate split, dependency list.
- `apps/chatbot/docs/04-ingest-flow.md` — replace SQL upsert walkthrough with Weaviate `insert_many` + `delete_many` flow.
- `apps/chatbot/docs/05-retrieval-rag.md` — replace the SQL CTE explanation with Weaviate hybrid + RANKED fusion explanation; document `alpha` and `top_k`.
- `apps/chatbot/docs/06-security.md` — note: Weaviate trust boundary is the internal Docker network; API key reserved for future managed deployments.
- `apps/chatbot/docs/08-ops-deploy.md` — replace pgvector container, env, and migration notes; add Weaviate volume backup note; update the runbook entry about re-indexing.
- `apps/chatbot/docs/09-glossary.md` — drop "pgvector", "RRF SQL", "tsvector"; add "Weaviate", "BM25", "Hybrid fusion (RANKED)".
- `apps/chatbot/docs/README.md` — update the doc-index summary line.
- `apps/chatbot/docs/02-langraph-agent.md` — light edit: the `retrieve` node now calls `WeaviateHybridSearcher`; remove the pgvector aside.

## Migration order (preview — full plan comes next)

1. Add dependency and config plumbing (no behavior change yet).
2. Build `weaviate_client.py`, `types.py`, `chunks_store.py`, `hybrid_search.py`.
3. Switch wiring in `main.py` and `api/deps.py`.
4. Update ingest type hints; delete `chunks_repo.py` and `retrieval/pgvector.py`.
5. Add `0002_drop_chunks.sql`; edit `0001_init.sql`.
6. Update docker-compose; remove `pgvector` package; add `weaviate-client`.
7. Rewrite tests + fixtures; add `WEAVIATE_TEST_URL` to CI/local docs.
8. Rewrite docs.

## Open risks

- **Weaviate Windows local dev** — the dev workflow runs on Windows. Weaviate's Docker image is amd64 Linux; runs fine on Docker Desktop. Flagging because the user's primary platform is Windows; no expected blocker but worth confirming during execution.
- **`weaviate-client` v4 API stability** — pinned at `>=4.9` since v4 is stable, but minor releases occasionally rename helpers. The plan will pin a specific minor in `uv.lock`.
- **Collection-name case sensitivity** — Weaviate enforces capitalised collection names. Settled on `Chunks` (prod) / `ChunksTest` (tests).
