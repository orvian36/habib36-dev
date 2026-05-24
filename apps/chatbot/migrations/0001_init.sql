-- 0001_init.sql
-- Idempotent: safe to re-run on container start.

CREATE SCHEMA IF NOT EXISTS chatbot;

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
