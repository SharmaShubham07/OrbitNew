"use client";

import * as React from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: any[]) {
  return twMerge(clsx(inputs));
}

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "editorial" | "danger";
  size?: "sm" | "md" | "lg" | "xl";
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      isLoading,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center font-medium transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2";

    const variantStyles = {
      primary:
        "bg-primary text-primary-foreground hover:brightness-110 shadow-editorial-sm rounded-2xl",
      secondary:
        "bg-secondary text-secondary-foreground hover:brightness-110 shadow-editorial-sm rounded-2xl",
      outline:
        "border border-border-hairline bg-surface text-foreground hover:bg-raised shadow-editorial-sm rounded-2xl",
      ghost:
        "text-foreground hover:bg-surface/80 rounded-2xl",
      editorial:
        "border-2 border-foreground bg-surface text-foreground font-serif tracking-tight hover:bg-raised shadow-editorial-md rounded-2xl",
      danger:
        "bg-destructive text-white hover:bg-red-700 shadow-editorial-sm rounded-2xl",
    };

    const sizeStyles = {
      sm: "text-xs px-3 py-1.5 gap-1.5 min-h-[32px]",
      md: "text-sm px-4 py-2 gap-2 min-h-[40px]",
      lg: "text-base px-5 py-2.5 gap-2.5 min-h-[44px]",
      xl: "text-lg px-6 py-3.5 gap-3 min-h-[52px]",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          baseStyles,
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        {...props}
      >
        {isLoading && (
          <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
        )}
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";
