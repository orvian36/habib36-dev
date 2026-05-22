"""chatbot.usage_budget repository — daily token counters."""
from __future__ import annotations

from datetime import date

import asyncpg


class BudgetRepo:
    def __init__(self, pool: asyncpg.Pool) -> None:
        self._pool = pool

    async def increment(self, day: date, *, tokens_in: int, tokens_out: int) -> None:
        async with self._pool.acquire() as conn:
            await conn.execute(
                """
                INSERT INTO chatbot.usage_budget (day, tokens_in, tokens_out)
                VALUES ($1, $2, $3)
                ON CONFLICT (day) DO UPDATE
                  SET tokens_in  = chatbot.usage_budget.tokens_in  + EXCLUDED.tokens_in,
                      tokens_out = chatbot.usage_budget.tokens_out + EXCLUDED.tokens_out
                """,
                day, tokens_in, tokens_out,
            )

    async def fetch(self, day: date) -> dict | None:
        async with self._pool.acquire() as conn:
            row = await conn.fetchrow(
                "SELECT * FROM chatbot.usage_budget WHERE day = $1", day,
            )
        return dict(row) if row else None

    async def total_for_day(self, day: date) -> int:
        async with self._pool.acquire() as conn:
            val = await conn.fetchval(
                "SELECT COALESCE(tokens_in + tokens_out, 0) FROM chatbot.usage_budget WHERE day = $1",
                day,
            )
        return int(val or 0)
