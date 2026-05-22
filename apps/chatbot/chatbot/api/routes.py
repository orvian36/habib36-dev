"""HTTP routes — health, metrics, chat, chat/stream, ingest, delete, feedback."""
from __future__ import annotations

import time
from typing import Annotated
from uuid import UUID, uuid4

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import Response, StreamingResponse

from .. import __version__
from ..agent.state import Message, default_state
from ..db.chat_log_repo import ChatLogRow
from ..db.chunks_repo import ChunksRepo
from ..ingest.service import IngestService
from ..llm.budget import BudgetExceeded
from ..observability.metrics import (
    metrics_registry,
    record_groundedness,
    record_request,
    record_request_duration,
    record_tokens,
    set_budget_remaining,
)
from ..retrieval.chunker import Chunker
from ..security.pii import redact
from .auth import require_ingest_hmac, require_internal_hmac
from .deps import AppContext, get_context
from .schemas import (
    ChatMessage,
    ChatMetadata,
    ChatRequest,
    ChatResponse,
    ChatTokens,
    DeleteResponse,
    FeedbackRequest,
    HealthResponse,
    IngestRequest,
    IngestResponse,
    Source,
)
from .sse import sse_event

router = APIRouter()

Ctx = Annotated[AppContext, Depends(get_context)]


def _to_messages(history: list[ChatMessage]) -> list[Message]:
    return [Message(role=m.role, content=m.content) for m in history]


@router.get("/health", response_model=HealthResponse)
async def health() -> HealthResponse:
    return HealthResponse(status="ok", version=__version__)


@router.get("/metrics")
async def metrics() -> Response:
    from prometheus_client import CONTENT_TYPE_LATEST, generate_latest

    body = generate_latest(metrics_registry())
    return Response(content=body, media_type=CONTENT_TYPE_LATEST)


@router.post("/chat", response_model=ChatResponse, dependencies=[Depends(require_internal_hmac)])
async def chat(body: ChatRequest, ctx: Ctx) -> ChatResponse:
    trace_id = body.trace_id or str(uuid4())

    try:
        await ctx.budget.assert_can_spend(estimated_tokens=ctx.per_request_token_cap)
    except BudgetExceeded as exc:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=str(exc)) from exc

    initial = default_state(query=body.query, trace_id=trace_id, history=_to_messages(body.history))
    started = time.perf_counter()
    final = await ctx.graph.ainvoke(initial)
    elapsed_ms = int((time.perf_counter() - started) * 1000)

    intent = final.get("intent", "about_habibur")
    grounded = final.get("groundedness")
    if grounded:
        record_groundedness(grounded)
    record_request(intent=intent, outcome="ok")
    record_request_duration(intent=intent, ms=elapsed_ms)

    tokens = final.get("tokens", {"in": 0, "out": 0})
    await ctx.budget.record_spend(tokens_in=tokens["in"], tokens_out=tokens["out"])
    record_tokens(ctx.pro_model, tokens_in=tokens["in"], tokens_out=tokens["out"])
    set_budget_remaining(await ctx.budget.remaining_today())

    response = ChatResponse(
        answer=final.get("answer", ""),
        sources=[
            Source(
                id=s.id, title=s.title, source_type=s.source_type, slug=s.slug,
                url=s.url, score=s.score, excerpt=s.excerpt,
            ) for s in final.get("sources", [])
        ],
        intent=intent,
        trace_id=trace_id,
        metadata=ChatMetadata(
            groundedness=grounded,
            retrieval_attempts=final.get("retrieval_attempt", 0),
            generation_attempts=final.get("generation_attempt", 0),
            latency_ms=elapsed_ms,
            tokens=ChatTokens(**{"in": tokens["in"], "out": tokens["out"]}),
        ),
    )

    # Spec §6 layer 7: persist a PII-scrubbed log row for analytics + incident debugging.
    await ctx.chat_log_repo.insert(ChatLogRow(
        trace_id=UUID(trace_id),
        session_id=body.session_id,
        query_redacted=redact(body.query),
        intent=intent,
        chunk_ids=[s.id for s in final.get("sources", [])],
        groundedness=grounded,
        latency_ms=elapsed_ms,
        tokens_in=tokens["in"],
        tokens_out=tokens["out"],
        error=None,
    ))
    return response


@router.post("/chat/stream", dependencies=[Depends(require_internal_hmac)])
async def chat_stream(body: ChatRequest, ctx: Ctx) -> StreamingResponse:
    trace_id = body.trace_id or str(uuid4())
    try:
        await ctx.budget.assert_can_spend(estimated_tokens=ctx.per_request_token_cap)
    except BudgetExceeded as exc:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=str(exc)) from exc

    initial = default_state(query=body.query, trace_id=trace_id, history=_to_messages(body.history))

    async def event_stream():
        try:
            async for event in ctx.graph.astream_events(initial, version="v2"):
                ev_type = event.get("event")
                name = event.get("name")
                if ev_type == "on_chain_start" and name:
                    yield sse_event("node", {"name": name, "status": "started"})
                elif ev_type == "on_chain_end" and name:
                    yield sse_event("node", {"name": name, "status": "completed"})
                elif ev_type == "on_chat_model_stream":
                    data = event.get("data", {})
                    chunk = data.get("chunk")
                    text = getattr(chunk, "content", None) or ""
                    if text:
                        yield sse_event("token", {"delta": text})
            final = await ctx.graph.ainvoke(initial)
            tokens = final.get("tokens", {"in": 0, "out": 0})
            await ctx.budget.record_spend(tokens_in=tokens["in"], tokens_out=tokens["out"])
            yield sse_event(
                "done",
                {
                    "answer": final.get("answer", ""),
                    "sources": [s.__dict__ for s in final.get("sources", [])],
                    "intent": final.get("intent", "about_habibur"),
                    "trace_id": trace_id,
                    "groundedness": final.get("groundedness"),
                },
            )
        except Exception as exc:
            yield sse_event("error", {"error": str(exc), "trace_id": trace_id})

    return StreamingResponse(event_stream(), media_type="text/event-stream")


@router.post("/ingest", response_model=IngestResponse, dependencies=[Depends(require_ingest_hmac)])
async def ingest(body: IngestRequest, ctx: Ctx) -> IngestResponse:
    trace_id = str(uuid4())
    svc = IngestService(chunker=Chunker(), embedder=ctx.embedder, repo=ChunksRepo(ctx.pool))
    summary = await svc.ingest(body.documents)
    return IngestResponse(ingested=summary.documents, chunks=summary.chunks, trace_id=trace_id)


@router.delete(
    "/documents/{collection}/{slug}",
    response_model=DeleteResponse,
    dependencies=[Depends(require_ingest_hmac)],
)
async def delete_document(
    collection: str, slug: str, ctx: Ctx,
) -> DeleteResponse:
    svc = IngestService(chunker=Chunker(), embedder=ctx.embedder, repo=ChunksRepo(ctx.pool))
    deleted = await svc.delete(collection, slug)
    return DeleteResponse(deleted=deleted)


@router.post("/chat/feedback", dependencies=[Depends(require_internal_hmac)])
async def chat_feedback(body: FeedbackRequest, ctx: Ctx) -> dict[str, bool]:
    ok = await ctx.chat_log_repo.record_feedback(UUID(body.trace_id), body.vote)
    if not ok:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="trace_id not found")
    return {"ok": True}
