"""retrieve node — wraps HybridSearcher and maps to ScoredChunk."""
from __future__ import annotations

from typing import Protocol

from ...retrieval.types import ChunkHit
from ..state import AgentState, ScoredChunk


class Searcher(Protocol):
    async def search(self, query: str) -> list[ChunkHit]: ...


def _to_scored(hit: ChunkHit) -> ScoredChunk:
    return ScoredChunk(
        id=hit.id,
        title=hit.title,
        source_type=hit.source_type,
        url=hit.url,
        content=hit.content,
        score=hit.score,
        collection=hit.collection,
        slug=hit.slug,
    )


async def retrieve(state: AgentState, *, searcher: Searcher) -> AgentState:
    query = state.get("search_query") or state["query"]
    hits = await searcher.search(query)
    return {**state, "chunks": [_to_scored(h) for h in hits]}
