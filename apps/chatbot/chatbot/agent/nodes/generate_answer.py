"""generate_answer node — the only node that uses gemini-2.5-pro."""
from __future__ import annotations

from ...llm.base import LLMClient
from ..prompts import GENERATE_ANSWER
from ..state import AgentState, Message, ScoredChunk


def _render_context(chunks: list[ScoredChunk]) -> str:
    return "\n\n".join(
        f"[{i+1}] {c.title} ({c.source_type})\n{c.content}" for i, c in enumerate(chunks)
    )


def _render_history(history: list[Message]) -> str:
    if not history:
        return "(no prior turns)"
    return "\n".join(f"{m.role}: {m.content}" for m in history[-6:])


async def generate_answer(state: AgentState, *, llm: LLMClient, model: str) -> AgentState:
    prompt = GENERATE_ANSWER.format(
        query=state["query"],
        context=_render_context(state.get("chunks", [])),
        history=_render_history(state.get("history", [])),
    )
    if state.get("generation_attempt", 0) > 0:
        prompt += (
            "\n\nSTRICT MODE: the previous draft contained ungrounded claims. "
            "Use ONLY the CONTEXT verbatim. If something cannot be cited, do not say it."
        )
    response = await llm.complete(
        [{"role": "user", "content": prompt}],
        model=model,
        temperature=0.2,
        max_tokens=512,
    )
    new_tokens = dict(state.get("tokens", {"in": 0, "out": 0}))
    new_tokens["in"] += response.tokens_in
    new_tokens["out"] += response.tokens_out
    return {**state, "draft": response.text.strip(), "tokens": new_tokens}
