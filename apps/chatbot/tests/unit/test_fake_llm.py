import math

import pytest

from chatbot.llm.base import LLMError, LLMResponse
from chatbot.llm.fake import FakeEmbeddingClient, FakeLLMClient


@pytest.mark.asyncio
async def test_fake_llm_records_calls_and_uses_responder():
    llm = FakeLLMClient(responder=lambda _: "scripted")
    res = await llm.complete([{"role": "user", "content": "hi"}], model="flash")
    assert res.text == "scripted"
    assert res.model == "flash"
    assert llm.calls[0]["messages"][0]["content"] == "hi"


@pytest.mark.asyncio
async def test_fake_llm_default_responder_echoes_last_user():
    llm = FakeLLMClient()
    res = await llm.complete([{"role": "user", "content": "Hello"}], model="flash")
    assert "Hello" in res.text


@pytest.mark.asyncio
async def test_fake_llm_can_simulate_failure():
    llm = FakeLLMClient(raise_on_call=True)
    with pytest.raises(LLMError):
        await llm.complete([{"role": "user", "content": "x"}], model="flash")


@pytest.mark.asyncio
async def test_fake_llm_supports_streaming():
    llm = FakeLLMClient(responder=lambda _: "a b c")
    chunks = []
    async for delta in llm.stream([{"role": "user", "content": "go"}], model="pro"):
        chunks.append(delta)
    assert "".join(chunks) == "a b c"


@pytest.mark.asyncio
async def test_fake_embedding_is_deterministic_and_normalised():
    emb = FakeEmbeddingClient(dimension=16)
    a1 = await emb.aembed_query("hello world")
    a2 = await emb.aembed_query("hello world")
    assert a1 == a2
    norm = math.sqrt(sum(x * x for x in a1))
    assert abs(norm - 1.0) < 1e-6


@pytest.mark.asyncio
async def test_fake_embedding_batch_returns_one_vector_per_input():
    emb = FakeEmbeddingClient(dimension=8)
    vectors = await emb.aembed_documents(["a b c", "d e f", "g h i"])
    assert len(vectors) == 3
    assert all(len(v) == 8 for v in vectors)


def test_llm_response_dataclass_has_token_counts():
    r = LLMResponse(text="t", model="m", tokens_in=10, tokens_out=20)
    assert r.tokens_in == 10
    assert r.tokens_out == 20
