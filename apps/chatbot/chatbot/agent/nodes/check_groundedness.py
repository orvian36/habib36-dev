"""check_groundedness node — verifies answer claims against retrieved chunks."""
from __future__ import annotations

from ...llm.base import LLMClient
from ..prompts import CHECK_GROUNDEDNESS
from ..state import AgentState, Groundedness, ScoredChunk

_VALID = {"grounded", "partial", "ungrounded"}


def _render_context(chunks: list[ScoredChunk]) -> str:
    return "\n\n".join(f"[{i+1}] {c.content}" for i, c in enumerate(chunks))


async def check_groundedness(state: AgentState, *, llm: LLMClient, model: str) -> AgentState:
    prompt = CHECK_GROUNDEDNESS.format(
        context=_render_context(state.get("chunks", [])),
        draft=state.get("draft", ""),
    )
    response = await llm.complete(
        [{"role": "user", "content": prompt}],
        model=model,
        temperature=0.0,
        max_tokens=8,
    )
    label = response.text.strip().lower()
    grounded: Groundedness = label if label in _VALID else "ungrounded"  # type: ignore[assignment]
    new_tokens = dict(state.get("tokens", {"in": 0, "out": 0}))
    new_tokens["in"] += response.tokens_in
    new_tokens["out"] += response.tokens_out
    return {**state, "groundedness": grounded, "tokens": new_tokens}
