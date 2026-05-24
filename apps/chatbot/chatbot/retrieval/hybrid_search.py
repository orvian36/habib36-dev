"""Hybrid retrieval via Weaviate native hybrid (BM25 + vector, RANKED fusion)."""
from __future__ import annotations

import json
from dataclasses import dataclass

from weaviate.classes.query import HybridFusion, MetadataQuery
from weaviate.client import WeaviateAsyncClient

from ..llm.base import EmbeddingClient
from .types import ChunkHit


def _to_hit(obj) -> ChunkHit:
    p = obj.properties
    raw_meta = p.get("metadata_json") or "{}"
    try:
        metadata = json.loads(raw_meta)
    except (ValueError, TypeError):
        metadata = {}
    score = float(obj.metadata.score) if obj.metadata and obj.metadata.score is not None else 0.0
    return ChunkHit(
        id=str(p.get("external_id") or ""),
        collection=str(p.get("collection") or ""),
        slug=str(p.get("slug") or ""),
        title=str(p.get("title") or ""),
        source_type=str(p.get("source_type") or ""),
        url=(str(p["url"]) if p.get("url") else None),
        content=str(p.get("content") or ""),
        score=score,
        metadata=metadata,
    )


@dataclass(frozen=True)
class HybridSearcher:
    client: WeaviateAsyncClient
    embedder: EmbeddingClient
    collection_name: str
    top_k: int = 8
    alpha: float = 0.5

    async def search(self, query: str) -> list[ChunkHit]:
        vector = await self.embedder.aembed_query(query)
        collection = self.client.collections.use(self.collection_name)
        res = await collection.query.hybrid(
            query=query,
            vector=vector,
            alpha=self.alpha,
            fusion_type=HybridFusion.RANKED,
            limit=self.top_k,
            return_metadata=MetadataQuery(score=True),
        )
        return [_to_hit(o) for o in res.objects]
