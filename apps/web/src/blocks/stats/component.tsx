const COLOR: Record<string, string> = {
  green:  "text-accent-green",
  blue:   "text-accent-blue",
  purple: "text-accent-purple",
  orange: "text-accent-orange",
};

type Item = { value: string; label: string; color?: string };

export function StatsBlockComponent({ items }: { items: Item[] }) {
  if (!items?.length) return null;
  const cols = Math.min(items.length, 4);
  const grid: Record<number, string> = {
    1: "grid-cols-1",
    2: "sm:grid-cols-2",
    3: "sm:grid-cols-3",
    4: "sm:grid-cols-2 lg:grid-cols-4",
  };
  return (
    <div className={`my-8 grid grid-cols-1 ${grid[cols]} gap-3`}>
      {items.map((item, i) => (
        <div
          key={i}
          className="card-surface p-5 text-center"
        >
          <div className={`font-mono text-2xl md:text-3xl font-bold ${COLOR[item.color ?? "green"] ?? COLOR.green}`}>
            {item.value}
          </div>
          <div className="font-mono text-xs text-text-muted mt-1 uppercase tracking-wider">
            {item.label}
          </div>
        </div>
      ))}
    </div>
  );
}
