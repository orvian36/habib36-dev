"""Unit-style smoke tests for /health and /metrics — no DB needed (fake context)."""
from fastapi.testclient import TestClient

from chatbot.api.deps import AppContext
from chatbot.config import Settings, get_settings
from chatbot.llm.fake import FakeEmbeddingClient, FakeLLMClient
from chatbot.main import create_app


class _FakeBudget:
    async def assert_can_spend(self, *, estimated_tokens):
        return None

    async def record_spend(self, *, tokens_in, tokens_out):
        return None

    async def remaining_today(self):
        return 1_000_000


class _FakeRepo:
    async def insert(self, row):
        return None

    async def record_feedback(self, trace_id, vote):
        return True

    async def fetch_by_trace(self, trace_id):
        return None


def _ctx() -> AppContext:
    return AppContext(
        pool=None,  # type: ignore[arg-type]
        weaviate=None,  # type: ignore[arg-type]
        llm=FakeLLMClient(),
        embedder=FakeEmbeddingClient(dimension=768),
        searcher=None,  # type: ignore[arg-type]
        budget=_FakeBudget(),  # type: ignore[arg-type]
        chat_log_repo=_FakeRepo(),  # type: ignore[arg-type]
        graph=None,
        pro_model="pro",
        flash_model="flash",
        per_request_token_cap=5000,
    )


def test_health_endpoint_returns_ok():
    app = create_app(context=_ctx())
    app.dependency_overrides[get_settings] = lambda: Settings()
    with TestClient(app) as client:
        r = client.get("/health")
        assert r.status_code == 200
        assert r.json()["status"] == "ok"


def test_metrics_endpoint_returns_prometheus_exposition():
    app = create_app(context=_ctx())
    app.dependency_overrides[get_settings] = lambda: Settings()
    with TestClient(app) as client:
        r = client.get("/metrics")
        assert r.status_code == 200
        assert "chatbot_request" in r.text
