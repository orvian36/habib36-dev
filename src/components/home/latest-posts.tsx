"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Clock, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "@/components/ui/section-heading";
import { TiltCard } from "@/components/ui/tilt-card";

type PostItem = {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  date: string;
  readingTime: string;
};

export function LatestPosts({ posts }: { posts: PostItem[] }) {
  const latestPosts = posts.slice(0, 3);
  return (
    <section className="py-24 bg-bg-secondary/30 border-y border-border-primary">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <SectionHeading
          label="Blog"
          title="Latest Posts"
          description="Deep dives, tutorials, and technical opinions."
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {latestPosts.map((post, i) => (
            <motion.div
              key={post.slug}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{
                delay: i * 0.1,
                type: "spring",
                stiffness: 100,
                damping: 15,
              }}
            >
              <TiltCard>
              <Link
                href={`/blog/${post.slug}`}
                className="card-surface card-glow block p-6 h-full group"
              >
                <Badge variant="accent" className="mb-3">
                  {post.category}
                </Badge>

                <h3 className="font-mono font-bold text-base text-text-primary group-hover:text-accent-blue transition-colors mb-2 line-clamp-2">
                  {post.title}
                </h3>

                <p className="text-text-secondary text-sm mb-4 line-clamp-3">
                  {post.excerpt}
                </p>

                <div className="flex items-center gap-4 text-xs text-text-muted font-mono mt-auto">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(post.date).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {post.readingTime}
                  </span>
                </div>
              </Link>
              </TiltCard>
            </motion.div>
          ))}
        </div>

        <div className="text-center mt-10">
          <Button href="/blog" variant="secondary">
            View all posts
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </section>
  );
}
