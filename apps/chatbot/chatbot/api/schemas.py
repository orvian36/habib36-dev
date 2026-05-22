"""Pydantic v2 schemas for the chatbot HTTP API."""
from __future__ import annotations

from typing import Literal

from pydantic import BaseModel, Field

Intent = Literal["smalltalk", "off_topic", "about_habibur", "tech_concept", "unsafe"]
Groundedness = Literal["grounded", "partial", "ungrounded"]
SourceType = Literal[
    "post", "project", "resume", "experience", "education", "skill",
    "achievement", "about", "case_study", "other",
]


class ChatMessage(BaseModel):
    role: Literal["user", "assistant"]
    content: str = Field(min_length=1, max_length=4000)


class ChatRequest(BaseModel):
    query: str = Field(min_length=1, max_length=500)
    session_id: str | None = None
    trace_id: str | None = None
    history: list[ChatMessage] = Field(default_factory=list)


class Source(BaseModel):
    id: str
    title: str
    source_type: SourceType
    slug: str | None = None
    url: str | None = None
    score: float
    excerpt: str


class ChatTokens(BaseModel):
    in_: int = Field(alias="in")
    out: int

    model_config = {"populate_by_name": True}


class ChatMetadata(BaseModel):
    groundedness: Groundedness | None = None
    retrieval_attempts: int = 0
    generation_attempts: int = 0
    latency_ms: int = 0
    tokens: ChatTokens = Field(default_factory=lambda: ChatTokens(**{"in": 0, "out": 0}))


class ChatResponse(BaseModel):
    answer: str
    sources: list[Source]
    intent: Intent
    trace_id: str
    metadata: ChatMetadata


class IngestDocument(BaseModel):
    collection: str = Field(min_length=1, max_length=64)
    slug: str = Field(min_length=1, max_length=200)
    title: str = Field(min_length=1, max_length=300)
    content: str = Field(min_length=1)
    source_type: SourceType = "other"
    url: str | None = None
    metadata: dict[str, str] = Field(default_factory=dict)


class IngestRequest(BaseModel):
    documents: list[IngestDocument] = Field(min_length=1)


class IngestResponse(BaseModel):
    ingested: int
    chunks: int
    trace_id: str


class DeleteResponse(BaseModel):
    deleted: int


class FeedbackRequest(BaseModel):
    trace_id: str
    vote: Literal["up", "down"]


class HealthResponse(BaseModel):
    status: Literal["ok"]
    version: str
