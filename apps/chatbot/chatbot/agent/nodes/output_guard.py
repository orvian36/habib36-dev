"""output_guard node — final safety check on the answer."""
from __future__ import annotations

import json
import logging

from ...llm.base import LLMClient
from ...security.pii import redact
from ..prompts import OUTPUT_GUARD
from ..state import AgentState

log = logging.getLogger(__name__)

SAFETY_REPLACEMENT = (
    "I can't share that. If you'd like, ask me about Habibur's projects, experience, "
    "or recent blog posts."
)


async def output_guard(
    state: AgentState,
    *,
    llm: LLMClient,
    model: str,
    max_chars: int,
) -> AgentState:
    answer = state.get("answer", "") or ""

    prompt = OUTPUT_GUARD.format(query=state["query"], answer=answer)
    try:
        response = await llm.complete(
            [{"role": "user", "content": prompt}],
            model=model,
            temperature=0.0,
            max_tokens=64,
        )
        verdict = json.loads(response.text.strip())
        if verdict.get("system_leak") or verdict.get("scope_violation"):
            return {**state, "answer": SAFETY_REPLACEMENT}
    except (json.JSONDecodeError, ValueError, Exception) as exc:
        log.warning("output_guard LLM check failed: %s — falling back to rules only", exc)

    cleaned = redact(answer)
    if len(cleaned) > max_chars:
        cleaned = cleaned[: max_chars - 1].rstrip() + "…"
    return {**state, "answer": cleaned}
