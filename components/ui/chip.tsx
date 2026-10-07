"use client";

import * as React from "react";
import { cn } from "./button";

export interface ChipProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "domain" | "stamp" | "accent" | "outline";
  size?: "sm" | "md" | "lg";
  icon?: React.ReactNode;
}

export function Chip({
  className,
  variant = "default",
  size = "md",
  icon,
  children,
  ...props
}: ChipProps) {
  const sizeStyles = {
    sm: "text-[11px] px-2.5 py-0.5 gap-1",
    md: "text-xs px-3 py-1 gap-1.5",
    lg: "text-sm px-4 py-1.5 gap-2",
  };

  const variantStyles = {
    default: "bg-surface text-foreground border border-border-hairline shadow-editorial-sm",
    domain: "bg-primary/10 text-primary border border-primary/20 font-medium",
    stamp: "font-mono uppercase tracking-widest text-[10px] bg-raised text-muted-text border border-border-hairline",
    accent: "bg-accent/15 text-foreground border border-accent/30 font-medium",
    outline: "bg-transparent border border-border-hairline text-foreground hover:bg-surface/50",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center font-sans rounded-full transition-colors",
        sizeStyles[size],
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      {children}
    </span>
  );
}
