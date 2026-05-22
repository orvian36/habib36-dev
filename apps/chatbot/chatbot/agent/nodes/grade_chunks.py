"""grade_chunks node — single-call LLM relevance grading."""
from __future__ import annotations

import json
import logging

from ...llm.base import LLMClient
from ..prompts import GRADE_CHUNKS
from ..state import AgentState, ScoredChunk

log = logging.getLogger(__name__)


def _render_chunks(chunks: list[ScoredChunk]) -> str:
    return "\n\n".join(f"[{i+1}] {c.title}\n{c.content}" for i, c in enumerate(chunks))


async def grade_chunks(state: AgentState, *, llm: LLMClient, model: str) -> AgentState:
    chunks = state.get("chunks", [])
    if not chunks:
        return {**state, "chunk_grades": []}

    prompt = GRADE_CHUNKS.format(query=state["query"], chunks=_render_chunks(chunks))
    response = await llm.complete(
        [{"role": "user", "content": prompt}],
        model=model,
        temperature=0.0,
        max_tokens=128,
    )

    grades: list[str]
    try:
        parsed = json.loads(response.text.strip())
        if not isinstance(parsed, list):
            raise ValueError("expected JSON array")
        grades = [str(g).lower() for g in parsed]
        if len(grades) != len(chunks):
            raise ValueError("grade count mismatch")
    except (ValueError, json.JSONDecodeError):
        log.warning("grade_chunks: malformed LLM output, keeping all as 'partial'")
        grades = ["partial"] * len(chunks)

    kept = [(c, g) for c, g in zip(chunks, grades, strict=True) if g in {"yes", "partial"}]
    new_tokens = dict(state.get("tokens", {"in": 0, "out": 0}))
    new_tokens["in"] += response.tokens_in
    new_tokens["out"] += response.tokens_out
    return {
        **state,
        "chunks": [c for c, _ in kept],
        "chunk_grades": [g for _, g in kept],  # type: ignore[misc]
        "tokens": new_tokens,
    }
