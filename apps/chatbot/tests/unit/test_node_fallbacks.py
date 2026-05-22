import pytest

from chatbot.agent.nodes.fallbacks import (
    fallback_no_context,
    refuse_off_topic,
    refuse_unsafe,
    smalltalk_reply,
)
from chatbot.agent.state import default_state
from chatbot.llm.fake import FakeLLMClient


@pytest.mark.asyncio
async def test_refuse_unsafe_returns_static_message_no_llm_call():
    out = await refuse_unsafe(default_state(query="x", trace_id="t"))
    assert "can't help" in out["answer"].lower()
    assert out["sources"] == []
    assert out["intent"] == "unsafe"


@pytest.mark.asyncio
async def test_refuse_off_topic_suggests_alternatives():
    out = await refuse_off_topic(default_state(query="weather?", trace_id="t"))
    assert "habibur" in out["answer"].lower()
    assert out["intent"] == "off_topic"


@pytest.mark.asyncio
async def test_fallback_no_context_directs_user_to_resume():
    out = await fallback_no_context(default_state(query="obscure?", trace_id="t"))
    assert "/resume" in out["answer"] or "resume" in out["answer"].lower()


@pytest.mark.asyncio
async def test_smalltalk_reply_uses_flash_llm_with_no_retrieval():
    llm = FakeLLMClient(responder=lambda _: "Hi there!")
    out = await smalltalk_reply(default_state(query="hello", trace_id="t"), llm=llm, model="flash")
    assert out["answer"] == "Hi there!"
    assert out["sources"] == []
    assert out["intent"] == "smalltalk"
