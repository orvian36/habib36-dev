"""classify_intent node — Gemini-flash LLM classifier."""
from __future__ import annotations

from typing import get_args

from ...llm.base import LLMClient
from ..prompts import CLASSIFY_INTENT
from ..state import AgentState, Intent

_VALID = set(get_args(Intent))


async def classify_intent(state: AgentState, *, llm: LLMClient, model: str) -> AgentState:
    prompt = CLASSIFY_INTENT.format(query=state["query"])
    response = await llm.complete(
        [{"role": "user", "content": prompt}],
        model=model,
        temperature=0.0,
        max_tokens=8,
    )
    label = response.text.strip().lower()
    intent: Intent = label if label in _VALID else "off_topic"  # type: ignore[assignment]
    new_tokens = dict(state.get("tokens", {"in": 0, "out": 0}))
    new_tokens["in"] += response.tokens_in
    new_tokens["out"] += response.tokens_out
    return {**state, "intent": intent, "tokens": new_tokens}
