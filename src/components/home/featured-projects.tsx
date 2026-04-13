"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, ExternalLink, GitFork } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "@/components/ui/section-heading";
import { TiltCard } from "@/components/ui/tilt-card";

type ProjectItem = {
  slug: string;
  title: string;
  description: string;
  tech: string[];
  featured?: boolean;
  github?: string;
  live?: string;
  metrics?: string[];
};

export function FeaturedProjects({ projects }: { projects: ProjectItem[] }) {
  const featuredProjects = projects.filter((p) => p.featured);
  return (
    <section className="py-24 relative">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <SectionHeading
          label="Projects"
          title="Featured Work"
          description="Production systems I've designed, built, and shipped."
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {featuredProjects.map((project, i) => (
            <motion.div
              key={project.slug}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{
                delay: i * 0.1,
                type: "spring",
                stiffness: 100,
                damping: 15,
              }}
              className="h-full"
            >
              <TiltCard className="h-full">
              <Link
                href={`/projects/${project.slug}`}
                className="card-surface card-glow block p-6 h-full group"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-mono font-bold text-lg text-text-primary group-hover:text-accent-blue transition-colors">
                    {project.title}
                  </h3>
                  <div className="flex gap-2 shrink-0">
                    {project.github && (
                      <span className="p-1.5 text-text-muted hover:text-text-primary transition-colors">
                        <GitFork className="w-4 h-4" />
                      </span>
                    )}
                    {project.live && (
                      <span className="p-1.5 text-text-muted hover:text-text-primary transition-colors">
                        <ExternalLink className="w-4 h-4" />
                      </span>
                    )}
                  </div>
                </div>

                {/* Description */}
                <p className="text-text-secondary text-sm mb-4 line-clamp-3">
                  {project.description}
                </p>

                {/* Metrics */}
                {project.metrics && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {project.metrics.map((metric) => (
                      <Badge key={metric} variant="green">
                        {metric}
                      </Badge>
                    ))}
                  </div>
                )}

                {/* Tech stack */}
                <div className="flex flex-wrap gap-1.5 mt-auto">
                  {project.tech.map((t) => (
                    <Badge key={t}>{t}</Badge>
                  ))}
                </div>
              </Link>
              </TiltCard>
            </motion.div>
          ))}
        </div>

        <div className="text-center mt-10">
          <Button href="/projects" variant="secondary">
            View all projects
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </section>
  );
}
