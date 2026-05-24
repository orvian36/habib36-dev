"""Content ingestion: chunk → embed → upsert. Idempotent per document."""
from __future__ import annotations

from dataclasses import dataclass

from ..api.schemas import IngestDocument
from ..llm.base import EmbeddingClient
from ..retrieval.chunker import Chunker
from ..retrieval.chunks_store import WeaviateChunksStore
from ..retrieval.types import ChunkRecord


@dataclass(frozen=True)
class IngestSummary:
    documents: int
    chunks: int


def _chunk_id(collection: str, slug: str, index: int) -> str:
    return f"{collection}:{slug}:{index}"


class IngestService:
    def __init__(
        self,
        chunker: Chunker,
        embedder: EmbeddingClient,
        repo: WeaviateChunksStore,
    ) -> None:
        self._chunker = chunker
        self._embedder = embedder
        self._repo = repo

    async def ingest(self, documents: list[IngestDocument]) -> IngestSummary:
        # Step 1: drop existing chunks for the (collection, slug) of each input doc.
        for doc in documents:
            await self._repo.delete_document(doc.collection, doc.slug)

        # Step 2: chunk every document.
        plan: list[tuple[IngestDocument, int, str]] = []
        for doc in documents:
            for chunk in self._chunker.split(doc.content):
                plan.append((doc, chunk.index, chunk.text))

        if not plan:
            return IngestSummary(documents=len(documents), chunks=0)

        # Step 3: embed all chunks in one batch.
        embeddings = await self._embedder.aembed_documents([text for _, _, text in plan])

        # Step 4: build ChunkRecord and upsert.
        records: list[ChunkRecord] = []
        for (doc, index, text), embedding in zip(plan, embeddings, strict=True):
            metadata: dict[str, str] = dict(doc.metadata)
            records.append(
                ChunkRecord(
                    id=_chunk_id(doc.collection, doc.slug, index),
                    collection=doc.collection,
                    slug=doc.slug,
                    chunk_index=index,
                    title=doc.title,
                    source_type=doc.source_type,
                    url=doc.url,
                    content=text,
                    embedding=embedding,
                    metadata=metadata,
                )
            )
        await self._repo.upsert(records)
        return IngestSummary(documents=len(documents), chunks=len(records))

    async def delete(self, collection: str, slug: str) -> int:
        return await self._repo.delete_document(collection, slug)
