-- 0001_init.sql
-- Idempotent: safe to re-run on container start.

CREATE SCHEMA IF NOT EXISTS chatbot;
CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE IF NOT EXISTS chatbot.chunks (
    id            text PRIMARY KEY,
    collection    text NOT NULL,
    slug          text NOT NULL,
    chunk_index   int  NOT NULL,
    title         text NOT NULL,
    source_type   text NOT NULL,
    url           text,
    content       text NOT NULL,
    embedding     vector(768) NOT NULL,
    tsv           tsvector GENERATED ALWAYS AS (to_tsvector('english', content)) STORED,
    metadata      jsonb NOT NULL DEFAULT '{}'::jsonb,
    created_at    timestamptz NOT NULL DEFAULT now(),
    updated_at    timestamptz NOT NULL DEFAULT now(),
    UNIQUE (collection, slug, chunk_index)
);
CREATE INDEX IF NOT EXISTS chunks_embedding_idx ON chatbot.chunks USING hnsw (embedding vector_cosine_ops);
CREATE INDEX IF NOT EXISTS chunks_tsv_idx       ON chatbot.chunks USING gin (tsv);
CREATE INDEX IF NOT EXISTS chunks_doc_idx       ON chatbot.chunks (collection, slug);

CREATE TABLE IF NOT EXISTS chatbot.chat_logs (
    id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    trace_id        uuid NOT NULL,
    session_id      text,
    query_redacted  text NOT NULL,
    intent          text,
    chunk_ids       text[],
    groundedness    text,
    latency_ms      int,
    tokens_in       int,
    tokens_out      int,
    feedback        text,
    error           text,
    created_at      timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS chat_logs_created_idx ON chatbot.chat_logs (created_at DESC);
CREATE INDEX IF NOT EXISTS chat_logs_trace_idx   ON chatbot.chat_logs (trace_id);

CREATE TABLE IF NOT EXISTS chatbot.usage_budget (
    day          date PRIMARY KEY,
    tokens_in    bigint NOT NULL DEFAULT 0,
    tokens_out   bigint NOT NULL DEFAULT 0
);
