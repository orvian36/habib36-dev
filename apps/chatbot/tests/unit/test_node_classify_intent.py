import pytest

from chatbot.agent.nodes.classify_intent import classify_intent
from chatbot.agent.state import default_state
from chatbot.llm.fake import FakeLLMClient


@pytest.mark.asyncio
async def test_classify_intent_returns_label_from_llm():
    llm = FakeLLMClient(responder=lambda _: "about_habibur")
    state = default_state(query="What's his RAG experience?", trace_id="t")
    out = await classify_intent(state, llm=llm, model="flash")
    assert out["intent"] == "about_habibur"


@pytest.mark.asyncio
async def test_classify_intent_normalises_unknown_label_to_off_topic():
    llm = FakeLLMClient(responder=lambda _: "random_garbage")
    state = default_state(query="x", trace_id="t")
    out = await classify_intent(state, llm=llm, model="flash")
    assert out["intent"] == "off_topic"


@pytest.mark.asyncio
async def test_classify_intent_accumulates_token_counts():
    llm = FakeLLMClient(responder=lambda _: "smalltalk")
    state = default_state(query="hi", trace_id="t")
    out = await classify_intent(state, llm=llm, model="flash")
    assert out["tokens"]["in"] > 0
