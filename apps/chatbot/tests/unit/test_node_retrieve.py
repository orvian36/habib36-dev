from dataclasses import dataclass

import pytest

from chatbot.agent.nodes.retrieve import retrieve
from chatbot.agent.state import default_state
from chatbot.retrieval.types import ChunkHit


@dataclass
class _StubSearcher:
    hits: list[ChunkHit]
    captured_query: str = ""

    async def search(self, query: str) -> list[ChunkHit]:
        self.captured_query = query
        return list(self.hits)


@pytest.mark.asyncio
async def test_retrieve_uses_search_query_when_present():
    hits = [ChunkHit("posts:x:0", "posts", "x", "T", "post", None, "body", 0.9, {})]
    searcher = _StubSearcher(hits=hits)
    state = {**default_state(query="raw", trace_id="t"), "search_query": "rewritten"}
    out = await retrieve(state, searcher=searcher)
    assert searcher.captured_query == "rewritten"
    assert out["chunks"][0].id == "posts:x:0"


@pytest.mark.asyncio
async def test_retrieve_falls_back_to_original_query_when_no_search_query():
    hits = []
    searcher = _StubSearcher(hits=hits)
    state = default_state(query="hello", trace_id="t")
    out = await retrieve(state, searcher=searcher)
    assert searcher.captured_query == "hello"
    assert out["chunks"] == []


@pytest.mark.asyncio
async def test_retrieve_preserves_hit_metadata_on_scored_chunks():
    hits = [ChunkHit("posts:x:0", "posts", "x", "T", "post", "https://u", "body", 0.42, {"k": "v"})]
    searcher = _StubSearcher(hits=hits)
    state = default_state(query="q", trace_id="t")
    out = await retrieve(state, searcher=searcher)
    chunk = out["chunks"][0]
    assert chunk.url == "https://u"
    assert chunk.collection == "posts"
    assert chunk.score == 0.42
