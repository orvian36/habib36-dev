type Props = { glyph?: string | null; label?: string | null };

export function DividerBlockComponent({ glyph, label }: Props) {
  return (
    <div className="my-10 flex items-center gap-3" aria-hidden={!(label || glyph)}>
      <div className="flex-1 h-px bg-border-primary" />
      {(label || glyph) && (
        <span className="font-mono text-xs text-text-muted px-1">
          {label ?? glyph ?? ''}
        </span>
      )}
      <div className="flex-1 h-px bg-border-primary" />
    </div>
  );
}
