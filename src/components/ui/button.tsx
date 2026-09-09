import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg" | "icon";
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "md", ...props }, ref) => {
    const variantStyles = {
      default:
        "bg-[#111] text-white hover:bg-[#1A1A1A]",
      outline:
        "border border-[#D5D5D0] bg-white hover:bg-[#FAFAFA] text-[#111]",
      secondary:
        "bg-white text-[#111] border border-[#D5D5D0] hover:bg-[#F3F3F1]",
      ghost: "hover:bg-[#F3F3F1] text-[#111]",
      danger: "text-[#D94A4A] hover:bg-red-50",
    };

    const sizeStyles = {
      sm: "h-9 px-3.5 text-xs rounded-md",
      md: "h-11 px-[18px] text-sm rounded-lg",
      lg: "h-12 px-6 text-sm rounded-lg font-medium",
      icon: "h-10 w-10 p-0 rounded-lg flex items-center justify-center",
    };

    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#111] focus-visible:ring-offset-1 disabled:pointer-events-none disabled:opacity-50",
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";
