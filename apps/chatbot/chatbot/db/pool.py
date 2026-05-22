"""asyncpg connection pool with pgvector registration."""
from __future__ import annotations

import asyncpg
from pgvector.asyncpg import register_vector


async def _init_conn(conn: asyncpg.Connection) -> None:
    await register_vector(conn)


async def create_pool(dsn: str, *, min_size: int = 2, max_size: int = 10) -> asyncpg.Pool:
    return await asyncpg.create_pool(
        dsn,
        min_size=min_size,
        max_size=max_size,
        init=_init_conn,
    )
