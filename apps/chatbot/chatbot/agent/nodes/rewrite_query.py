"""rewrite_query node — resolves anaphora and expands vague queries."""
from __future__ import annotations

from ...llm.base import LLMClient, LLMError
from ..prompts import REWRITE_QUERY
from ..state import AgentState


def _format_history(history) -> str:
    if not history:
        return "(no prior turns)"
    return "\n".join(f"{m.role}: {m.content}" for m in history[-6:])


async def rewrite_query(state: AgentState, *, llm: LLMClient, model: str) -> AgentState:
    base_prompt = REWRITE_QUERY.format(
        query=state["query"],
        history=_format_history(state.get("history", [])),
    )
    if state.get("retrieval_attempt", 0) > 0:
        base_prompt += (
            "\n\nHINT: the previous query produced no relevant results. "
            "Rephrase using synonyms or a broader formulation."
        )
    try:
        response = await llm.complete(
            [{"role": "user", "content": base_prompt}],
            model=model,
            temperature=0.2,
            max_tokens=64,
        )
        rewritten = response.text.strip() or state["query"]
    except LLMError:
        rewritten = state["query"]
        response = None

    new_tokens = dict(state.get("tokens", {"in": 0, "out": 0}))
    if response:
        new_tokens["in"] += response.tokens_in
        new_tokens["out"] += response.tokens_out
    return {**state, "search_query": rewritten, "tokens": new_tokens}
