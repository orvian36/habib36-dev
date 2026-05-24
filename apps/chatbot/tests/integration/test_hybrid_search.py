import pytest

from chatbot.llm.fake import FakeEmbeddingClient
from chatbot.retrieval.chunks_store import WeaviateChunksStore
from chatbot.retrieval.hybrid_search import HybridSearcher
from chatbot.retrieval.types import ChunkRecord

pytestmark = pytest.mark.integration


async def _seed(store: WeaviateChunksStore, embedder: FakeEmbeddingClient):
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
    await store.upsert(records)


async def test_hybrid_search_finds_relevant_chunk(weaviate_client, weaviate_test_collection):
    embedder = FakeEmbeddingClient(dimension=768)
    store = WeaviateChunksStore(weaviate_client, weaviate_test_collection)
    await _seed(store, embedder)
    searcher = HybridSearcher(weaviate_client, embedder, weaviate_test_collection, top_k=2)
    hits = await searcher.search("rag pipeline weaviate")
    assert hits, "expected hits"
    assert hits[0].id == "projects:rag:0"


async def test_hybrid_search_falls_back_to_sparse_when_dense_misses(
    weaviate_client, weaviate_test_collection
):
    embedder = FakeEmbeddingClient(dimension=768)
    store = WeaviateChunksStore(weaviate_client, weaviate_test_collection)
    await _seed(store, embedder)
    searcher = HybridSearcher(weaviate_client, embedder, weaviate_test_collection, top_k=3)
    hits = await searcher.search("Payload CMS")
    assert any(h.id == "resume:profile:0" for h in hits)


async def test_hybrid_search_returns_empty_when_corpus_empty(
    weaviate_client, weaviate_test_collection
):
    embedder = FakeEmbeddingClient(dimension=768)
    searcher = HybridSearcher(weaviate_client, embedder, weaviate_test_collection, top_k=5)
    assert await searcher.search("anything") == []
