from chatbot.api.sse import sse_event


def test_sse_event_formats_event_and_data():
    out = sse_event("node", {"name": "retrieve", "status": "started"})
    assert out.startswith("event: node\n")
    assert "data: " in out
    assert out.endswith("\n\n")


def test_sse_event_supports_token_deltas():
    out = sse_event("token", {"delta": "hello"})
    assert '"delta": "hello"' in out


def test_sse_event_serialises_unicode_safely():
    out = sse_event("token", {"delta": "héllo→"})
    assert "héllo" in out
