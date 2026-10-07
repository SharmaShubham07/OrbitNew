"use client";

import * as React from "react";
import { cn } from "./button";

export interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
  ...props
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center p-8 sm:p-12 rounded-3xl bg-surface/60 border border-dashed border-border-hairline",
        className
      )}
      {...props}
    >
      {icon && (
        <div className="w-14 h-14 rounded-2xl bg-raised border border-border-hairline flex items-center justify-center text-primary mb-4 shadow-editorial-sm">
          {icon}
        </div>
      )}
      <h3 className="font-serif text-lg font-bold text-foreground mb-1">
        {title}
      </h3>
      <p className="text-xs sm:text-sm text-muted-text max-w-sm mb-6">
        {description}
      </p>
      {action && <div>{action}</div>}
    </div>
  );
}
