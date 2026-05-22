import pytest

from chatbot.db.chunks_repo import ChunkRecord, ChunksRepo
from chatbot.llm.fake import FakeEmbeddingClient
from chatbot.retrieval.pgvector import HybridSearcher

pytestmark = pytest.mark.integration


async def _seed(db_pool, embedder):
    repo = ChunksRepo(db_pool)
    docs = [
        ("projects:rag:0", "Habibur built a production RAG pipeline using Weaviate", "RAG Pipeline"),
        ("projects:cv:0", "A computer vision model for traffic signal detection", "Traffic CV"),
        ("resume:profile:0", "Full-stack engineer with Next.js and Payload CMS experience", "Resume"),
    ]
    records = []
    for id_, text, title in docs:
        col, slug, idx = id_.split(":")
        records.append(
            ChunkRecord(
                id=id_, collection=col, slug=slug, chunk_index=int(idx),
                title=title, source_type="project" if col == "projects" else "resume",
                url=None, content=text,
                embedding=await embedder.aembed_query(text),
                metadata={},
            )
        )
    await repo.upsert(records)


async def test_hybrid_search_finds_relevant_chunk(db_pool):
    embedder = FakeEmbeddingClient(dimension=768)
    await _seed(db_pool, embedder)
    searcher = HybridSearcher(db_pool, embedder, top_k=2, rrf_k=60)
    hits = await searcher.search("rag pipeline weaviate")
    assert hits, "expected hits"
    assert hits[0].id == "projects:rag:0"


async def test_hybrid_search_falls_back_to_sparse_when_dense_misses(db_pool):
    embedder = FakeEmbeddingClient(dimension=768)
    await _seed(db_pool, embedder)
    searcher = HybridSearcher(db_pool, embedder, top_k=3, rrf_k=60)
    hits = await searcher.search("Payload CMS")
    assert any(h.id == "resume:profile:0" for h in hits)


async def test_hybrid_search_returns_empty_when_corpus_empty(db_pool):
    embedder = FakeEmbeddingClient(dimension=768)
    searcher = HybridSearcher(db_pool, embedder, top_k=5, rrf_k=60)
    assert await searcher.search("anything") == []
