"""Per-day Gemini token budget.

Tracked in chatbot.usage_budget, keyed by date. The agent calls
`assert_can_spend()` before issuing an LLM request and `record_spend()` after.
"""
from __future__ import annotations

from datetime import date

from ..db.budget_repo import BudgetRepo


class BudgetExceeded(RuntimeError):
    pass


class BudgetGate:
    def __init__(self, repo: BudgetRepo, *, daily_cap: int) -> None:
        self._repo = repo
        self._cap = daily_cap

    async def remaining_today(self) -> int:
        spent = await self._repo.total_for_day(date.today())
        return max(self._cap - spent, 0)

    async def assert_can_spend(self, *, estimated_tokens: int) -> None:
        if estimated_tokens > await self.remaining_today():
            raise BudgetExceeded("daily Gemini budget exhausted")

    async def record_spend(self, *, tokens_in: int, tokens_out: int) -> None:
        await self._repo.increment(date.today(), tokens_in=tokens_in, tokens_out=tokens_out)
