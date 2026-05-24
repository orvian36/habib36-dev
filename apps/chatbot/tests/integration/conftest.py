"""Integration-tier conftest — auto-truncate Postgres tables and reset the Weaviate test collection.

The pool/DSN/Weaviate fixtures live in `tests/conftest.py`.
"""
from collections.abc import AsyncIterator

import asyncpg
import pytest_asyncio


@pytest_asyncio.fixture(autouse=True)
async def _integration_truncate(db_pool: asyncpg.Pool) -> AsyncIterator[None]:
    async with db_pool.acquire() as conn:
        await conn.execute(
            "TRUNCATE chatbot.chat_logs, chatbot.usage_budget RESTART IDENTITY;"
        )
    yield


@pytest_asyncio.fixture(autouse=True)
async def _integration_weaviate_reset(request) -> AsyncIterator[None]:
    """Reset the test collection if the test requested a `weaviate_client` fixture."""
    if "weaviate_client" not in request.fixturenames:
        yield
        return

    client = request.getfixturevalue("weaviate_client")
    collection = request.getfixturevalue("weaviate_test_collection")

    from chatbot.retrieval.weaviate_client import ensure_chunks_collection

    if await client.collections.exists(collection):
        await client.collections.delete(collection)
    await ensure_chunks_collection(client, collection)
    yield
