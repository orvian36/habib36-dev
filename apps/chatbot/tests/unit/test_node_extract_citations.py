import pytest

from chatbot.agent.nodes.extract_citations import extract_citations
from chatbot.agent.state import ScoredChunk, default_state


def _chunks():
    return [
        ScoredChunk(id="projects:rag:0", title="RAG", source_type="project", url="https://x",
                    content="ctx-1", score=0.9, collection="projects", slug="rag"),
        ScoredChunk(id="posts:cp:0", title="CP", source_type="post", url=None,
                    content="ctx-2", score=0.5, collection="posts", slug="cp"),
        ScoredChunk(id="projects:rag:1", title="RAG", source_type="project", url="https://x",
                    content="ctx-1-cont", score=0.6, collection="projects", slug="rag"),
    ]


@pytest.mark.asyncio
async def test_extract_citations_returns_sources_for_referenced_chunks():
    state = {
        **default_state(query="q", trace_id="t"),
        "chunks": _chunks(),
        "draft": "First idea [1]. Then [2].",
    }
    out = await extract_citations(state)
    assert out["answer"] == "First idea [1]. Then [2]."
    assert [s.id for s in out["sources"]] == ["projects:rag", "posts:cp"]


@pytest.mark.asyncio
async def test_extract_citations_deduplicates_sources_by_document():
    state = {
        **default_state(query="q", trace_id="t"),
        "chunks": _chunks(),
        "draft": "[1] and again [3]",
    }
    out = await extract_citations(state)
    assert [s.id for s in out["sources"]] == ["projects:rag"]


@pytest.mark.asyncio
async def test_extract_citations_handles_answer_with_no_citation_markers():
    state = {
        **default_state(query="q", trace_id="t"),
        "chunks": _chunks(),
        "draft": "A plain answer with no citations.",
    }
    out = await extract_citations(state)
    assert out["sources"] == []
    assert out["answer"] == "A plain answer with no citations."
