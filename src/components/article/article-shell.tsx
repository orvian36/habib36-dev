import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { ReactNode } from "react";
import type { SerializedEditorState } from "lexical";
import { Badge } from "@/components/ui/badge";
import { ScrollProgress } from "@/components/ui/scroll-progress";
import { ShareButton } from "./share-button";
import { TocDots } from "./toc-dots";
import { MobileToc } from "./mobile-toc";
import { RichTextRenderer } from "./rich-text-renderer";

export type Crumb = { label: string; href?: string };
export type BadgeVariant = "default" | "accent" | "green" | "orange" | "purple";

export type ArticleShellProps = {
  kind: "post" | "project";
  breadcrumb: Crumb[];
  badge?: { text: string; variant?: BadgeVariant };
  title: string;
  description: string;
  meta?: ReactNode;
  metaStrip?: ReactNode;
  cover?: ReactNode;
  content: SerializedEditorState | null | undefined;
  tags?: string[];
  footer?: ReactNode;
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

          {metaStrip && <div className="mb-8">{metaStrip}</div>}

          {cover && <div className="mb-10">{cover}</div>}

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

          {footer && <div className="mt-12">{footer}</div>}
        </div>
      </div>
    </>
  );
}
