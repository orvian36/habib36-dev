"""LLM and embedding protocols.

Concrete implementations live in `gemini.py` (production) and `fake.py` (tests).
The agent depends only on these protocols, never on the concrete classes.
"""
from __future__ import annotations

from collections.abc import AsyncIterator
from dataclasses import dataclass
from typing import Protocol, runtime_checkable


@dataclass(frozen=True)
class LLMResponse:
    text: str
    model: str
    tokens_in: int = 0
    tokens_out: int = 0


class LLMError(RuntimeError):
    """Wraps any provider-specific failure (network, auth, rate limit, bad shape)."""


@runtime_checkable
class LLMClient(Protocol):
    async def complete(
        self,
        messages: list[dict[str, str]],
        *,
        model: str,
        temperature: float = 0.3,
        max_tokens: int = 512,
        system_instruction: str | None = None,
    ) -> LLMResponse: ...

    def stream(
        self,
        messages: list[dict[str, str]],
        *,
        model: str,
        temperature: float = 0.3,
        max_tokens: int = 512,
        system_instruction: str | None = None,
    ) -> AsyncIterator[str]: ...


@runtime_checkable
class EmbeddingClient(Protocol):
    @property
    def dimension(self) -> int: ...

    async def aembed_query(self, text: str) -> list[float]: ...
    async def aembed_documents(self, texts: list[str]) -> list[list[float]]: ...
