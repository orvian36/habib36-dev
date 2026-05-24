"""Shared dataclasses for retrieval: records (writes) and hits (reads)."""
from __future__ import annotations

from dataclasses import dataclass
from typing import Any


@dataclass(frozen=True)
class ChunkRecord:
    id: str
    collection: str
    slug: str
    chunk_index: int
    title: str
    source_type: str
    url: str | None
    content: str
    embedding: list[float]
    metadata: dict[str, Any]


@dataclass(frozen=True)
class ChunkHit:
    id: str
    collection: str
    slug: str
    title: str
    source_type: str
    url: str | None
    content: str
    score: float
    metadata: dict[str, Any]
