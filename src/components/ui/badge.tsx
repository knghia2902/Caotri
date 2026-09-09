import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "outline" | "accent" | "danger" | "success" | "neon";
}

export function Badge({
  className,
  variant = "default",
  ...props
}: BadgeProps) {
  const variantStyles = {
    default: "bg-primary text-primary-foreground",
    secondary: "bg-secondary text-secondary-foreground",
    outline: "border border-border text-foreground",
    accent: "bg-accent text-accent-foreground",
    danger: "bg-red-100 text-red-700 border border-red-200",
    success: "bg-emerald-100 text-emerald-800 border border-emerald-200",
    neon: "bg-cyan-950/80 text-cyan-400 border border-cyan-500/50 shadow-sm shadow-cyan-950/50",
  };

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors",
        variantStyles[variant],
        className
      )}
      {...props}
    />
  );
}
