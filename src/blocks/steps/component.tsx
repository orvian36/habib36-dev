type Item = { title: string; body?: string | null };

export function StepsBlockComponent({ items }: { items: Item[] }) {
  if (!items?.length) return null;
  return (
    <ol className="my-8 list-none p-0 space-y-5">
      {items.map((item, i) => (
        <li key={i} className="relative pl-12">
          <span
            className="absolute left-0 top-0 inline-flex items-center justify-center w-8 h-8 rounded-full bg-accent-blue text-bg-primary font-mono text-sm font-bold"
            aria-hidden="true"
          >
            {i + 1}
          </span>
          {i < items.length - 1 && (
            <span
              className="absolute left-4 top-8 w-px h-[calc(100%+1.25rem-2rem)] bg-border-primary -translate-x-px"
              aria-hidden="true"
            />
          )}
          <h4 className="font-mono text-base font-bold text-text-primary m-0">
            {item.title}
          </h4>
          {item.body && (
            <p className="text-text-secondary text-sm mt-1 m-0 leading-relaxed whitespace-pre-line">
              {item.body}
            </p>
          )}
        </li>
      ))}
    </ol>
  );
}
