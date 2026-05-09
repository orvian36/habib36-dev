# Blog & Project Reading Pages — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace placeholder content on `/blog/[slug]` and `/projects/[slug]` with a shared editorial reading shell that renders the existing Payload `content` rich text plus 10 custom inline blocks (Callout, Code, Image, ImagePair, PullQuote, Video, Stats, Mermaid, Steps, Divider).

**Architecture:** A single `ArticleShell` server component powers both routes. Custom blocks are registered against the existing `content` richText field via Payload's `BlocksFeature`. Each block has a Payload schema (`config.ts`) and a React renderer (`component.tsx`). Code uses Shiki at server-render time. Mermaid is dynamic-imported only when its block appears on the page. A floating margin TOC is generated from H2/H3 headings extracted from the rendered DOM by a client component.

**Tech Stack:** Next.js 16, React 19, Payload CMS 3 (`@payloadcms/richtext-lexical`), Tailwind v4, Shiki, Mermaid, Framer Motion (already in repo), Lucide React (already in repo). Package manager is **pnpm only**.

**Testing approach:** This project has no automated test infrastructure. Verification is manual via `pnpm dev`, the Payload admin (`/admin`), and the public routes (`/blog/[slug]`, `/projects/[slug]`). Each task lists the specific manual check to run before committing. Adding Vitest/Jest infrastructure is out of scope — would dwarf the actual feature work.

**Source spec:** `docs/superpowers/specs/2026-05-09-blog-project-reading-pages-design.md`

---

## Pre-flight

Before starting, run these once:

- [ ] **Pre-flight 1: Confirm dev server still starts**

```bash
pnpm dev
```

Open `http://localhost:3000`, confirm home page loads, then stop the server.

- [ ] **Pre-flight 2: Skim the spec**

Read `docs/superpowers/specs/2026-05-09-blog-project-reading-pages-design.md` end-to-end so the plan steps are recognizable.

- [ ] **Pre-flight 3: Skim Next docs warning**

`AGENTS.md` says this Next.js (16.x) differs from training data. Before writing any new `app/` route or layout pattern, look at `node_modules/next/dist/docs/` for the relevant guide. (Most of this plan reuses existing patterns, but the warning is real.)

---

## Phase A — Foundations (deps, helpers, styles, shared client utilities)

### Task 1: Add Shiki and Mermaid dependencies

**Files:**
- Modify: `package.json`
- Modify: `pnpm-lock.yaml` (auto)

- [ ] **Step 1: Install Shiki**

```bash
pnpm add shiki
```

- [ ] **Step 2: Install Mermaid**

```bash
pnpm add mermaid
```

- [ ] **Step 3: Verify nothing broke**

```bash
pnpm dev
```

Open `http://localhost:3000`, confirm home page still loads, stop the server.

- [ ] **Step 4: Commit**

```bash
git add package.json pnpm-lock.yaml
git commit -m "deps: add shiki and mermaid for article block rendering"
```

---

### Task 2: Add slugify helper

**Files:**
- Create: `src/lib/article/slugify.ts`

- [ ] **Step 1: Write the file**

```ts
// src/lib/article/slugify.ts
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')   // strip diacritics
    .replace(/[^a-z0-9\s-]/g, '')      // strip punctuation
    .trim()
    .replace(/\s+/g, '-')              // spaces -> dashes
    .replace(/-+/g, '-')               // collapse runs of dashes
    .slice(0, 80)
}

/**
 * Returns a slugify function that disambiguates collisions by
 * appending -2, -3, ... on subsequent uses of the same base slug.
 */
export function makeUniqueSlugger() {
  const seen = new Map<string, number>()
  return (text: string): string => {
    const base = slugify(text) || 'section'
    const n = (seen.get(base) ?? 0) + 1
    seen.set(base, n)
    return n === 1 ? base : `${base}-${n}`
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/article/slugify.ts
git commit -m "feat(article): add slugify helper for heading anchors"
```

---

### Task 3: Add prose-article styles

**Files:**
- Modify: `src/app/(frontend)/globals.css` (append at end)

- [ ] **Step 1: Append the prose styles**

Open `src/app/(frontend)/globals.css` and append:

```css
/* ========================================
   Article reading typography
   ======================================== */

.prose-article {
  font-family: var(--font-sans);
  color: var(--text-primary);
  font-size: 1rem;
  line-height: 1.7;
}

.prose-article > * + * {
  margin-top: 1rem;
}

.prose-article h2 {
  font-family: var(--font-mono);
  font-weight: 700;
  font-size: 1.5rem;
  letter-spacing: -0.02em;
  margin-top: 2.25rem;
  margin-bottom: 0.5rem;
  color: var(--text-primary);
  scroll-margin-top: 6rem;
}

.prose-article h3 {
  font-family: var(--font-mono);
  font-weight: 700;
  font-size: 1.125rem;
  letter-spacing: -0.01em;
  margin-top: 1.75rem;
  margin-bottom: 0.5rem;
  color: var(--text-primary);
  scroll-margin-top: 6rem;
}

.prose-article p {
  color: var(--text-primary);
}

.prose-article a {
  color: var(--accent-blue);
  text-decoration: underline;
  text-underline-offset: 3px;
  text-decoration-color: var(--accent-blue-dim);
  transition: color 0.15s, text-decoration-color 0.15s;
}

.prose-article a:hover {
  text-decoration-color: var(--accent-blue);
}

.prose-article strong { color: var(--text-primary); font-weight: 700; }
.prose-article em { color: var(--text-secondary); }

.prose-article ul,
.prose-article ol {
  padding-left: 1.5rem;
}
.prose-article ul { list-style: disc; }
.prose-article ol { list-style: decimal; }
.prose-article li::marker { color: var(--text-muted); }
.prose-article li + li { margin-top: 0.4rem; }

.prose-article blockquote {
  border-left: 2px solid var(--border-hover);
  padding-left: 1rem;
  color: var(--text-secondary);
  font-style: italic;
}

.prose-article code:not(pre code) {
  font-family: var(--font-mono);
  font-size: 0.9em;
  background: var(--bg-tertiary);
  padding: 0.1em 0.4em;
  border-radius: 4px;
  color: var(--accent-blue);
}

.prose-article hr {
  border: none;
  border-top: 1px solid var(--border-primary);
  margin: 2rem 0;
}
```

- [ ] **Step 2: Verify**

```bash
pnpm dev
```

Open `http://localhost:3000`, confirm CSS hasn't regressed (existing pages still look the same), stop.

- [ ] **Step 3: Commit**

```bash
git add src/app/(frontend)/globals.css
git commit -m "feat(article): add prose-article typography utilities"
```

---

### Task 4: Add CopyButton client component

**Files:**
- Create: `src/components/article/copy-button.tsx`

- [ ] **Step 1: Write the file**

```tsx
"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

export function CopyButton({ text, label = "Copy" }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);

  async function onClick() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard blocked — silent fallback, button just doesn't flash
    }
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1.5 text-xs font-mono text-text-muted hover:text-text-secondary transition-colors"
      aria-label={copied ? "Copied" : label}
    >
      {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
      {copied ? "copied" : label.toLowerCase()}
    </button>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/article/copy-button.tsx
git commit -m "feat(article): add CopyButton client component"
```

---

### Task 5: Add ShareButton client component

**Files:**
- Create: `src/components/article/share-button.tsx`

- [ ] **Step 1: Write the file**

```tsx
"use client";

import { useState } from "react";
import { Share2, Check } from "lucide-react";

export function ShareButton({ title }: { title: string }) {
  const [copied, setCopied] = useState(false);

  async function onClick() {
    const url = typeof window !== "undefined" ? window.location.href : "";
    const shareData = { title, url };
    try {
      if (typeof navigator !== "undefined" && "share" in navigator) {
        await navigator.share(shareData);
        return;
      }
    } catch {
      // user cancelled — fall through to clipboard
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard blocked — silent
    }
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className="p-2 text-text-muted hover:text-accent-blue hover:bg-accent-blue/10 rounded-lg transition-all inline-flex items-center gap-1.5 text-xs font-mono"
      aria-label="Share article"
    >
      {copied ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
      {copied && <span>copied</span>}
    </button>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/article/share-button.tsx
git commit -m "feat(article): add ShareButton client component"
```

---

### Task 6: Add TocDots client component (placeholder behavior, no headings yet)

**Files:**
- Create: `src/components/article/toc-dots.tsx`

The component scans the article body for `[data-heading-id]` elements. We don't pass headings as a prop; the component finds them in the DOM. This avoids extracting headings from the Lexical JSON server-side — a separate concern that turned out unnecessary given the renderer already injects `data-heading-id` on each H2/H3.

- [ ] **Step 1: Write the file**

```tsx
"use client";

import { useEffect, useState } from "react";

type Heading = { id: string; text: string; level: 2 | 3 };

export function TocDots({ rootId }: { rootId: string }) {
  const [headings, setHeadings] = useState<Heading[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    const root = document.getElementById(rootId);
    if (!root) return;
    const els = Array.from(
      root.querySelectorAll<HTMLElement>("[data-heading-id]")
    ).filter((el) => el.tagName === "H2" || el.tagName === "H3");

    const next: Heading[] = els.map((el) => ({
      id: el.dataset.headingId!,
      text: el.textContent ?? "",
      level: (el.tagName === "H2" ? 2 : 3) as 2 | 3,
    }));
    setHeadings(next);
    if (next.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) {
          const id = (visible[0].target as HTMLElement).dataset.headingId;
          if (id) setActiveId(id);
        }
      },
      { rootMargin: "-20% 0px -70% 0px", threshold: 0 }
    );
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [rootId]);

  if (headings.length === 0) return null;

  return (
    <nav
      aria-label="On this page"
      className="hidden lg:flex flex-col gap-2 sticky top-32 pt-2 group/toc"
    >
      {headings.map((h) => {
        const active = h.id === activeId;
        return (
          <a
            key={h.id}
            href={`#${h.id}`}
            className="relative flex items-center group/dot py-1"
            aria-current={active ? "true" : undefined}
          >
            <span
              className={`block rounded-full transition-all ${
                active
                  ? "w-2 h-2 bg-accent-blue shadow-[0_0_8px_var(--accent-blue-glow-strong)]"
                  : "w-1.5 h-1.5 bg-border-hover group-hover/dot:bg-text-muted"
              } ${h.level === 3 ? "ml-2" : ""}`}
            />
            <span
              className={`absolute left-5 whitespace-nowrap text-xs font-mono opacity-0 -translate-x-1 group-hover/dot:opacity-100 group-hover/dot:translate-x-0 transition-all pointer-events-none ${
                active ? "text-accent-blue" : "text-text-secondary"
              }`}
            >
              {h.text}
            </span>
          </a>
        );
      })}
    </nav>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/article/toc-dots.tsx
git commit -m "feat(article): add TocDots client component (DOM-driven)"
```

---

## Phase B — First end-to-end vertical slice

Build the Divider block, the rich-text renderer skeleton, and the ArticleShell skeleton. Wire it through the blog `[slug]` page. Goal: after this phase, an author can add a Divider in the Lexical editor and see it render on a published post.

### Task 7: Build the Divider block

**Files:**
- Create: `src/blocks/divider/config.ts`
- Create: `src/blocks/divider/component.tsx`

- [ ] **Step 1: Write the schema**

```ts
// src/blocks/divider/config.ts
import type { Block } from 'payload'

export const DividerBlock: Block = {
  slug: 'divider',
  interfaceName: 'DividerBlock',
  labels: { singular: 'Divider', plural: 'Dividers' },
  fields: [
    {
      name: 'glyph',
      type: 'text',
      label: 'Glyph',
      defaultValue: '§',
      admin: { description: 'Optional glyph shown in the middle of the rule.' },
    },
    {
      name: 'label',
      type: 'text',
      label: 'Label',
      admin: { description: 'Optional small label shown in the middle.' },
    },
  ],
}
```

- [ ] **Step 2: Write the renderer**

```tsx
// src/blocks/divider/component.tsx
type Props = { glyph?: string | null; label?: string | null };

export function DividerBlockComponent({ glyph, label }: Props) {
  return (
    <div className="my-10 flex items-center gap-3" aria-hidden={!label}>
      <div className="flex-1 h-px bg-border-primary" />
      {(label || glyph) && (
        <span className="font-mono text-xs text-text-muted px-1">
          {label ?? glyph ?? ''}
        </span>
      )}
      <div className="flex-1 h-px bg-border-primary" />
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add src/blocks/divider/
git commit -m "feat(blocks): add Divider block schema and renderer"
```

---

### Task 8: Build the blocks index (just the divider for now)

**Files:**
- Create: `src/blocks/index.ts`

- [ ] **Step 1: Write the index**

```ts
// src/blocks/index.ts
import type { Block } from 'payload'
import { DividerBlock } from './divider/config'

export const blocks: Block[] = [DividerBlock]
```

- [ ] **Step 2: Commit**

```bash
git add src/blocks/index.ts
git commit -m "feat(blocks): add blocks registry"
```

---

### Task 9: Build the RichTextRenderer skeleton

**Files:**
- Create: `src/components/article/rich-text-renderer.tsx`

- [ ] **Step 1: Write the file**

```tsx
// src/components/article/rich-text-renderer.tsx
import {
  RichText,
  type JSXConvertersFunction,
} from "@payloadcms/richtext-lexical/react";
import type { SerializedEditorState } from "lexical";
import { DividerBlockComponent } from "@/blocks/divider/component";
import { makeUniqueSlugger } from "@/lib/article/slugify";

function getNodeText(node: any): string {
  if (!node) return "";
  if (typeof node.text === "string") return node.text;
  if (Array.isArray(node.children)) {
    return node.children.map(getNodeText).join("");
  }
  return "";
}

export function RichTextRenderer({
  content,
}: {
  content: SerializedEditorState;
}) {
  // One slugger instance per render so heading IDs are stable & unique within a page.
  const sluggerForRender = makeUniqueSlugger();

  const converters: JSXConvertersFunction = ({ defaultConverters }) => ({
    ...defaultConverters,
    // Inject anchorable id + data-heading-id on every heading.
    heading: ({ node, nodesToJSX }) => {
      const children = nodesToJSX({ nodes: node.children });
      const id = sluggerForRender(getNodeText(node));
      const Tag = node.tag as "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
      return (
        <Tag id={id} data-heading-id={id}>
          {children}
        </Tag>
      );
    },
    blocks: {
      divider: ({ node }) => (
        <DividerBlockComponent {...(node.fields as any)} />
      ),
    },
  });

  return (
    <RichText
      data={content}
      converters={converters}
      disableContainer
      className="prose-article"
    />
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/article/rich-text-renderer.tsx
git commit -m "feat(article): add RichTextRenderer with heading anchoring + Divider"
```

---

### Task 10: Build the ArticleShell skeleton

**Files:**
- Create: `src/components/article/article-shell.tsx`

This is the skeleton — header, breadcrumb, body. We'll add cover, meta strip, related, prev/next, and TOC integration in later tasks. Building incrementally keeps each commit verifiable.

- [ ] **Step 1: Write the file**

```tsx
// src/components/article/article-shell.tsx
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { ReactNode } from "react";
import type { SerializedEditorState } from "lexical";
import { Badge } from "@/components/ui/badge";
import { ScrollProgress } from "@/components/ui/scroll-progress";
import { ShareButton } from "./share-button";
import { TocDots } from "./toc-dots";
import { RichTextRenderer } from "./rich-text-renderer";

export type Crumb = { label: string; href?: string };
export type BadgeVariant = "default" | "accent" | "green" | "orange" | "purple";

export type ArticleShellProps = {
  kind: "post" | "project";
  breadcrumb: Crumb[];
  badge?: { text: string; variant?: BadgeVariant };
  title: string;
  description: string;
  meta?: ReactNode;          // free-form meta line under description (date, reading time, etc.)
  metaStrip?: ReactNode;     // big card under header (project meta)
  cover?: ReactNode;         // optional cover image element
  content: SerializedEditorState | null | undefined;
  tags?: string[];
  footer?: ReactNode;        // free-form footer (related posts, prev/next, back link)
};

const ARTICLE_BODY_ID = "article-body";

export function ArticleShell({
  breadcrumb,
  badge,
  title,
  description,
  meta,
  metaStrip,
  cover,
  content,
  tags,
  footer,
}: ArticleShellProps) {
  return (
    <>
      <ScrollProgress />
      <div className="py-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-text-muted font-mono mb-8">
            {breadcrumb.map((c, i) => (
              <span key={i} className="flex items-center gap-2 min-w-0">
                {c.href ? (
                  <Link
                    href={c.href}
                    className="hover:text-text-secondary transition-colors"
                  >
                    {c.label}
                  </Link>
                ) : (
                  <span className="text-text-primary truncate">{c.label}</span>
                )}
                {i < breadcrumb.length - 1 && (
                  <ChevronRight className="w-3 h-3" />
                )}
              </span>
            ))}
          </nav>

          {/* Header */}
          <header className="mb-8">
            {badge && (
              <Badge variant={badge.variant ?? "accent"} className="mb-4">
                {badge.text}
              </Badge>
            )}
            <h1 className="heading-mono text-3xl md:text-4xl text-text-primary mb-4">
              {title}
            </h1>
            <p className="text-text-secondary text-lg leading-relaxed">
              {description}
            </p>
            {(meta || tags) && (
              <div className="mt-6 flex items-center justify-between flex-wrap gap-4">
                <div className="text-sm text-text-muted font-mono flex items-center gap-4">
                  {meta}
                </div>
                <ShareButton title={title} />
              </div>
            )}
            {tags && tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-4">
                {tags.map((t) => (
                  <Badge key={t}>{t}</Badge>
                ))}
              </div>
            )}
          </header>

          {/* Project meta strip */}
          {metaStrip && <div className="mb-8">{metaStrip}</div>}

          {/* Cover image */}
          {cover && <div className="mb-10">{cover}</div>}

          {/* Body + TOC */}
          {content && (
            <div className="lg:grid lg:grid-cols-[1fr_minmax(0,640px)_1fr] lg:gap-6">
              <div className="hidden lg:block" />
              <div id={ARTICLE_BODY_ID}>
                <RichTextRenderer content={content} />
              </div>
              <aside className="hidden lg:block">
                <TocDots rootId={ARTICLE_BODY_ID} />
              </aside>
            </div>
          )}

          {/* Footer */}
          {footer && <div className="mt-12">{footer}</div>}
        </div>
      </div>
    </>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/article/article-shell.tsx
git commit -m "feat(article): add ArticleShell skeleton (header, body, TOC slot)"
```

---

### Task 11: Wire BlocksFeature into the Posts collection

**Files:**
- Modify: `src/collections/Posts.ts`

- [ ] **Step 1: Update the content field**

Open `src/collections/Posts.ts`. Add the import and replace the `content` field block.

Add at the top:

```ts
import { lexicalEditor, BlocksFeature } from '@payloadcms/richtext-lexical'
import { blocks } from '@/blocks'
```

Replace the existing `content` field (currently lines ~35–39) with:

```ts
    {
      name: 'content',
      type: 'richText',
      required: true,
      label: 'Post Content',
      editor: lexicalEditor({
        features: ({ defaultFeatures }) => [
          ...defaultFeatures,
          BlocksFeature({ blocks }),
        ],
      }),
    },
```

- [ ] **Step 2: Regenerate Payload types**

```bash
pnpm generate:types
```

Expected: `src/payload-types.ts` is rewritten and now contains a `DividerBlock` interface.

- [ ] **Step 3: Verify the admin loads**

```bash
pnpm dev
```

Open `http://localhost:3000/admin`. Edit any post. Click into the rich-text body. Type `/`. Confirm "Divider" appears in the slash menu (block group). Insert one. Save the draft.

- [ ] **Step 4: Commit**

```bash
git add src/collections/Posts.ts src/payload-types.ts
git commit -m "feat(posts): register BlocksFeature with Divider on content field"
```

---

### Task 12: Wire blog [slug] page to the new ArticleShell

**Files:**
- Modify: `src/app/(frontend)/blog/[slug]/page.tsx`
- Modify: `src/app/(frontend)/blog/[slug]/blog-post-detail.tsx` (this becomes a thin wrapper; we will eventually inline-delete it but keep it for now to absorb data shaping)

- [ ] **Step 1: Update the data fetcher to pass content through**

Open `src/app/(frontend)/blog/[slug]/page.tsx` and replace the file contents with:

```tsx
import { getPayloadClient } from '@/lib/payload'
import { BlogPostDetail } from './blog-post-detail'
import { notFound } from 'next/navigation'

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const payload = await getPayloadClient()
  const { docs } = await payload.find({
    collection: 'posts',
    where: {
      slug: { equals: slug },
      _status: { equals: 'published' },
    },
    depth: 2,
    limit: 1,
  })

  const doc = docs[0]
  if (!doc) notFound()

  const { docs: relatedDocs } = await payload.find({
    collection: 'posts',
    where: {
      category: { equals: doc.category },
      slug: { not_equals: slug },
      _status: { equals: 'published' },
    },
    limit: 2,
  })

  const post = {
    slug: doc.slug,
    title: doc.title,
    excerpt: doc.excerpt,
    category: doc.category,
    tags: (doc.tags ?? []).map((t: { tag: string } | string) =>
      typeof t === 'object' ? t.tag : t
    ),
    date: doc.publishedAt ?? doc.createdAt,
    readingTime: doc.readingTime ?? '5 min',
    content: doc.content,
    image: typeof doc.image === 'object' ? doc.image : null,
  }

  const relatedPosts = relatedDocs.map((r) => ({
    slug: r.slug,
    title: r.title,
    excerpt: r.excerpt,
  }))

  return <BlogPostDetail post={post} relatedPosts={relatedPosts} />
}
```

- [ ] **Step 2: Replace the blog-post-detail component**

Open `src/app/(frontend)/blog/[slug]/blog-post-detail.tsx` and replace its entire contents with:

```tsx
import Link from "next/link";
import { ArrowLeft, Calendar, Clock } from "lucide-react";
import type { SerializedEditorState } from "lexical";
import { ArticleShell } from "@/components/article/article-shell";
import { Button } from "@/components/ui/button";

type Post = {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  tags: string[];
  date: string;
  readingTime: string;
  content: SerializedEditorState | null | undefined;
  image: { url?: string | null; alt?: string | null } | null;
};

type RelatedPost = {
  slug: string;
  title: string;
  excerpt: string;
};

export function BlogPostDetail({
  post,
  relatedPosts,
}: {
  post: Post;
  relatedPosts: RelatedPost[];
}) {
  return (
    <ArticleShell
      kind="post"
      breadcrumb={[
        { label: "Home", href: "/" },
        { label: "Blog", href: "/blog" },
        { label: post.title },
      ]}
      badge={{ text: post.category, variant: "accent" }}
      title={post.title}
      description={post.excerpt}
      meta={
        <>
          <span className="flex items-center gap-1.5">
            <Calendar className="w-4 h-4" />
            {new Date(post.date).toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="w-4 h-4" />
            {post.readingTime}
          </span>
        </>
      }
      tags={post.tags}
      content={post.content}
      footer={
        <>
          {relatedPosts.length > 0 && (
            <div className="border-t border-border-primary pt-10">
              <h3 className="font-mono text-sm text-text-muted uppercase tracking-wider mb-6">
                Related Posts
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {relatedPosts.map((related) => (
                  <Link
                    key={related.slug}
                    href={`/blog/${related.slug}`}
                    className="card-surface p-5 group hover:border-border-hover transition-all"
                  >
                    <h4 className="font-mono text-sm font-bold text-text-primary group-hover:text-accent-blue transition-colors">
                      {related.title}
                    </h4>
                    <p className="text-text-muted text-xs mt-1 line-clamp-2">
                      {related.excerpt}
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          )}
          <div className="mt-10 pt-6 border-t border-border-primary">
            <Button href="/blog" variant="secondary">
              <ArrowLeft className="w-4 h-4" />
              All posts
            </Button>
          </div>
        </>
      }
    />
  );
}
```

Note: this component is now a server component (no `"use client"`). Framer Motion was the only client dependency in the old version; we've dropped its entry animations since the page already has fade transitions from the shell-level page transition. If you want them back later, wrap individual elements in a small client component.

- [ ] **Step 3: Verify end-to-end**

```bash
pnpm dev
```

Open `http://localhost:3000/admin`. Edit a post. Add a paragraph, an H2, another paragraph, a Divider block, a final paragraph. Save and publish. Then open `http://localhost:3000/blog/<slug>` (where `<slug>` is the post's slug).

Confirm:
- Breadcrumb renders (Home / Blog / Title)
- Title and excerpt render
- Date and reading time render
- Share button is in the header (no bookmark button)
- Body shows your paragraphs and the H2
- Divider renders as a horizontal rule with optional glyph
- Reading-progress bar appears at the top of the page (sticky)
- TOC dots appear in the right margin on `lg+` screens; hovering a dot reveals the heading text
- No console errors

- [ ] **Step 4: Commit**

```bash
git add src/app/\(frontend\)/blog/\[slug\]/
git commit -m "feat(blog): render Lexical content via ArticleShell"
```

---

## Phase C — Add the remaining 9 blocks

Each block follows the same pattern: schema in `config.ts`, renderer in `component.tsx`, registered in `src/blocks/index.ts`, mapped in `RichTextRenderer`. After each block is wired, regenerate types and verify in the admin.

### Task 13: Callout block

**Files:**
- Create: `src/blocks/callout/config.ts`
- Create: `src/blocks/callout/component.tsx`
- Modify: `src/blocks/index.ts`
- Modify: `src/components/article/rich-text-renderer.tsx`

- [ ] **Step 1: Schema**

```ts
// src/blocks/callout/config.ts
import type { Block } from 'payload'

export const CalloutBlock: Block = {
  slug: 'callout',
  interfaceName: 'CalloutBlock',
  labels: { singular: 'Callout', plural: 'Callouts' },
  fields: [
    {
      name: 'variant',
      type: 'select',
      required: true,
      defaultValue: 'info',
      options: [
        { label: 'Info', value: 'info' },
        { label: 'Success', value: 'success' },
        { label: 'Warning', value: 'warn' },
        { label: 'Danger', value: 'danger' },
      ],
    },
    {
      name: 'text',
      type: 'textarea',
      required: true,
    },
  ],
}
```

- [ ] **Step 2: Renderer**

```tsx
// src/blocks/callout/component.tsx
import { Info, CheckCircle2, AlertTriangle, AlertOctagon } from "lucide-react";

type Variant = "info" | "success" | "warn" | "danger";

const VARIANTS: Record<
  Variant,
  { icon: typeof Info; tint: string; border: string; iconColor: string }
> = {
  info:    { icon: Info,           tint: "bg-accent-blue/8",   border: "border-l-accent-blue",   iconColor: "text-accent-blue" },
  success: { icon: CheckCircle2,   tint: "bg-accent-green/8",  border: "border-l-accent-green",  iconColor: "text-accent-green" },
  warn:    { icon: AlertTriangle,  tint: "bg-accent-orange/8", border: "border-l-accent-orange", iconColor: "text-accent-orange" },
  danger:  { icon: AlertOctagon,   tint: "bg-accent-orange/12",border: "border-l-accent-orange", iconColor: "text-accent-orange" },
};

export function CalloutBlockComponent({
  variant,
  text,
}: {
  variant: Variant;
  text: string;
}) {
  const v = VARIANTS[variant] ?? VARIANTS.info;
  const Icon = v.icon;
  return (
    <aside
      role="note"
      className={`my-6 flex gap-3 p-4 rounded-lg border-l-2 ${v.tint} ${v.border}`}
    >
      <Icon className={`w-4 h-4 mt-1 shrink-0 ${v.iconColor}`} />
      <p className="text-sm text-text-secondary leading-relaxed m-0">{text}</p>
    </aside>
  );
}
```

- [ ] **Step 3: Register in `src/blocks/index.ts`**

```ts
import type { Block } from 'payload'
import { CalloutBlock } from './callout/config'
import { DividerBlock } from './divider/config'

export const blocks: Block[] = [CalloutBlock, DividerBlock]
```

- [ ] **Step 4: Map in `src/components/article/rich-text-renderer.tsx`**

Add the import:

```ts
import { CalloutBlockComponent } from "@/blocks/callout/component";
```

Add the entry inside the `blocks` map:

```ts
callout: ({ node }) => <CalloutBlockComponent {...(node.fields as any)} />,
```

- [ ] **Step 5: Regen types and verify**

```bash
pnpm generate:types
pnpm dev
```

In the admin, edit a post, insert a Callout block (try each variant), save, view the published post. Confirm icons + tint show correctly per variant.

- [ ] **Step 6: Commit**

```bash
git add src/blocks/callout/ src/blocks/index.ts src/components/article/rich-text-renderer.tsx src/payload-types.ts
git commit -m "feat(blocks): add Callout block (info/success/warn/danger)"
```

---

### Task 14: PullQuote block

**Files:**
- Create: `src/blocks/pull-quote/config.ts`
- Create: `src/blocks/pull-quote/component.tsx`
- Modify: `src/blocks/index.ts`
- Modify: `src/components/article/rich-text-renderer.tsx`

- [ ] **Step 1: Schema**

```ts
// src/blocks/pull-quote/config.ts
import type { Block } from 'payload'

export const PullQuoteBlock: Block = {
  slug: 'pullQuote',
  interfaceName: 'PullQuoteBlock',
  labels: { singular: 'Pull quote', plural: 'Pull quotes' },
  fields: [
    { name: 'quote', type: 'textarea', required: true },
    { name: 'cite',  type: 'text' },
  ],
}
```

- [ ] **Step 2: Renderer**

```tsx
// src/blocks/pull-quote/component.tsx
export function PullQuoteBlockComponent({
  quote,
  cite,
}: {
  quote: string;
  cite?: string | null;
}) {
  return (
    <figure className="my-8 pl-6 border-l-2 border-accent-purple/60">
      <blockquote className="text-xl md:text-2xl leading-snug text-text-primary italic m-0">
        &ldquo;{quote}&rdquo;
      </blockquote>
      {cite && (
        <figcaption className="mt-3 font-mono text-xs text-text-muted">
          — {cite}
        </figcaption>
      )}
    </figure>
  );
}
```

- [ ] **Step 3: Register + map**

In `src/blocks/index.ts` add the import and entry. In `src/components/article/rich-text-renderer.tsx` add:

```ts
import { PullQuoteBlockComponent } from "@/blocks/pull-quote/component";
// …inside blocks:
pullQuote: ({ node }) => <PullQuoteBlockComponent {...(node.fields as any)} />,
```

- [ ] **Step 4: Verify and commit**

```bash
pnpm generate:types && pnpm dev
```

Insert a PullQuote in the admin, view published. Then:

```bash
git add src/blocks/pull-quote/ src/blocks/index.ts src/components/article/rich-text-renderer.tsx src/payload-types.ts
git commit -m "feat(blocks): add PullQuote block"
```

---

### Task 15: Image block

**Files:**
- Create: `src/blocks/image/config.ts`
- Create: `src/blocks/image/component.tsx`
- Modify: `src/blocks/index.ts`
- Modify: `src/components/article/rich-text-renderer.tsx`

- [ ] **Step 1: Schema**

```ts
// src/blocks/image/config.ts
import type { Block } from 'payload'

export const ImageBlock: Block = {
  slug: 'image',
  interfaceName: 'ImageBlock',
  labels: { singular: 'Image', plural: 'Images' },
  fields: [
    { name: 'image',   type: 'upload', relationTo: 'media', required: true },
    { name: 'alt',     type: 'text',   admin: { description: 'Falls back to media alt if empty.' } },
    { name: 'caption', type: 'text' },
  ],
}
```

- [ ] **Step 2: Renderer**

```tsx
// src/blocks/image/component.tsx
import NextImage from "next/image";

type Media = { url?: string | null; alt?: string | null; width?: number | null; height?: number | null };

export function ImageBlockComponent({
  image,
  alt,
  caption,
}: {
  image: Media | string | null;
  alt?: string | null;
  caption?: string | null;
}) {
  if (!image || typeof image === "string" || !image.url) return null;
  const altText = alt ?? image.alt ?? "";
  return (
    <figure className="my-8">
      <div className="rounded-xl border border-border-primary overflow-hidden bg-bg-tertiary">
        <NextImage
          src={image.url}
          alt={altText}
          width={image.width ?? 1600}
          height={image.height ?? 900}
          className="w-full h-auto"
          sizes="(min-width: 768px) 640px, 100vw"
        />
      </div>
      {caption && (
        <figcaption className="mt-3 text-center font-mono text-xs text-text-muted">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}
```

- [ ] **Step 3: Register + map**

```ts
// in rich-text-renderer.tsx
import { ImageBlockComponent } from "@/blocks/image/component";
// …
image: ({ node }) => <ImageBlockComponent {...(node.fields as any)} />,
```

- [ ] **Step 4: Verify and commit**

```bash
pnpm generate:types && pnpm dev
```

Upload an image to Media, insert an Image block in a post, view published. Then:

```bash
git add src/blocks/image/ src/blocks/index.ts src/components/article/rich-text-renderer.tsx src/payload-types.ts
git commit -m "feat(blocks): add Image block (next/image with caption)"
```

---

### Task 16: ImagePair block

**Files:**
- Create: `src/blocks/image-pair/config.ts`
- Create: `src/blocks/image-pair/component.tsx`
- Modify: `src/blocks/index.ts`
- Modify: `src/components/article/rich-text-renderer.tsx`

- [ ] **Step 1: Schema**

```ts
// src/blocks/image-pair/config.ts
import type { Block } from 'payload'

export const ImagePairBlock: Block = {
  slug: 'imagePair',
  interfaceName: 'ImagePairBlock',
  labels: { singular: 'Image pair', plural: 'Image pairs' },
  fields: [
    {
      type: 'row',
      fields: [
        {
          name: 'left',
          type: 'group',
          fields: [
            { name: 'image', type: 'upload', relationTo: 'media', required: true },
            { name: 'label', type: 'text' },
          ],
        },
        {
          name: 'right',
          type: 'group',
          fields: [
            { name: 'image', type: 'upload', relationTo: 'media', required: true },
            { name: 'label', type: 'text' },
          ],
        },
      ],
    },
  ],
}
```

- [ ] **Step 2: Renderer**

```tsx
// src/blocks/image-pair/component.tsx
import NextImage from "next/image";

type Media = { url?: string | null; alt?: string | null; width?: number | null; height?: number | null };
type Side = { image: Media | string | null; label?: string | null };

function Pane({ side, accent }: { side: Side; accent: string }) {
  if (!side?.image || typeof side.image === "string" || !side.image.url) return null;
  return (
    <figure className="m-0">
      <div className={`rounded-xl border ${accent} overflow-hidden bg-bg-tertiary`}>
        <NextImage
          src={side.image.url}
          alt={side.image.alt ?? side.label ?? ""}
          width={side.image.width ?? 1200}
          height={side.image.height ?? 800}
          className="w-full h-auto"
          sizes="(min-width: 768px) 320px, 50vw"
        />
      </div>
      {side.label && (
        <figcaption className="mt-2 font-mono text-xs text-text-muted text-center">
          {side.label}
        </figcaption>
      )}
    </figure>
  );
}

export function ImagePairBlockComponent({ left, right }: { left: Side; right: Side }) {
  return (
    <div className="my-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
      <Pane side={left}  accent="border-border-primary" />
      <Pane side={right} accent="border-accent-green/40" />
    </div>
  );
}
```

- [ ] **Step 3: Register + map**

```ts
// in rich-text-renderer.tsx
import { ImagePairBlockComponent } from "@/blocks/image-pair/component";
// …
imagePair: ({ node }) => <ImagePairBlockComponent {...(node.fields as any)} />,
```

- [ ] **Step 4: Verify and commit**

```bash
pnpm generate:types && pnpm dev
```

Insert an ImagePair (e.g. before/after), view published. Then:

```bash
git add src/blocks/image-pair/ src/blocks/index.ts src/components/article/rich-text-renderer.tsx src/payload-types.ts
git commit -m "feat(blocks): add ImagePair block"
```

---

### Task 17: Video block

**Files:**
- Create: `src/blocks/video/config.ts`
- Create: `src/blocks/video/component.tsx`
- Modify: `src/blocks/index.ts`
- Modify: `src/components/article/rich-text-renderer.tsx`

- [ ] **Step 1: Schema**

```ts
// src/blocks/video/config.ts
import type { Block } from 'payload'

export const VideoBlock: Block = {
  slug: 'video',
  interfaceName: 'VideoBlock',
  labels: { singular: 'Video', plural: 'Videos' },
  fields: [
    {
      name: 'provider',
      type: 'select',
      required: true,
      defaultValue: 'youtube',
      options: [
        { label: 'YouTube', value: 'youtube' },
        { label: 'Loom', value: 'loom' },
        { label: 'MP4 (direct URL)', value: 'mp4' },
      ],
    },
    {
      name: 'url',
      type: 'text',
      required: true,
      admin: {
        description:
          'YouTube: full watch URL or short URL. Loom: full share URL. MP4: direct file URL.',
      },
    },
    { name: 'caption', type: 'text' },
  ],
}
```

- [ ] **Step 2: Renderer**

```tsx
// src/blocks/video/component.tsx
type Provider = "youtube" | "loom" | "mp4";

function youtubeId(url: string): string | null {
  // matches youtu.be/<id>, youtube.com/watch?v=<id>, youtube.com/embed/<id>
  const m =
    url.match(/(?:youtu\.be\/|[?&]v=|\/embed\/)([A-Za-z0-9_-]{6,})/) ||
    url.match(/youtube\.com\/shorts\/([A-Za-z0-9_-]{6,})/);
  return m ? m[1] : null;
}

function loomEmbed(url: string): string | null {
  const m = url.match(/loom\.com\/share\/([A-Za-z0-9]+)/);
  return m ? `https://www.loom.com/embed/${m[1]}` : null;
}

export function VideoBlockComponent({
  provider,
  url,
  caption,
}: {
  provider: Provider;
  url: string;
  caption?: string | null;
}) {
  let embed: { kind: "iframe" | "video"; src: string } | null = null;

  if (provider === "youtube") {
    const id = youtubeId(url);
    embed = id ? { kind: "iframe", src: `https://www.youtube.com/embed/${id}` } : null;
  } else if (provider === "loom") {
    const src = loomEmbed(url);
    embed = src ? { kind: "iframe", src } : null;
  } else if (provider === "mp4") {
    embed = { kind: "video", src: url };
  }

  if (!embed) {
    return (
      <div className="my-8 p-4 card-surface text-sm text-text-muted font-mono">
        Could not parse video URL: {url}
      </div>
    );
  }

  return (
    <figure className="my-8">
      <div className="rounded-xl overflow-hidden border border-border-primary bg-black aspect-video">
        {embed.kind === "iframe" ? (
          <iframe
            src={embed.src}
            title={caption ?? "Embedded video"}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            loading="lazy"
            className="w-full h-full"
          />
        ) : (
          <video
            src={embed.src}
            controls
            preload="metadata"
            className="w-full h-full"
          />
        )}
      </div>
      {caption && (
        <figcaption className="mt-3 text-center font-mono text-xs text-text-muted">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}
```

- [ ] **Step 3: Register + map**

```ts
// in rich-text-renderer.tsx
import { VideoBlockComponent } from "@/blocks/video/component";
// …
video: ({ node }) => <VideoBlockComponent {...(node.fields as any)} />,
```

- [ ] **Step 4: Verify and commit**

```bash
pnpm generate:types && pnpm dev
```

Insert a Video (try YouTube first, then a Loom URL if available). View published. Then:

```bash
git add src/blocks/video/ src/blocks/index.ts src/components/article/rich-text-renderer.tsx src/payload-types.ts
git commit -m "feat(blocks): add Video block (youtube/loom/mp4)"
```

---

### Task 18: Stats block

**Files:**
- Create: `src/blocks/stats/config.ts`
- Create: `src/blocks/stats/component.tsx`
- Modify: `src/blocks/index.ts`
- Modify: `src/components/article/rich-text-renderer.tsx`

- [ ] **Step 1: Schema**

```ts
// src/blocks/stats/config.ts
import type { Block } from 'payload'

export const StatsBlock: Block = {
  slug: 'stats',
  interfaceName: 'StatsBlock',
  labels: { singular: 'Stat tiles', plural: 'Stat tile groups' },
  fields: [
    {
      name: 'items',
      type: 'array',
      required: true,
      minRows: 1,
      maxRows: 4,
      labels: { singular: 'Tile', plural: 'Tiles' },
      fields: [
        { name: 'value', type: 'text', required: true, admin: { description: 'e.g. -47%, 3.2k, 99.9%' } },
        { name: 'label', type: 'text', required: true },
        {
          name: 'color',
          type: 'select',
          defaultValue: 'green',
          options: [
            { label: 'Green',  value: 'green' },
            { label: 'Blue',   value: 'blue' },
            { label: 'Purple', value: 'purple' },
            { label: 'Orange', value: 'orange' },
          ],
        },
      ],
    },
  ],
}
```

- [ ] **Step 2: Renderer**

```tsx
// src/blocks/stats/component.tsx
const COLOR: Record<string, string> = {
  green:  "text-accent-green",
  blue:   "text-accent-blue",
  purple: "text-accent-purple",
  orange: "text-accent-orange",
};

type Item = { value: string; label: string; color?: string };

export function StatsBlockComponent({ items }: { items: Item[] }) {
  if (!items?.length) return null;
  const cols = Math.min(items.length, 4);
  const grid: Record<number, string> = {
    1: "grid-cols-1",
    2: "sm:grid-cols-2",
    3: "sm:grid-cols-3",
    4: "sm:grid-cols-2 lg:grid-cols-4",
  };
  return (
    <div className={`my-8 grid grid-cols-1 ${grid[cols]} gap-3`}>
      {items.map((item, i) => (
        <div
          key={i}
          className="card-surface p-5 text-center"
        >
          <div className={`font-mono text-2xl md:text-3xl font-bold ${COLOR[item.color ?? "green"] ?? COLOR.green}`}>
            {item.value}
          </div>
          <div className="font-mono text-xs text-text-muted mt-1 uppercase tracking-wider">
            {item.label}
          </div>
        </div>
      ))}
    </div>
  );
}
```

- [ ] **Step 3: Register + map**

```ts
// in rich-text-renderer.tsx
import { StatsBlockComponent } from "@/blocks/stats/component";
// …
stats: ({ node }) => <StatsBlockComponent {...(node.fields as any)} />,
```

- [ ] **Step 4: Verify and commit**

```bash
pnpm generate:types && pnpm dev
```

Insert a Stats block with 3 items. View published. Then:

```bash
git add src/blocks/stats/ src/blocks/index.ts src/components/article/rich-text-renderer.tsx src/payload-types.ts
git commit -m "feat(blocks): add Stats block"
```

---

### Task 19: Steps block

**Files:**
- Create: `src/blocks/steps/config.ts`
- Create: `src/blocks/steps/component.tsx`
- Modify: `src/blocks/index.ts`
- Modify: `src/components/article/rich-text-renderer.tsx`

Spec keeps `body` optional plain text (textarea) — using nested rich-text would require recursive renderer wiring. Plain text is enough for tutorial steps and keeps scope tight.

- [ ] **Step 1: Schema**

```ts
// src/blocks/steps/config.ts
import type { Block } from 'payload'

export const StepsBlock: Block = {
  slug: 'steps',
  interfaceName: 'StepsBlock',
  labels: { singular: 'Steps', plural: 'Step lists' },
  fields: [
    {
      name: 'items',
      type: 'array',
      required: true,
      minRows: 1,
      labels: { singular: 'Step', plural: 'Steps' },
      fields: [
        { name: 'title', type: 'text', required: true },
        { name: 'body',  type: 'textarea' },
      ],
    },
  ],
}
```

- [ ] **Step 2: Renderer**

```tsx
// src/blocks/steps/component.tsx
type Item = { title: string; body?: string | null };

export function StepsBlockComponent({ items }: { items: Item[] }) {
  if (!items?.length) return null;
  return (
    <ol className="my-8 list-none p-0 space-y-5">
      {items.map((item, i) => (
        <li key={i} className="relative pl-12">
          <span
            className="absolute left-0 top-0 inline-flex items-center justify-center w-8 h-8 rounded-full bg-accent-blue text-bg-primary font-mono text-sm font-bold"
            aria-hidden="true"
          >
            {i + 1}
          </span>
          {i < items.length - 1 && (
            <span
              className="absolute left-4 top-8 w-px h-[calc(100%+1.25rem-2rem)] bg-border-primary -translate-x-px"
              aria-hidden="true"
            />
          )}
          <h4 className="font-mono text-base font-bold text-text-primary m-0">
            {item.title}
          </h4>
          {item.body && (
            <p className="text-text-secondary text-sm mt-1 m-0 leading-relaxed whitespace-pre-line">
              {item.body}
            </p>
          )}
        </li>
      ))}
    </ol>
  );
}
```

- [ ] **Step 3: Register + map**

```ts
// in rich-text-renderer.tsx
import { StepsBlockComponent } from "@/blocks/steps/component";
// …
steps: ({ node }) => <StepsBlockComponent {...(node.fields as any)} />,
```

- [ ] **Step 4: Verify and commit**

```bash
pnpm generate:types && pnpm dev
```

Insert a Steps block with 3 steps. View published. Then:

```bash
git add src/blocks/steps/ src/blocks/index.ts src/components/article/rich-text-renderer.tsx src/payload-types.ts
git commit -m "feat(blocks): add Steps block"
```

---

### Task 20: Code block (with Shiki)

**Files:**
- Create: `src/blocks/code/config.ts`
- Create: `src/blocks/code/component.tsx`
- Create: `src/blocks/code/shiki.css`
- Modify: `src/blocks/index.ts`
- Modify: `src/components/article/rich-text-renderer.tsx`
- Modify: `src/app/(frontend)/globals.css` (import the shiki CSS)

The Code block is async (it awaits Shiki). React Server Components handle async natively.

- [ ] **Step 1: Schema**

```ts
// src/blocks/code/config.ts
import type { Block } from 'payload'

export const CodeBlock: Block = {
  slug: 'code',
  interfaceName: 'CodeBlock',
  labels: { singular: 'Code', plural: 'Code blocks' },
  fields: [
    {
      name: 'language',
      type: 'select',
      required: true,
      defaultValue: 'ts',
      admin: { description: 'Add more in the schema as needed.' },
      options: [
        { label: 'TypeScript', value: 'ts' },
        { label: 'JavaScript', value: 'js' },
        { label: 'TSX',        value: 'tsx' },
        { label: 'JSX',        value: 'jsx' },
        { label: 'Bash',       value: 'bash' },
        { label: 'JSON',       value: 'json' },
        { label: 'YAML',       value: 'yaml' },
        { label: 'SQL',        value: 'sql' },
        { label: 'Python',     value: 'python' },
        { label: 'Go',         value: 'go' },
        { label: 'Rust',       value: 'rust' },
        { label: 'HTML',       value: 'html' },
        { label: 'CSS',        value: 'css' },
        { label: 'Markdown',   value: 'md' },
        { label: 'Plain text', value: 'plaintext' },
      ],
    },
    { name: 'filename', type: 'text', admin: { description: 'Optional filename header.' } },
    { name: 'code',     type: 'code', required: true },
  ],
}
```

- [ ] **Step 2: Renderer (async server component)**

```tsx
// src/blocks/code/component.tsx
import { codeToHtml } from "shiki";
import { CopyButton } from "@/components/article/copy-button";

type Props = { language: string; filename?: string | null; code: string };

export async function CodeBlockComponent({ language, filename, code }: Props) {
  let html: string;
  try {
    html = await codeToHtml(code, {
      lang: language || "plaintext",
      themes: { dark: "github-dark-default", light: "github-light-default" },
      defaultColor: "dark",
    });
  } catch {
    // Unknown language — fall back to plain text
    html = await codeToHtml(code, {
      lang: "plaintext",
      themes: { dark: "github-dark-default", light: "github-light-default" },
      defaultColor: "dark",
    });
  }

  return (
    <figure className="my-6 card-surface overflow-hidden">
      <header className="flex items-center justify-between px-4 py-2 bg-bg-tertiary/50 border-b border-border-primary">
        <span className="font-mono text-xs text-text-muted">
          {filename || language}
        </span>
        <CopyButton text={code} />
      </header>
      <div
        className="article-shiki overflow-x-auto text-sm"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </figure>
  );
}
```

- [ ] **Step 3: Add Shiki CSS hook in globals**

Open `src/app/(frontend)/globals.css` and append:

```css
/* ========================================
   Code block (Shiki) overrides
   ======================================== */

.article-shiki pre.shiki {
  margin: 0;
  padding: 1rem;
  font-family: var(--font-mono);
  font-size: 0.875rem;
  line-height: 1.6;
  background: transparent !important;
}

.article-shiki code {
  background: transparent !important;
  font-family: inherit;
  color: inherit;
}

/* Light-theme color swap when [data-theme="light"] is present on <html> */
[data-theme="light"] .article-shiki .shiki,
[data-theme="light"] .article-shiki .shiki span {
  color: var(--shiki-light) !important;
  background-color: var(--shiki-light-bg) !important;
  font-style: var(--shiki-light-font-style) !important;
  font-weight: var(--shiki-light-font-weight) !important;
  text-decoration: var(--shiki-light-text-decoration) !important;
}
```

(Shiki emits CSS variables like `--shiki-light` because we passed both themes; the override above flips to them when light theme is active.)

- [ ] **Step 4: Register + map**

```ts
// in rich-text-renderer.tsx
import { CodeBlockComponent } from "@/blocks/code/component";
// …
code: ({ node }) => <CodeBlockComponent {...(node.fields as any)} />,
```

Note: Lexical default features ship a `code` *node* (block-level code element from inline syntax). Our block has slug `code` too but lives under the `blocks` map, which is keyed separately from default node converters. This will not collide.

- [ ] **Step 5: Verify and commit**

```bash
pnpm generate:types && pnpm dev
```

Insert a Code block with TS source, with and without a filename. View published. Open in light theme via the theme toggle (if present) — confirm code colors switch. Click "copy" — confirm it copies (paste somewhere).

```bash
git add src/blocks/code/ src/blocks/index.ts src/components/article/rich-text-renderer.tsx src/app/\(frontend\)/globals.css src/payload-types.ts
git commit -m "feat(blocks): add Code block (Shiki, dual-theme)"
```

---

### Task 21: Mermaid block

**Files:**
- Create: `src/blocks/mermaid/config.ts`
- Create: `src/blocks/mermaid/component.tsx`
- Create: `src/blocks/mermaid/mermaid-client.tsx`
- Modify: `src/blocks/index.ts`
- Modify: `src/components/article/rich-text-renderer.tsx`

- [ ] **Step 1: Schema**

```ts
// src/blocks/mermaid/config.ts
import type { Block } from 'payload'

export const MermaidBlock: Block = {
  slug: 'mermaid',
  interfaceName: 'MermaidBlock',
  labels: { singular: 'Mermaid diagram', plural: 'Mermaid diagrams' },
  fields: [
    {
      name: 'source',
      type: 'code',
      required: true,
      admin: { description: 'Mermaid syntax (e.g. graph LR; A-->B).' },
    },
  ],
}
```

- [ ] **Step 2: Server component (just hands off to client)**

```tsx
// src/blocks/mermaid/component.tsx
import { MermaidClient } from "./mermaid-client";

export function MermaidBlockComponent({ source }: { source: string }) {
  return (
    <figure className="my-6 card-surface p-4 overflow-x-auto">
      <MermaidClient source={source} />
    </figure>
  );
}
```

- [ ] **Step 3: Client wrapper with dynamic import**

```tsx
// src/blocks/mermaid/mermaid-client.tsx
"use client";

import { useEffect, useRef, useState } from "react";

let counter = 0;

export function MermaidClient({ source }: { source: string }) {
  const [svg, setSvg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const idRef = useRef(`mermaid-${++counter}`);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { default: mermaid } = await import("mermaid");
        const isLight =
          typeof document !== "undefined" &&
          document.documentElement.dataset.theme === "light";
        mermaid.initialize({
          startOnLoad: false,
          theme: isLight ? "default" : "dark",
          fontFamily: "JetBrains Mono, ui-monospace, monospace",
          securityLevel: "strict",
        });
        const { svg: rendered } = await mermaid.render(idRef.current, source);
        if (!cancelled) setSvg(rendered);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Render failed");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [source]);

  if (error) {
    return (
      <div>
        <p className="font-mono text-xs text-text-muted mb-2">
          Diagram failed to render — showing source:
        </p>
        <pre className="font-mono text-xs text-text-secondary whitespace-pre-wrap m-0">
          {source}
        </pre>
      </div>
    );
  }

  if (!svg) {
    return (
      <pre className="font-mono text-xs text-text-muted whitespace-pre-wrap m-0">
        {source}
      </pre>
    );
  }

  return <div className="mermaid-rendered" dangerouslySetInnerHTML={{ __html: svg }} />;
}
```

- [ ] **Step 4: Register + map**

```ts
// in rich-text-renderer.tsx
import { MermaidBlockComponent } from "@/blocks/mermaid/component";
// …
mermaid: ({ node }) => <MermaidBlockComponent {...(node.fields as any)} />,
```

- [ ] **Step 5: Verify and commit**

```bash
pnpm generate:types && pnpm dev
```

Insert a Mermaid block with source like `graph LR; A-->B; B-->C;`. View published. Confirm SVG renders. Toggle theme — diagram theme should follow on next reload.

```bash
git add src/blocks/mermaid/ src/blocks/index.ts src/components/article/rich-text-renderer.tsx src/payload-types.ts
git commit -m "feat(blocks): add Mermaid block (dynamic-imported client renderer)"
```

---

## Phase D — Project page wiring

### Task 22: Build ProjectMetaStrip component

**Files:**
- Create: `src/components/article/project-meta-strip.tsx`

- [ ] **Step 1: Write the file**

```tsx
// src/components/article/project-meta-strip.tsx
import { GitFork, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const STAT_COLORS = ["text-accent-green", "text-accent-blue", "text-accent-purple", "text-accent-orange"];

export type ProjectMetaStripProps = {
  tech: string[];
  metrics: string[];     // existing collection shape: list of strings
  github?: string;
  live?: string;
};

export function ProjectMetaStrip({ tech, metrics, github, live }: ProjectMetaStripProps) {
  const hasTech = tech.length > 0;
  const hasMetrics = metrics.length > 0;
  const hasLinks = Boolean(github || live);
  if (!hasTech && !hasMetrics && !hasLinks) return null;

  return (
    <div className="card-surface p-5 space-y-5">
      {hasTech && (
        <div>
          <div className="font-mono text-xs text-text-muted uppercase tracking-wider mb-2">
            Tech stack
          </div>
          <div className="flex flex-wrap gap-1.5">
            {tech.map((t) => (
              <Badge key={t}>{t}</Badge>
            ))}
          </div>
        </div>
      )}

      {hasMetrics && (
        <div>
          <div className="font-mono text-xs text-text-muted uppercase tracking-wider mb-2">
            Key metrics
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {metrics.map((m, i) => (
              <div
                key={m}
                className="rounded-lg border border-border-primary bg-bg-tertiary/30 px-3 py-2 text-center"
              >
                <span className={`font-mono text-base font-bold ${STAT_COLORS[i % STAT_COLORS.length]}`}>
                  {m}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {hasLinks && (
        <div className="flex flex-wrap gap-3">
          {live && (
            <a
              href={live}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-accent-blue/40 text-accent-blue text-sm font-mono hover:bg-accent-blue/10 transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              Live demo
            </a>
          )}
          {github && (
            <a
              href={github}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border-primary text-text-secondary text-sm font-mono hover:border-border-hover hover:text-text-primary transition-colors"
            >
              <GitFork className="w-4 h-4" />
              View source
            </a>
          )}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/article/project-meta-strip.tsx
git commit -m "feat(article): add ProjectMetaStrip"
```

---

### Task 23: Wire BlocksFeature into the Projects collection

**Files:**
- Modify: `src/collections/Projects.ts`

- [ ] **Step 1: Update the content field**

Open `src/collections/Projects.ts`. Add at the top:

```ts
import { lexicalEditor, BlocksFeature } from '@payloadcms/richtext-lexical'
import { blocks } from '@/blocks'
```

Replace the existing `content` field with:

```ts
    {
      name: 'content',
      type: 'richText',
      label: 'Full Content',
      editor: lexicalEditor({
        features: ({ defaultFeatures }) => [
          ...defaultFeatures,
          BlocksFeature({ blocks }),
        ],
      }),
    },
```

(Note: `required` stays false — projects can have no body and rely on the meta strip alone, per the spec.)

- [ ] **Step 2: Regenerate types**

```bash
pnpm generate:types
```

- [ ] **Step 3: Verify the admin loads**

```bash
pnpm dev
```

Open `http://localhost:3000/admin`, edit a project, confirm `/` slash menu shows all 10 blocks in the body field.

- [ ] **Step 4: Commit**

```bash
git add src/collections/Projects.ts src/payload-types.ts
git commit -m "feat(projects): register BlocksFeature on content field"
```

---

### Task 24: Wire project [slug] page to ArticleShell

**Files:**
- Modify: `src/app/(frontend)/projects/[slug]/page.tsx`
- Modify: `src/app/(frontend)/projects/[slug]/project-detail.tsx`

- [ ] **Step 1: Update the data fetcher**

Replace `src/app/(frontend)/projects/[slug]/page.tsx` contents with:

```tsx
import { getPayloadClient } from '@/lib/payload'
import { ProjectDetail } from './project-detail'
import { notFound } from 'next/navigation'

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const payload = await getPayloadClient()
  const { docs } = await payload.find({
    collection: 'projects',
    where: {
      slug: { equals: slug },
      _status: { equals: 'published' },
    },
    depth: 2,
    limit: 1,
  })

  const doc = docs[0]
  if (!doc) notFound()

  const project = {
    slug: doc.slug,
    title: doc.title,
    description: doc.description,
    tech: (doc.tech ?? []).map((t: { name: string } | string) =>
      typeof t === 'object' ? t.name : t
    ),
    featured: doc.featured ?? false,
    github: doc.github ?? undefined,
    live: doc.live ?? undefined,
    metrics: (doc.metrics ?? []).map((m: { value: string } | string) =>
      typeof m === 'object' ? m.value : m
    ),
    content: doc.content,
    image: typeof doc.image === 'object' ? doc.image : null,
  }

  return <ProjectDetail project={project} />
}
```

- [ ] **Step 2: Replace project-detail**

Replace `src/app/(frontend)/projects/[slug]/project-detail.tsx` contents with:

```tsx
import { ArrowLeft } from "lucide-react";
import type { SerializedEditorState } from "lexical";
import { ArticleShell } from "@/components/article/article-shell";
import { ProjectMetaStrip } from "@/components/article/project-meta-strip";
import { Button } from "@/components/ui/button";

type Project = {
  slug: string;
  title: string;
  description: string;
  tech: string[];
  featured: boolean;
  github?: string;
  live?: string;
  metrics: string[];
  content: SerializedEditorState | null | undefined;
  image: { url?: string | null; alt?: string | null } | null;
};

export function ProjectDetail({ project }: { project: Project }) {
  return (
    <ArticleShell
      kind="project"
      breadcrumb={[
        { label: "Home", href: "/" },
        { label: "Projects", href: "/projects" },
        { label: project.title },
      ]}
      badge={project.featured ? { text: "Featured Project", variant: "accent" } : undefined}
      title={project.title}
      description={project.description}
      metaStrip={
        <ProjectMetaStrip
          tech={project.tech}
          metrics={project.metrics}
          github={project.github}
          live={project.live}
        />
      }
      content={project.content}
      footer={
        <div className="mt-10 pt-6 border-t border-border-primary">
          <Button href="/projects" variant="secondary">
            <ArrowLeft className="w-4 h-4" />
            All projects
          </Button>
        </div>
      }
    />
  );
}
```

- [ ] **Step 3: Verify end-to-end**

```bash
pnpm dev
```

Open `http://localhost:3000/admin`, edit a project, fill out tech/metrics/github/live, add 3+ content blocks (mix of types), publish. Open `http://localhost:3000/projects/<slug>`.

Confirm:
- Breadcrumb (Home / Projects / Title)
- Featured badge if applicable
- Title + description
- Meta strip card with tech chips, metric tiles, Live/Source buttons
- Body renders blocks correctly
- TOC dots in margin if H2/H3 headings exist
- Hardcoded "01. Problem / 02. Architecture / 03. Key Decisions / 04. Outcome" sections are gone
- "All projects" back link at bottom

- [ ] **Step 4: Commit**

```bash
git add src/app/\(frontend\)/projects/\[slug\]/
git commit -m "feat(projects): render Lexical content via ArticleShell + meta strip"
```

---

## Phase E — Polish & cover image

### Task 25: Add cover image rendering to both pages

**Files:**
- Modify: `src/app/(frontend)/blog/[slug]/blog-post-detail.tsx`
- Modify: `src/app/(frontend)/projects/[slug]/project-detail.tsx`

- [ ] **Step 1: Add the cover prop on the blog page**

In `blog-post-detail.tsx`, add the import:

```tsx
import NextImage from "next/image";
```

In the `<ArticleShell ... />` props, add:

```tsx
cover={
  post.image?.url ? (
    <div className="rounded-xl overflow-hidden border border-border-primary bg-bg-tertiary">
      <NextImage
        src={post.image.url}
        alt={post.image.alt ?? ""}
        width={1600}
        height={900}
        sizes="(min-width: 768px) 720px, 100vw"
        priority
        className="w-full h-auto"
      />
    </div>
  ) : undefined
}
```

- [ ] **Step 2: Same on the project page**

In `project-detail.tsx`, mirror the same `cover` prop using `project.image`.

- [ ] **Step 3: Verify**

Set a cover image on a post and a project. Confirm it renders between the meta and the body, contained, rounded, and only shows when set.

- [ ] **Step 4: Commit**

```bash
git add src/app/\(frontend\)/
git commit -m "feat(article): render optional cover image between meta and body"
```

---

### Task 26: Add mobile collapsible TOC

The desktop TOC is the floating margin dots. On mobile we want a `<details>`-based table of contents at the top of the body.

**Files:**
- Create: `src/components/article/mobile-toc.tsx`
- Modify: `src/components/article/article-shell.tsx`

- [ ] **Step 1: Build MobileToc**

```tsx
// src/components/article/mobile-toc.tsx
"use client";

import { useEffect, useState } from "react";
import { ChevronDown, List } from "lucide-react";

type Heading = { id: string; text: string; level: 2 | 3 };

export function MobileToc({ rootId }: { rootId: string }) {
  const [headings, setHeadings] = useState<Heading[]>([]);

  useEffect(() => {
    const root = document.getElementById(rootId);
    if (!root) return;
    const els = Array.from(
      root.querySelectorAll<HTMLElement>("[data-heading-id]")
    ).filter((el) => el.tagName === "H2" || el.tagName === "H3");
    setHeadings(
      els.map((el) => ({
        id: el.dataset.headingId!,
        text: el.textContent ?? "",
        level: (el.tagName === "H2" ? 2 : 3) as 2 | 3,
      }))
    );
  }, [rootId]);

  if (headings.length < 2) return null;

  return (
    <details className="lg:hidden card-surface p-4 mb-6 group">
      <summary className="flex items-center justify-between cursor-pointer list-none font-mono text-xs text-text-muted uppercase tracking-wider">
        <span className="inline-flex items-center gap-2">
          <List className="w-3.5 h-3.5" /> On this page
        </span>
        <ChevronDown className="w-4 h-4 transition-transform group-open:rotate-180" />
      </summary>
      <nav className="mt-3 space-y-1.5">
        {headings.map((h) => (
          <a
            key={h.id}
            href={`#${h.id}`}
            className={`block text-sm hover:text-accent-blue transition-colors ${
              h.level === 3 ? "pl-4 text-text-muted" : "text-text-secondary"
            }`}
          >
            {h.text}
          </a>
        ))}
      </nav>
    </details>
  );
}
```

- [ ] **Step 2: Use it in ArticleShell**

In `src/components/article/article-shell.tsx`, add:

```tsx
import { MobileToc } from "./mobile-toc";
```

Replace the `{content && (...)} ` body block with:

```tsx
{content && (
  <>
    <MobileToc rootId={ARTICLE_BODY_ID} />
    <div className="lg:grid lg:grid-cols-[1fr_minmax(0,640px)_1fr] lg:gap-6">
      <div className="hidden lg:block" />
      <div id={ARTICLE_BODY_ID}>
        <RichTextRenderer content={content} />
      </div>
      <aside className="hidden lg:block">
        <TocDots rootId={ARTICLE_BODY_ID} />
      </aside>
    </div>
  </>
)}
```

- [ ] **Step 3: Verify on a narrow window**

Resize the browser below `lg` (1024px). Confirm a "On this page" disclosure appears at the top of the body when a post has 2+ H2/H3 headings, and is hidden otherwise.

- [ ] **Step 4: Commit**

```bash
git add src/components/article/
git commit -m "feat(article): add mobile collapsible TOC"
```

---

### Task 27: Final smoke test, lint, graphify update

**Files:** none

- [ ] **Step 1: Lint**

```bash
pnpm lint
```

Fix any errors reported. (Warnings about Next.js or React hooks should be addressed; pure formatting can be left.)

- [ ] **Step 2: Build**

```bash
pnpm build
```

Expected: build completes with no errors. If a server/client boundary error appears, the most likely cause is a server component importing a client-only API; trace and split.

- [ ] **Step 3: Manual smoke test**

```bash
pnpm dev
```

Walk this list:

- [ ] `/blog` index still loads
- [ ] `/projects` index still loads
- [ ] `/admin` loads
- [ ] Edit a published blog post that has ALL 10 block types in its body — confirm each renders correctly: Callout (each variant), Code (with copy), Image, ImagePair, PullQuote, Video, Stats, Mermaid, Steps, Divider
- [ ] Confirm desktop TOC dots appear on the right margin and highlight as you scroll; hover reveals labels
- [ ] Confirm mobile collapsible TOC works on narrow window
- [ ] Confirm reading-progress bar moves
- [ ] Toggle theme to light — body, code, mermaid, callouts all stay legible
- [ ] Project page: confirm the meta strip card shows, the four sidebar items moved into it, the old hardcoded "01. Problem / 02. Architecture / 03. Key Decisions / 04. Outcome" cards are gone
- [ ] Cover image appears when set, absent when not
- [ ] No console errors on any page
- [ ] An older post that has ONLY plain rich text (no blocks) still renders with paragraphs, headings, links
- [ ] An older project with no `content` still renders header + meta strip without an empty body section

- [ ] **Step 4: Update graphify**

Per the project's graphify rule:

```bash
graphify update .
```

- [ ] **Step 5: Commit anything left**

```bash
git status
# If graphify-out/ was changed:
git add graphify-out/
git commit -m "chore: refresh graphify after article shell changes"
```

---

## Self-review (run mentally before reporting done)

- Every task lists files to create/modify, code, the manual verify, and a commit.
- Every block in the spec (Callout, Code, Image, ImagePair, PullQuote, Video, Stats, Mermaid, Steps, Divider) has its own task.
- `BlocksFeature` is registered on both Posts and Projects collections.
- TOC dots, mobile TOC, share button, copy button, scroll progress, prose styles, cover image, project meta strip — all covered.
- Bookmark button is removed (in Task 12 by replacing the file with one that doesn't include it).
- The four hardcoded project sections are removed (in Task 24 by replacing project-detail.tsx).
- Edge cases from spec (missing content, missing image, mermaid render error, no headings) are handled in the relevant component code.
- `pnpm` is used everywhere. `pnpm generate:types` runs after every collection change.
- `graphify update .` runs at the end.

## Notes for the implementer

- If `pnpm generate:types` fails after a collection change, double-check that the block's `interfaceName` is unique and a valid TS identifier.
- If a block doesn't appear in the slash menu, verify the schema is exported from `src/blocks/index.ts` and `BlocksFeature({ blocks })` is using that array.
- If TOC dots don't show, open devtools and check that headings have `data-heading-id` attributes — the renderer's heading converter is the source of truth.
- Code highlighting at first request can be slow due to Shiki theme/language load. Subsequent requests are cached in-process. If perceived slowness is an issue in production, consider pre-warming with the most common languages at import time.
- This Next.js version (16.x) reportedly differs from training data — when in doubt about a Next API, check `node_modules/next/dist/docs/`.
