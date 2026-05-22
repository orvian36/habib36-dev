"""Integration-tier conftest — auto-truncate tables between tests.

The pool/DSN fixtures live in tests/conftest.py so they can be shared with the e2e tier.
"""
from collections.abc import AsyncIterator

import asyncpg
import pytest_asyncio


@pytest_asyncio.fixture(autouse=True)
async def _integration_truncate(db_pool: asyncpg.Pool) -> AsyncIterator[None]:
    async with db_pool.acquire() as conn:
        await conn.execute(
            "TRUNCATE chatbot.chunks, chatbot.chat_logs, chatbot.usage_budget RESTART IDENTITY;"
        )
    yield
