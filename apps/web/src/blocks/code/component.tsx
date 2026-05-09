import { codeToHtml } from "shiki";
import { CopyButton } from "@/components/article/copy-button";

type Props = { language: string; filename?: string | null; code: string };

export async function CodeBlockComponent({ language, filename, code }: Props) {
  let html: string;
  try {
    html = await codeToHtml(code, {
      lang: language || "plaintext",
      themes: { dark: "github-dark-default", light: "github-light-default" },
      defaultColor: "dark",
    });
  } catch {
    html = await codeToHtml(code, {
      lang: "plaintext",
      themes: { dark: "github-dark-default", light: "github-light-default" },
      defaultColor: "dark",
    });
  }

  return (
    <figure className="my-6 card-surface overflow-hidden">
      <header className="flex items-center justify-between px-4 py-2 bg-bg-tertiary/50 border-b border-border-primary">
        <span className="font-mono text-xs text-text-muted">
          {filename || language}
        </span>
        <CopyButton text={code} />
      </header>
      <div
        className="article-shiki overflow-x-auto text-sm"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </figure>
  );
}
