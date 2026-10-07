"use client";

import * as React from "react";
import { cn } from "./button";

export interface SectionHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  number?: string; // e.g. "01", "02"
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}

export function SectionHeader({
  number,
  title,
  subtitle,
  action,
  className,
  ...props
}: SectionHeaderProps) {
  return (
    <div
      className={cn(
        "flex items-end justify-between pb-3 mb-4 border-b border-border-hairline",
        className
      )}
      {...props}
    >
      <div className="space-y-1">
        {number && (
          <div className="flex items-center gap-2">
            <span className="font-mono text-[11px] font-bold tracking-widest text-primary">
              {number}
            </span>
            <span className="text-[11px] font-mono text-muted-text uppercase tracking-wider">
              {"// SECTION"}
            </span>
          </div>
        )}
        <h2 className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-foreground">
          {title}
        </h2>
        {subtitle && (
          <p className="text-xs sm:text-sm text-muted-text font-sans max-w-xl">
            {subtitle}
          </p>
        )}
      </div>

      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
