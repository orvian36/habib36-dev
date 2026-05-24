"""FastAPI application factory + lifespan."""
from __future__ import annotations

from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

from fastapi import FastAPI

from . import __version__
from .agent.graph import build_graph
from .api.deps import AppContext
from .api.routes import router
from .config import Settings, get_settings
from .db.budget_repo import BudgetRepo
from .db.chat_log_repo import ChatLogRepo
from .db.pool import create_pool
from .llm.base import EmbeddingClient, LLMClient
from .llm.budget import BudgetGate
from .llm.gemini import GeminiClient
from .observability.logger import configure_logging
from .observability.tracing import configure_tracing
from .retrieval.embedder import GeminiEmbeddingClient
from .retrieval.hybrid_search import HybridSearcher
from .retrieval.weaviate_client import create_weaviate_client, ensure_chunks_collection


def _build_real_components(settings: Settings) -> tuple[LLMClient, EmbeddingClient]:
    if not settings.gemini_api_key:
        raise RuntimeError("GEMINI_API_KEY must be set in non-test environments")
    llm = GeminiClient(
        api_key=settings.gemini_api_key,
        safety=settings.gemini_safety,
        timeout_seconds=settings.gemini_timeout_seconds,
    )
    embedder = GeminiEmbeddingClient(
        api_key=settings.gemini_api_key,
        model=settings.gemini_embedding_model,
        dimension=settings.embedding_dimension,
    )
    return llm, embedder


def create_app(*, context: AppContext | None = None) -> FastAPI:
    """Application factory.

    If `context` is provided it is used as-is (tests inject fakes here).
    Otherwise the real Gemini + Postgres + Weaviate components are built in the lifespan.
    """
    settings = get_settings()
    configure_logging(settings.log_level)
    configure_tracing()

    @asynccontextmanager
    async def lifespan(app: FastAPI) -> AsyncIterator[None]:
        if context is not None:
            app.state.context = context
            yield
            return

        pool = await create_pool(
            settings.database_url,
            min_size=settings.db_pool_min,
            max_size=settings.db_pool_max,
        )
        weaviate = await create_weaviate_client(
            http_host=settings.weaviate_http_host,
            http_port=settings.weaviate_http_port,
            grpc_host=settings.weaviate_grpc_host,
            grpc_port=settings.weaviate_grpc_port,
            secure=settings.weaviate_secure,
            api_key=settings.weaviate_api_key,
        )
        await ensure_chunks_collection(weaviate, settings.weaviate_collection)

        llm, embedder = _build_real_components(settings)
        searcher = HybridSearcher(
            weaviate, embedder, settings.weaviate_collection,
            top_k=settings.retrieval_top_k,
        )
        budget = BudgetGate(BudgetRepo(pool), daily_cap=settings.daily_token_budget)
        graph = build_graph(
            llm=llm,
            searcher=searcher,
            budget=budget,
            flash_model=settings.gemini_flash_model,
            pro_model=settings.gemini_pro_model,
            max_query_length=settings.max_query_length,
            max_answer_chars=settings.max_answer_chars,
            history_window=settings.history_window,
            max_retrieval_retries=settings.max_retrieval_retries,
            max_generation_retries=settings.max_generation_retries,
        )
        app.state.context = AppContext(
            pool=pool,
            weaviate=weaviate,
            llm=llm,
            embedder=embedder,
            searcher=searcher,
            budget=budget,
            chat_log_repo=ChatLogRepo(pool),
            graph=graph,
            pro_model=settings.gemini_pro_model,
            flash_model=settings.gemini_flash_model,
            per_request_token_cap=settings.per_request_token_cap,
        )
        try:
            yield
        finally:
            await weaviate.close()
            await pool.close()

    app = FastAPI(title="habib36.dev chatbot", version=__version__, lifespan=lifespan)
    app.include_router(router)
    return app


app = create_app()
