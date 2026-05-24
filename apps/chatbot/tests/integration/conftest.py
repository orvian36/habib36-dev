"""Integration-tier conftest — auto-truncate tables between tests.

The pool/DSN fixtures live in tests/conftest.py so they can be shared with the e2e tier.
Weaviate-only tests that don't touch Postgres skip cleanly via the weaviate_test_endpoints
fixture; this autouse truncation only runs when a real DB pool is available.
"""
import os
from collections.abc import AsyncIterator

import asyncpg
import pytest_asyncio


@pytest_asyncio.fixture(autouse=True)
async def _integration_truncate() -> AsyncIterator[None]:
    dsn = os.environ.get("TEST_DATABASE_URL")
    if not dsn:
        yield
        return

    from chatbot.db.migrate import apply_migrations
    from chatbot.db.pool import create_pool

    await apply_migrations(dsn)
    pool = await create_pool(dsn, min_size=1, max_size=4)
    try:
        async with pool.acquire() as conn:
            await conn.execute(
                "TRUNCATE chatbot.chunks, chatbot.chat_logs, chatbot.usage_budget RESTART IDENTITY;"
            )
        yield
    finally:
        await pool.close()
