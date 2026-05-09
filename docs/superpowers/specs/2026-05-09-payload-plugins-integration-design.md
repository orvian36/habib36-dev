# Payload Plugins Integration — Design

**Date:** 2026-05-09
**Author:** brainstorming session
**Status:** approved (pending spec review)

## Goal

Integrate five Payload CMS plugins (Form Builder, SEO, Redirects, Search, Sentry) into the habib36.dev portfolio with full frontend wiring. Plugins must become user-visible features, not just admin-only additions.

## Scope

In scope:

- Install and configure all 5 plugins in `src/payload.config.ts`
- Replace the hardcoded `/contact` form with a Form Builder–driven form
- Add per-page SEO metadata for `posts` and `projects`
- Register middleware that consults the redirects collection on every request
- Build a `/search` page and repoint the existing `/projects` and `/blog` filter inputs at the search index
- Wire Sentry across client, server, edge runtimes and into Payload's error path
- Seed sane defaults so a fresh `pnpm seed` produces a working contact form, redirects for the recently-flattened routes, and a populated search index

Out of scope (explicit):

- A new "Pages" collection for about/resume/contact static pages
- Multi-tenant or i18n
- A `pnpm test` suite (project has none today)
- Form Builder payment fields

## Approach

Single PR ("Approach A"): all 5 plugins land together with a clear logical ordering inside the diff. Plugins are independent enough at the Payload-config layer that bundling is low-risk; the project is small enough that 5 sequential commits would mostly rebuild the same files.

## Architecture

### Dependencies

```
@payloadcms/plugin-form-builder
@payloadcms/plugin-seo
@payloadcms/plugin-redirects
@payloadcms/plugin-search
@payloadcms/plugin-sentry
@payloadcms/email-nodemailer
@sentry/nextjs
nodemailer
```

### `src/payload.config.ts`

- Import the 5 plugins + `nodemailerAdapter` + `Sentry`
- Add `email: nodemailerAdapter({ ... })` reading SMTP creds from env
- Add `plugins: [...]` array containing all five plugins (sentryPlugin sits alongside the others — it does not wrap them; see Section: Sentry)

Plugins auto-register these collections (visible in admin and in regenerated `payload-types.ts`):

- `forms`, `form-submissions` (Form Builder)
- `redirects` (Redirects)
- `search` (Search)

### Environment variables (`.env`)

```
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
EMAIL_FROM_ADDRESS=
EMAIL_FROM_NAME="habib36.dev"
SENTRY_DSN=                 # leave blank to disable
NEXT_PUBLIC_SENTRY_DSN=     # client-side
SENTRY_ORG=                 # only needed for sourcemap upload in CI
SENTRY_PROJECT=
SENTRY_AUTH_TOKEN=
NEXT_PUBLIC_SERVER_URL=https://habib36.dev
```

### `next.config.ts`

Wrap with `withSentryConfig(withPayload(nextConfig), { ... })`. Sentry's wrapper is the outer one — if reversed, Payload's withPayload wouldn't see Sentry instrumentation and admin routes would lose error capture.

### Type regeneration

Single `pnpm generate:types` after `payload.config.ts` is updated, **before** any frontend code that imports `Form`, `Redirect`, or `Search` types is written.

## Per-Plugin Design

### Form Builder + Email

**Plugin config**

```ts
formBuilderPlugin({
  fields: { text: true, textarea: true, select: true, email: true, message: true, checkbox: true, number: true, payment: false },
  formOverrides: { admin: { group: 'Forms' } },
  formSubmissionOverrides: { admin: { group: 'Forms' } },
  defaultToEmail: process.env.EMAIL_FROM_ADDRESS,
})
```

**Email adapter**

```ts
email: nodemailerAdapter({
  defaultFromAddress: process.env.EMAIL_FROM_ADDRESS!,
  defaultFromName: process.env.EMAIL_FROM_NAME!,
  transportOptions: {
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT ?? 587),
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  },
})
```

**Frontend** — `src/app/(frontend)/contact/page.tsx` becomes a server component that fetches the form by slug `contact` and passes it to a new `<ContactForm form={form} />` client component. The client component preserves the existing visual design (card-surface, font-mono labels, framer-motion animations, sidebar) and renders fields with a small switch on `block.blockType`. Submit posts to `POST /api/form-submissions` with `{ form: form.id, submissionData: [{ field, value }, ...] }`.

**Seed** — `seedContactForm()` idempotently creates a Form doc with slug `contact`, fields `name | email | message`, and an email config notifying `EMAIL_FROM_ADDRESS`.

**Error handling**

- Network/server error on submit → inline error, button stays clickable
- Empty `forms` query (form not seeded) → fallback UI linking to `mailto:`

### SEO

**Plugin config**

```ts
seoPlugin({
  collections: ['posts', 'projects'],
  uploadsCollection: 'media',
  generateTitle: ({ doc }) => `${doc?.title} | habib36.dev`,
  generateDescription: ({ doc }) => doc?.excerpt ?? doc?.description ?? '',
  generateURL: ({ doc }) => `${process.env.NEXT_PUBLIC_SERVER_URL}/${doc?.slug}`,
  tabbedUI: true,
})
```

Adds a `meta` group (title, description, image, keywords) to Posts and Projects.

**Frontend** — `src/app/(frontend)/[slug]/page.tsx` adds `generateMetadata({ params })` that resolves the doc and returns `Metadata` derived from `doc.meta` with fallbacks (`doc.meta.title || doc.title`, etc.). Returns `openGraph` + `twitter` cards including the meta image (resolved through `media` relation → absolute URL via `NEXT_PUBLIC_SERVER_URL`).

To avoid double-fetching, extract `findBySlug(slug)` into `src/lib/find-by-slug.ts` wrapped in React `cache()` so `generateMetadata` and the page export share the same Payload query.

Static metadata in `(frontend)/layout.tsx` is preserved as the fallback for non-detail pages.

**Error handling** — empty result → `generateMetadata` returns `{}`, layout default applies, page calls `notFound()` as today.

### Redirects

**Plugin config**

```ts
redirectsPlugin({
  collections: ['posts', 'projects'],
  overrides: { admin: { group: 'System' } },
  redirectTypes: ['301', '302'],
})
```

**Why now** — commit `e67ba78` flattened `/projects/[slug]` and `/blog/[slug]` to `/[slug]`. Old indexed links need 301s.

**Middleware** — new `src/middleware.ts`:

- For each request, query the redirects collection via `getPayloadClient()` (the project's existing helper in `src/lib/payload.ts`) using `payload.find({ collection: 'redirects', where: { from: { equals: path } }, limit: 1 })`
- Match → `NextResponse.redirect(toUrl, status)`
- Export `runtime: 'nodejs'` (Edge can't reach Postgres)
- `matcher` skips `/admin`, `/api`, `/_next`, static assets
- 60s in-memory cache keyed by pathname to avoid hitting Postgres on every page load

**Bootstrap** — `seedFlattenRedirects()` creates 301s from `/projects/:slug` → `/:slug` and `/blog/:slug` → `/:slug` for each existing published doc. Idempotent.

**Error handling** — DB error → log and `return NextResponse.next()`. Middleware never crashes a page load.

### Search

**Plugin config**

```ts
searchPlugin({
  collections: ['posts', 'projects'],
  defaultPriorities: { posts: 10, projects: 20 },
  searchOverrides: {
    admin: { group: 'System' },
    fields: ({ defaultFields }) => [
      ...defaultFields,
      { name: 'excerpt', type: 'textarea' },
      { name: 'category', type: 'text' },
      { name: 'docType', type: 'select', options: ['post', 'project'] },
    ],
  },
  beforeSync: ({ originalDoc, searchDoc }) => ({
    ...searchDoc,
    excerpt: originalDoc.excerpt ?? originalDoc.description ?? '',
    category: originalDoc.category ?? null,
    docType: originalDoc._collection === 'posts' ? 'post' : 'project',
  }),
  syncDrafts: false,
})
```

**Backfill** — `seed.ts` re-saves each existing published Post/Project (`payload.update` with the doc's current `title` value) to fire the plugin's `afterChange` sync hook. Idempotent.

**Frontend touchpoints**

1. **`src/app/(frontend)/search/page.tsx`** — server component reading `?q=` from `searchParams`. Calls `payload.find({ collection: 'search', where: { or: [{ title: { like: q } }, { excerpt: { like: q } }] }, sort: '-priority', limit: 50 })`. Renders combined results with a `docType` badge, linked to `/[slug]`. A small client `<SearchInput>` updates the URL via `router.replace('?q=...')` debounced 250ms.
2. **`src/app/(frontend)/projects/projects-grid.tsx`** — same input UI; non-empty `search` → fetch `/api/search?q=&docType=project`. Empty search → render preloaded list (current behavior).
3. **`src/app/(frontend)/blog/blog-grid.tsx`** — same pattern, `docType=post`.

**API route** — `src/app/(frontend)/api/search/route.ts` reads `q` and optional `docType`, queries the `search` collection through `getPayloadClient`, returns `{ docs: [...] }`.

**Error handling** — empty `q` → `{ docs: [] }` with no DB hit. API 5xx → grids fall back to preloaded client-side filter.

### Sentry

**Plugin config (in `payload.config.ts` plugins array)**

```ts
sentryPlugin({ Sentry })
```

Wraps Payload's internal error handlers so collection-hook, access-control, and Local-API errors flow into Sentry with Payload-aware context (collection slug, operation, user id).

**Sentry SDK config files (project root)**

- `sentry.client.config.ts` — `Sentry.init({ dsn: process.env.NEXT_PUBLIC_SENTRY_DSN, tracesSampleRate: 0.1, replaysSessionSampleRate: 0, replaysOnErrorSampleRate: 1.0 })`
- `sentry.server.config.ts` — `Sentry.init({ dsn: process.env.SENTRY_DSN, tracesSampleRate: 0.1 })`
- `sentry.edge.config.ts` — same as server

All three early-return if their DSN is unset → leaving env blank fully no-ops Sentry.

**`src/instrumentation.ts`**

```ts
export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') await import('../sentry.server.config')
  if (process.env.NEXT_RUNTIME === 'edge') await import('../sentry.edge.config')
}
export const onRequestError = Sentry.captureRequestError
```

**`next.config.ts` wrap**

```ts
export default withSentryConfig(withPayload(nextConfig), {
  silent: !process.env.CI,
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  authToken: process.env.SENTRY_AUTH_TOKEN,
  hideSourceMaps: true,
  disableLogger: true,
})
```

**Cost guardrails baked in**

- 10% trace sample rate (not 100%)
- Replay only on errors, not all sessions
- `hideSourceMaps: true` so maps upload but don't ship in client bundle

## Files

### New

- `sentry.client.config.ts`, `sentry.server.config.ts`, `sentry.edge.config.ts` (project root)
- `src/instrumentation.ts`
- `src/middleware.ts`
- `src/app/(frontend)/contact/contact-form.tsx`
- `src/app/(frontend)/search/page.tsx`
- `src/app/(frontend)/search/search-client.tsx`
- `src/app/(frontend)/api/search/route.ts`
- `src/lib/find-by-slug.ts`

### Modified

- `src/payload.config.ts`
- `next.config.ts`
- `.env`
- `src/app/(frontend)/contact/page.tsx`
- `src/app/(frontend)/[slug]/page.tsx`
- `src/app/(frontend)/projects/projects-grid.tsx`
- `src/app/(frontend)/blog/blog-grid.tsx`
- `src/seed.ts`
- `src/payload-types.ts` (regenerated)

## Build Sequence

1. Install all 8 new deps with pnpm
2. Update `payload.config.ts` (plugins + email adapter)
3. `pnpm generate:types`
4. Sentry scaffolding (`sentry.*.config.ts`, `instrumentation.ts`, `next.config.ts` wrap)
5. SEO frontend (`findBySlug` util + `generateMetadata` in `[slug]/page.tsx`)
6. Redirects middleware
7. Search API route + `/search` page + repoint `projects-grid` and `blog-grid`
8. Form Builder frontend (`contact/page.tsx` server fetch + `contact-form.tsx` client)
9. `seed.ts` updates (contact form, flatten redirects, search backfill)
10. `pnpm lint && pnpm build` — verify clean
11. `pnpm dev` — manual smoke test (see Verification)

## Verification Before Claiming Done

- `pnpm build` produces zero TS errors
- `pnpm lint` passes
- Manual smoke test:
  - `/contact` submit → row appears in `form-submissions`; SMTP log shows email sent
  - `/search?q=foo` returns hits across both collections
  - `/projects/<old-slug>` 301-redirects to `/<old-slug>`
  - View-source on a published post shows OG/Twitter tags from `meta`
  - Throw a test error → Sentry receives it (only if DSN set)
- `git status` clean except for intended files

## Risks

- Form Builder ships a default React renderer (`@payloadcms/plugin-form-builder/client`); we deliberately don't use it because it doesn't match the card-surface design. We render fields ourselves.
- Redirects middleware hits Postgres on every request. The 60s in-memory cache mitigates but isn't perfect under serverless cold starts. If hot-path latency becomes a concern, switch to `unstable_cache` with `revalidateTag('redirects')` triggered from a Payload `afterChange` hook on the `redirects` collection.
- Sentry source-map upload silently skips when `SENTRY_AUTH_TOKEN` is missing. This is correct for local dev; CI must provide it.
