"""chatbot.chunks repository."""
from __future__ import annotations

from dataclasses import dataclass
from typing import Any

import asyncpg


@dataclass(frozen=True)
class ChunkRecord:
    id: str
    collection: str
    slug: str
    chunk_index: int
    title: str
    source_type: str
    url: str | None
    content: str
    embedding: list[float]
    metadata: dict[str, Any]


@dataclass(frozen=True)
class ChunkHit:
    id: str
    collection: str
    slug: str
    title: str
    source_type: str
    url: str | None
    content: str
    score: float
    metadata: dict[str, Any]


class ChunksRepo:
    def __init__(self, pool: asyncpg.Pool) -> None:
        self._pool = pool

    async def upsert(self, records: list[ChunkRecord]) -> None:
        if not records:
            return
        rows = [
            (
                r.id, r.collection, r.slug, r.chunk_index, r.title, r.source_type,
                r.url, r.content, r.embedding, dict(r.metadata),
            )
            for r in records
        ]
        async with self._pool.acquire() as conn:
            async with conn.transaction():
                await conn.executemany(
                    """
                    INSERT INTO chatbot.chunks
                        (id, collection, slug, chunk_index, title, source_type, url, content, embedding, metadata)
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
                    ON CONFLICT (id) DO UPDATE SET
                        collection  = EXCLUDED.collection,
                        slug        = EXCLUDED.slug,
                        chunk_index = EXCLUDED.chunk_index,
                        title       = EXCLUDED.title,
                        source_type = EXCLUDED.source_type,
                        url         = EXCLUDED.url,
                        content     = EXCLUDED.content,
                        embedding   = EXCLUDED.embedding,
                        metadata    = EXCLUDED.metadata,
                        updated_at  = now()
                    """,
                    rows,
                )

    async def delete_document(self, collection: str, slug: str) -> int:
        async with self._pool.acquire() as conn:
            result = await conn.execute(
                "DELETE FROM chatbot.chunks WHERE collection = $1 AND slug = $2",
                collection, slug,
            )
        return int(result.split(" ")[-1])

    async def count(self) -> int:
        async with self._pool.acquire() as conn:
            return int(await conn.fetchval("SELECT count(*) FROM chatbot.chunks"))
