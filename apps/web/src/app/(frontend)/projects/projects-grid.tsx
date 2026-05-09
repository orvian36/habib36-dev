"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { GitFork, ExternalLink, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { SectionHeading } from "@/components/ui/section-heading";

type Project = {
  slug: string;
  title: string;
  description: string;
  tech: string[];
  featured: boolean;
  github?: string;
  live?: string;
  metrics?: string[];
};

export function ProjectsGrid({ projects }: { projects: Project[] }) {
  const [search, setSearch] = useState("");
  const [activeTech, setActiveTech] = useState<string | null>(null);

  const [remoteResults, setRemoteResults] = useState<typeof projects | null>(null)

  useEffect(() => {
    let cancelled = false
    const handle = setTimeout(async () => {
      if (!search.trim()) {
        if (!cancelled) setRemoteResults(null)
        return
      }
      try {
        const res = await fetch(
          `/api/search?q=${encodeURIComponent(search)}&docType=project`,
        )
        const data = await res.json()
        if (cancelled) return
        const mapped = (data.docs as Array<{ slug: string; title: string; excerpt?: string }>).map(
          (d) => projects.find((p) => p.slug === d.slug),
        ).filter(Boolean) as typeof projects
        setRemoteResults(mapped)
      } catch {
        setRemoteResults(null)
      }
    }, 250)
    return () => {
      cancelled = true
      clearTimeout(handle)
    }
  }, [search, projects])

  const baseList = remoteResults ?? projects

  const allTechs = [...new Set(projects.flatMap((p) => p.tech))].sort();

  const filtered = baseList.filter((p) => {
    const matchesSearch =
      !search ||
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase());
    const matchesTech = !activeTech || p.tech.includes(activeTech);
    return matchesSearch && matchesTech;
  });

  return (
    <div className="py-24">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <SectionHeading
          label="Projects"
          title="All Projects"
          description="Production systems, open-source tools, and experiments."
        />

        {/* Filters */}
        <div className="mb-10 space-y-4">
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search projects..."
              className="w-full pl-10 pr-4 py-2.5 bg-bg-secondary border border-border-primary rounded-lg font-mono text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-blue/30 transition-colors"
            />
          </div>

          <div className="flex flex-wrap justify-center gap-2">
            <button
              onClick={() => setActiveTech(null)}
              className={`px-3 py-1 text-xs font-mono rounded-full border transition-all ${
                !activeTech
                  ? "bg-accent-blue/10 text-accent-blue border-accent-blue/30"
                  : "text-text-muted border-border-primary hover:text-text-secondary hover:border-border-hover"
              }`}
            >
              All
            </button>
            {allTechs.map((tech) => (
              <button
                key={tech}
                onClick={() => setActiveTech(activeTech === tech ? null : tech)}
                className={`px-3 py-1 text-xs font-mono rounded-full border transition-all ${
                  activeTech === tech
                    ? "bg-accent-blue/10 text-accent-blue border-accent-blue/30"
                    : "text-text-muted border-border-primary hover:text-text-secondary hover:border-border-hover"
                }`}
              >
                {tech}
              </button>
            ))}
          </div>
        </div>

        {/* Project grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((project, i) => (
            <motion.div
              key={project.slug}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05, duration: 0.4 }}
              layout
            >
              <Link
                href={`/${project.slug}`}
                className="card-surface card-glow block p-6 h-full group"
              >
                {/* Featured badge */}
                {project.featured && (
                  <Badge variant="accent" className="mb-3">
                    Featured
                  </Badge>
                )}

                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-mono font-bold text-base text-text-primary group-hover:text-accent-blue transition-colors">
                    {project.title}
                  </h3>
                  <div className="flex gap-1.5 shrink-0 ml-2">
                    {project.github && (
                      <GitFork className="w-4 h-4 text-text-muted" />
                    )}
                    {project.live && (
                      <ExternalLink className="w-4 h-4 text-text-muted" />
                    )}
                  </div>
                </div>

                <p className="text-text-secondary text-sm mb-4 line-clamp-3">
                  {project.description}
                </p>

                {project.metrics && project.metrics.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {project.metrics.slice(0, 2).map((m) => (
                      <Badge key={m} variant="green">
                        {m}
                      </Badge>
                    ))}
                  </div>
                )}

                <div className="flex flex-wrap gap-1.5 mt-auto">
                  {project.tech.map((t) => (
                    <Badge key={t}>{t}</Badge>
                  ))}
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16">
            <p className="font-mono text-text-muted">
              No projects match your search. Try a different query.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
