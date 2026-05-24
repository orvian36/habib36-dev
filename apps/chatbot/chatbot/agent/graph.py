"""Build the LangGraph state machine."""
from __future__ import annotations

from functools import partial
from typing import Protocol

from langgraph.graph import END, START, StateGraph

from ..retrieval.types import ChunkHit
from ..llm.base import LLMClient
from ..llm.budget import BudgetGate
from .nodes.check_groundedness import check_groundedness
from .nodes.classify_intent import classify_intent
from .nodes.extract_citations import extract_citations
from .nodes.fallbacks import (
    fallback_no_context,
    refuse_off_topic,
    refuse_unsafe,
    smalltalk_reply,
)
from .nodes.generate_answer import generate_answer
from .nodes.grade_chunks import grade_chunks
from .nodes.input_guard import input_guard
from .nodes.output_guard import output_guard
from .nodes.respond import respond
from .nodes.retrieve import retrieve
from .nodes.rewrite_query import rewrite_query
from .state import AgentState


class Searcher(Protocol):
    async def search(self, query: str) -> list[ChunkHit]: ...


def _route_after_input_guard(state: AgentState) -> str:
    return "refuse_unsafe" if not state.get("is_input_safe", False) else "classify_intent"


def _route_after_classify(state: AgentState) -> str:
    intent = state.get("intent", "off_topic")
    return {
        "smalltalk": "smalltalk_reply",
        "off_topic": "refuse_off_topic",
        "unsafe": "refuse_unsafe",
        "about_habibur": "rewrite_query",
        "tech_concept": "rewrite_query",
    }.get(intent, "refuse_off_topic")


def _route_after_grade(state: AgentState, *, max_retries: int) -> str:
    has_chunks = bool(state.get("chunks"))
    if has_chunks:
        return "generate_answer"
    if state.get("retrieval_attempt", 0) < max_retries:
        return "rewrite_for_retry"
    return "fallback_no_context"


def _route_after_groundedness(state: AgentState, *, max_retries: int) -> str:
    grounded = state.get("groundedness")
    if grounded in {"grounded", "partial"}:
        return "extract_citations"
    if state.get("generation_attempt", 0) < max_retries:
        return "regenerate"
    return "fallback_no_context"


async def _rewrite_for_retry(state: AgentState) -> AgentState:
    return {**state, "retrieval_attempt": state.get("retrieval_attempt", 0) + 1}


async def _bump_generation_attempt(state: AgentState) -> AgentState:
    return {**state, "generation_attempt": state.get("generation_attempt", 0) + 1}


def build_graph(
    *,
    llm: LLMClient,
    searcher: Searcher,
    budget: BudgetGate,
    flash_model: str,
    pro_model: str,
    max_query_length: int,
    max_answer_chars: int,
    history_window: int,
    max_retrieval_retries: int = 1,
    max_generation_retries: int = 1,
):
    g: StateGraph = StateGraph(AgentState)

    g.add_node("input_guard", partial(input_guard, max_length=max_query_length))
    g.add_node("classify_intent", partial(classify_intent, llm=llm, model=flash_model))
    g.add_node("rewrite_query", partial(rewrite_query, llm=llm, model=flash_model))
    g.add_node("retrieve", partial(retrieve, searcher=searcher))
    g.add_node("grade_chunks", partial(grade_chunks, llm=llm, model=flash_model))
    g.add_node("rewrite_for_retry", _rewrite_for_retry)
    g.add_node("generate_answer", partial(generate_answer, llm=llm, model=pro_model))
    g.add_node("check_groundedness", partial(check_groundedness, llm=llm, model=flash_model))
    g.add_node("regenerate", _bump_generation_attempt)
    g.add_node("extract_citations", extract_citations)
    g.add_node("output_guard", partial(output_guard, llm=llm, model=flash_model, max_chars=max_answer_chars))
    g.add_node("respond", respond)

    g.add_node("refuse_unsafe", refuse_unsafe)
    g.add_node("refuse_off_topic", refuse_off_topic)
    g.add_node("fallback_no_context", fallback_no_context)
    g.add_node("smalltalk_reply", partial(smalltalk_reply, llm=llm, model=flash_model))

    g.add_edge(START, "input_guard")
    g.add_conditional_edges(
        "input_guard",
        _route_after_input_guard,
        {"refuse_unsafe": "refuse_unsafe", "classify_intent": "classify_intent"},
    )
    g.add_conditional_edges(
        "classify_intent",
        _route_after_classify,
        {
            "smalltalk_reply": "smalltalk_reply",
            "refuse_off_topic": "refuse_off_topic",
            "refuse_unsafe": "refuse_unsafe",
            "rewrite_query": "rewrite_query",
        },
    )
    g.add_edge("rewrite_query", "retrieve")
    g.add_edge("retrieve", "grade_chunks")
    g.add_conditional_edges(
        "grade_chunks",
        partial(_route_after_grade, max_retries=max_retrieval_retries),
        {
            "generate_answer": "generate_answer",
            "rewrite_for_retry": "rewrite_for_retry",
            "fallback_no_context": "fallback_no_context",
        },
    )
    g.add_edge("rewrite_for_retry", "rewrite_query")
    g.add_edge("generate_answer", "check_groundedness")
    g.add_conditional_edges(
        "check_groundedness",
        partial(_route_after_groundedness, max_retries=max_generation_retries),
        {
            "extract_citations": "extract_citations",
            "regenerate": "regenerate",
            "fallback_no_context": "fallback_no_context",
        },
    )
    g.add_edge("regenerate", "generate_answer")
    g.add_edge("extract_citations", "output_guard")
    g.add_edge("output_guard", "respond")
    g.add_edge("smalltalk_reply", "respond")
    g.add_edge("refuse_unsafe", "respond")
    g.add_edge("refuse_off_topic", "respond")
    g.add_edge("fallback_no_context", "respond")
    g.add_edge("respond", END)

    return g.compile()
