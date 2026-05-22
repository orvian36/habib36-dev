"""Shared fixtures for integration + e2e tiers.

The `db_pool` fixture skips automatically when `TEST_DATABASE_URL` is unset, so
running only unit tests requires no Postgres.
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
    """Opt-in truncation fixture for tests that need a clean slate.

    Not autouse — unit tests would skip the whole pool fixture chain otherwise.
    Integration and e2e tests that mutate the DB should request this explicitly,
    OR rely on each test setting up its own seed data.
    """
    async with db_pool.acquire() as conn:
        await conn.execute(
            "TRUNCATE chatbot.chunks, chatbot.chat_logs, chatbot.usage_budget RESTART IDENTITY;"
        )
    yield
