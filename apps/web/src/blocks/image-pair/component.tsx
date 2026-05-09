import NextImage from "next/image";

type Media = { url?: string | null; alt?: string | null; width?: number | null; height?: number | null };
type Side = { image: Media | string | null; label?: string | null };

function Pane({ side, accent }: { side: Side; accent: string }) {
  if (!side?.image || typeof side.image === "string" || !side.image.url) return null;
  return (
    <figure className="m-0">
      <div className={`rounded-xl border ${accent} overflow-hidden bg-bg-tertiary`}>
        <NextImage
          src={side.image.url}
          alt={side.image.alt ?? side.label ?? ""}
          width={side.image.width ?? 1200}
          height={side.image.height ?? 800}
          className="w-full h-auto"
          sizes="(min-width: 768px) 320px, 50vw"
        />
      </div>
      {side.label && (
        <figcaption className="mt-2 font-mono text-xs text-text-muted text-center">
          {side.label}
        </figcaption>
      )}
    </figure>
  );
}

export function ImagePairBlockComponent({ left, right }: { left: Side; right: Side }) {
  return (
    <div className="my-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
      <Pane side={left}  accent="border-border-primary" />
      <Pane side={right} accent="border-accent-green/40" />
    </div>
  );
}
