"""Gemini concrete LLMClient via the `google-genai` SDK.

The module imports `google.genai as genai` at module scope so tests can monkeypatch it.
"""
from __future__ import annotations

from collections.abc import AsyncIterator

from google import genai
from google.genai import types

from .base import LLMError, LLMResponse


def _to_gemini_messages(messages: list[dict[str, str]]) -> list[types.Content]:
    """Map OpenAI-style {"role", "content"} pairs to Gemini Content objects.

    Gemini uses 'user' / 'model' roles; 'assistant' maps to 'model'.
    """
    out: list[types.Content] = []
    for m in messages:
        role = "model" if m["role"] == "assistant" else "user"
        out.append(types.Content(role=role, parts=[types.Part(text=m["content"])]))
    return out


def _safety_settings(level: str) -> list[types.SafetySetting]:
    cats = [
        "HARM_CATEGORY_HARASSMENT",
        "HARM_CATEGORY_HATE_SPEECH",
        "HARM_CATEGORY_SEXUALLY_EXPLICIT",
        "HARM_CATEGORY_DANGEROUS_CONTENT",
    ]
    return [types.SafetySetting(category=c, threshold=level) for c in cats]


class GeminiClient:
    def __init__(
        self,
        api_key: str,
        *,
        safety: str = "BLOCK_MEDIUM_AND_ABOVE",
        timeout_seconds: float = 30.0,
    ) -> None:
        self._client = genai.Client(api_key=api_key)
        self._safety = safety
        self._timeout = timeout_seconds

    def _config(self, *, temperature: float, max_tokens: int, system_instruction: str | None):
        return types.GenerateContentConfig(
            temperature=temperature,
            max_output_tokens=max_tokens,
            safety_settings=_safety_settings(self._safety),
            system_instruction=system_instruction,
        )

    async def complete(
        self,
        messages: list[dict[str, str]],
        *,
        model: str,
        temperature: float = 0.3,
        max_tokens: int = 512,
        system_instruction: str | None = None,
    ) -> LLMResponse:
        try:
            response = await self._client.aio.models.generate_content(
                model=model,
                contents=_to_gemini_messages(messages),
                config=self._config(
                    temperature=temperature,
                    max_tokens=max_tokens,
                    system_instruction=system_instruction,
                ),
            )
        except Exception as exc:
            raise LLMError(f"Gemini call failed: {exc}") from exc

        text = getattr(response, "text", "") or ""
        meta = getattr(response, "usage_metadata", None)
        tokens_in = int(getattr(meta, "prompt_token_count", 0) or 0)
        tokens_out = int(getattr(meta, "candidates_token_count", 0) or 0)
        return LLMResponse(text=text.strip(), model=model, tokens_in=tokens_in, tokens_out=tokens_out)

    async def stream(
        self,
        messages: list[dict[str, str]],
        *,
        model: str,
        temperature: float = 0.3,
        max_tokens: int = 512,
        system_instruction: str | None = None,
    ) -> AsyncIterator[str]:
        try:
            stream = self._client.aio.models.generate_content_stream(
                model=model,
                contents=_to_gemini_messages(messages),
                config=self._config(
                    temperature=temperature,
                    max_tokens=max_tokens,
                    system_instruction=system_instruction,
                ),
            )
            async for chunk in stream:
                text = getattr(chunk, "text", None)
                if text:
                    yield text
        except Exception as exc:
            raise LLMError(f"Gemini stream failed: {exc}") from exc
