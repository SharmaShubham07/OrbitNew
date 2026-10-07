"use client";

import * as React from "react";
import { cn } from "./button";

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "rectangular" | "circular" | "text" | "card";
}

export function Skeleton({
  variant = "rectangular",
  className,
  ...props
}: SkeletonProps) {
  const variantStyles = {
    rectangular: "rounded-xl",
    circular: "rounded-full",
    text: "rounded-md h-4 my-1",
    card: "rounded-3xl p-6 border border-border-hairline space-y-4",
  };

  return (
    <div
      className={cn(
        "animate-pulse bg-muted/60 relative overflow-hidden",
        "after:absolute after:inset-0 after:-translate-x-full after:animate-shimmer after:bg-gradient-to-r after:from-transparent after:via-surface/40 after:to-transparent",
        variantStyles[variant],
        className
      )}
      {...props}
    />
  );
}

export function PostCardSkeleton() {
  return (
    <div className="rounded-3xl bg-surface border border-border-hairline p-6 shadow-editorial-sm space-y-4">
      <div className="flex items-center gap-3">
        <Skeleton variant="circular" className="w-12 h-12" />
        <div className="space-y-1.5 flex-1">
          <Skeleton variant="text" className="w-1/3 h-4" />
          <Skeleton variant="text" className="w-1/2 h-3" />
        </div>
      </div>
      <Skeleton variant="text" className="w-full h-4" />
      <Skeleton variant="text" className="w-5/6 h-4" />
      <Skeleton variant="text" className="w-2/3 h-4" />
      <Skeleton variant="rectangular" className="w-full h-48 rounded-2xl" />
      <div className="flex items-center justify-between pt-2">
        <Skeleton variant="text" className="w-1/4 h-6" />
        <Skeleton variant="text" className="w-1/4 h-6" />
      </div>
    </div>
  );
}
