"""AgentState TypedDict and small immutable helpers."""
from __future__ import annotations

from dataclasses import dataclass
from typing import Literal, TypedDict

Intent = Literal["smalltalk", "off_topic", "about_habibur", "tech_concept", "unsafe"]
Groundedness = Literal["grounded", "partial", "ungrounded"]
ChunkGrade = Literal["yes", "partial", "no"]


@dataclass(frozen=True)
class Message:
    role: Literal["user", "assistant"]
    content: str


@dataclass(frozen=True)
class ScoredChunk:
    id: str
    title: str
    source_type: str
    url: str | None
    content: str
    score: float
    collection: str = ""
    slug: str = ""
    chunk_index: int = 0


@dataclass(frozen=True)
class SourceRef:
    id: str
    title: str
    source_type: str
    slug: str | None
    url: str | None
    score: float
    excerpt: str


class AgentState(TypedDict, total=False):
    query: str
    history: list[Message]
    trace_id: str

    intent: Intent
    is_input_safe: bool

    search_query: str
    hypothetical_doc: str | None
    chunks: list[ScoredChunk]
    chunk_grades: list[ChunkGrade]
    retrieval_attempt: int

    draft: str | None
    groundedness: Groundedness | None
    generation_attempt: int

    answer: str
    sources: list[SourceRef]
    terminal: bool

    node_timings_ms: dict[str, float]
    tokens: dict[str, int]


def default_state(*, query: str, trace_id: str, history: list[Message] | None = None) -> AgentState:
    return AgentState(
        query=query,
        history=history or [],
        trace_id=trace_id,
        retrieval_attempt=0,
        generation_attempt=0,
        node_timings_ms={},
        tokens={"in": 0, "out": 0},
    )


def increment_attempt(state: AgentState, key: Literal["retrieval_attempt", "generation_attempt"]) -> AgentState:
    new = dict(state)
    new[key] = state.get(key, 0) + 1
    return new  # type: ignore[return-value]
