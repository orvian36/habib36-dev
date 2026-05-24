"""Async Weaviate client factory + idempotent collection ensure.

The chatbot stores chunks in a single collection (default name "Chunks") with
vectorizer = none — vectors are produced by GeminiEmbeddingClient and passed
explicitly on insert. Hybrid search uses Weaviate's native BM25 + vector hybrid.
"""
from __future__ import annotations

import weaviate
from weaviate.auth import Auth
from weaviate.classes.config import (
    Configure,
    DataType,
    Property,
    Tokenization,
    VectorDistances,
)
from weaviate.client import WeaviateAsyncClient


async def create_weaviate_client(
    *,
    http_host: str,
    http_port: int,
    grpc_host: str,
    grpc_port: int,
    secure: bool = False,
    api_key: str | None = None,
) -> WeaviateAsyncClient:
    client = weaviate.use_async_with_custom(
        http_host=http_host,
        http_port=http_port,
        http_secure=secure,
        grpc_host=grpc_host,
        grpc_port=grpc_port,
        grpc_secure=secure,
        auth_credentials=Auth.api_key(api_key) if api_key else None,
    )
    await client.connect()
    return client


async def ensure_chunks_collection(client: WeaviateAsyncClient, name: str) -> None:
    if await client.collections.exists(name):
        return
    await client.collections.create(
        name=name,
        vectorizer_config=Configure.Vectorizer.none(),
        vector_index_config=Configure.VectorIndex.hnsw(
            distance_metric=VectorDistances.COSINE,
        ),
        properties=[
            Property(name="external_id",  data_type=DataType.TEXT, tokenization=Tokenization.FIELD),
            Property(name="collection",   data_type=DataType.TEXT, tokenization=Tokenization.FIELD),
            Property(name="slug",         data_type=DataType.TEXT, tokenization=Tokenization.FIELD),
            Property(name="chunk_index",  data_type=DataType.INT),
            Property(name="title",        data_type=DataType.TEXT),
            Property(name="source_type",  data_type=DataType.TEXT, tokenization=Tokenization.FIELD),
            Property(name="url",          data_type=DataType.TEXT),
            Property(name="content",      data_type=DataType.TEXT),
            Property(name="metadata_json", data_type=DataType.TEXT, tokenization=Tokenization.FIELD),
        ],
    )
