import pytest

from chatbot.agent.nodes.check_groundedness import check_groundedness
from chatbot.agent.state import ScoredChunk, default_state
from chatbot.llm.fake import FakeLLMClient


def _state(draft: str):
    return {
        **default_state(query="q", trace_id="t"),
        "draft": draft,
        "chunks": [ScoredChunk(id="a", title="T", source_type="post", url=None,
                                content="context body", score=0.9)],
    }


@pytest.mark.asyncio
async def test_groundedness_grounded():
    llm = FakeLLMClient(responder=lambda _: "grounded")
    out = await check_groundedness(_state("answer text"), llm=llm, model="flash")
    assert out["groundedness"] == "grounded"


@pytest.mark.asyncio
async def test_groundedness_partial():
    llm = FakeLLMClient(responder=lambda _: "partial")
    out = await check_groundedness(_state("answer"), llm=llm, model="flash")
    assert out["groundedness"] == "partial"


@pytest.mark.asyncio
async def test_groundedness_ungrounded():
    llm = FakeLLMClient(responder=lambda _: "UNGROUNDED")
    out = await check_groundedness(_state("answer"), llm=llm, model="flash")
    assert out["groundedness"] == "ungrounded"


@pytest.mark.asyncio
async def test_groundedness_unknown_label_treated_as_ungrounded():
    llm = FakeLLMClient(responder=lambda _: "maybe?")
    out = await check_groundedness(_state("answer"), llm=llm, model="flash")
    assert out["groundedness"] == "ungrounded"
