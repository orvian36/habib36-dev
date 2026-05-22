"""Prometheus collectors used across the service."""
from __future__ import annotations

from prometheus_client import CollectorRegistry, Counter, Gauge, Histogram

_registry = CollectorRegistry()

_request_total = Counter(
    "chatbot_request_total",
    "Chat request count",
    labelnames=("intent", "outcome"),
    registry=_registry,
)
_node_duration = Histogram(
    "chatbot_node_duration_ms",
    "Per-node latency in milliseconds",
    labelnames=("node",),
    buckets=(5, 10, 25, 50, 100, 250, 500, 1000, 2500, 5000, 10000),
    registry=_registry,
)
_request_duration = Histogram(
    "chatbot_request_duration_ms",
    "End-to-end chat latency in milliseconds",
    labelnames=("intent",),
    buckets=(50, 100, 250, 500, 1000, 2500, 5000, 10000, 20000),
    registry=_registry,
)
_gemini_tokens = Counter(
    "chatbot_gemini_tokens_total",
    "Gemini token consumption",
    labelnames=("model", "direction"),
    registry=_registry,
)
_budget_remaining = Gauge(
    "chatbot_budget_remaining",
    "Remaining Gemini token budget for today",
    registry=_registry,
)
_groundedness = Counter(
    "chatbot_groundedness_total",
    "Groundedness verdict count",
    labelnames=("result",),
    registry=_registry,
)


def metrics_registry() -> CollectorRegistry:
    return _registry


def record_request(*, intent: str, outcome: str) -> None:
    _request_total.labels(intent=intent, outcome=outcome).inc()


def record_request_duration(*, intent: str, ms: float) -> None:
    _request_duration.labels(intent=intent).observe(ms)


def record_node_duration(node: str, ms: float) -> None:
    _node_duration.labels(node=node).observe(ms)


def record_tokens(model: str, *, tokens_in: int, tokens_out: int) -> None:
    _gemini_tokens.labels(model=model, direction="in").inc(tokens_in)
    _gemini_tokens.labels(model=model, direction="out").inc(tokens_out)


def set_budget_remaining(value: int) -> None:
    _budget_remaining.set(value)


def record_groundedness(result: str) -> None:
    _groundedness.labels(result=result).inc()
