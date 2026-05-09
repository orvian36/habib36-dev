export function PullQuoteBlockComponent({
  quote,
  cite,
}: {
  quote: string;
  cite?: string | null;
}) {
  return (
    <figure className="my-8 pl-6 border-l-2 border-accent-purple/60">
      <blockquote className="text-xl md:text-2xl leading-snug text-text-primary italic m-0">
        &ldquo;{quote}&rdquo;
      </blockquote>
      {cite && (
        <figcaption className="mt-3 font-mono text-xs text-text-muted">
          — {cite}
        </figcaption>
      )}
    </figure>
  );
}
