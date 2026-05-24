import pytest

from chatbot.api.schemas import IngestDocument
from chatbot.ingest.service import IngestService
from chatbot.llm.fake import FakeEmbeddingClient
from chatbot.retrieval.chunker import Chunker
from chatbot.retrieval.chunks_store import WeaviateChunksStore

pytestmark = pytest.mark.integration


def _service(weaviate_client, collection_name: str) -> IngestService:
    return IngestService(
        chunker=Chunker(chunk_size=120, chunk_overlap=20),
        embedder=FakeEmbeddingClient(dimension=768),
        repo=WeaviateChunksStore(weaviate_client, collection_name),
    )


async def test_ingest_chunks_embed_and_upsert(weaviate_client, weaviate_test_collection):
    svc = _service(weaviate_client, weaviate_test_collection)
    store = WeaviateChunksStore(weaviate_client, weaviate_test_collection)
    summary = await svc.ingest(
        [
            IngestDocument(
                collection="posts", slug="welcome", title="Welcome",
                content="Sentence one. " * 30, source_type="post",
            )
        ]
    )
    assert summary.documents == 1
    assert summary.chunks >= 2
    assert await store.count() == summary.chunks


async def test_ingest_is_idempotent(weaviate_client, weaviate_test_collection):
    svc = _service(weaviate_client, weaviate_test_collection)
    store = WeaviateChunksStore(weaviate_client, weaviate_test_collection)
    doc = IngestDocument(
        collection="posts", slug="evolving", title="Evolving",
        content="version one " * 30, source_type="post",
    )
    await svc.ingest([doc])
    after_first = await store.count()
    await svc.ingest([doc])
    assert await store.count() == after_first


async def test_ingest_replaces_existing_chunks_on_update(weaviate_client, weaviate_test_collection):
    svc = _service(weaviate_client, weaviate_test_collection)
    store = WeaviateChunksStore(weaviate_client, weaviate_test_collection)
    doc = IngestDocument(
        collection="posts", slug="evolving", title="Evolving",
        content="version one " * 30, source_type="post",
    )
    await svc.ingest([doc])
    first_count = await store.count()
    await svc.ingest([doc.model_copy(update={"content": "short"})])
    assert await store.count() < first_count


async def test_ingest_skips_documents_with_no_chunkable_content(
    weaviate_client, weaviate_test_collection
):
    svc = _service(weaviate_client, weaviate_test_collection)
    summary = await svc.ingest(
        [
            IngestDocument(
                collection="posts", slug="empty", title="Empty",
                content="   ", source_type="post",
            )
        ]
    )
    assert summary.documents == 1 and summary.chunks == 0


async def test_delete_document_removes_only_matching_chunks(
    weaviate_client, weaviate_test_collection
):
    svc = _service(weaviate_client, weaviate_test_collection)
    await svc.ingest(
        [
            IngestDocument(collection="posts", slug="keep", title="K", content="keep", source_type="post"),
            IngestDocument(collection="posts", slug="drop", title="D", content="drop drop drop", source_type="post"),
        ]
    )
    deleted = await svc.delete("posts", "drop")
    assert deleted >= 1
