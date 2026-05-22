import pytest

from chatbot.api.schemas import IngestDocument
from chatbot.db.chunks_repo import ChunksRepo
from chatbot.ingest.service import IngestService
from chatbot.llm.fake import FakeEmbeddingClient
from chatbot.retrieval.chunker import Chunker

pytestmark = pytest.mark.integration


def _service(db_pool):
    return IngestService(
        chunker=Chunker(chunk_size=120, chunk_overlap=20),
        embedder=FakeEmbeddingClient(dimension=768),
        repo=ChunksRepo(db_pool),
    )


async def test_ingest_chunks_embed_and_upsert(db_pool):
    svc = _service(db_pool)
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
    assert await ChunksRepo(db_pool).count() == summary.chunks


async def test_ingest_is_idempotent(db_pool):
    svc = _service(db_pool)
    doc = IngestDocument(
        collection="posts", slug="evolving", title="Evolving",
        content="version one " * 30, source_type="post",
    )
    await svc.ingest([doc])
    after_first = await ChunksRepo(db_pool).count()
    await svc.ingest([doc])
    assert await ChunksRepo(db_pool).count() == after_first


async def test_ingest_replaces_existing_chunks_on_update(db_pool):
    svc = _service(db_pool)
    doc = IngestDocument(
        collection="posts", slug="evolving", title="Evolving",
        content="version one " * 30, source_type="post",
    )
    await svc.ingest([doc])
    first_count = await ChunksRepo(db_pool).count()
    await svc.ingest([doc.model_copy(update={"content": "short"})])
    assert await ChunksRepo(db_pool).count() < first_count


async def test_ingest_skips_documents_with_no_chunkable_content(db_pool):
    svc = _service(db_pool)
    summary = await svc.ingest(
        [
            IngestDocument(
                collection="posts", slug="empty", title="Empty",
                content="   ", source_type="post",
            )
        ]
    )
    assert summary.documents == 1 and summary.chunks == 0


async def test_delete_document_removes_only_matching_chunks(db_pool):
    svc = _service(db_pool)
    await svc.ingest(
        [
            IngestDocument(collection="posts", slug="keep", title="K", content="keep", source_type="post"),
            IngestDocument(collection="posts", slug="drop", title="D", content="drop drop drop", source_type="post"),
        ]
    )
    deleted = await svc.delete("posts", "drop")
    assert deleted >= 1
