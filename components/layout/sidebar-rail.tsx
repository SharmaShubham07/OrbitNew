"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sparkles,
  Home,
  Globe2,
  Users2,
  MessageSquare,
  Bell,
  Briefcase,
  Compass,
  Bookmark,
  Settings,
  LogOut,
  Moon,
  Sun,
  PlusCircle,
} from "lucide-react";
import { useTheme } from "next-themes";
import { signOut } from "next-auth/react";
import { cn } from "@/lib/utils";
import { useSocket } from "@/components/providers/socket-provider";

interface SidebarRailProps {
  user?: {
    id: string;
    name: string;
    username: string;
    image?: string | null;
    headline?: string | null;
    domainEmoji?: string | null;
    domainName?: string | null;
    domainColor?: string | null;
  } | null;
  onOpenCreatePost?: () => void;
}

export function SidebarRail({ user, onOpenCreatePost }: SidebarRailProps) {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const { unreadMessageCount, unreadNotificationCount } = useSocket();

  const navItems = [
    { label: "Feed", href: "/feed", icon: Home },
    { label: "Domains", href: user?.domainName ? `/domain/${user.domainName.toLowerCase().replace(/\s+/g, "-")}` : "/feed?tab=domain", icon: Globe2 },
    { label: "Network", href: "/network", icon: Users2 },
    {
      label: "Messages",
      href: "/messages",
      icon: MessageSquare,
      badge: unreadMessageCount > 0 ? unreadMessageCount : undefined,
    },
    {
      label: "Notifications",
      href: "/notifications",
      icon: Bell,
      badge: unreadNotificationCount > 0 ? unreadNotificationCount : undefined,
    },
    { label: "Opportunities", href: "/jobs", icon: Briefcase },
    { label: "Discover", href: "/discover", icon: Compass },
    { label: "Saved", href: "/saved", icon: Bookmark },
    { label: "Settings", href: "/settings", icon: Settings },
  ];

  return (
    <aside className="hidden md:flex flex-col justify-between w-20 xl:w-64 h-screen sticky top-0 py-6 px-3 xl:px-5 border-r border-white/5 glass-panel z-30 transition-all duration-300">
      <div className="flex flex-col gap-6">
        {/* Orbit Brand Logo */}
        <Link
          href="/feed"
          className="flex items-center gap-3 px-2 py-1 group"
        >
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 via-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition-transform">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div className="hidden xl:flex flex-col">
            <span className="font-heading font-bold text-xl tracking-tight bg-gradient-to-r from-white via-slate-200 to-cyan-400 bg-clip-text text-transparent">
              Orbit
            </span>
            <span className="text-[11px] text-muted-foreground font-medium -mt-1 tracking-wider uppercase">
              Domain Network
            </span>
          </div>
        </Link>

        {/* Primary Navigation Links */}
        <nav className="flex flex-col gap-1.5 mt-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/feed" && pathname.startsWith(item.href));
            const Icon = item.icon;

            return (
              <Link
                key={item.label}
                href={item.href}
                className={cn(
                  "relative flex items-center gap-4 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group",
                  isActive
                    ? "bg-cyan-500/10 text-cyan-400 font-semibold shadow-sm border border-cyan-500/20"
                    : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                )}
              >
                <div className="relative flex items-center justify-center">
                  <Icon
                    className={cn(
                      "w-5 h-5 transition-transform group-hover:scale-110",
                      isActive ? "text-cyan-400" : "text-muted-foreground group-hover:text-foreground"
                    )}
                  />
                  {item.badge !== undefined && (
                    <span className="absolute -top-1.5 -right-1.5 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold text-white bg-rose-500 rounded-full animate-pulse shadow-md">
                      {item.badge > 9 ? "9+" : item.badge}
                    </span>
                  )}
                </div>
                <span className="hidden xl:inline-block tracking-wide">{item.label}</span>
                {isActive && (
                  <span className="hidden xl:block absolute right-2 w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#06b6d4]" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Create Post Fast CTA Button */}
        <button
          onClick={onOpenCreatePost}
          className="flex items-center justify-center gap-2.5 w-full py-3 px-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-medium shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all"
        >
          <PlusCircle className="w-5 h-5 flex-shrink-0" />
          <span className="hidden xl:inline font-heading font-semibold">Create Post</span>
        </button>
      </div>

      {/* Bottom User Profile Card & Actions */}
      <div className="flex flex-col gap-3 pt-4 border-t border-white/5">
        {/* Theme Toggle */}
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors"
          title="Toggle Theme"
        >
          {theme === "dark" ? (
            <>
              <Sun className="w-4 h-4 text-amber-400" />
              <span className="hidden xl:inline">Light Theme</span>
            </>
          ) : (
            <>
              <Moon className="w-4 h-4 text-indigo-400" />
              <span className="hidden xl:inline">Dark Theme</span>
            </>
          )}
        </button>

        {/* User Mini Profile */}
        {user && (
          <div className="flex items-center justify-between p-2 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-white/10 transition-colors">
            <Link
              href={`/in/${user.username}`}
              className="flex items-center gap-3 min-w-0 flex-1 group"
            >
              <div className="orbit-ring-container flex-shrink-0">
                <div className="orbit-ring opacity-75" />
                <img
                  src={user.image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`}
                  alt={user.name}
                  className="w-9 h-9 rounded-full object-cover border-2 border-background z-10"
                />
              </div>
              <div className="hidden xl:flex flex-col min-w-0">
                <span className="text-xs font-semibold truncate group-hover:text-cyan-400 transition-colors">
                  {user.name}
                </span>
                <span className="text-[10px] text-muted-foreground truncate">
                  @{user.username} {user.domainEmoji && `· ${user.domainEmoji}`}
                </span>
              </div>
            </Link>

            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="hidden xl:flex p-1.5 rounded-lg text-muted-foreground hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
              title="Log out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
