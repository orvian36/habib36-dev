import { MermaidClient } from "./mermaid-client";

export function MermaidBlockComponent({ source }: { source: string }) {
  return (
    <figure className="my-6 card-surface p-4 overflow-x-auto">
      <MermaidClient source={source} />
    </figure>
  );
}
