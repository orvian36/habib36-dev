"""extract_citations node — pure Python, no LLM call."""
from __future__ import annotations

import re

from ..state import AgentState, ScoredChunk, SourceRef

_CITATION_RE = re.compile(r"\[(\d+)\]")


def _excerpt(text: str, limit: int = 240) -> str:
    text = text.strip().replace("\n", " ")
    return text if len(text) <= limit else text[: limit - 1].rstrip() + "…"


def _to_source(chunk: ScoredChunk) -> SourceRef:
    doc_id = f"{chunk.collection}:{chunk.slug}" if chunk.collection and chunk.slug else chunk.id
    return SourceRef(
        id=doc_id,
        title=chunk.title,
        source_type=chunk.source_type,
        slug=chunk.slug or None,
        url=chunk.url,
        score=chunk.score,
        excerpt=_excerpt(chunk.content),
    )


async def extract_citations(state: AgentState) -> AgentState:
    draft = state.get("draft", "") or ""
    chunks = state.get("chunks", [])
    seen_ids: dict[str, SourceRef] = {}
    for match in _CITATION_RE.finditer(draft):
        idx = int(match.group(1)) - 1
        if 0 <= idx < len(chunks):
            src = _to_source(chunks[idx])
            seen_ids.setdefault(src.id, src)
    return {**state, "answer": draft, "sources": list(seen_ids.values())}
