# 08 — Operations & Deployment

> All source paths below are relative to `apps/chatbot/` (so `chatbot/config.py` lives on disk at `apps/chatbot/chatbot/config.py`).

---

## 1. Dockerfile walkthrough

_Source: `apps/chatbot/Dockerfile`_

The image is **multi-stage** (builder → runtime) to keep the production layer free of build tooling.

| Layer | What it does |
|-------|-------------|
| `FROM python:3.12-slim AS builder` | Slim Debian base; Python 3.12 matches the project's minimum. |
| `ENV PYTHONDONTWRITEBYTECODE … UV_LINK_MODE=copy` | Suppresses `.pyc` files, forces unbuffered stdout, and tells `uv` to copy files instead of symlinking (necessary inside Docker). |
| `apt-get install build-essential curl ca-certificates` | Installs the C toolchain and curl needed to bootstrap `uv` and compile any native wheels. |
| `curl … astral.sh/uv/install.sh \| sh` | Fetches and installs `uv`; moved to `/usr/local/bin/uv` so it is on PATH for subsequent `RUN` steps. |
| `COPY pyproject.toml uv.lock ./` + `RUN uv sync --frozen --no-dev` | Copies only the lock files first so Docker can cache the layer; `--frozen` enforces the lock file and `--no-dev` omits test/lint deps. |
| `COPY chatbot ./chatbot` + `COPY migrations ./migrations` | Application source and SQL migrations copied after the dependency layer — changing source code does not bust the expensive dep-install cache. |
| `COPY docker-entrypoint.sh` + `chmod +x` | Adds the entrypoint script and makes it executable inside the builder layer. |
| `FROM python:3.12-slim AS runtime` | Fresh slim base; nothing from the builder's build tools is carried over. |
| `apt-get install postgresql-client curl ca-certificates` | `pg_isready` / `psql` for readiness probes; `curl` is used by the `HEALTHCHECK` instruction. |
| `useradd --uid 10001 chatbot` | Creates a non-root user so the container does not run as root. |
| `COPY --from=builder /app /app` | Copies the entire pre-built `/app` directory (venv + source) from the builder stage. |
| `USER chatbot` | Drops privileges to the non-root `chatbot` user for all subsequent instructions and at runtime. |
| `EXPOSE 8001` | Documents (does not publish) the service port. |
| `HEALTHCHECK CMD curl -fs http://localhost:8001/health` | Docker marks the container unhealthy after three 30-second intervals with a 5-second timeout. |
| `ENTRYPOINT ["./docker-entrypoint.sh"]` | All container invocations pass through the entrypoint; there is no separate `CMD`. |

---

## 2. docker-entrypoint.sh

_Source: `apps/chatbot/docker-entrypoint.sh`_

The script runs under `set -euo pipefail` — any error aborts startup immediately.

**Steps in order:**

1. `python -m chatbot.db.migrate` — applies all SQL migrations before the server starts (see §4 for details).
2. `exec uvicorn chatbot.main:app --host 0.0.0.0 --port 8001 --workers 2` — replaces the shell process with uvicorn (PID 1 receives signals correctly).

There is no explicit env validation, health pre-check, or DB wait-loop in the script; migration failure (e.g. unreachable database) will exit non-zero and abort the container start.

---

## 3. Environment reference

_Source: `chatbot/config.py:18-63`_

All variables are case-insensitive and can be supplied via a `.env` file or real environment variables. Fields marked **Required in prod** have no safe default for production use.

### App / General (`config.py:18-19`)

| Name | Default | Required in prod | What it controls |
|------|---------|-----------------|-----------------|
| `APP_NAME` | `habib36.dev chatbot` | No | Service name surfaced in logs and OpenTelemetry resource attributes. |
| `ENVIRONMENT` | `development` | Yes | Controls behaviour gates; must be `production` in prod. |

### Database (`config.py:22-24`)

| Name | Default | Required in prod | What it controls |
|------|---------|-----------------|-----------------|
| `DATABASE_URL` | `postgresql://postgres:postgres@localhost:5432/postgres` | Yes | asyncpg DSN for the PostgreSQL database. |
| `DB_POOL_MIN` | `2` | No | Minimum persistent connections in the asyncpg pool. |
| `DB_POOL_MAX` | `10` | No | Maximum connections; cap to Postgres `max_connections` headroom. |

### Weaviate (`config.py`)

| Name | Default | Required in prod | What it controls |
|------|---------|-----------------|-----------------|
| `WEAVIATE_HTTP_HOST` | `localhost` | Yes | Hostname for the Weaviate HTTP endpoint (port 8080). |
| `WEAVIATE_HTTP_PORT` | `8080` | No | HTTP port for the Weaviate REST/GraphQL API. |
| `WEAVIATE_GRPC_HOST` | `localhost` | Yes | Hostname for the Weaviate gRPC endpoint (port 50051). |
| `WEAVIATE_GRPC_PORT` | `50051` | No | gRPC port used by `weaviate-client` v4 for fast queries. |
| `WEAVIATE_COLLECTION` | `Chunks` | No | Name of the Weaviate collection holding chunk objects. |
| `WEAVIATE_API_KEY` | `None` | No | API key for managed/hosted Weaviate (`Auth.api_key(...)`); omit for anonymous local access. |
| `WEAVIATE_SECURE` | `false` | No | Set to `true` to enable TLS on both HTTP and gRPC connections. |

### Gemini (`config.py:27-35`)

| Name | Default | Required in prod | What it controls |
|------|---------|-----------------|-----------------|
| `GEMINI_API_KEY` | `None` | Yes | Google AI API key; `None` causes all generation calls to fail. |
| `GEMINI_PRO_MODEL` | `gemini-2.5-pro` | No | Model ID used for final answer generation. |
| `GEMINI_FLASH_MODEL` | `gemini-2.5-flash` | No | Model ID used for cheaper/faster tasks (intent, groundedness). |
| `GEMINI_EMBEDDING_MODEL` | `gemini-embedding-001` | No | Model ID used for embedding chunks and queries. |
| `EMBEDDING_DIMENSION` | `768` | No | Vector size; must match the 768-dim vectors pushed to Weaviate. |
| `GEMINI_TIMEOUT_SECONDS` | `30.0` | No | Per-request HTTP timeout for all Gemini calls. |
| `GEMINI_SAFETY` | `BLOCK_MEDIUM_AND_ABOVE` | No | Harm-block threshold applied to all Gemini requests. |

### Retrieval (`config.py:38-41`)

| Name | Default | Required in prod | What it controls |
|------|---------|-----------------|-----------------|
| `CHUNK_SIZE` | `700` | No | Target token count per text chunk during ingest. |
| `CHUNK_OVERLAP` | `100` | No | Overlap between consecutive chunks (context continuity). |
| `RETRIEVAL_TOP_K` | `8` | No | Number of chunks returned by the hybrid retriever. |
| `RRF_K` | `60` | No | Reciprocal-rank fusion constant; higher = smoother score distribution. |

### Agent (`config.py:44-47`)

| Name | Default | Required in prod | What it controls |
|------|---------|-----------------|-----------------|
| `HISTORY_WINDOW` | `5` | No | Number of prior conversation turns kept in context. |
| `MAX_QUERY_LENGTH` | `500` | No | Hard character limit on incoming user query; longer queries are rejected. |
| `MAX_RETRIEVAL_RETRIES` | `1` | No | Retry attempts for retrieval failures before surfacing an error. |
| `MAX_GENERATION_RETRIES` | `1` | No | Retry attempts for generation failures before surfacing an error. |

### Security (`config.py:50-52`)

| Name | Default | Required in prod | What it controls |
|------|---------|-----------------|-----------------|
| `INTERNAL_HMAC_SECRET` | `dev-internal-secret-change-me` | Yes | HMAC-SHA256 secret(s) (comma-separated) for `/chat` and `/health` routes. |
| `INGEST_HMAC_SECRET` | `dev-ingest-secret-change-me` | Yes | HMAC-SHA256 secret(s) (comma-separated) for `/ingest` routes. |
| `REPLAY_WINDOW_SECONDS` | `60` | No | Maximum age of a signed request before it is rejected as a replay. |

### Budget (`config.py:55-56`)

| Name | Default | Required in prod | What it controls |
|------|---------|-----------------|-----------------|
| `DAILY_TOKEN_BUDGET` | `1,000,000` | No | Rolling daily token cap across all Gemini calls; resets at UTC midnight. |
| `PER_REQUEST_TOKEN_CAP` | `5,000` | No | Maximum tokens allowed in a single request; prevents runaway prompts. |

### Output guard (`config.py:59`)

| Name | Default | Required in prod | What it controls |
|------|---------|-----------------|-----------------|
| `MAX_ANSWER_CHARS` | `1500` | No | Hard character limit applied to the generated answer before it is returned to the caller. |

### Observability (`config.py:62-63`)

| Name | Default | Required in prod | What it controls |
|------|---------|-----------------|-----------------|
| `OTEL_ENDPOINT` | `None` | No | OTLP gRPC/HTTP endpoint for OpenTelemetry traces; disabled when `None`. |
| `LOG_LEVEL` | `INFO` | No | Python logging level (`DEBUG`, `INFO`, `WARNING`, `ERROR`). |

Total: **25 fields**.

---

## 4. Migrations

_Source: `chatbot/db/migrate.py`_

**Command:**

```bash
uv run python -m chatbot.db.migrate
```

This is also invoked automatically by `docker-entrypoint.sh` on every container start.

**How it works:**

- The runner globs `migrations/*.sql` in **lexical order** (e.g. `0001_init.sql`, `0002_…sql`).
- Each file is executed in its own `asyncpg` transaction. If a statement fails the transaction is rolled back and the process exits non-zero.
- **No migration-tracking table is maintained.** The module docstring states: _"schema-level versioning is intentionally out of scope for v1."_ Every SQL file must therefore be written with idempotency guards (`CREATE TABLE IF NOT EXISTS`, `CREATE INDEX IF NOT EXISTS`). The migrations in the repo follow this convention throughout.
- **Rollback is not supported.** There is no `down` path, no version registry, and no rollback command. To reverse a migration, write a new forward-only SQL file.
- **`0002_drop_chunks.sql`** cleans up the legacy `chatbot.chunks` table for any environment migrating off pgvector. Fresh databases are unaffected (the table never existed).

---

## 5. Backups

**Postgres** is the source of truth for chat logs and budget counters — back up the `pgdata` volume on whatever schedule fits the rest of the platform.

**Weaviate** `weaviate_data` volume holds the chunks index. If lost it can be rebuilt from scratch by re-running the ingest job, since the embedding pipeline is deterministic for a given content blob. Volume backups still recommended to avoid a multi-minute warmup.

---

## 6. Runbook

### 6.1 Gemini API key rotation

**Symptom:** You need to revoke a compromised key or rotate on schedule.

1. Generate the new key in Google AI Studio / GCP.
2. Set `GEMINI_API_KEY=<new-key>` in your secrets manager / pod env.
3. Redeploy (or restart) the container — `get_settings()` is cached per process via `@lru_cache`; only a restart loads the new value.
4. Verify: `GET /health` should return `200` and the response body should show `gemini: ok`.
5. Revoke the old key. No downtime because Gemini clients are re-created in the FastAPI lifespan on the new process.

### 6.2 Daily budget exhausted

**Symptom:** `/chat` returns `503 Service Unavailable` with a budget-exhausted error body.

1. Check the Prometheus gauge `chatbot_budget_remaining` (defined in `chatbot/observability/metrics.py`, set via `set_budget_remaining()`). A value of `0` confirms budget depletion.
2. The Prometheus scrape endpoint and any dashboard are **operator-side; not in repo**.
3. **Option A — wait:** The budget rolls over at UTC midnight (keyed on `date.today()` in `chatbot.db.usage_budget`).
4. **Option B — raise the cap:** Increase `DAILY_TOKEN_BUDGET` and redeploy. Effect is immediate on next process start.
5. Confirm recovery: send a test `/chat` request; `chatbot_budget_remaining` gauge should reflect the new ceiling.

### 6.3 Re-index from scratch (Weaviate)

**Symptom:** The `weaviate_data` volume is lost, corrupted, or you need a clean rebuild.

```powershell
docker compose down weaviate
docker volume rm habib36-dev_weaviate_data
docker compose up -d weaviate
# Then trigger an ingest cycle from the web app (or hit the ingest endpoint directly with the HMAC secret).
```

Weaviate will recreate the `Chunks` collection on first use (the chatbot calls `ensure_collection` during lifespan startup). The embedding pipeline is deterministic for a given content blob, so re-ingesting produces an identical index.

### 6.4 Weaviate connection refused

**Symptom:** Chatbot fails to start with a `weaviate.exceptions.WeaviateConnectionError`.

1. Confirm Weaviate is running: `docker compose ps weaviate`.
2. Check `WEAVIATE_HTTP_HOST` / `WEAVIATE_HTTP_PORT` match the compose service name (`weaviate`) and port (`8080`).
3. If Weaviate is healthy but the chatbot times out, increase `WEAVIATE_STARTUP_PERIOD` in the compose file or add a startup delay in the entrypoint.

### 6.5 HMAC replay-window failures

**Symptom:** Clients receive `401 Unauthorized` errors that correlate with NTP drift between the signing host and the pod.

1. Compare the pod clock (`date -u` inside the container) against the caller's clock.
2. If the delta exceeds `REPLAY_WINDOW_SECONDS` (default `60 s`), the request timestamp falls outside the acceptance window.
3. **Fix:** Correct the NTP configuration on the drifting host (pod or caller). Do **not** blindly widen `REPLAY_WINDOW_SECONDS` — a wider window increases the replay-attack surface.
4. After fixing NTP, confirm new requests succeed without changing any secrets or redeploying.

### 6.6 DB pool exhausted

**Symptom:** `asyncpg.exceptions.TooManyConnectionsError` in logs, or requests hang indefinitely with no response.

1. Check the current pool configuration: `DB_POOL_MIN` (default `2`) and `DB_POOL_MAX` (default `10`).
2. Query the database for active connections:
   ```sql
   SELECT count(*) FROM pg_stat_activity WHERE datname = current_database();
   ```
3. Check Postgres `max_connections` (`SHOW max_connections;`) to confirm headroom.
4. If headroom exists, raise `DB_POOL_MAX` and redeploy.
5. If Postgres is at capacity, either reduce other clients or increase `max_connections` (requires a Postgres restart on most managed providers).

---

## 7. See also

- [01-architecture.md](01-architecture.md) — service topology and component overview
- [06-security.md](06-security.md) — HMAC signing scheme, replay protection, secret rotation
- [07-observability.md](07-observability.md) — metrics reference, tracing, log fields
