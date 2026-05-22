"""Deterministic, dependency-free fakes for unit and integration tests."""
from __future__ import annotations

import hashlib
import math
from collections.abc import AsyncIterator, Callable

from .base import LLMError, LLMResponse


class FakeLLMClient:
    def __init__(
        self,
        *,
        responder: Callable[[list[dict[str, str]]], str] | None = None,
        raise_on_call: bool = False,
    ) -> None:
        self._responder = responder
        self._raise = raise_on_call
        self.calls: list[dict[str, object]] = []

    def _respond(self, messages: list[dict[str, str]]) -> str:
        if self._responder:
            return self._responder(messages)
        last_user = next(
            (m["content"] for m in reversed(messages) if m["role"] == "user"),
            "",
        )
        return f"Echo: {last_user}"

    async def complete(self, messages, *, model, temperature=0.3, max_tokens=512, system_instruction=None):
        self.calls.append({"messages": list(messages), "model": model, "system": system_instruction})
        if self._raise:
            raise LLMError("forced failure")
        text = self._respond(messages)
        return LLMResponse(
            text=text,
            model=model,
            tokens_in=sum(len(m["content"]) for m in messages),
            tokens_out=len(text),
        )

    async def stream(self, messages, *, model, temperature=0.3, max_tokens=512, system_instruction=None) -> AsyncIterator[str]:
        if self._raise:
            raise LLMError("forced failure")
        text = self._respond(messages)
        self.calls.append({"messages": list(messages), "model": model, "system": system_instruction, "streamed": True})
        words = text.split(" ")
        for i, word in enumerate(words):
            yield word + " " if i < len(words) - 1 else word


class FakeEmbeddingClient:
    def __init__(self, dimension: int = 64) -> None:
        if dimension <= 0:
            raise ValueError("dimension must be positive")
        self._dim = dimension

    @property
    def dimension(self) -> int:
        return self._dim

    def _vectorise(self, text: str) -> list[float]:
        vec = [0.0] * self._dim
        for token in text.lower().split():
            digest = hashlib.md5(token.encode()).digest()
            idx = int.from_bytes(digest[:4], "big") % self._dim
            sign = 1.0 if digest[4] & 1 else -1.0
            vec[idx] += sign
        norm = math.sqrt(sum(v * v for v in vec))
        if norm == 0:
            return vec
        return [v / norm for v in vec]

    async def aembed_query(self, text: str) -> list[float]:
        return self._vectorise(text)

    async def aembed_documents(self, texts: list[str]) -> list[list[float]]:
        return [self._vectorise(t) for t in texts]
