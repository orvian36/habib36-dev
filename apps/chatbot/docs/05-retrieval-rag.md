# 05 – Retrieval & RAG Pipeline

> All source paths below are relative to `apps/chatbot/` (so `chatbot/retrieval/weaviate_store.py` lives on disk at `apps/chatbot/chatbot/retrieval/weaviate_store.py`).

The retrieval layer turns a raw user query into a ranked list of text chunks that are injected into the generator prompt. Four components do the work: **Chunker → Embedder → Weaviate `Chunks` collection → HybridSearcher**.

---

## 1. Chunker

**File:** `chatbot/retrieval/chunker.py`

`Chunker` wraps LangChain's `RecursiveCharacterTextSplitter`. Sizes are **characters**, not tokens (`length_function=len`, `chunker.py:22`).

| Setting | Default | Source |
|---|---|---|
| `chunk_size` | 700 chars | `config.py:38` |
| `chunk_overlap` | 100 chars | `config.py:39` |

**Split strategy** (`chunker.py:23`): tries separators in order — `"\n\n"`, `"\n"`, `". "`, `" "`, `""` — falling back to character splitting only when none match. This is paragraph → sentence → word → character priority, so semantic units survive intact when possible.

**Why 700 / 100:**
- 700 chars ≈ 130–160 tokens — small enough to retrieve tight snippets without diluting the relevance signal, yet far under Gemini Flash's context window ceiling for the generation step.
- A 100-char overlap (~14 % of chunk size) prevents entities or sentences that cross a boundary from disappearing from both neighbours.

```python
# chunker.py:15-24
class Chunker:
    def __init__(self, chunk_size: int = 700, chunk_overlap: int = 100) -> None:
        ...
        self._splitter = RecursiveCharacterTextSplitter(
            chunk_size=chunk_size,
            chunk_overlap=chunk_overlap,
            length_function=len,
            separators=["\n\n", "\n", ". ", " ", ""],
        )
```

`Chunker.split()` (`chunker.py:26-31`) strips leading/trailing whitespace, delegates to `_splitter.split_text()`, and wraps results in `Chunk(text, index)` dataclasses.

---

## 2. Embedder

**File:** `chatbot/retrieval/embedder.py`

`GeminiEmbeddingClient` wraps the Google GenAI async SDK.

| Property | Value | Source |
|---|---|---|
| Model | `gemini-embedding-001` | `embedder.py:18`, `config.py:30` |
| Output dimension | 768 dims, stored externally in Weaviate (`vectorizer: none`) | `embedder.py:19`, `config.py:31` |
| Async? | Yes — `aio.models.embed_content` | `embedder.py:30` |
| Batched? | Yes — 100 texts per API call | `embedder.py:41-44` |

**Key methods:**

- `_embed_batch(texts)` (`embedder.py:29-35`): sends a single batched request; extracts `.values` from each `Embedding` object.
- `aembed_query(text)` (`embedder.py:37-39`): wraps `_embed_batch` for a single string; used by the searcher at query time.
- `aembed_documents(texts, *, batch_size=100)` (`embedder.py:41-45`): slices the input into 100-item windows and collects results; used during ingest.

There is no explicit retry logic inside the embedder — callers rely on the ingest pipeline's retry layer (see `04-ingest-flow.md`).

---

## 3. Weaviate `Chunks` Collection

**Managed by:** `chatbot/retrieval/weaviate_store.py` (`WeaviateChunksStore.ensure_collection`)

The `Chunks` collection uses `vectorizer: none` — vectors are computed externally by the Gemini embedder and passed in explicitly on every upsert.

| Property | Weaviate type | Notes |
|---|---|---|
| `external_id` | `text` | Deterministic hash; source of the UUID5 object ID |
| `collection` | `text` | Payload CMS collection name (e.g. `posts`, `projects`) |
| `slug` | `text` | Document slug; used for document-level deletes |
| `chunk_index` | `int` | Position within the parent document |
| `title` | `text` | Document title |
| `source_type` | `text` | Payload `SourceType` enum value |
| `url` | `text` | Optional canonical URL |
| `content` | `text` | Chunk text; BM25-indexed automatically |
| `metadata_json` | `text` | Serialised JSON metadata dict |

**Index configuration:**

| Index | Type | Purpose |
|---|---|---|
| Vector index | HNSW vector index on the `Chunks` Weaviate collection, cosine distance | ANN vector search |
| BM25 index | Inverted index on `content` (automatic in Weaviate) | Keyword / BM25 candidate scan |

HNSW is chosen (Weaviate default) because it supports incremental inserts without requiring a periodic rebuild; this matters for an online ingest API. The 768-dim vector is stored externally in Weaviate (`vectorizer: none`).

---

## 4. Hybrid Search

**File:** `chatbot/retrieval/searcher.py` — `HybridSearcher.search(query)`

**Hybrid search.** `HybridSearcher.search(query)` performs one Weaviate call:

```python
await collection.query.hybrid(
    query=query,
    vector=await embedder.aembed_query(query),
    alpha=0.5,                          # equal weight between BM25 and vector
    fusion_type=HybridFusion.RANKED,    # reciprocal rank fusion
    limit=top_k,
    return_metadata=MetadataQuery(score=True),
)
```

- `alpha` controls the BM25↔vector mix (`0.0` = keyword only, `1.0` = vector only). The default `0.5` matches the equal-weight RRF semantics of the previous SQL-based fusion.
- `HybridFusion.RANKED` is Weaviate's reciprocal rank fusion implementation; `HybridFusion.RELATIVE_SCORE` is the alternative if score-normalised fusion is wanted later.
- `limit` defines `top_k`. Internal candidate pool sizing is managed by Weaviate.

Each returned object is mapped back to a `ChunkHit(id=external_id, ..., score=metadata.score)`. The score scale differs from the previous RRF-sum (Weaviate scores are not directly comparable across queries) but the ordering is preserved.

### Worked Example — Hybrid with 3 chunks

Query: `"FastAPI dependency injection"`

| Chunk | BM25 rank | Vector rank | Fused result |
|---|---|---|---|
| A — "FastAPI uses `Depends()`…" | 1 | 2 | top (strong in both legs) |
| B — "Dependency injection patterns…" | 2 | 3 | second |
| C — "vector cosine similarity…" | — | 1 | lower (no keyword match) |

Chunk A wins: it ranks highly in both legs. Chunk C appears only in the vector results (no BM25 match for "FastAPI dependency injection") so its fused score is lower despite having the best vector rank.

---

## 5. Why Hybrid vs. Pure Vector

Pure-vector retrieval fails on **exact-match terms** common in a developer portfolio corpus: library names (`asyncpg`, `weaviate-client`), file paths (`chatbot/retrieval/chunker.py`), version strings (`gemini-2.5-flash`), and method names (`aembed_documents`). These are low-frequency tokens that embeddings smear across the semantic neighbourhood; the BM25 leg over the `content` field catches them with precise keyword matching. Conversely, the vector leg handles paraphrases and cross-lingual queries that BM25 misses. `HybridFusion.RANKED` (reciprocal rank fusion) keeps both strengths without requiring per-corpus weight tuning.

---

## See Also

- [04-ingest-flow.md](04-ingest-flow.md) — how documents reach the Weaviate `Chunks` collection
- [09-glossary.md](09-glossary.md) — RRF, HNSW, Matryoshka embeddings, BM25, Weaviate
