"use client";

import React from "react";
import { useTheme } from "next-themes";
import { Sparkles, Sun, Moon } from "lucide-react";

export function ThemeSwitcher({ className = "" }: { className?: string }) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className={`flex items-center gap-1 p-1 rounded-full bg-surface border border-border-hairline ${className}`}>
        <div className="w-7 h-7 rounded-full bg-muted animate-pulse" />
      </div>
    );
  }

  const themes = [
    {
      id: "paper",
      name: "Paper",
      icon: Sun,
      color: "bg-[#B5552F]",
      desc: "Warm Editorial Light",
    },
    {
      id: "cobalt",
      name: "Cobalt",
      icon: Sparkles,
      color: "bg-[#1F4BD8]",
      desc: "Bold Electric Grid",
    },
    {
      id: "midnight",
      name: "Midnight",
      icon: Moon,
      color: "bg-[#E8A94A]",
      desc: "Refined Dark Slate",
    },
  ];

  return (
    <div
      className={`inline-flex items-center p-1 rounded-2xl bg-surface border border-border-hairline shadow-editorial-sm ${className}`}
      role="radiogroup"
      aria-label="Select Theme"
    >
      {themes.map((t) => {
        const Icon = t.icon;
        const isActive = theme === t.id;
        return (
          <button
            key={t.id}
            type="button"
            onClick={() => setTheme(t.id)}
            className={`relative flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono tracking-wider rounded-xl transition-all duration-200 ${
              isActive
                ? "bg-raised text-foreground font-semibold shadow-editorial-sm border border-border-hairline"
                : "text-muted-text hover:text-foreground hover:bg-raised/50"
            }`}
            title={t.desc}
            aria-checked={isActive}
            role="radio"
          >
            <span className={`w-2 h-2 rounded-full ${t.color}`} />
            <span className="hidden sm:inline uppercase">{t.name}</span>
            <Icon className="w-3.5 h-3.5 sm:hidden" />
          </button>
        );
      })}
    </div>
  );
}
