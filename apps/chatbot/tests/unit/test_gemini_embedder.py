from types import SimpleNamespace
from unittest.mock import AsyncMock, MagicMock

import pytest

from chatbot.retrieval.embedder import GeminiEmbeddingClient


def _patch_genai(monkeypatch, vectors):
    aio_models = MagicMock()
    aio_models.embed_content = AsyncMock(
        return_value=SimpleNamespace(embeddings=[SimpleNamespace(values=v) for v in vectors])
    )
    client_obj = SimpleNamespace(aio=SimpleNamespace(models=aio_models))
    fake = SimpleNamespace(Client=MagicMock(return_value=client_obj))
    monkeypatch.setattr("chatbot.retrieval.embedder.genai", fake)
    return aio_models


def test_dimension_property_reflects_configured_output_dim(monkeypatch):
    _patch_genai(monkeypatch, vectors=[])
    client = GeminiEmbeddingClient(api_key="k", model="gemini-embedding-001", dimension=768)
    assert client.dimension == 768


@pytest.mark.asyncio
async def test_embed_query_returns_a_vector_of_configured_dimension(monkeypatch):
    _patch_genai(monkeypatch, vectors=[[0.1] * 768])
    client = GeminiEmbeddingClient(api_key="k", model="gemini-embedding-001", dimension=768)
    vec = await client.aembed_query("hello world")
    assert len(vec) == 768


@pytest.mark.asyncio
async def test_embed_documents_batches_and_preserves_order(monkeypatch):
    models = _patch_genai(monkeypatch, vectors=[[0.1] * 768, [0.2] * 768])
    client = GeminiEmbeddingClient(api_key="k", model="gemini-embedding-001", dimension=768)
    vectors = await client.aembed_documents(["one", "two"])
    assert len(vectors) == 2
    assert vectors[0][0] == 0.1 and vectors[1][0] == 0.2
    models.embed_content.assert_called_once()
