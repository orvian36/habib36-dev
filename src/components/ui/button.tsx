import Link from "next/link";

interface ButtonProps {
  children: React.ReactNode;
  href?: string;
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
  className?: string;
  onClick?: () => void;
  type?: "button" | "submit";
  external?: boolean;
}

const baseStyles =
  "inline-flex items-center justify-center gap-2 font-mono text-sm font-medium transition-all duration-300 rounded-lg focus-visible:outline-2 focus-visible:outline-accent-blue";

const variantStyles = {
  primary:
    "bg-accent-blue/10 text-accent-blue border border-accent-blue/30 hover:bg-accent-blue/20 hover:border-accent-blue/50 hover:shadow-[0_0_20px_rgba(0,212,255,0.15)]",
  secondary:
    "bg-bg-tertiary text-text-primary border border-border-primary hover:border-border-hover hover:bg-bg-secondary",
  ghost:
    "text-text-secondary hover:text-text-primary hover:bg-bg-tertiary",
};

const sizeStyles = {
  sm: "px-3 py-1.5 text-xs",
  md: "px-5 py-2.5",
  lg: "px-7 py-3 text-base",
};

export function Button({
  children,
  href,
  variant = "primary",
  size = "md",
  className = "",
  onClick,
  type = "button",
  external,
}: ButtonProps) {
  const classes = `${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`;

  if (href) {
    if (external) {
      return (
        <a href={href} target="_blank" rel="noopener noreferrer" className={classes}>
          {children}
        </a>
      );
    }
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button type={type} onClick={onClick} className={classes}>
      {children}
    </button>
  );
}
