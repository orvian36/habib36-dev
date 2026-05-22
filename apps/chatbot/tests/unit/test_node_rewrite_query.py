import pytest

from chatbot.agent.nodes.rewrite_query import rewrite_query
from chatbot.agent.state import Message, default_state
from chatbot.llm.fake import FakeLLMClient


@pytest.mark.asyncio
async def test_rewrite_query_uses_llm_output_as_search_query():
    llm = FakeLLMClient(responder=lambda _: "What is Habibur Rahman's experience with RAG pipelines?")
    state = default_state(query="and rag?", trace_id="t",
                          history=[Message(role="user", content="tell me about him"),
                                   Message(role="assistant", content="...")])
    out = await rewrite_query(state, llm=llm, model="flash")
    assert "Habibur" in out["search_query"]


@pytest.mark.asyncio
async def test_rewrite_query_includes_hint_when_retrieval_attempt_is_one():
    captured: list[str] = []

    def responder(messages):
        captured.append(messages[0]["content"])
        return "expanded query"

    llm = FakeLLMClient(responder=responder)
    state = {**default_state(query="vague", trace_id="t"), "retrieval_attempt": 1}
    await rewrite_query(state, llm=llm, model="flash")
    assert "previous query" in captured[0].lower() or "retry" in captured[0].lower()


@pytest.mark.asyncio
async def test_rewrite_query_falls_back_to_original_on_llm_error():
    llm = FakeLLMClient(raise_on_call=True)
    state = default_state(query="original question", trace_id="t")
    out = await rewrite_query(state, llm=llm, model="flash")
    assert out["search_query"] == "original question"
