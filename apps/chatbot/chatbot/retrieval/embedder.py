"""Gemini embedding client.

Uses `gemini-embedding-001` with Matryoshka truncation to 768 dimensions by default,
matching the `chatbot.chunks.embedding vector(768)` schema. Swap the model id without
schema changes as long as the truncated dimension stays 768.
"""
from __future__ import annotations

from google import genai
from google.genai import types


class GeminiEmbeddingClient:
    def __init__(
        self,
        api_key: str,
        *,
        model: str = "gemini-embedding-001",
        dimension: int = 768,
    ) -> None:
        self._client = genai.Client(api_key=api_key)
        self._model = model
        self._dimension = dimension

    @property
    def dimension(self) -> int:
        return self._dimension

    async def _embed_batch(self, texts: list[str]) -> list[list[float]]:
        result = await self._client.aio.models.embed_content(
            model=self._model,
            contents=texts,
            config=types.EmbedContentConfig(output_dimensionality=self._dimension),
        )
        return [list(e.values) for e in result.embeddings]

    async def aembed_query(self, text: str) -> list[float]:
        vectors = await self._embed_batch([text])
        return vectors[0]

    async def aembed_documents(self, texts: list[str], *, batch_size: int = 100) -> list[list[float]]:
        out: list[list[float]] = []
        for i in range(0, len(texts), batch_size):
            out.extend(await self._embed_batch(texts[i : i + batch_size]))
        return out
