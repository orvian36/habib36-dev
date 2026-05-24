"""Weaviate-backed store for chunk write operations."""
from __future__ import annotations

import json
import uuid
from dataclasses import dataclass

from weaviate.classes.data import DataObject
from weaviate.classes.query import Filter
from weaviate.client import WeaviateAsyncClient

from .types import ChunkRecord

_NAMESPACE = uuid.NAMESPACE_URL


def _uuid_for(external_id: str) -> uuid.UUID:
    return uuid.uuid5(_NAMESPACE, external_id)


def _to_data_object(record: ChunkRecord) -> DataObject:
    return DataObject(
        properties={
            "external_id": record.id,
            "collection": record.collection,
            "slug": record.slug,
            "chunk_index": record.chunk_index,
            "title": record.title,
            "source_type": record.source_type,
            "url": record.url,
            "content": record.content,
            "metadata_json": json.dumps(record.metadata, ensure_ascii=False),
        },
        uuid=_uuid_for(record.id),
        vector=record.embedding,
    )


@dataclass(frozen=True)
class WeaviateChunksStore:
    client: WeaviateAsyncClient
    collection_name: str

    async def upsert(self, records: list[ChunkRecord]) -> None:
        if not records:
            return
        collection = self.client.collections.use(self.collection_name)
        # Deterministic UUIDs mean re-inserting the same id replaces the object.
        # Delete-then-insert keeps semantics identical to the pgvector ON CONFLICT path.
        ids_to_replace = [_uuid_for(r.id) for r in records]
        await collection.data.delete_many(
            where=Filter.by_id().contains_any(ids_to_replace)
        )
        await collection.data.insert_many([_to_data_object(r) for r in records])

    async def delete_document(self, collection: str, slug: str) -> int:
        coll = self.client.collections.use(self.collection_name)
        result = await coll.data.delete_many(
            where=(
                Filter.by_property("collection").equal(collection)
                & Filter.by_property("slug").equal(slug)
            )
        )
        return int(result.successful or 0)

    async def count(self) -> int:
        coll = self.client.collections.use(self.collection_name)
        result = await coll.aggregate.over_all(total_count=True)
        return int(result.total_count or 0)
