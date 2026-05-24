import pytest

pytestmark = pytest.mark.integration


async def test_connect_and_ready(weaviate_client):
    assert await weaviate_client.is_ready() is True


async def test_ensure_collection_is_idempotent(weaviate_client, weaviate_test_collection):
    from chatbot.retrieval.weaviate_client import ensure_chunks_collection

    # Clean slate
    if await weaviate_client.collections.exists(weaviate_test_collection):
        await weaviate_client.collections.delete(weaviate_test_collection)

    await ensure_chunks_collection(weaviate_client, weaviate_test_collection)
    assert await weaviate_client.collections.exists(weaviate_test_collection)

    # Running again must not raise
    await ensure_chunks_collection(weaviate_client, weaviate_test_collection)
    assert await weaviate_client.collections.exists(weaviate_test_collection)
