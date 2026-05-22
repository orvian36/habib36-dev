from datetime import date
from uuid import uuid4

import pytest

from chatbot.db.budget_repo import BudgetRepo
from chatbot.db.chat_log_repo import ChatLogRepo, ChatLogRow
from chatbot.db.chunks_repo import ChunkRecord, ChunksRepo

pytestmark = pytest.mark.integration


def _record(id_: str, embedding: list[float], **meta: str) -> ChunkRecord:
    return ChunkRecord(
        id=id_,
        collection=meta.get("collection", "posts"),
        slug=meta.get("slug", "hello"),
        chunk_index=int(meta.get("chunk_index", "0")),
        title=meta.get("title", "Title"),
        source_type=meta.get("source_type", "post"),
        url=meta.get("url"),
        content=meta.get("content", "body text"),
        embedding=embedding,
        metadata=meta.get("extra_metadata", {}),
    )


async def test_chunks_upsert_and_count(db_pool):
    repo = ChunksRepo(db_pool)
    await repo.upsert(
        [
            _record("posts:hello:0", [0.1] * 768),
            _record("posts:hello:1", [0.2] * 768),
        ]
    )
    assert await repo.count() == 2


async def test_chunks_upsert_replaces_existing_id(db_pool):
    repo = ChunksRepo(db_pool)
    await repo.upsert([_record("posts:hello:0", [0.1] * 768, content="old")])
    await repo.upsert([_record("posts:hello:0", [0.1] * 768, content="new")])
    assert await repo.count() == 1


async def test_chunks_delete_by_prefix(db_pool):
    repo = ChunksRepo(db_pool)
    await repo.upsert(
        [
            _record("posts:keep:0", [0.0] * 768),
            _record("posts:drop:0", [0.0] * 768),
            _record("posts:drop:1", [0.0] * 768),
        ]
    )
    deleted = await repo.delete_document("posts", "drop")
    assert deleted == 2
    assert await repo.count() == 1


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
