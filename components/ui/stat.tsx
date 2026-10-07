"use client";

import * as React from "react";
import { cn } from "./button";

export interface StatProps extends React.HTMLAttributes<HTMLDivElement> {
  label: string;
  value: string | number;
  change?: string;
  isPositive?: boolean;
  prefix?: string;
  suffix?: string;
}

export function Stat({
  label,
  value,
  change,
  isPositive,
  prefix,
  suffix,
  className,
  ...props
}: StatProps) {
  return (
    <div
      className={cn(
        "p-4 rounded-2xl bg-surface border border-border-hairline shadow-editorial-sm space-y-1",
        className
      )}
      {...props}
    >
      <div className="font-mono text-[10px] uppercase tracking-widest text-muted-text">
        {label}
      </div>
      <div className="flex items-baseline gap-1">
        {prefix && (
          <span className="font-serif text-lg text-muted-text">{prefix}</span>
        )}
        <div className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
          {value}
        </div>
        {suffix && (
          <span className="font-sans text-xs text-muted-text">{suffix}</span>
        )}
      </div>
      {change && (
        <div
          className={cn(
            "text-[11px] font-mono",
            isPositive ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"
          )}
        >
          {change}
        </div>
      )}
    </div>
  );
}
