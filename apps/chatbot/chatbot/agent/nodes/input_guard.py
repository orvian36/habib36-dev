"""input_guard node — rules-only safety gate that runs first."""
from __future__ import annotations

from ...security.prompt_injection import detect as detect_injection
from ..state import AgentState

_CONTROL_CHARS = {chr(c) for c in range(0x20) if c not in (0x09, 0x0A, 0x0D)} | {chr(0x7F)}


def _strip_controls(text: str) -> str:
    return "".join(ch for ch in text if ch not in _CONTROL_CHARS)


async def input_guard(state: AgentState, *, max_length: int) -> AgentState:
    raw = state.get("query", "")
    cleaned = _strip_controls(raw).strip()
    if not cleaned:
        return {**state, "query": cleaned, "is_input_safe": False}
    if len(cleaned) > max_length:
        return {**state, "query": cleaned, "is_input_safe": False}
    if detect_injection(cleaned):
        return {**state, "query": cleaned, "is_input_safe": False}
    return {**state, "query": cleaned, "is_input_safe": True}
