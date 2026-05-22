"""Application configuration loaded from environment variables."""
from __future__ import annotations

from functools import lru_cache
from typing import Literal

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    app_name: str = "habib36.dev chatbot"
    environment: Literal["development", "test", "production"] = "development"

    # Database
    database_url: str = "postgresql://postgres:postgres@localhost:5432/postgres"
    db_pool_min: int = 2
    db_pool_max: int = 10

    # Gemini
    gemini_api_key: str | None = None
    gemini_pro_model: str = "gemini-2.5-pro"
    gemini_flash_model: str = "gemini-2.5-flash"
    gemini_embedding_model: str = "gemini-embedding-001"
    embedding_dimension: int = 768
    gemini_timeout_seconds: float = 30.0
    gemini_safety: Literal["BLOCK_ONLY_HIGH", "BLOCK_MEDIUM_AND_ABOVE", "BLOCK_LOW_AND_ABOVE"] = (
        "BLOCK_MEDIUM_AND_ABOVE"
    )

    # Retrieval
    chunk_size: int = 700
    chunk_overlap: int = 100
    retrieval_top_k: int = 8
    rrf_k: int = 60

    # Agent
    history_window: int = 5
    max_query_length: int = 500
    max_retrieval_retries: int = 1
    max_generation_retries: int = 1

    # Security
    internal_hmac_secret: str = "dev-internal-secret-change-me"
    ingest_hmac_secret: str = "dev-ingest-secret-change-me"
    replay_window_seconds: int = 60

    # Budget
    daily_token_budget: int = 1_000_000
    per_request_token_cap: int = 5_000

    # Output guard
    max_answer_chars: int = 1500

    # Observability
    otel_endpoint: str | None = None
    log_level: str = "INFO"

    def _split_csv(self, value: str) -> list[str]:
        return [v.strip() for v in value.split(",") if v.strip()]

    def internal_secrets(self) -> list[str]:
        return self._split_csv(self.internal_hmac_secret)

    def ingest_secrets(self) -> list[str]:
        return self._split_csv(self.ingest_hmac_secret)


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    return Settings()
