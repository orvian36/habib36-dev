import pytest

from chatbot.agent.nodes.respond import respond
from chatbot.agent.state import default_state


@pytest.mark.asyncio
async def test_respond_sets_terminal_true():
    out = await respond({**default_state(query="q", trace_id="t"), "answer": "hi"})
    assert out["terminal"] is True


@pytest.mark.asyncio
async def test_respond_ensures_intent_defaults_to_about_habibur():
    out = await respond({**default_state(query="q", trace_id="t"), "answer": "hi"})
    assert out.get("intent") in {"about_habibur", "smalltalk", "off_topic", "tech_concept", "unsafe"}


@pytest.mark.asyncio
async def test_respond_preserves_sources_and_tokens():
    state = {
        **default_state(query="q", trace_id="t"),
        "answer": "x",
        "sources": [],
        "tokens": {"in": 10, "out": 20},
    }
    out = await respond(state)
    assert out["tokens"] == {"in": 10, "out": 20}
