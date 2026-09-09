import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "outline" | "danger" | "success" | "warning";
}

export function Badge({
  className,
  variant = "default",
  ...props
}: BadgeProps) {
  const variantStyles = {
    default: "bg-[#111] text-white",
    secondary: "bg-[#F3F3F1] text-[#555550]",
    outline: "border border-[#E7E7E3] text-[#555550]",
    danger: "bg-red-50 text-[#D94A4A] border border-red-100",
    success: "bg-emerald-50 text-[#21A366] border border-emerald-100",
    warning: "bg-amber-50 text-[#D99A24] border border-amber-100",
  };

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-medium",
        variantStyles[variant],
        className
      )}
      {...props}
    />
  );
}
