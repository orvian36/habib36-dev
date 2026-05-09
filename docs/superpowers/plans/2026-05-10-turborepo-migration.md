# Turborepo Monorepo Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Convert the existing Next.js/Payload application into a Turborepo monorepo and add a Python FastAPI `chatbot` service.

**Architecture:** Move current application into `apps/web`. Create `apps/chatbot` with FastAPI managed via `uv`. Use `pnpm` workspaces and `turbo` to orchestrate tasks across both projects.

**Tech Stack:** Next.js, Payload CMS, Turborepo, pnpm, Python, FastAPI, Uvicorn, uv.

---

## User Review Required
> [!IMPORTANT]
> The directory restructuring will move almost all files at the root (except git, docs, and some root config) into `apps/web`. Please review Task 1 to ensure no critical files are left behind or incorrectly moved.

## Open Questions
None.

## Proposed Changes

### Task 1: Directory Restructuring

**Files:**
- Move: `package.json`, `tsconfig.json`, `postcss.config.mjs`, `next.config.ts`, `eslint.config.mjs`, `.env`, `sentry.*`, `src/`, `public/`, `next-env.d.ts` to `apps/web/`
- Delete: `package-lock.json`

- [ ] **Step 1: Create apps directories**
```bash
mkdir -p apps/web apps/chatbot
```

- [ ] **Step 2: Move Next.js/Payload app files**
```bash
mv package.json tsconfig.json postcss.config.mjs next.config.ts eslint.config.mjs .env next-env.d.ts apps/web/
mv sentry.client.config.ts sentry.edge.config.ts sentry.server.config.ts apps/web/
mv src public apps/web/
rm -f package-lock.json
```

- [ ] **Step 3: Update apps/web/package.json name**
Change `"name": "habib36-dev"` to `"name": "web"`.

- [ ] **Step 4: Commit restructuring**
```bash
git add -A
git commit -m "chore: move existing app to apps/web"
```

### Task 2: Root Monorepo Configuration

**Files:**
- Create: `pnpm-workspace.yaml`
- Create: `package.json`
- Create: `turbo.json`

- [ ] **Step 1: Create pnpm-workspace.yaml**
```yaml
packages:
  - "apps/*"
```

- [ ] **Step 2: Create root package.json**
```json
{
  "name": "habib36-dev-monorepo",
  "private": true,
  "scripts": {
    "dev": "turbo run dev",
    "build": "turbo run build",
    "lint": "turbo run lint"
  },
  "devDependencies": {
    "turbo": "^2.0.0"
  },
  "packageManager": "pnpm@9.0.0"
}
```

- [ ] **Step 3: Create turbo.json**
```json
{
  "$schema": "https://turbo.build/schema.json",
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "!.next/cache/**"]
    },
    "lint": {
      "dependsOn": ["^lint"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    }
  }
}
```

- [ ] **Step 4: Commit root configs**
```bash
git add pnpm-workspace.yaml package.json turbo.json
git commit -m "chore: add turborepo and pnpm workspace configs"
```

### Task 3: Python FastAPI Service

**Files:**
- Create: `apps/chatbot/main.py`
- Create: `apps/chatbot/package.json`
- Run: `uv init` inside `apps/chatbot`

- [ ] **Step 1: Initialize Python project with uv**
```bash
cd apps/chatbot
uv init
uv add fastapi uvicorn
```

- [ ] **Step 2: Create apps/chatbot/main.py**
```python
from fastapi import FastAPI

app = FastAPI()

@app.get("/health")
def health_check():
    return {"status": "ok"}
```

- [ ] **Step 3: Create apps/chatbot/package.json for Turborepo**
```json
{
  "name": "chatbot",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "uv run uvicorn main:app --reload --port 8000",
    "start": "uv run uvicorn main:app --port 8000"
  }
}
```

- [ ] **Step 4: Commit chatbot service**
```bash
git add apps/chatbot
git commit -m "feat: add python fastapi chatbot service"
```

### Task 4: Verification

- [ ] **Step 1: Install dependencies at root**
```bash
pnpm install
```

- [ ] **Step 2: Verify `web` builds**
```bash
pnpm turbo run build --filter=web
```

- [ ] **Step 3: Run full dev pipeline briefly to verify**
```bash
pnpm turbo run dev
```

## Verification Plan

### Automated Tests
Run `pnpm install` and `pnpm turbo run build --filter=web`.

### Manual Verification
Ensure that running `pnpm dev` starts the `web` application correctly and the Python service handles requests on `localhost:8000/health`.
