import pytest

pytestmark = pytest.mark.integration


async def test_schema_exists_after_migration(db_pool):
    async with db_pool.acquire() as conn:
        row = await conn.fetchrow(
            "SELECT schema_name FROM information_schema.schemata WHERE schema_name = 'chatbot'"
        )
        assert row is not None
        tables = await conn.fetch(
            "SELECT table_name FROM information_schema.tables WHERE table_schema = 'chatbot' ORDER BY table_name"
        )
        names = [r["table_name"] for r in tables]
        assert "chunks" in names
        assert "chat_logs" in names
        assert "usage_budget" in names


async def test_pgvector_extension_loaded(db_pool):
    async with db_pool.acquire() as conn:
        row = await conn.fetchrow("SELECT extname FROM pg_extension WHERE extname = 'vector'")
        assert row is not None
