<div align="center">

# `habib36.dev`

### Full-Stack Engineer & AI Builder — Personal Portfolio

Dark, terminal-inspired portfolio powered by **Next.js 16**, **Payload CMS 3**, and a custom RAG-ready content pipeline.

[![Next.js](https://img.shields.io/badge/Next.js-16-000000?logo=nextdotjs&logoColor=white)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev)
[![Payload CMS](https://img.shields.io/badge/Payload_CMS-3-000000?logo=payloadcms&logoColor=white)](https://payloadcms.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![SQLite](https://img.shields.io/badge/SQLite-003B57?logo=sqlite&logoColor=white)](https://www.sqlite.org)
[![pnpm](https://img.shields.io/badge/pnpm-F69220?logo=pnpm&logoColor=white)](https://pnpm.io)
[![Framer Motion](https://img.shields.io/badge/Framer_Motion-12-0055FF?logo=framer&logoColor=white)](https://www.framer.com/motion/)

[Live Site](https://habib36.dev) &nbsp;·&nbsp; [Admin Panel](https://habib36.dev/admin) &nbsp;·&nbsp; [Blog](https://habib36.dev/blog) &nbsp;·&nbsp; [Contact](https://habib36.dev/contact)

</div>

---

## Preview

<p align="center">
  <img src="./public/screenshots/home-desktop.png" alt="Home page — hero, stats, featured work, chatbot, blog highlights" width="90%"/>
</p>

<table>
<tr>
<td width="50%" align="center"><strong>About</strong><br/><img src="./public/screenshots/about-desktop.png" alt="About page"/></td>
<td width="50%" align="center"><strong>Projects</strong><br/><img src="./public/screenshots/projects-desktop.png" alt="Projects page"/></td>
</tr>
<tr>
<td width="50%" align="center"><strong>Blog</strong><br/><img src="./public/screenshots/blog-desktop.png" alt="Blog page"/></td>
<td width="50%" align="center"><strong>Resume</strong><br/><img src="./public/screenshots/resume-desktop.png" alt="Resume page"/></td>
</tr>
<tr>
<td width="50%" align="center"><strong>Contact</strong><br/><img src="./public/screenshots/contact-desktop.png" alt="Contact page"/></td>
<td width="50%" align="center"><strong>Home (extended)</strong><br/><img src="./public/screenshots/home-desktop.png" alt="Home page"/></td>
</tr>
</table>

<details>
<summary><strong>Mobile preview</strong> (click to expand)</summary>

<p align="center">
  <img src="./public/screenshots/home-mobile.png" alt="Home (mobile)" width="22%"/>
  <img src="./public/screenshots/about-mobile.png" alt="About (mobile)" width="22%"/>
  <img src="./public/screenshots/projects-mobile.png" alt="Projects (mobile)" width="22%"/>
  <img src="./public/screenshots/blog-mobile.png" alt="Blog (mobile)" width="22%"/>
</p>
<p align="center">
  <img src="./public/screenshots/resume-mobile.png" alt="Resume (mobile)" width="22%"/>
  <img src="./public/screenshots/contact-mobile.png" alt="Contact (mobile)" width="22%"/>
</p>

</details>

---

## Highlights

- **Next.js 16 + React 19** — App Router, Turbopack dev, route groups, server components where it matters.
- **Payload CMS 3, embedded in the same app** — no separate backend service, single deploy, single type system.
- **Fully typed** — Payload-generated types flow directly into frontend components (`src/payload-types.ts`).
- **Tailwind CSS v4** via `@tailwindcss/postcss` — custom design tokens, dark-first terminal aesthetic.
- **Framer Motion** — scroll-triggered section reveals, preloader sequence, micro-interactions.
- **AI chat widget** — persistent site-wide assistant UI, wired to answer questions about the portfolio content.
- **Lexical rich-text** for blog posts, draft/versioning enabled on `Projects` and `Posts`.
- **SQLite out of the box** (`payload.db`) — zero-config local dev, swap to Postgres for prod by changing the adapter.
- **Playwright-powered screenshot pipeline** — `pnpm screenshots` regenerates every preview in this README.

---

## Tech Stack

| Layer | Tools |
|---|---|
| **Framework** | Next.js 16 (App Router, Turbopack), React 19 |
| **CMS** | Payload CMS 3, `@payloadcms/next`, `@payloadcms/richtext-lexical` |
| **Database** | SQLite via `@payloadcms/db-sqlite` (swap-ready for Postgres) |
| **Styling** | Tailwind CSS v4, custom design tokens, JetBrains Mono + Inter |
| **Motion** | Framer Motion 12 |
| **Icons** | Lucide React |
| **Image** | `sharp` for Payload media processing |
| **Language** | TypeScript 5, strict mode |
| **Tooling** | pnpm, ESLint (flat config), tsx, Playwright (dev-only) |

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                   Next.js 16 (single app)               │
│                                                         │
│   src/app/(frontend)/           src/app/(payload)/      │
│   ──────────────────            ──────────────────      │
│   /   /about   /projects        /admin                  │
│   /blog  /resume /contact       /api/*  (Payload)       │
│   globals.css                                           │
│        │                              │                 │
│        └──────┐                ┌──────┘                 │
│               ▼                ▼                        │
│       src/lib/payload.ts  →  getPayloadClient()         │
│                      │                                  │
│                      ▼                                  │
│                Payload CMS 3                            │
│   Collections: Users · Media · Projects · Posts         │
│                      │                                  │
│                      ▼                                  │
│              SQLite (payload.db)                        │
└─────────────────────────────────────────────────────────┘
```

- `src/app/(frontend)/` — public pages (`home`, `about`, `projects`, `blog`, `resume`, `contact`).
- `src/app/(payload)/` — Payload admin UI and REST/GraphQL endpoints.
- `src/collections/` — `Users`, `Media`, `Projects`, `Posts` (draft + versioning enabled on content collections).
- `src/components/` — organized by domain: `home`, `layout`, `projects`, `blog`, `resume`, `chat`, `ui`.
- `src/lib/data.ts` — static content (nav, skills, experience, achievements) used as fallback alongside CMS data.
- `src/payload.config.ts` — Payload wiring; consumed by `withPayload()` in `next.config.ts`.

---

## Getting Started

### Prerequisites

- **Node.js** ≥ 20
- **pnpm** ≥ 9 (`npm i -g pnpm`)

### Install & run

```bash
pnpm install
pnpm dev          # Next.js + Payload admin on http://localhost:3000
```

Open:

- **Frontend** → <http://localhost:3000>
- **Admin panel** → <http://localhost:3000/admin>

### Optional environment

```bash
# .env
PAYLOAD_SECRET=replace-with-a-strong-secret
DATABASE_URL=file:./payload.db   # default; set a Postgres URL for prod
```

### Seed the CMS

```bash
pnpm seed                 # runs src/seed.ts via tsx
```

### Generate types from Payload collections

```bash
pnpm generate:types       # updates src/payload-types.ts
```

---

## Scripts

| Command | Purpose |
|---|---|
| `pnpm dev` | Start the dev server (Next.js + Payload admin). |
| `pnpm build` | Production build. |
| `pnpm start` | Start the production server. |
| `pnpm lint` | ESLint (flat config). |
| `pnpm seed` | Seed the Payload database. |
| `pnpm generate:types` | Regenerate Payload TypeScript types. |
| `pnpm payload` | Run Payload CLI commands. |
| `pnpm screenshots` | Regenerate README screenshots via Playwright. |

---

## Project Structure

```
habib36-dev/
├── public/
│   └── screenshots/          # README previews (generated)
├── scripts/
│   └── capture-screenshots.ts  # Playwright screenshot pipeline
├── src/
│   ├── app/
│   │   ├── (frontend)/       # Public pages + globals.css
│   │   └── (payload)/        # Payload admin + API
│   ├── collections/          # Users · Media · Projects · Posts
│   ├── components/
│   │   ├── home/             # Hero, stats, featured work, CTA
│   │   ├── layout/           # Navbar, footer, preloader, shell
│   │   ├── projects/         # Project cards, filters
│   │   ├── blog/             # Post cards, category chips
│   │   ├── resume/           # Timeline, skills, achievements
│   │   ├── chat/             # AI chat widget
│   │   └── ui/               # Primitives
│   ├── lib/
│   │   ├── data.ts           # Static content / fallbacks
│   │   └── payload.ts        # Payload client helper
│   ├── payload.config.ts     # Payload wiring
│   └── payload-types.ts      # Generated types
├── eslint.config.mjs         # Flat ESLint config
├── next.config.ts            # withPayload() wrapper
└── payload.db                # SQLite (dev)
```

---

## Regenerating the README previews

All screenshots in this README are produced from the running app. To refresh them:

```bash
pnpm dev           # in one terminal
pnpm screenshots   # in another — writes to public/screenshots/
```

The pipeline (`scripts/capture-screenshots.ts`) captures six pages at two viewports (1440×900 desktop and 390×844 mobile), scrolling each page end-to-end first so every `whileInView` animation has fired before the full-page shot is taken.

---

## Deploy

Works out of the box on any Node-compatible host. For production:

1. Set `PAYLOAD_SECRET` to a long random string.
2. Set `DATABASE_URL` — keep SQLite for small deployments, or switch the Payload DB adapter to Postgres (`@payloadcms/db-postgres`) for managed hosting.
3. `pnpm build && pnpm start` — Next.js serves both the frontend and the Payload admin from the same process.

---

## License

Personal portfolio — code is available for reference and inspiration. Please don't repost the content, copy, or imagery as-is.

<div align="center">

Built with care by **Habibur Rahman** · <https://habib36.dev>

</div>
