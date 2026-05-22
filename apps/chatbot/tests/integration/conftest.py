import os
from collections.abc import AsyncIterator

import asyncpg
import pytest
import pytest_asyncio


@pytest.fixture(scope="session")
def test_dsn() -> str:
    dsn = os.environ.get("TEST_DATABASE_URL")
    if not dsn:
        pytest.skip("TEST_DATABASE_URL not set — skipping integration tests")
    return dsn


@pytest_asyncio.fixture
async def db_pool(test_dsn: str) -> AsyncIterator[asyncpg.Pool]:
    from chatbot.db.pool import create_pool
    from chatbot.db.migrate import apply_migrations

    await apply_migrations(test_dsn)
    pool = await create_pool(test_dsn, min_size=1, max_size=4)
    yield pool
    await pool.close()


@pytest_asyncio.fixture(autouse=True)
async def truncate_tables(db_pool: asyncpg.Pool) -> AsyncIterator[None]:
    async with db_pool.acquire() as conn:
        await conn.execute("TRUNCATE chatbot.chunks, chatbot.chat_logs, chatbot.usage_budget RESTART IDENTITY;")
    yield
