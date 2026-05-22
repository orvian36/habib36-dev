"""Fallback nodes — short-circuit the graph with fixed or trivial responses."""
from __future__ import annotations

from ...llm.base import LLMClient
from ..state import AgentState

UNSAFE_REPLY = "I can't help with that."
OFF_TOPIC_REPLY = (
    "I only answer questions about Habibur Rahman. "
    "Try asking about his projects (→ /projects) or his resume (→ /resume)."
)
NO_CONTEXT_REPLY = (
    "I don't have specific information on that. "
    "His resume (→ /resume) and projects (→ /projects) cover most of his work — feel free to browse there."
)


async def refuse_unsafe(state: AgentState) -> AgentState:
    return {**state, "answer": UNSAFE_REPLY, "sources": [], "intent": "unsafe", "terminal": True}


async def refuse_off_topic(state: AgentState) -> AgentState:
    return {**state, "answer": OFF_TOPIC_REPLY, "sources": [], "intent": "off_topic", "terminal": True}


async def fallback_no_context(state: AgentState) -> AgentState:
    return {**state, "answer": NO_CONTEXT_REPLY, "sources": [], "terminal": True}


async def smalltalk_reply(state: AgentState, *, llm: LLMClient, model: str) -> AgentState:
    response = await llm.complete(
        [
            {
                "role": "user",
                "content": (
                    "Reply in one short friendly sentence as Habibur Rahman's portfolio assistant. "
                    f"User said: {state['query']}"
                ),
            }
        ],
        model=model,
        temperature=0.5,
        max_tokens=64,
    )
    new_tokens = dict(state.get("tokens", {"in": 0, "out": 0}))
    new_tokens["in"] += response.tokens_in
    new_tokens["out"] += response.tokens_out
    return {
        **state,
        "answer": response.text.strip(),
        "sources": [],
        "intent": "smalltalk",
        "terminal": True,
        "tokens": new_tokens,
    }
