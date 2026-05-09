import { Info, CheckCircle2, AlertTriangle, AlertOctagon } from "lucide-react";

type Variant = "info" | "success" | "warn" | "danger";

const VARIANTS: Record<
  Variant,
  { icon: typeof Info; tint: string; border: string; iconColor: string }
> = {
  info:    { icon: Info,           tint: "bg-accent-blue/8",   border: "border-l-accent-blue",   iconColor: "text-accent-blue" },
  success: { icon: CheckCircle2,   tint: "bg-accent-green/8",  border: "border-l-accent-green",  iconColor: "text-accent-green" },
  warn:    { icon: AlertTriangle,  tint: "bg-accent-orange/8", border: "border-l-accent-orange", iconColor: "text-accent-orange" },
  danger:  { icon: AlertOctagon,   tint: "bg-accent-orange/12",border: "border-l-accent-orange", iconColor: "text-accent-orange" },
};

export function CalloutBlockComponent({
  variant,
  text,
}: {
  variant: Variant;
  text: string;
}) {
  const v = VARIANTS[variant] ?? VARIANTS.info;
  const Icon = v.icon;
  return (
    <aside
      role="note"
      className={`my-6 flex gap-3 p-4 rounded-lg border-l-2 ${v.tint} ${v.border}`}
    >
      <Icon className={`w-4 h-4 mt-1 shrink-0 ${v.iconColor}`} />
      <p className="text-sm text-text-secondary leading-relaxed m-0">{text}</p>
    </aside>
  );
}
