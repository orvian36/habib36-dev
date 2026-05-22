from chatbot.agent.state import AgentState, ScoredChunk, default_state, increment_attempt


def test_default_state_is_safe_starting_point():
    s = default_state(query="hi", trace_id="t-1")
    assert s["query"] == "hi"
    assert s["trace_id"] == "t-1"
    assert s["retrieval_attempt"] == 0
    assert s["generation_attempt"] == 0
    assert s["node_timings_ms"] == {}
    assert s["tokens"] == {"in": 0, "out": 0}


def test_increment_attempt_returns_new_dict():
    s: AgentState = default_state(query="q", trace_id="t")
    next_state = increment_attempt(s, "retrieval_attempt")
    assert next_state["retrieval_attempt"] == 1
    assert s["retrieval_attempt"] == 0   # original is not mutated


def test_scored_chunk_can_be_constructed_from_hit_fields():
    c = ScoredChunk(id="x:1:0", title="t", source_type="post", url=None, content="b", score=0.5)
    assert c.id == "x:1:0"
