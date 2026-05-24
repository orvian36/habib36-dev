"""DI providers reading from app.state, plus a small AppContext dataclass."""
from __future__ import annotations

from dataclasses import dataclass

import asyncpg
from fastapi import Request
from weaviate.client import WeaviateAsyncClient

from ..db.chat_log_repo import ChatLogRepo
from ..llm.base import EmbeddingClient, LLMClient
from ..llm.budget import BudgetGate
from ..retrieval.hybrid_search import HybridSearcher


@dataclass
class AppContext:
    pool: asyncpg.Pool
    weaviate: WeaviateAsyncClient
    llm: LLMClient
    embedder: EmbeddingClient
    searcher: HybridSearcher
    budget: BudgetGate
    chat_log_repo: ChatLogRepo
    graph: object
    pro_model: str
    flash_model: str
    per_request_token_cap: int


def get_context(request: Request) -> AppContext:
    ctx = getattr(request.app.state, "context", None)
    if ctx is None:
        raise RuntimeError("AppContext is not initialised")
    return ctx
