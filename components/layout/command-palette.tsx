"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Sparkles,
  Compass,
  Users,
  MessageSquare,
  Bell,
  Briefcase,
  Bookmark,
  Settings,
  PlusCircle,
  FileText,
  User,
  ArrowRight,
  Palette,
} from "lucide-react";
import { useTheme } from "next-themes";
import { TemplateStudioModal } from "@/components/templates/template-studio-modal";

export function CommandPalette() {
  const [isOpen, setIsOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [isTemplateStudioOpen, setIsTemplateStudioOpen] = React.useState(false);
  const router = useRouter();
  const { setTheme } = useTheme();

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Toggle on Cmd+K or Ctrl+K
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      // Close on Esc
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  if (!isOpen) {
    return (
      <TemplateStudioModal
        isOpen={isTemplateStudioOpen}
        onClose={() => setIsTemplateStudioOpen(false)}
      />
    );
  }

  const navigationItems = [
    { label: "Main Feed", href: "/feed", icon: Compass, category: "Navigation" },
    { label: "Discover People & Domains", href: "/discover", icon: Search, category: "Navigation" },
    { label: "My Network & Connections", href: "/network", icon: Users, category: "Navigation" },
    { label: "Direct Messages", href: "/messages", icon: MessageSquare, category: "Navigation" },
    { label: "Notifications", href: "/notifications", icon: Bell, category: "Navigation" },
    { label: "Job Opportunities", href: "/jobs", icon: Briefcase, category: "Navigation" },
    { label: "Saved Bookmarks", href: "/saved", icon: Bookmark, category: "Navigation" },
    { label: "Settings & Privacy", href: "/settings", icon: Settings, category: "Navigation" },
    { label: "Design System Showcase", href: "/design", icon: Palette, category: "Navigation" },
  ];

  const actionItems = [
    {
      label: "Open Post Template Studio (16+ Templates)",
      action: () => {
        setIsOpen(false);
        setIsTemplateStudioOpen(true);
      },
      icon: Sparkles,
      category: "Actions",
    },
    {
      label: "Switch Theme: Paper (Default Light)",
      action: () => {
        setTheme("paper");
        setIsOpen(false);
      },
      icon: Palette,
      category: "Themes",
    },
    {
      label: "Switch Theme: Cobalt Coast (Bold)",
      action: () => {
        setTheme("cobalt");
        setIsOpen(false);
      },
      icon: Palette,
      category: "Themes",
    },
    {
      label: "Switch Theme: Midnight (Dark)",
      action: () => {
        setTheme("midnight");
        setIsOpen(false);
      },
      icon: Palette,
      category: "Themes",
    },
  ];

  const filteredNav = navigationItems.filter((i) =>
    i.label.toLowerCase().includes(query.toLowerCase())
  );
  const filteredActions = actionItems.filter((i) =>
    i.label.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] px-4 animate-in fade-in duration-150">
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />

        <div className="relative w-full max-w-xl rounded-3xl bg-surface border-2 border-border-hairline shadow-editorial-lift overflow-hidden z-10 flex flex-col">
          {/* Search Input Bar */}
          <div className="flex items-center px-4 py-3 border-b border-border-hairline bg-raised">
            <Search className="w-5 h-5 text-muted-text mr-3 shrink-0" />
            <input
              type="text"
              placeholder="Search Orbit commands, pages, templates (or switch themes)..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoFocus
              className="w-full bg-transparent text-sm font-sans focus:outline-none placeholder:text-muted-text text-foreground"
            />
            <kbd className="hidden sm:inline-block font-mono text-[10px] px-2 py-0.5 rounded-lg bg-surface border border-border-hairline text-muted-text">
              ESC
            </kbd>
          </div>

          {/* Results List */}
          <div className="p-3 max-h-80 overflow-y-auto space-y-3">
            {filteredActions.length > 0 && (
              <div className="space-y-1">
                <div className="px-3 py-1 text-[10px] font-mono uppercase tracking-widest text-muted-text">
                  Actions & Tools
                </div>
                {filteredActions.map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={idx}
                      onClick={item.action}
                      className="flex items-center justify-between w-full px-3 py-2 rounded-2xl text-left text-xs font-sans hover:bg-raised text-foreground group transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className="w-4 h-4 text-primary" />
                        <span className="font-medium">{item.label}</span>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-primary" />
                    </button>
                  );
                })}
              </div>
            )}

            {filteredNav.length > 0 && (
              <div className="space-y-1">
                <div className="px-3 py-1 text-[10px] font-mono uppercase tracking-widest text-muted-text">
                  Navigation
                </div>
                {filteredNav.map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={idx}
                      onClick={() => {
                        setIsOpen(false);
                        router.push(item.href);
                      }}
                      className="flex items-center justify-between w-full px-3 py-2 rounded-2xl text-left text-xs font-sans hover:bg-raised text-foreground group transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className="w-4 h-4 text-muted-text group-hover:text-foreground" />
                        <span>{item.label}</span>
                      </div>
                      <span className="font-mono text-[10px] opacity-50 group-hover:opacity-100">
                        {item.href}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}

            {filteredNav.length === 0 && filteredActions.length === 0 && (
              <div className="text-center py-6 text-xs text-muted-text font-mono">
                No matching Orbit commands or destinations.
              </div>
            )}
          </div>

          <div className="px-4 py-2 border-t border-border-hairline bg-raised/50 flex items-center justify-between text-[11px] font-mono text-muted-text">
            <span>Navigation: ↑ ↓ • Select: ENTER</span>
            <span>Shortcut: Cmd+K / Ctrl+K</span>
          </div>
        </div>
      </div>

      <TemplateStudioModal
        isOpen={isTemplateStudioOpen}
        onClose={() => setIsTemplateStudioOpen(false)}
      />
    </>
  );
}
