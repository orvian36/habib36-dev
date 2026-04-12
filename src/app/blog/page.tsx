"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Search, Calendar, Clock, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { SectionHeading } from "@/components/ui/section-heading";
import { blogPosts } from "@/lib/data";

const categories = [...new Set(blogPosts.map((p) => p.category))];

export default function BlogPage() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const filtered = blogPosts.filter((p) => {
    const matchesSearch =
      !search ||
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.excerpt.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = !activeCategory || p.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="py-24">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <SectionHeading
          label="Blog"
          title="Technical Blog"
          description="Deep dives, tutorials, project breakdowns, and opinions on software engineering and AI."
        />

        {/* Filters */}
        <div className="mb-10 space-y-4">
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search posts..."
              className="w-full pl-10 pr-4 py-2.5 bg-bg-secondary border border-border-primary rounded-lg font-mono text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-blue/30 transition-colors"
            />
          </div>

          <div className="flex flex-wrap justify-center gap-2">
            <button
              onClick={() => setActiveCategory(null)}
              className={`px-3 py-1 text-xs font-mono rounded-full border transition-all ${
                !activeCategory
                  ? "bg-accent-blue/10 text-accent-blue border-accent-blue/30"
                  : "text-text-muted border-border-primary hover:text-text-secondary"
              }`}
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() =>
                  setActiveCategory(activeCategory === cat ? null : cat)
                }
                className={`px-3 py-1 text-xs font-mono rounded-full border transition-all ${
                  activeCategory === cat
                    ? "bg-accent-blue/10 text-accent-blue border-accent-blue/30"
                    : "text-text-muted border-border-primary hover:text-text-secondary"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Posts grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filtered.map((post, i) => (
            <motion.div
              key={post.slug}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05, duration: 0.4 }}
              layout
            >
              <Link
                href={`/blog/${post.slug}`}
                className="card-surface card-glow block p-6 h-full group"
              >
                <div className="flex items-center gap-2 mb-3">
                  <Badge variant="accent">{post.category}</Badge>
                  <span className="text-xs text-text-muted font-mono flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {post.readingTime}
                  </span>
                </div>

                <h2 className="font-mono font-bold text-lg text-text-primary group-hover:text-accent-blue transition-colors mb-2">
                  {post.title}
                </h2>

                <p className="text-text-secondary text-sm mb-4 line-clamp-3">
                  {post.excerpt}
                </p>

                <div className="flex items-center justify-between mt-auto">
                  <div className="flex flex-wrap gap-1.5">
                    {post.tags.slice(0, 3).map((tag) => (
                      <Badge key={tag}>{tag}</Badge>
                    ))}
                  </div>
                  <span className="text-xs text-text-muted font-mono flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(post.date).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16">
            <p className="font-mono text-text-muted">
              No posts match your search.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
