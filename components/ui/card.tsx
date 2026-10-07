"use client";

import * as React from "react";
import { cn } from "./button";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "paper" | "raised" | "tile" | "striped" | "editorial-border";
  interactive?: boolean;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = "paper", interactive = false, children, ...props }, ref) => {
    const variantStyles = {
      paper: "bg-surface text-card-foreground border border-border-hairline shadow-editorial-sm",
      raised: "bg-raised text-card-foreground border border-border-hairline shadow-editorial-md",
      tile: "bg-surface text-card-foreground border-2 border-foreground/10 rounded-3xl shadow-editorial-sm",
      striped: "bg-surface bg-awning-stripes text-card-foreground border border-border-hairline shadow-editorial-sm",
      "editorial-border": "bg-surface text-card-foreground border-2 border-border-hairline relative before:absolute before:inset-1 before:border before:border-border-hairline/60 before:pointer-events-none",
    };

    return (
      <div
        ref={ref}
        className={cn(
          "rounded-3xl p-6 transition-all duration-200",
          variantStyles[variant],
          interactive && "hover:shadow-editorial-lift hover:-translate-y-0.5 cursor-pointer",
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);
Card.displayName = "Card";

export function CardHeader({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("flex flex-col space-y-1.5 pb-4", className)}
      {...props}
    />
  );
}

export function CardTitle({
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn(
        "font-serif text-xl font-bold leading-tight tracking-tight text-foreground",
        className
      )}
      {...props}
    />
  );
}

export function CardDescription({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn("text-sm text-muted-text font-sans", className)}
      {...props}
    />
  );
}

export function CardContent({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("pt-0", className)} {...props} />;
}

export function CardFooter({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("flex items-center pt-4 border-t border-border-hairline", className)}
      {...props}
    />
  );
}
