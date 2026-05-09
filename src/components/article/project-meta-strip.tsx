import { GitFork, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const STAT_COLORS = ["text-accent-green", "text-accent-blue", "text-accent-purple", "text-accent-orange"];

export type ProjectMetaStripProps = {
  tech: string[];
  metrics: string[];
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
