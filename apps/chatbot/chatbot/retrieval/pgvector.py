"""Hybrid retrieval: pgvector cosine + Postgres ts_rank, fused via RRF."""
from __future__ import annotations

from dataclasses import dataclass

import asyncpg

from ..db.chunks_repo import ChunkHit
from ..llm.base import EmbeddingClient


@dataclass(frozen=True)
class HybridSearcher:
    pool: asyncpg.Pool
    embedder: EmbeddingClient
    top_k: int = 8
    rrf_k: int = 60
    candidate_pool: int = 20

    async def search(self, query: str) -> list[ChunkHit]:
        embedding = await self.embedder.aembed_query(query)
        sql = """
        WITH dense AS (
            SELECT id, ROW_NUMBER() OVER (ORDER BY embedding <=> $1) AS r
            FROM chatbot.chunks
            ORDER BY embedding <=> $1
            LIMIT $4
        ),
        sparse AS (
            SELECT id, ROW_NUMBER() OVER (ORDER BY ts_rank(tsv, plainto_tsquery('english', $2)) DESC) AS r
            FROM chatbot.chunks
            WHERE tsv @@ plainto_tsquery('english', $2)
            LIMIT $4
        )
        SELECT c.id, c.collection, c.slug, c.title, c.source_type, c.url, c.content, c.metadata,
               COALESCE(1.0/($5 + d.r), 0) + COALESCE(1.0/($5 + s.r), 0) AS score
        FROM chatbot.chunks c
        LEFT JOIN dense  d ON d.id = c.id
        LEFT JOIN sparse s ON s.id = c.id
        WHERE d.r IS NOT NULL OR s.r IS NOT NULL
        ORDER BY score DESC
        LIMIT $3;
        """
        async with self.pool.acquire() as conn:
            rows = await conn.fetch(sql, embedding, query, self.top_k, self.candidate_pool, self.rrf_k)
        return [
            ChunkHit(
                id=row["id"],
                collection=row["collection"],
                slug=row["slug"],
                title=row["title"],
                source_type=row["source_type"],
                url=row["url"],
                content=row["content"],
                score=float(row["score"]),
                metadata=dict(row["metadata"] or {}),
            )
            for row in rows
        ]
