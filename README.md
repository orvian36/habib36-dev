<div align="center">

# `habib36.dev`

### Full-Stack Engineer & AI Builder — Personal Portfolio

Dark, terminal-inspired portfolio powered by **Next.js 16**, **Payload CMS 3**, and a **Python FastAPI** AI service, orchestrated with **Turborepo**.

[![Next.js](https://img.shields.io/badge/Next.js-16-000000?logo=nextdotjs&logoColor=white)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev)
[![Payload CMS](https://img.shields.io/badge/Payload_CMS-3-000000?logo=payloadcms&logoColor=white)](https://payloadcms.com)
[![FastAPI](https://img.shields.io/badge/FastAPI-005571?logo=fastapi)](https://fastapi.tiangolo.com/)
[![Turborepo](https://img.shields.io/badge/Turborepo-EF4444?logo=turborepo&logoColor=white)](https://turbo.build/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Python](https://img.shields.io/badge/Python-3776AB?logo=python&logoColor=white)](https://python.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![pnpm](https://img.shields.io/badge/pnpm-F69220?logo=pnpm&logoColor=white)](https://pnpm.io)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?logo=postgresql&logoColor=white)](https://postgresql.org/)

[Live Site](https://habib36.dev) &nbsp;·&nbsp; [Admin Panel](https://habib36.dev/admin) &nbsp;·&nbsp; [Blog](https://habib36.dev/blog) &nbsp;·&nbsp; [Contact](https://habib36.dev/contact)

</div>

---

## Preview

<p align="center">
  <img src="./apps/web/public/screenshots/home-desktop.png" alt="Home page — hero, stats, featured work, chatbot, blog highlights" width="90%"/>
</p>

<table>
<tr>
<td width="50%" align="center"><strong>About</strong><br/><img src="./apps/web/public/screenshots/about-desktop.png" alt="About page"/></td>
<td width="50%" align="center"><strong>Projects</strong><br/><img src="./apps/web/public/screenshots/projects-desktop.png" alt="Projects page"/></td>
</tr>
<tr>
<td width="50%" align="center"><strong>Blog</strong><br/><img src="./apps/web/public/screenshots/blog-desktop.png" alt="Blog page"/></td>
<td width="50%" align="center"><strong>Resume</strong><br/><img src="./apps/web/public/screenshots/resume-desktop.png" alt="Resume page"/></td>
</tr>
<tr>
<td width="50%" align="center"><strong>Contact</strong><br/><img src="./apps/web/public/screenshots/contact-desktop.png" alt="Contact page"/></td>
<td width="50%" align="center"><strong>Home (extended)</strong><br/><img src="./apps/web/public/screenshots/home-desktop.png" alt="Home page"/></td>
</tr>
</table>

<details>
<summary><strong>Mobile preview</strong> (click to expand)</summary>

<p align="center">
  <img src="./apps/web/public/screenshots/home-mobile.png" alt="Home (mobile)" width="22%"/>
  <img src="./apps/web/public/screenshots/about-mobile.png" alt="About (mobile)" width="22%"/>
  <img src="./apps/web/public/screenshots/projects-mobile.png" alt="Projects (mobile)" width="22%"/>
  <img src="./apps/web/public/screenshots/blog-mobile.png" alt="Blog (mobile)" width="22%"/>
</p>
<p align="center">
  <img src="./apps/web/public/screenshots/resume-mobile.png" alt="Resume (mobile)" width="22%"/>
  <img src="./apps/web/public/screenshots/contact-mobile.png" alt="Contact (mobile)" width="22%"/>
</p>

</details>

---

## Highlights

- **Monorepo Architecture** — Orchestrated via Turborepo and pnpm workspaces.
- **Next.js 16 + React 19** — App Router, Turbopack dev, route groups, server components.
- **Payload CMS 3** — Embedded in the Next.js app, no separate backend service, single deploy.
- **Python FastAPI Service** — Dedicated AI chatbot service managed natively via `uv` alongside Node.
- **Fully typed** — Payload-generated types flow directly into frontend components.
- **Tailwind CSS v4** via `@tailwindcss/postcss` — custom design tokens, dark-first terminal aesthetic.
- **PostgreSQL Database** — Robust data layer using `@payloadcms/db-postgres`.

---

## Tech Stack

| Layer | Tools |
|---|---|
| **Monorepo** | Turborepo, pnpm workspaces |
| **Frontend/CMS** | Next.js 16, React 19, Payload CMS 3 |
| **Python Service** | FastAPI, Uvicorn, uv |
| **Database** | PostgreSQL via `@payloadcms/db-postgres` |
| **Styling & UI** | Tailwind CSS v4, Framer Motion 12, Lucide React |
| **Language** | TypeScript 5, Python 3.10+ |

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                       Turborepo Workspace                   │
│                                                             │
│   ┌─────────────────────────────────────────────────────┐   │
│   │ apps/web (Next.js + Payload CMS)                    │   │
│   │                                                     │   │
│   │   /about     /projects     /admin      /api/*       │   │
│   │                                                     │   │
│   │   [Payload CMS 3]  ───────────► [PostgreSQL]        │   │
│   └─────────────────────────────────────────────────────┘   │
│                                                             │
│   ┌─────────────────────────────────────────────────────┐   │
│   │ apps/chatbot (Python FastAPI)                       │   │
│   │                                                     │   │
│   │   /health    (AI Services)                          │   │
│   │                                                     │   │
│   │   [FastAPI] ◄── managed by `uv`                     │   │
│   └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

## Getting Started

### Prerequisites

- **Node.js** ≥ 20
- **pnpm** ≥ 9
- **uv** (for Python dependency management)

### Install & run

```bash
pnpm install
pnpm dev          # Turborepo starts Next.js and FastAPI concurrently
```

Open:
- **Frontend** → <http://localhost:3000>
- **Admin panel** → <http://localhost:3000/admin>
- **Chatbot API** → <http://localhost:8000/health>

### Environment

```bash
# apps/web/.env
PAYLOAD_SECRET=replace-with-a-strong-secret
DATABASE_URL=postgresql://postgres:password@127.0.0.1:5432/yourdb
```

### Seed the CMS

```bash
pnpm --filter web seed
```

### Generate types from Payload collections

```bash
pnpm --filter web generate:types
```

---

## Scripts

Run these from the monorepo root:

| Command | Purpose |
|---|---|
| `pnpm dev` | Start all apps concurrently. |
| `pnpm build` | Production build via Turborepo caching. |
| `pnpm lint` | Lint all workspaces. |
| `pnpm --filter web seed` | Seed the Payload database. |
| `pnpm --filter web generate:types` | Regenerate Payload TypeScript types. |
| `pnpm --filter web screenshots` | Regenerate README screenshots via Playwright. |

---

## Project Structure

```
habib36-dev/
├── apps/
│   ├── web/                    # Next.js 16 + Payload CMS 3
│   │   ├── src/                # Frontend and Admin logic
│   │   ├── next.config.ts      
│   │   └── package.json        
│   └── chatbot/                # Python FastAPI service
│       ├── main.py             # App logic
│       ├── pyproject.toml      # Python dependencies via uv
│       └── package.json        # Turborepo task proxy
├── turbo.json                  # Turborepo task configuration
├── pnpm-workspace.yaml         # Monorepo workspaces definition
└── package.json                # Root dependency and script orchestration
```

---

## Regenerating the README previews

All screenshots in this README are produced from the running app. To refresh them:

```bash
pnpm --filter web dev           # in one terminal
pnpm --filter web screenshots   # in another — writes to apps/web/public/screenshots/
```

---

## Deploy

Works out of the box on any Node-compatible host and standard Python hosts. For production:

1. Setup `PAYLOAD_SECRET` and your PostgreSQL `DATABASE_URL` in `apps/web`.
2. `pnpm build` at the root.
3. Start the Next.js process for `web`, and `uvicorn` for the `chatbot`.

---

## License

Personal portfolio — code is available for reference and inspiration. Please don't repost the content, copy, or imagery as-is.

<div align="center">

Built with care by **Habibur Rahman** · <https://habib36.dev>

</div>
