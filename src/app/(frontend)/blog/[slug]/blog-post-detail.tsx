import Link from "next/link";
import NextImage from "next/image";
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
