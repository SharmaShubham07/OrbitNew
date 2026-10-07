"use client";

import Link from "next/link";
import { Sparkles, Search, Bell } from "lucide-react";
import { useSocket } from "@/components/providers/socket-provider";
import { ThemeSwitcher } from "@/components/ui/theme-switcher";

export function HeaderMobile({ user }: { user?: any }) {
  const { unreadNotificationCount } = useSocket();

  return (
    <header className="md:hidden sticky top-0 left-0 right-0 h-14 bg-surface/90 backdrop-blur-md border-b border-border-hairline px-4 flex items-center justify-between z-30 shadow-editorial-sm">
      <Link href="/feed" className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shadow-editorial-sm">
          <Sparkles className="w-4 h-4" />
        </div>
        <span className="font-serif font-black text-xl tracking-tight text-foreground">
          Orbit
        </span>
      </Link>

      <div className="flex items-center gap-2">
        <ThemeSwitcher />
        <Link
          href="/discover"
          className="p-2 rounded-xl text-muted-text hover:text-foreground transition-colors"
          aria-label="Search"
        >
          <Search className="w-4 h-4" />
        </Link>
        <Link
          href="/notifications"
          className="relative p-2 rounded-xl text-muted-text hover:text-foreground transition-colors"
          aria-label="Notifications"
        >
          <Bell className="w-4 h-4" />
          {unreadNotificationCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-primary animate-pulse" />
          )}
        </Link>
      </div>
    </header>
  );
}
