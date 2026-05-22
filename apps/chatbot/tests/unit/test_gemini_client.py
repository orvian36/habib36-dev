from types import SimpleNamespace
from unittest.mock import AsyncMock, MagicMock

import pytest

from chatbot.llm.base import LLMError
from chatbot.llm.gemini import GeminiClient


def _fake_genai_module(monkeypatch, completion_text: str = "hi", embedding_values=(0.1, 0.2)):
    """Patch `google.genai.Client` so unit tests don't hit the network."""
    response = SimpleNamespace(
        text=completion_text,
        usage_metadata=SimpleNamespace(prompt_token_count=10, candidates_token_count=20),
    )
    aio_models = MagicMock()
    aio_models.generate_content = AsyncMock(return_value=response)
    aio_models.embed_content = AsyncMock(
        return_value=SimpleNamespace(embeddings=[SimpleNamespace(values=list(embedding_values))])
    )

    async def fake_stream(**_kw):
        for word in completion_text.split(" "):
            yield SimpleNamespace(text=word + " ")
    aio_models.generate_content_stream = MagicMock(return_value=fake_stream())

    aio = SimpleNamespace(models=aio_models)
    client_obj = SimpleNamespace(aio=aio)
    fake_module = SimpleNamespace(Client=MagicMock(return_value=client_obj))
    monkeypatch.setattr("chatbot.llm.gemini.genai", fake_module)
    return aio_models


@pytest.mark.asyncio
async def test_complete_returns_text_and_token_counts(monkeypatch):
    models = _fake_genai_module(monkeypatch, completion_text="answer text")
    client = GeminiClient(api_key="k", safety="BLOCK_MEDIUM_AND_ABOVE")
    res = await client.complete([{"role": "user", "content": "q"}], model="gemini-2.5-flash")
    assert res.text == "answer text"
    assert res.tokens_in == 10 and res.tokens_out == 20
    models.generate_content.assert_called_once()


@pytest.mark.asyncio
async def test_complete_wraps_provider_errors_in_llm_error(monkeypatch):
    models = _fake_genai_module(monkeypatch)
    models.generate_content.side_effect = RuntimeError("boom")
    client = GeminiClient(api_key="k")
    with pytest.raises(LLMError):
        await client.complete([{"role": "user", "content": "q"}], model="gemini-2.5-flash")


@pytest.mark.asyncio
async def test_stream_yields_text_deltas(monkeypatch):
    _fake_genai_module(monkeypatch, completion_text="a b c")
    client = GeminiClient(api_key="k")
    deltas = []
    async for d in client.stream([{"role": "user", "content": "q"}], model="gemini-2.5-pro"):
        deltas.append(d)
    assert "".join(deltas).strip() == "a b c"
