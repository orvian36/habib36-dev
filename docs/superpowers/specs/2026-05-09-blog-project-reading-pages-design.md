# Blog & Project Reading Pages — Design Spec

**Date:** 2026-05-09
**Status:** Approved (brainstorming) — pending implementation plan
**Scope:** `src/app/(frontend)/blog/[slug]/*` and `src/app/(frontend)/projects/[slug]/*`, plus a new `src/blocks/` and `src/components/article/` infrastructure.

## Goal

Make the individual blog post and project case-study reading pages feel calm, focused, and easy to read, while giving the CMS author a small library of inline custom blocks to compose richer articles.

The two pages currently render placeholder content cards. Both have a Payload `richText` field that is never rendered. The goal is to actually render that field, register custom Lexical blocks against it, and replace the page chrome with a single shared editorial reading shell.

## Non-goals

- No comments, reactions, or any user-generated content.
- No bookmarking backend (the current dead bookmark button is removed).
- No prev/next on project pages — only on blog. (Project order is curatorial, not chronological.)
- No comments / no newsletter capture on detail pages.
- No analytics events beyond what already exists.
- No migration of existing post/project bodies. The new system is additive — old `richText` content keeps rendering as plain rich text; new content can use blocks.

## Decisions made during brainstorming

| Decision | Choice |
| --- | --- |
| Authoring model | Lexical inline blocks (Notion-style slash menu via `BlocksFeature`) |
| Block library | 10 blocks: Callout, Code, Image, ImagePair, PullQuote, Video, Stats, Mermaid, Steps, Divider |
| Reading layout | Single column + sticky margin TOC dots that expand on hover; top reading-progress bar |
| Project meta location | Header strip below description (tech chips + stat tiles + GitHub/Live links) |
| Cover image | Optional, contained ~700px, between meta and body |
| Bookmark button | Removed |

## Architecture

### Shared shell

A new `ArticleShell` server component handles the layout for both blog and project reading pages. It accepts:

```
ArticleShell({
  kind: 'post' | 'project',
  breadcrumb: { label, href }[],
  badge?: { text, variant },
  title,
  description,            // excerpt (post) or description (project)
  meta?: { date?, readingTime? },     // post-only typical
  cover?: MediaDoc,                   // both
  metaStrip?: ReactNode,              // project-only typical
  content: SerializedEditorState,     // raw Lexical JSON
  tags?: string[],                    // post-only
  related?: PostCard[],               // post-only
  prevNext?: { prev?, next? },        // post-only
})
```

Internally it composes:

1. `<ScrollProgress />` (already exists in `src/components/ui/scroll-progress.tsx`) — top progress bar.
2. Breadcrumb (replicates current mono breadcrumb style).
3. Header block: badge, title (`heading-mono`), description, meta line (date + reading time + share button).
4. Tag chips (when provided).
5. Optional cover `<Image />` (Next/Image), contained, rounded.
6. Optional `metaStrip` slot (project meta strip is rendered here).
7. Layout: `lg:grid-cols-[24px_1fr]` — left column for `<TocDots />` (client component), right column for body.
8. Body: `<RichTextRenderer content={content} />` — wraps `@payloadcms/richtext-lexical/react`'s `RichText` with our custom block renderers and Tailwind typography.
9. Optional `<RelatedPosts />` and `<PrevNext />` for blog.
10. "All posts" / "All projects" back link (already in current pages).

### TOC dots component

Server-side helper extracts H2/H3 nodes from the Lexical `SerializedEditorState`:

```ts
// src/lib/lexical/extract-headings.ts
type Heading = { id: string, level: 2 | 3, text: string }
function extractHeadings(state: SerializedEditorState): Heading[]
```

The Lexical heading nodes get a slugified `id` injected into their renderer (used as the anchor target). `<TocDots headings={…} />` is a client component that:

- Renders one dot per heading, vertical stack, sticky.
- Tracks the active heading via `IntersectionObserver` on `[data-heading-id]`.
- On hover (or focus) of a dot, expands to show the heading text in a small floating label.
- Hidden below `lg` breakpoint; on mobile we add a single collapsible `<details>`-based TOC at the top of the article body.

### Block system

A new `src/blocks/` directory groups everything related to custom blocks:

```
src/blocks/
  index.ts                  // exports the array used by BlocksFeature in payload.config
  callout/
    config.ts               // Payload Block schema
    component.tsx           // React renderer (server component)
  code/
    config.ts
    component.tsx           // uses shiki
  image/
    config.ts
    component.tsx
  image-pair/
    config.ts
    component.tsx
  pull-quote/
    config.ts
    component.tsx
  video/
    config.ts
    component.tsx
  stats/
    config.ts
    component.tsx
  mermaid/
    config.ts
    component.tsx           // dynamic-imports mermaid in a client subcomponent
  steps/
    config.ts
    component.tsx
  divider/
    config.ts
    component.tsx
```

Registration in the rich-text field happens in `src/collections/Posts.ts` and `src/collections/Projects.ts`:

```ts
import { lexicalEditor, BlocksFeature } from '@payloadcms/richtext-lexical'
import { blocks } from '@/blocks'

// in field definition:
{
  name: 'content',
  type: 'richText',
  required: true,
  editor: lexicalEditor({
    features: ({ defaultFeatures }) => [
      ...defaultFeatures,            // keeps the default HeadingFeature (h1–h6) and others
      BlocksFeature({ blocks }),
    ],
  }),
},
```

Notes:
- `payload.config.ts` keeps the global `editor: lexicalEditor()` default; field-level editors override it. This avoids forcing all rich-text fields elsewhere (e.g. inside small block configs) to carry the full block library.
- `defaultFeatures` already enables H1–H6 via the built-in `HeadingFeature`. We don't restrict heading sizes — authors can still use H1 for layout — but the TOC walker only collects H2/H3 (see "TOC dots component"). This keeps editor flexibility without polluting the TOC with every heading level.

### Rendering rich text + blocks

A new `RichTextRenderer` component wraps `@payloadcms/richtext-lexical/react`'s `RichText`. Sketch:

```tsx
// src/components/article/rich-text-renderer.tsx
import { RichText } from '@payloadcms/richtext-lexical/react'
import { Callout } from '@/blocks/callout/component'
// …other block components…

export function RichTextRenderer({ content }: { content: SerializedEditorState }) {
  return (
    <RichText
      data={content}
      converters={({ defaultConverters }) => ({
        ...defaultConverters,
        blocks: {
          callout: ({ node }) => <Callout {...node.fields} />,
          code:    ({ node }) => <CodeBlock {...node.fields} />,
          // …one entry per block slug…
        },
        // headings: inject id for TOC anchoring (exact override shape verified
        // against the installed @payloadcms/richtext-lexical/react version
        // during implementation — the API exposes either a `heading` converter
        // or a `nodes.heading` map depending on version).
      })}
    />
  )
}
```

Heading anchoring strategy (concrete, version-resilient): the implementation will (1) read the converter API surface in the installed `@payloadcms/richtext-lexical` version, (2) override the heading converter to render `<h{n} id={slug} data-heading-id={slug}>`. If the converter override is awkward in the installed version, fall back to a small post-render walk in client land (the `IntersectionObserver` in `TocDots` already needs to find these elements anyway, so it can also assign `id` if missing — server-rendered ids are preferred for deep-linking).

Typography: a `prose-article` Tailwind class (defined in `globals.css`) supplies font, color, link, and spacing rules. We do **not** add `@tailwindcss/typography` — the site's design tokens are bespoke and the plugin would mostly be overridden anyway.

### Code highlighting

Shiki is invoked at server-render time inside `code/component.tsx`:

```ts
import { codeToHtml } from 'shiki'

export async function CodeBlock({ language, filename, code }) {
  const html = await codeToHtml(code, {
    lang: language ?? 'plaintext',
    themes: { dark: 'github-dark-default', light: 'github-light-default' },
    defaultColor: false,                  // emit both themes; CSS picks one
  })
  return (
    <figure className="article-code">
      {filename && <figcaption>{filename}</figcaption>}
      <div className="article-code__copy"><CopyButton code={code} /></div>
      <div dangerouslySetInnerHTML={{ __html: html }} />
    </figure>
  )
}
```

`CopyButton` is the only client component in the code block. Languages are loaded on demand via Shiki's bundled themes. Long-term we may pin a specific subset to keep the bundle small; for now we accept Shiki's default lazy-load behavior.

### Mermaid

Mermaid runs only client-side and only when a Mermaid block is on the page. `mermaid/component.tsx` is a server component that renders a `<MermaidClient src={...} />` client wrapper. The wrapper:

```ts
useEffect(() => {
  let cancelled = false
  import('mermaid').then(async ({ default: mermaid }) => {
    if (cancelled) return
    mermaid.initialize({ startOnLoad: false, theme: 'dark' /* or auto */ })
    const { svg } = await mermaid.render(`m-${id}`, src)
    setSvg(svg)
  })
  return () => { cancelled = true }
}, [src, id])
```

Static fallback: render the raw Mermaid source in a `<pre>` until the client renders the SVG (so the page is readable without JS).

### Project meta strip

```tsx
// src/components/article/project-meta-strip.tsx
export function ProjectMetaStrip({ tech, metrics, github, live }) { … }
```

Renders a single bordered card with three rows (chips, stat tiles, link buttons). Stat tiles cycle through accent colors (green → blue → purple) by index for visual rhythm. Hidden rows when their data is empty.

### Block schemas (data shapes)

Each block schema below uses Payload's `Block` config. Field details (admin labels, required flags) live in each `config.ts`.

| Block | Slug | Fields |
| --- | --- | --- |
| Callout | `callout` | `variant: 'info' \| 'success' \| 'warn' \| 'danger'` (default `info`); `content: richText` (small Lexical, no blocks) |
| Code | `code` | `language: text` (default `ts`); `filename?: text`; `code: textarea` |
| Image | `image` | `image: upload→media`; `caption?: text`; `alt?: text` |
| ImagePair | `imagePair` | `left: { image, label }`; `right: { image, label }` |
| PullQuote | `pullQuote` | `quote: textarea`; `cite?: text` |
| Video | `video` | `provider: 'youtube' \| 'loom' \| 'mp4'`; `url: text`; `caption?: text` |
| Stats | `stats` | `items: array<{ value: text, label: text, color?: 'green' \| 'blue' \| 'purple' \| 'orange' }>` (max 4) |
| Mermaid | `mermaid` | `source: textarea` |
| Steps | `steps` | `items: array<{ title: text, body?: richText (small) }>` |
| Divider | `divider` | `glyph?: text` (default `§`); `label?: text` |

### File touch-list

**New files:**

- `src/blocks/index.ts` and one folder per block (10 folders × 2 files = 20 files).
- `src/components/article/article-shell.tsx`
- `src/components/article/rich-text-renderer.tsx`
- `src/components/article/toc-dots.tsx` (client)
- `src/components/article/share-button.tsx` (client)
- `src/components/article/project-meta-strip.tsx`
- `src/components/article/related-posts.tsx`
- `src/components/article/prev-next.tsx`
- `src/components/article/copy-button.tsx` (client) — shared by Code block
- `src/lib/lexical/extract-headings.ts`
- `src/lib/lexical/slugify.ts`
- A small `prose-article` style block in `src/app/(frontend)/globals.css`

**Modified:**

- `src/collections/Posts.ts` — add `BlocksFeature` to `content`, ensure `H2`/`H3` features enabled.
- `src/collections/Projects.ts` — same.
- `src/app/(frontend)/blog/[slug]/page.tsx` — pass `content`, `image`, related, prev/next to shell.
- `src/app/(frontend)/blog/[slug]/blog-post-detail.tsx` — becomes a thin pass-through to `<ArticleShell kind="post" … />`. Eventually deletable, but kept short-term to absorb tag/category formatting that was already there.
- `src/app/(frontend)/projects/[slug]/page.tsx` — pass `content`, `image`, meta to shell; build the meta-strip props.
- `src/app/(frontend)/projects/[slug]/project-detail.tsx` — replaced by a thin pass-through to `<ArticleShell kind="project" metaStrip={…} />`.
- `package.json` — add `shiki`, `mermaid`.
- `src/payload-types.ts` — regenerated via `pnpm generate:types` after collection changes.

**Deleted:**

- The hardcoded "01. Problem / 02. Architecture / 03. Key Decisions / 04. Outcome" section in `project-detail.tsx`.
- The hardcoded TOC and example code block in `blog-post-detail.tsx`.
- Bookmark button in `blog-post-detail.tsx`.

## Visual / styling notes

- Reuse existing tokens from `globals.css` (`--accent-blue`, `--accent-green`, `card-surface`, `heading-mono`, etc.). No new design tokens.
- Body prose width: `max-w-[68ch]` (Tailwind v4 arbitrary). Keeps the line length in the editorial sweet spot.
- TOC dots column is `lg:block hidden` and `w-6` (24px). Below `lg`, a `<details>`-based TOC sits between the cover and the body.
- Share button uses `navigator.share` when present, falls back to copying the canonical URL via `navigator.clipboard.writeText`. Brief inline "Copied!" microcopy on fallback success.
- Cover image renders with `next/image` and `priority={true}` (above-the-fold). Aspect ratio inferred from the Media doc; max-width 100% of body column, rounded `rounded-xl`, subtle border `border-border-primary`.
- Framer Motion: keep the existing fade/slide entry animations on the breadcrumb, header, and body. Do not animate every block — adds noise on pages with many blocks.
- Code block theme respects `[data-theme="light"]` via Shiki's dual-theme output (`themes: { dark, light }` with CSS-variable color tokens; the exact wiring is finalized during implementation against the installed Shiki version).

## Error handling and edge cases

- `Posts.content` is `required: true` in the existing schema, so a post without content shouldn't reach the renderer. `Projects.content` is **not** required — render only the header (title, description, meta strip, optional cover) and skip the body when it's empty. No "missing content" message — silent.
- If a Lexical block references a missing media doc (image deleted), render a small `card-surface` placeholder with the alt text and a muted "Image unavailable" line.
- If the heading walker finds zero H2/H3, hide the TOC dots column entirely and let the body span the full width.
- Mermaid render errors: catch and show the raw source in a `<pre>` with a muted "Diagram failed to render" caption. Do not throw — the rest of the page must keep working.
- `extractHeadings` must be defensive — treat unknown node shapes as no-op.
- All block components must handle missing optional fields without runtime errors. Required fields are enforced at the schema level by Payload.

## Performance

- Server components by default. Client components: `TocDots`, `ShareButton`, `CopyButton`, `MermaidClient`, the existing `ScrollProgress`. Nothing else.
- Mermaid is dynamic-imported only inside its block, so pages without a Mermaid block don't pay for it.
- Shiki bundle is server-only; no client cost for code blocks.
- Single Lexical walk per page (one pass for headings, one pass for the renderer — both happen during RSC render).

## Testing

No automated tests in this repo today. Manual verification per the Test Plan in the implementation plan, plus visual checks on:

- Empty state (no body content)
- Long body with multiple of every block
- Mobile (no TOC dots column, collapsible TOC works)
- Light theme
- Existing posts with plain rich text and no blocks (must keep rendering)

## Open implementation choices (defer to plan)

- Exact slug-to-id strategy for headings (probably basic `kebab-case` of node text content; collisions get a `-2`, `-3` suffix).
- Whether to memoize the headings walk (likely unnecessary at our content size).
- Whether to add `prefers-reduced-motion` checks beyond what `framer-motion` already does (probably yes — keep transitions short anyway).

## Constraints from project conventions

- `AGENTS.md` flags that this Next.js version (16.x) has breaking changes from training data. Implementation must consult `node_modules/next/dist/docs/` before writing or modifying any `app/` route, layout, or RSC pattern.
- Package manager is `pnpm` only.
- After collection changes, run `pnpm generate:types` to refresh `src/payload-types.ts`.
- After file changes, run `graphify update .` per the project's graphify rule.

## Summary diff

| Surface | Before | After |
| --- | --- | --- |
| Blog `[slug]` body | Placeholder card + hardcoded code sample | Real Lexical content + 10-block library |
| Project `[slug]` body | 4 hardcoded cards (Problem / Architecture / Key Decisions / Outcome) | Real Lexical content + 10-block library |
| Project sidebar | Right-side sticky card with tech / metrics / links | Removed; replaced by header meta strip |
| TOC | Hardcoded list of 5 fake headings | Auto-generated from H2/H3, sticky margin dots |
| Bookmark button | Dead button | Removed |
| Reading progress | Already exists site-wide | Unchanged — same `ScrollProgress` |
| Cover image on detail | Not rendered | Optional, contained, between meta and body |
