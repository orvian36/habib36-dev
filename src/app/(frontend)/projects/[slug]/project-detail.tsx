import { ArrowLeft } from "lucide-react";
import NextImage from "next/image";
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
      cover={
        project.image?.url ? (
          <div className="rounded-xl overflow-hidden border border-border-primary bg-bg-tertiary">
            <NextImage
              src={project.image.url}
              alt={project.image.alt ?? ""}
              width={1600}
              height={900}
              sizes="(min-width: 768px) 720px, 100vw"
              priority
              className="w-full h-auto"
            />
          </div>
        ) : undefined
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
