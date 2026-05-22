"""chatbot.chat_logs repository."""
from __future__ import annotations

from dataclasses import dataclass, field
from uuid import UUID

import asyncpg


@dataclass(frozen=True)
class ChatLogRow:
    trace_id: UUID
    session_id: str | None
    query_redacted: str
    intent: str | None
    chunk_ids: list[str]
    groundedness: str | None
    latency_ms: int
    tokens_in: int
    tokens_out: int
    error: str | None
    feedback: str | None = field(default=None)


class ChatLogRepo:
    def __init__(self, pool: asyncpg.Pool) -> None:
        self._pool = pool

    async def insert(self, row: ChatLogRow) -> None:
        async with self._pool.acquire() as conn:
            await conn.execute(
                """
                INSERT INTO chatbot.chat_logs
                    (trace_id, session_id, query_redacted, intent, chunk_ids,
                     groundedness, latency_ms, tokens_in, tokens_out, error, feedback)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
                """,
                row.trace_id, row.session_id, row.query_redacted, row.intent,
                row.chunk_ids, row.groundedness, row.latency_ms, row.tokens_in,
                row.tokens_out, row.error, row.feedback,
            )

    async def record_feedback(self, trace_id: UUID, vote: str) -> bool:
        async with self._pool.acquire() as conn:
            result = await conn.execute(
                "UPDATE chatbot.chat_logs SET feedback = $1 WHERE trace_id = $2",
                vote, trace_id,
            )
        return int(result.split(" ")[-1]) > 0

    async def fetch_by_trace(self, trace_id: UUID) -> dict | None:
        async with self._pool.acquire() as conn:
            row = await conn.fetchrow(
                "SELECT * FROM chatbot.chat_logs WHERE trace_id = $1 ORDER BY created_at DESC LIMIT 1",
                trace_id,
            )
        return dict(row) if row else None
