"use client";

import Link from "next/link";
import { Sparkles, Search, Bell, Menu } from "lucide-react";
import { useSocket } from "@/components/providers/socket-provider";

export function HeaderMobile({ user }: { user?: any }) {
  const { unreadNotificationCount } = useSocket();

  return (
    <header className="md:hidden sticky top-0 left-0 right-0 h-14 bg-background/80 backdrop-blur-xl border-b border-white/10 px-4 flex items-center justify-between z-30">
      <Link href="/feed" className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center shadow-md">
          <Sparkles className="w-4 h-4 text-white" />
        </div>
        <span className="font-heading font-bold text-lg bg-gradient-to-r from-white via-slate-200 to-cyan-400 bg-clip-text text-transparent">
          Orbit
        </span>
      </Link>

      <div className="flex items-center gap-2">
        <Link
          href="/discover"
          className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors"
        >
          <Search className="w-5 h-5" />
        </Link>
        <Link
          href="/notifications"
          className="relative p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors"
        >
          <Bell className="w-5 h-5" />
          {unreadNotificationCount > 0 && (
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-500 animate-ping" />
          )}
        </Link>
      </div>
    </header>
  );
}
