# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Package Manager

**Always use `pnpm`** — never `npm` or `yarn`. All commands below use `pnpm`.
For Python dependencies, **always use `uv`**.

## Commands (Monorepo Root)

```bash
pnpm dev             # Start all apps concurrently via Turborepo
pnpm build           # Production build for all apps
pnpm lint            # Run linters across workspaces
```

### Web App (`apps/web`) Commands

```bash
pnpm --filter web dev
pnpm --filter web build
pnpm --filter web seed            # Seed Payload CMS database
pnpm --filter web generate:types  # Regenerate Payload TypeScript types → apps/web/src/payload-types.ts
pnpm --filter web payload         # Run Payload CLI commands directly
```

## Architecture

This is a **monorepo** orchestrated by **Turborepo** containing:
1. `apps/web`: Personal portfolio site (habib36.dev) built with **Next.js 16** and **Payload CMS 3** embedded. Database is **PostgreSQL** (Supabase), connected via `DATABASE_URL`.
2. `apps/chatbot`: Python **FastAPI** service for AI logic.

### Web App (`apps/web`)
- **Route Groups**:
  - `src/app/(frontend)/` — Public-facing pages: home, about, projects, blog, resume, contact
  - `src/app/(payload)/` — Payload admin panel and its API routes (`/admin`)
- **Payload CMS**:
  - Config: `src/payload.config.ts`
  - Collections: `Users`, `Media`, `Projects`, `Posts` (in `src/collections/`)
  - DB adapter: `@payloadcms/db-postgres` (Supabase PostgreSQL 17)
- **Frontend**: Tailwind CSS v4, Framer Motion, Lucide React.
- **Key Patterns**:
  - Next.js `withPayload()` wrapper in `next.config.ts` is required for Payload integration.
  - `DATABASE_URL` is required.

### Chatbot Service (`apps/chatbot`)
- A minimal Python service using `FastAPI` and managed via `uv`.
- Orchestrated by Turborepo via a proxy `package.json` with scripts mapping to `uv run uvicorn`.

## graphify

This project has a graphify knowledge graph at graphify-out/.

Rules:
- Before answering architecture or codebase questions, read graphify-out/GRAPH_REPORT.md for god nodes and community structure
- If graphify-out/wiki/index.md exists, navigate it instead of reading raw files
- For cross-module "how does X relate to Y" questions, prefer `graphify query "<question>"`, `graphify path "<A>" "<B>"`, or `graphify explain "<concept>"` over grep — these traverse the graph's EXTRACTED + INFERRED edges instead of scanning files
- After modifying code files in this session, run `graphify update .` to keep the graph current (AST-only, no API cost)
- All graphify temp/helper scripts and intermediate files (e.g. `_gf_*.py`, `.graphify_*.json`) must be created inside `graphify-out/temp/` — never in the project root. Create the folder if it doesn't exist. Delete it when the graphify operation completes.
