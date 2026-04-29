# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Package Manager

**Always use `pnpm`** — never `npm` or `yarn`. All commands below use `pnpm`.

## Commands

```bash
pnpm dev             # Start dev server (Next.js + Payload admin)
pnpm build           # Production build
pnpm lint            # ESLint (flat config, eslint.config.mjs)
pnpm seed            # Seed Payload CMS database (npx tsx src/seed.ts)
pnpm generate:types  # Regenerate Payload TypeScript types → src/payload-types.ts
pnpm payload         # Run Payload CLI commands directly
```

## Architecture

This is a **personal portfolio site** (habib36.dev) built with **Next.js 16** and **Payload CMS 3** embedded in the same app. Database is **PostgreSQL** (Supabase), connected via `DATABASE_URL`.

### Route Groups

- `src/app/(frontend)/` — Public-facing pages: home, about, projects, blog, resume, contact
- `src/app/(payload)/` — Payload admin panel and its API routes (`/admin`)
- `src/app/layout.tsx` — Minimal root layout (just passes children through)
- `src/app/(frontend)/layout.tsx` — Frontend layout with fonts (Inter + JetBrains Mono), metadata, and `ClientShell`

### Payload CMS

- Config: `src/payload.config.ts`
- Collections: `Users`, `Media`, `Projects`, `Posts` (in `src/collections/`)
- Rich text: Lexical editor
- DB adapter: `@payloadcms/db-postgres` (Supabase PostgreSQL 17)
- Client helper: `src/lib/payload.ts` exports `getPayloadClient()`
- Types are generated to `src/payload-types.ts`

### Frontend

- **Styling**: Tailwind CSS v4 (via `@tailwindcss/postcss`), global styles in `src/app/(frontend)/globals.css`
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Static data**: `src/lib/data.ts` contains site config, nav links, skills, experience, projects, blog posts, etc. — used as fallback / frontend-only data alongside CMS content
- **Components**: Organized by page section in `src/components/` (home, layout, chat, resume, projects, blog, ui)
- **Layout shell**: `src/components/layout/client-shell.tsx` wraps pages with navbar, footer, preloader, and chat widget

### Key Patterns

- Next.js `withPayload()` wrapper in `next.config.ts` is required for Payload integration
- Payload secret defaults to a hardcoded value — set `PAYLOAD_SECRET` env var in production
- `DATABASE_URL` is required — points to Supabase Postgres (use `?sslmode=no-verify` for local dev to bypass Node's strict cert chain check)
- `@payload-config` path alias is used by Payload internals (resolved by the withPayload plugin)
- Projects and Posts collections have draft/versioning enabled
