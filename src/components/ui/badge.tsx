interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "accent" | "green" | "orange" | "purple";
  className?: string;
}

const variantStyles = {
  default:
    "bg-bg-tertiary text-text-secondary border-border-primary",
  accent:
    "bg-accent-blue/10 text-accent-blue border-accent-blue/20",
  green:
    "bg-accent-green/10 text-accent-green border-accent-green/20",
  orange:
    "bg-accent-orange/10 text-accent-orange border-accent-orange/20",
  purple:
    "bg-accent-purple/10 text-accent-purple border-accent-purple/20",
};

export function Badge({
  children,
  variant = "default",
  className = "",
}: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-mono border ${variantStyles[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
