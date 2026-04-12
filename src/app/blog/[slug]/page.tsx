"use client";

import { use } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  Clock,
  ChevronRight,
  Share2,
  Bookmark,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { blogPosts } from "@/lib/data";

export default function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const post = blogPosts.find((p) => p.slug === slug);

  if (!post) {
    return (
      <div className="py-24 text-center">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <h1 className="heading-mono text-3xl text-text-primary mb-4">
            Post not found
          </h1>
          <p className="text-text-secondary mb-8">
            The blog post you&apos;re looking for doesn&apos;t exist.
          </p>
          <Button href="/blog">
            <ArrowLeft className="w-4 h-4" />
            Back to blog
          </Button>
        </div>
      </div>
    );
  }

  // Get related posts (same category, exclude current)
  const relatedPosts = blogPosts
    .filter((p) => p.category === post.category && p.slug !== post.slug)
    .slice(0, 2);

  return (
    <div className="py-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {/* Breadcrumb */}
        <motion.nav
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 text-sm text-text-muted font-mono mb-8"
        >
          <Link href="/" className="hover:text-text-secondary transition-colors">
            Home
          </Link>
          <ChevronRight className="w-3 h-3" />
          <Link
            href="/blog"
            className="hover:text-text-secondary transition-colors"
          >
            Blog
          </Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-text-primary truncate">{post.title}</span>
        </motion.nav>

        {/* Article header */}
        <motion.header
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-10"
        >
          <Badge variant="accent" className="mb-4">
            {post.category}
          </Badge>

          <h1 className="heading-mono text-3xl md:text-4xl text-text-primary mb-4">
            {post.title}
          </h1>

          <p className="text-text-secondary text-lg mb-6">{post.excerpt}</p>

          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4 text-sm text-text-muted font-mono">
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
            </div>
            <div className="flex gap-2">
              <button className="p-2 text-text-muted hover:text-accent-blue hover:bg-accent-blue/10 rounded-lg transition-all">
                <Share2 className="w-4 h-4" />
              </button>
              <button className="p-2 text-text-muted hover:text-accent-blue hover:bg-accent-blue/10 rounded-lg transition-all">
                <Bookmark className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="flex flex-wrap gap-1.5 mt-4">
            {post.tags.map((tag) => (
              <Badge key={tag}>{tag}</Badge>
            ))}
          </div>
        </motion.header>

        <div className="border-t border-border-primary" />

        {/* Article content placeholder */}
        <motion.article
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="py-10"
        >
          {/* Table of Contents */}
          <div className="card-surface p-5 mb-8">
            <h3 className="font-mono text-sm font-bold text-text-primary mb-3">
              Table of Contents
            </h3>
            <nav className="space-y-2 text-sm">
              <p className="text-text-muted font-mono">
                1. Introduction
              </p>
              <p className="text-text-muted font-mono">
                2. Problem Statement
              </p>
              <p className="text-text-muted font-mono">
                3. Implementation
              </p>
              <p className="text-text-muted font-mono">
                4. Results & Metrics
              </p>
              <p className="text-text-muted font-mono">
                5. Takeaways
              </p>
            </nav>
          </div>

          {/* Content placeholder */}
          <div className="prose prose-invert max-w-none space-y-6">
            <div className="card-surface p-8 text-center">
              <p className="font-mono text-text-muted text-sm">
                [ Blog post content will be rendered from Payload CMS ]
              </p>
              <p className="text-text-muted text-xs mt-2">
                Rich text with Lexical editor, code highlighting via Shiki,
                embedded diagrams, and image optimization.
              </p>
            </div>

            {/* Example code block */}
            <div className="card-surface overflow-hidden">
              <div className="flex items-center justify-between px-4 py-2 bg-bg-tertiary/50 border-b border-border-primary">
                <span className="font-mono text-xs text-text-muted">
                  example.ts
                </span>
                <button className="text-xs font-mono text-text-muted hover:text-text-secondary transition-colors">
                  Copy
                </button>
              </div>
              <pre className="p-4 overflow-x-auto">
                <code className="font-mono text-sm text-text-secondary">
{`// Example code block styling
const pipeline = new RAGPipeline({
  vectorDb: new WeaviateClient(),
  llm: new GroqClient({ model: "llama-3.1-70b" }),
  embedder: new LocalEmbedder("all-MiniLM-L6-v2"),
});

const response = await pipeline.query({
  question: "What is Habibur's experience with RAG?",
  topK: 5,
});`}
                </code>
              </pre>
            </div>
          </div>
        </motion.article>

        {/* Related posts */}
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

        {/* Back link */}
        <div className="mt-10 pt-6 border-t border-border-primary">
          <Button href="/blog" variant="secondary">
            <ArrowLeft className="w-4 h-4" />
            All posts
          </Button>
        </div>
      </div>
    </div>
  );
}
