#!/usr/bin/env bash
set -euo pipefail

echo "[entrypoint] applying migrations..."
python -m chatbot.db.migrate

echo "[entrypoint] starting uvicorn on :8001"
exec uvicorn chatbot.main:app --host 0.0.0.0 --port 8001 --workers 2
