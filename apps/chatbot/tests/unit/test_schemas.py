import pytest
from pydantic import ValidationError

from chatbot.api.schemas import (
    ChatRequest,
    ChatResponse,
    IngestDocument,
    IngestRequest,
    Source,
)


def test_chat_request_rejects_empty_query():
    with pytest.raises(ValidationError):
        ChatRequest(query="")


def test_chat_request_rejects_query_over_500_chars():
    with pytest.raises(ValidationError):
        ChatRequest(query="x" * 501)


def test_chat_request_accepts_optional_history_and_trace_id():
    req = ChatRequest(
        query="hi",
        history=[{"role": "user", "content": "earlier"}],
        trace_id="11111111-1111-1111-1111-111111111111",
    )
    assert req.history[0].role == "user"


def test_chat_response_round_trips_through_dict():
    payload = {
        "answer": "ok",
        "sources": [
            {
                "id": "projects:rag",
                "title": "RAG",
                "source_type": "project",
                "slug": "rag",
                "url": None,
                "score": 0.8,
                "excerpt": "...",
            }
        ],
        "intent": "about_habibur",
        "trace_id": "11111111-1111-1111-1111-111111111111",
        "metadata": {
            "groundedness": "grounded",
            "retrieval_attempts": 0,
            "generation_attempts": 0,
            "latency_ms": 100,
            "tokens": {"in": 100, "out": 50},
        },
    }
    response = ChatResponse.model_validate(payload)
    assert response.sources[0].title == "RAG"
    assert isinstance(response.sources[0], Source)


def test_ingest_request_requires_at_least_one_document():
    with pytest.raises(ValidationError):
        IngestRequest(documents=[])


def test_ingest_document_requires_collection_slug_title_content():
    with pytest.raises(ValidationError):
        IngestDocument(collection="", slug="x", title="t", content="c")
