"use client";

import * as React from "react";
import { cn } from "./button";

export interface TabItem {
  id: string;
  label: string;
  count?: number;
  icon?: React.ReactNode;
}

export interface TabsProps {
  items: TabItem[];
  activeId: string;
  onChange: (id: string) => void;
  className?: string;
  variant?: "pill" | "underline" | "editorial";
}

export function Tabs({
  items,
  activeId,
  onChange,
  className,
  variant = "pill",
}: TabsProps) {
  if (variant === "editorial") {
    return (
      <div
        className={cn(
          "flex items-center gap-1 border-b border-border-hairline overflow-x-auto no-scrollbar",
          className
        )}
      >
        {items.map((tab) => {
          const isActive = tab.id === activeId;
          return (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className={cn(
                "relative flex items-center gap-2 px-4 py-3 font-mono text-xs uppercase tracking-wider transition-all duration-200 shrink-0",
                isActive
                  ? "text-primary font-bold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-primary"
                  : "text-muted-text hover:text-foreground"
              )}
            >
              {tab.icon && <span>{tab.icon}</span>}
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span
                  className={cn(
                    "text-[10px] px-1.5 py-0.2 rounded-full font-mono",
                    isActive
                      ? "bg-primary/15 text-primary"
                      : "bg-surface text-muted-text"
                  )}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "inline-flex items-center p-1 rounded-full bg-surface border border-border-hairline shadow-editorial-sm overflow-x-auto no-scrollbar",
        className
      )}
    >
      {items.map((tab) => {
        const isActive = tab.id === activeId;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-full text-xs font-sans tracking-wide transition-all duration-200 shrink-0",
              isActive
                ? "bg-[#18181B] text-white font-semibold shadow-sm"
                : "text-muted-text hover:text-foreground hover:bg-raised/60"
            )}
          >
            {tab.icon && <span>{tab.icon}</span>}
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span
                className={cn(
                  "text-[10px] px-2 py-0.5 rounded-full font-mono",
                  isActive
                    ? "bg-white/20 text-white"
                    : "bg-muted text-muted-text"
                )}
              >
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
