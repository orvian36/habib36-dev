
import pytest

from chatbot.db.budget_repo import BudgetRepo
from chatbot.llm.budget import BudgetExceeded, BudgetGate

pytestmark = pytest.mark.integration


async def test_budget_gate_allows_when_under_cap(db_pool):
    gate = BudgetGate(BudgetRepo(db_pool), daily_cap=1000)
    await gate.assert_can_spend(estimated_tokens=100)
    await gate.record_spend(tokens_in=80, tokens_out=20)
    remaining = await gate.remaining_today()
    assert remaining == 900


async def test_budget_gate_blocks_when_request_would_exceed_cap(db_pool):
    gate = BudgetGate(BudgetRepo(db_pool), daily_cap=100)
    await gate.record_spend(tokens_in=80, tokens_out=10)
    with pytest.raises(BudgetExceeded):
        await gate.assert_can_spend(estimated_tokens=20)


async def test_remaining_today_returns_full_cap_when_no_spend_yet(db_pool):
    gate = BudgetGate(BudgetRepo(db_pool), daily_cap=500)
    assert await gate.remaining_today() == 500
