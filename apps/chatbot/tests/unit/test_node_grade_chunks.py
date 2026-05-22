import pytest

from chatbot.agent.nodes.grade_chunks import grade_chunks
from chatbot.agent.state import ScoredChunk, default_state
from chatbot.llm.fake import FakeLLMClient


def _chunks() -> list[ScoredChunk]:
    return [
        ScoredChunk(id="a", title="A", source_type="post", url=None, content="rag pipeline", score=0.9),
        ScoredChunk(id="b", title="B", source_type="post", url=None, content="weather forecast", score=0.5),
    ]


@pytest.mark.asyncio
async def test_grade_chunks_keeps_only_yes_and_partial():
    llm = FakeLLMClient(responder=lambda _: '["yes", "no"]')
    state = {**default_state(query="rag", trace_id="t"), "chunks": _chunks()}
    out = await grade_chunks(state, llm=llm, model="flash")
    assert [c.id for c in out["chunks"]] == ["a"]
    assert out["chunk_grades"] == ["yes"]


@pytest.mark.asyncio
async def test_grade_chunks_returns_empty_when_all_rated_no():
    llm = FakeLLMClient(responder=lambda _: '["no", "no"]')
    state = {**default_state(query="x", trace_id="t"), "chunks": _chunks()}
    out = await grade_chunks(state, llm=llm, model="flash")
    assert out["chunks"] == []


@pytest.mark.asyncio
async def test_grade_chunks_handles_malformed_llm_response_by_keeping_all():
    llm = FakeLLMClient(responder=lambda _: "not json")
    state = {**default_state(query="x", trace_id="t"), "chunks": _chunks()}
    out = await grade_chunks(state, llm=llm, model="flash")
    assert len(out["chunks"]) == 2
    assert out["chunk_grades"] == ["partial", "partial"]


@pytest.mark.asyncio
async def test_grade_chunks_is_a_noop_when_no_input_chunks():
    llm = FakeLLMClient()
    state = {**default_state(query="x", trace_id="t"), "chunks": []}
    out = await grade_chunks(state, llm=llm, model="flash")
    assert out["chunks"] == []
    assert out.get("chunk_grades", []) == []
