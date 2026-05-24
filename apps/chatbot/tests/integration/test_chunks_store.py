import pytest

from chatbot.retrieval.chunks_store import WeaviateChunksStore
from chatbot.retrieval.types import ChunkRecord

pytestmark = pytest.mark.integration


def _record(id_: str, embedding: list[float], **meta: str) -> ChunkRecord:
    return ChunkRecord(
        id=id_,
        collection=meta.get("collection", "posts"),
        slug=meta.get("slug", "hello"),
        chunk_index=int(meta.get("chunk_index", "0")),
        title=meta.get("title", "Title"),
        source_type=meta.get("source_type", "post"),
        url=meta.get("url"),
        content=meta.get("content", "body text"),
        embedding=embedding,
        metadata=meta.get("extra_metadata", {}),
    )


async def test_upsert_and_count(weaviate_client, weaviate_test_collection):
    store = WeaviateChunksStore(weaviate_client, weaviate_test_collection)
    await store.upsert([
        _record("posts:hello:0", [0.1] * 768),
        _record("posts:hello:1", [0.2] * 768),
    ])
    assert await store.count() == 2


async def test_upsert_replaces_existing_id(weaviate_client, weaviate_test_collection):
    store = WeaviateChunksStore(weaviate_client, weaviate_test_collection)
    await store.upsert([_record("posts:hello:0", [0.1] * 768, content="old")])
    await store.upsert([_record("posts:hello:0", [0.1] * 768, content="new")])
    assert await store.count() == 1


async def test_delete_by_document(weaviate_client, weaviate_test_collection):
    store = WeaviateChunksStore(weaviate_client, weaviate_test_collection)
    await store.upsert([
        _record("posts:keep:0", [0.0] * 768, slug="keep"),
        _record("posts:drop:0", [0.0] * 768, slug="drop"),
        _record("posts:drop:1", [0.0] * 768, slug="drop", chunk_index="1"),
    ])
    deleted = await store.delete_document("posts", "drop")
    assert deleted == 2
    assert await store.count() == 1
