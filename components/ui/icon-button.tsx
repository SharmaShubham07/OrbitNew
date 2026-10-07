"use client";

import * as React from "react";
import { cn } from "./button";

export interface IconButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "editorial";
  size?: "sm" | "md" | "lg";
  label: string;
}

export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ className, variant = "ghost", size = "md", label, children, ...props }, ref) => {
    const sizeMap = {
      sm: "w-8 h-8 text-xs",
      md: "w-10 h-10 text-sm",
      lg: "w-12 h-12 text-base",
    };

    const variantMap = {
      primary: "bg-primary text-primary-foreground hover:brightness-110 shadow-editorial-sm",
      secondary: "bg-secondary text-secondary-foreground hover:brightness-110",
      outline: "border border-border-hairline bg-surface text-foreground hover:bg-raised shadow-editorial-sm",
      ghost: "text-muted-text hover:text-foreground hover:bg-surface",
      editorial: "border border-foreground bg-raised text-foreground hover:bg-surface shadow-editorial-sm",
    };

    return (
      <button
        ref={ref}
        aria-label={label}
        title={label}
        className={cn(
          "inline-flex items-center justify-center rounded-2xl transition-all duration-200 active:scale-95 disabled:opacity-40 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
          sizeMap[size],
          variantMap[variant],
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);
IconButton.displayName = "IconButton";
