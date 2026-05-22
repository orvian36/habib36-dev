"""respond node — terminal node that finalises the state."""
from __future__ import annotations

from ..state import AgentState


async def respond(state: AgentState) -> AgentState:
    out: AgentState = {**state, "terminal": True}
    out.setdefault("answer", "")
    out.setdefault("sources", [])
    out.setdefault("intent", "about_habibur")
    out.setdefault("tokens", {"in": 0, "out": 0})
    return out
