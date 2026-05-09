# Turborepo Monorepo Migration Design

## Purpose
Convert the existing Next.js/Payload application into a Turborepo-managed monorepo to support multiple services. The current application will become the `web` workspace, and a new Python FastAPI service named `chatbot` will be added.

## Architecture

### Directory Structure
```
/
├── apps/
│   ├── web/        (Existing Next.js/Payload application)
│   └── chatbot/    (New Python FastAPI service)
├── package.json    (Root package.json for pnpm workspaces)
├── pnpm-workspace.yaml
├── turbo.json      (Turborepo configuration)
└── ...
```

### Components

#### 1. Root Workspace
- **Package Manager:** `pnpm` workspaces.
- **Dependencies:** `turbo` (dev dependency).
- **Turborepo Config:** A `turbo.json` file defining tasks (`dev`, `build`, `lint`) with caching strategies.

#### 2. `apps/web` (Next.js & Payload CMS)
- The entire existing repository contents (except Git and top-level environment configs/ignores where it makes sense to keep at root).
- Will retain its own `package.json` with existing dependencies.
- No changes to business logic or existing configurations, just path updates if necessary.

#### 3. `apps/chatbot` (Python FastAPI)
- **Dependency Manager:** `uv`.
- **Framework:** FastAPI with Uvicorn.
- **Endpoints:** A single `/health` endpoint for initial setup.
- **Turborepo Integration:** A minimal `package.json` with scripts:
  - `"dev": "uv run uvicorn main:app --reload --port 8000"`
  - `"start": "uv run uvicorn main:app --port 8000"`
  This allows Turborepo to seamlessly orchestrate the Python app alongside Node.js apps.

## Data Flow
- `pnpm dev` at the root will trigger `turbo run dev`.
- Turborepo will concurrently execute `npm run dev` in `apps/web` and `apps/chatbot`.
- Next.js will serve the frontend/Payload CMS, and FastAPI will serve the `/health` endpoint on port 8000.

## Error Handling & Testing
- Both apps run independently but are orchestrated together. 
- Build tasks for `web` can be cached by Turborepo.
- The `/health` endpoint provides a straightforward way to verify the Python service is running.

## Implementation Steps
1. Create `apps/` directory and move current application code into `apps/web`.
2. Configure `pnpm-workspace.yaml` and root `package.json`.
3. Create `apps/chatbot`, initialize `uv` with FastAPI, and add `main.py`.
4. Create Turborepo proxy `package.json` in `apps/chatbot`.
5. Create `turbo.json` at root.
6. Verify development pipeline by running `pnpm install` and `pnpm dev`.
