from datetime import date
from uuid import uuid4

import pytest

from chatbot.db.budget_repo import BudgetRepo
from chatbot.db.chat_log_repo import ChatLogRepo, ChatLogRow

pytestmark = pytest.mark.integration


async def test_chat_log_insert_and_fetch(db_pool):
    repo = ChatLogRepo(db_pool)
    trace = uuid4()
    await repo.insert(
        ChatLogRow(
            trace_id=trace,
            session_id=None,
            query_redacted="hello",
            intent="about_habibur",
            chunk_ids=["posts:x:0"],
            groundedness="grounded",
            latency_ms=120,
            tokens_in=100,
            tokens_out=50,
            error=None,
        )
    )
    row = await repo.fetch_by_trace(trace)
    assert row is not None
    assert row["intent"] == "about_habibur"


async def test_chat_log_record_feedback_updates_row(db_pool):
    repo = ChatLogRepo(db_pool)
    trace = uuid4()
    await repo.insert(
        ChatLogRow(
            trace_id=trace, session_id=None, query_redacted="q",
            intent="about_habibur", chunk_ids=[], groundedness="grounded",
            latency_ms=0, tokens_in=0, tokens_out=0, error=None,
        )
    )
    ok = await repo.record_feedback(trace, "up")
    assert ok is True
    row = await repo.fetch_by_trace(trace)
    assert row["feedback"] == "up"


async def test_budget_increment_returns_running_total(db_pool):
    repo = BudgetRepo(db_pool)
    today = date.today()
    await repo.increment(today, tokens_in=100, tokens_out=50)
    await repo.increment(today, tokens_in=10, tokens_out=5)
    row = await repo.fetch(today)
    assert row["tokens_in"] == 110 and row["tokens_out"] == 55
