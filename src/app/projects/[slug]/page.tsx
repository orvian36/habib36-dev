"use client";

import { use } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  ArrowLeft,
  GitFork,
  ExternalLink,
  ChevronRight,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { projects } from "@/lib/data";

export default function ProjectDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const project = projects.find((p) => p.slug === slug);

  if (!project) {
    return (
      <div className="py-24 text-center">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <h1 className="heading-mono text-3xl text-text-primary mb-4">
            Project not found
          </h1>
          <p className="text-text-secondary mb-8">
            The project you&apos;re looking for doesn&apos;t exist.
          </p>
          <Button href="/projects">
            <ArrowLeft className="w-4 h-4" />
            Back to projects
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="py-24">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
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
            href="/projects"
            className="hover:text-text-secondary transition-colors"
          >
            Projects
          </Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-text-primary">{project.title}</span>
        </motion.nav>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
          {/* Sidebar */}
          <motion.aside
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-1 order-2 lg:order-1"
          >
            <div className="card-surface p-5 sticky top-24 space-y-5">
              <div>
                <h3 className="font-mono text-xs text-text-muted uppercase tracking-wider mb-2">
                  Tech Stack
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {project.tech.map((t) => (
                    <Badge key={t}>{t}</Badge>
                  ))}
                </div>
              </div>

              {project.metrics && (
                <div>
                  <h3 className="font-mono text-xs text-text-muted uppercase tracking-wider mb-2">
                    Key Metrics
                  </h3>
                  <div className="space-y-2">
                    {project.metrics.map((m) => (
                      <div
                        key={m}
                        className="text-sm text-accent-green font-mono flex items-center gap-2"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-accent-green shrink-0" />
                        {m}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <h3 className="font-mono text-xs text-text-muted uppercase tracking-wider mb-3">
                  Links
                </h3>
                <div className="space-y-2">
                  {project.github && (
                    <a
                      href={project.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-text-secondary hover:text-accent-blue transition-colors"
                    >
                      <GitFork className="w-4 h-4" />
                      View source
                    </a>
                  )}
                  {project.live && (
                    <a
                      href={project.live}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-text-secondary hover:text-accent-blue transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Live demo
                    </a>
                  )}
                </div>
              </div>
            </div>
          </motion.aside>

          {/* Main content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="lg:col-span-3 order-1 lg:order-2"
          >
            {project.featured && (
              <Badge variant="accent" className="mb-4">
                Featured Project
              </Badge>
            )}

            <h1 className="heading-mono text-3xl md:text-4xl text-text-primary mb-4">
              {project.title}
            </h1>

            <p className="text-text-secondary text-lg mb-8 leading-relaxed">
              {project.description}
            </p>

            {/* Placeholder for rich content that will come from CMS */}
            <div className="space-y-8">
              {/* Problem Statement */}
              <div className="card-surface p-6">
                <h2 className="font-mono font-bold text-lg text-text-primary mb-3 flex items-center gap-2">
                  <span className="text-accent-blue">01.</span> Problem
                </h2>
                <p className="text-text-secondary leading-relaxed">
                  This section will contain the problem statement and motivation for
                  this project. Content will be managed through Payload CMS once the
                  backend is connected.
                </p>
              </div>

              {/* Architecture */}
              <div className="card-surface p-6">
                <h2 className="font-mono font-bold text-lg text-text-primary mb-3 flex items-center gap-2">
                  <span className="text-accent-blue">02.</span> Architecture
                </h2>
                <div className="bg-bg-tertiary border border-border-primary rounded-lg p-8 text-center">
                  <p className="text-text-muted font-mono text-sm">
                    [ Architecture diagram placeholder ]
                  </p>
                  <p className="text-text-muted text-xs mt-2">
                    Mermaid/SVG diagrams will be embedded here
                  </p>
                </div>
              </div>

              {/* Key Decisions */}
              <div className="card-surface p-6">
                <h2 className="font-mono font-bold text-lg text-text-primary mb-3 flex items-center gap-2">
                  <span className="text-accent-blue">03.</span> Key Decisions
                </h2>
                <p className="text-text-secondary leading-relaxed">
                  Technical decision rationale, trade-offs considered, and why
                  specific tools and approaches were chosen. Managed via CMS.
                </p>
              </div>

              {/* Outcome */}
              <div className="card-surface p-6">
                <h2 className="font-mono font-bold text-lg text-text-primary mb-3 flex items-center gap-2">
                  <span className="text-accent-blue">04.</span> Outcome
                </h2>
                <p className="text-text-secondary leading-relaxed">
                  Results, metrics, and lessons learned. This section will include
                  performance data and before/after comparisons where applicable.
                </p>
              </div>
            </div>

            {/* Navigation */}
            <div className="mt-10 pt-6 border-t border-border-primary">
              <Button href="/projects" variant="secondary">
                <ArrowLeft className="w-4 h-4" />
                All projects
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
