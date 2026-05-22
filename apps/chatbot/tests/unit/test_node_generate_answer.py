import pytest

from chatbot.agent.nodes.generate_answer import generate_answer
from chatbot.agent.state import Message, ScoredChunk, default_state
from chatbot.llm.fake import FakeLLMClient


def _chunks() -> list[ScoredChunk]:
    return [
        ScoredChunk(id="a", title="RAG Pipeline", source_type="project", url=None,
                    content="Habibur built a production RAG system at Makebell.", score=0.9),
    ]


@pytest.mark.asyncio
async def test_generate_answer_calls_pro_model_with_context_block():
    captured: list[str] = []

    def responder(messages):
        captured.append(messages[0]["content"])
        return "Habibur built a production RAG system [1]."

    llm = FakeLLMClient(responder=responder)
    state = {**default_state(query="rag?", trace_id="t"), "chunks": _chunks()}
    out = await generate_answer(state, llm=llm, model="pro")
    assert out["draft"].endswith("[1].")
    assert "[1] RAG Pipeline" in captured[0]


@pytest.mark.asyncio
async def test_generate_answer_uses_stricter_prompt_on_retry():
    captured: list[str] = []

    def responder(messages):
        captured.append(messages[0]["content"])
        return "answer"

    llm = FakeLLMClient(responder=responder)
    state = {**default_state(query="q", trace_id="t"), "chunks": _chunks(), "generation_attempt": 1}
    await generate_answer(state, llm=llm, model="pro")
    assert "STRICT" in captured[0] or "only the CONTEXT" in captured[0].lower()


@pytest.mark.asyncio
async def test_generate_answer_includes_history_window():
    captured: list[str] = []

    def responder(messages):
        captured.append(messages[0]["content"])
        return "..."

    llm = FakeLLMClient(responder=responder)
    state = {
        **default_state(query="and the last one?", trace_id="t"),
        "chunks": _chunks(),
        "history": [Message(role="user", content="earlier-q"), Message(role="assistant", content="earlier-a")],
    }
    await generate_answer(state, llm=llm, model="pro")
    assert "earlier-q" in captured[0]
    assert "earlier-a" in captured[0]
