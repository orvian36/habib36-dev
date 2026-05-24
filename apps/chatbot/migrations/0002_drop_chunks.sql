-- 0002_drop_chunks.sql
-- Removes the legacy pgvector-backed chunks table. Chunks now live in Weaviate.
-- Idempotent: safe on fresh databases (where neither object exists).

DROP TABLE IF EXISTS chatbot.chunks;
DROP EXTENSION IF EXISTS vector;
