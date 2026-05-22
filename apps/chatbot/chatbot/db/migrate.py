"""Idempotent migration runner.

Reads every .sql file under `migrations/` in lexical order and executes its contents
in a single transaction per file. All statements should be idempotent — schema-level
versioning is intentionally out of scope for v1.
"""
from __future__ import annotations

import asyncio
import sys
from pathlib import Path

import asyncpg

from chatbot.config import get_settings

MIGRATIONS_DIR = Path(__file__).resolve().parents[2] / "migrations"


async def apply_migrations(dsn: str) -> None:
    conn = await asyncpg.connect(dsn)
    try:
        for sql_path in sorted(MIGRATIONS_DIR.glob("*.sql")):
            statements = sql_path.read_text(encoding="utf-8")
            async with conn.transaction():
                await conn.execute(statements)
    finally:
        await conn.close()


def main() -> None:
    settings = get_settings()
    asyncio.run(apply_migrations(settings.database_url))


if __name__ == "__main__":
    main()
    sys.exit(0)
