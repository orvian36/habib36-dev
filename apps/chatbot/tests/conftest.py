"""Shared fixtures for integration + e2e tiers.

DB fixtures skip if `TEST_DATABASE_URL` is unset.
Weaviate fixtures skip if any of WEAVIATE_TEST_HTTP_HOST / WEAVIATE_TEST_HTTP_PORT
/ WEAVIATE_TEST_GRPC_HOST / WEAVIATE_TEST_GRPC_PORT is unset.
"""
import os
from collections.abc import AsyncIterator

import asyncpg
import pytest
import pytest_asyncio


@pytest.fixture(scope="session")
def test_dsn() -> str:
    dsn = os.environ.get("TEST_DATABASE_URL")
    if not dsn:
        pytest.skip("TEST_DATABASE_URL not set — skipping db-backed tests")
    return dsn


@pytest_asyncio.fixture
async def db_pool(test_dsn: str) -> AsyncIterator[asyncpg.Pool]:
    from chatbot.db.migrate import apply_migrations
    from chatbot.db.pool import create_pool

    await apply_migrations(test_dsn)
    pool = await create_pool(test_dsn, min_size=1, max_size=4)
    yield pool
    await pool.close()


@pytest_asyncio.fixture
async def truncate_tables(db_pool: asyncpg.Pool) -> AsyncIterator[None]:
    """Opt-in truncation fixture (only chat_logs + usage_budget; chunks live in Weaviate)."""
    async with db_pool.acquire() as conn:
        await conn.execute(
            "TRUNCATE chatbot.chat_logs, chatbot.usage_budget RESTART IDENTITY;"
        )
    yield


@pytest.fixture(scope="session")
def weaviate_test_endpoints() -> dict[str, object]:
    http_host = os.environ.get("WEAVIATE_TEST_HTTP_HOST")
    http_port = os.environ.get("WEAVIATE_TEST_HTTP_PORT")
    grpc_host = os.environ.get("WEAVIATE_TEST_GRPC_HOST")
    grpc_port = os.environ.get("WEAVIATE_TEST_GRPC_PORT")
    if not all([http_host, http_port, grpc_host, grpc_port]):
        pytest.skip("WEAVIATE_TEST_* endpoints not set — skipping weaviate-backed tests")
    return {
        "http_host": http_host,
        "http_port": int(http_port),
        "grpc_host": grpc_host,
        "grpc_port": int(grpc_port),
    }


@pytest.fixture(scope="session")
def weaviate_test_collection() -> str:
    return os.environ.get("WEAVIATE_TEST_COLLECTION", "ChunksTest")


@pytest_asyncio.fixture
async def weaviate_client(weaviate_test_endpoints):
    from chatbot.retrieval.weaviate_client import create_weaviate_client

    client = await create_weaviate_client(
        http_host=weaviate_test_endpoints["http_host"],
        http_port=weaviate_test_endpoints["http_port"],
        grpc_host=weaviate_test_endpoints["grpc_host"],
        grpc_port=weaviate_test_endpoints["grpc_port"],
    )
    try:
        yield client
    finally:
        await client.close()
