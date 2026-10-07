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
  Command,
  Layout,
  Palette,
} from "lucide-react";
import { signOut } from "next-auth/react";
import { cn } from "@/components/ui/button";
import { useSocket } from "@/components/providers/socket-provider";
import { ThemeSwitcher } from "@/components/ui/theme-switcher";
import { Avatar } from "@/components/ui/avatar";

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
  const { unreadMessageCount, unreadNotificationCount } = useSocket();

  const navItems = [
    { label: "Feed", href: "/feed", icon: Home },
    {
      label: "Circles",
      href: user?.domainName
        ? `/domain/${user.domainName.toLowerCase().replace(/\s+/g, "-")}`
        : "/feed?tab=domain",
      icon: Globe2,
    },
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
    { label: "Design Lab", href: "/design", icon: Palette },
    { label: "Saved", href: "/saved", icon: Bookmark },
    { label: "Settings", href: "/settings", icon: Settings },
  ];

  return (
    <aside className="hidden md:flex flex-col justify-between w-20 xl:w-64 h-screen sticky top-0 py-6 px-3 xl:px-5 border-r border-border-hairline bg-surface z-30 transition-all duration-300">
      <div className="flex flex-col gap-6">
        {/* Orbit Brand Header */}
        <Link href="/feed" className="flex items-center gap-3 px-2 py-1 group">
          <div className="w-10 h-10 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center shadow-editorial-sm group-hover:scale-105 transition-transform">
            <Sparkles className="w-5 h-5" />
          </div>
          <div className="hidden xl:flex flex-col">
            <span className="font-serif font-black text-2xl tracking-tight text-foreground">
              Orbit
            </span>
            <span className="font-mono text-[10px] text-muted-text font-bold -mt-1 tracking-widest uppercase">
              EDITORIAL NETWORK
            </span>
          </div>
        </Link>

        {/* Cmd+K Quick Search Trigger Pill */}
        <button
          onClick={() => {
            const event = new KeyboardEvent("keydown", {
              key: "k",
              metaKey: true,
              bubbles: true,
            });
            window.dispatchEvent(event);
          }}
          className="hidden xl:flex items-center justify-between px-3 py-2 rounded-2xl bg-raised border border-border-hairline text-xs font-mono text-muted-text hover:text-foreground hover:border-primary/40 transition-all shadow-editorial-sm"
        >
          <span className="flex items-center gap-2">
            <Command className="w-3.5 h-3.5" />
            <span>Search & Jump</span>
          </span>
          <kbd className="px-1.5 py-0.5 rounded bg-surface border border-border-hairline text-[10px]">
            ⌘K
          </kbd>
        </button>

        {/* Primary Navigation Links */}
        <nav className="flex flex-col gap-1 mt-1">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/feed" && pathname.startsWith(item.href));
            const Icon = item.icon;

            return (
              <Link
                key={item.label}
                href={item.href}
                className={cn(
                  "relative flex items-center gap-3.5 px-3.5 py-2.5 rounded-2xl text-xs font-mono uppercase tracking-wider transition-all duration-200 group",
                  isActive
                    ? "bg-raised text-foreground font-bold shadow-editorial-sm border border-border-hairline"
                    : "text-muted-text hover:text-foreground hover:bg-raised/50"
                )}
              >
                <div className="relative flex items-center justify-center">
                  <Icon
                    className={cn(
                      "w-4 h-4 transition-transform group-hover:scale-110",
                      isActive ? "text-primary" : "text-muted-text group-hover:text-foreground"
                    )}
                  />
                  {item.badge !== undefined && (
                    <span className="absolute -top-1.5 -right-2 flex items-center justify-center min-w-[16px] h-[16px] px-1 text-[9px] font-bold text-white bg-primary rounded-full shadow-editorial-sm">
                      {item.badge > 9 ? "9+" : item.badge}
                    </span>
                  )}
                </div>
                <span className="hidden xl:inline-block font-sans capitalize text-sm font-medium">
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>

        {/* Post Studio CTA Button */}
        <button
          onClick={onOpenCreatePost}
          className="flex items-center justify-center gap-2 w-full py-3 px-3 rounded-2xl bg-primary text-primary-foreground text-xs font-mono font-bold shadow-editorial-sm hover:brightness-110 active:scale-98 transition-all"
        >
          <Layout className="w-4 h-4 shrink-0" />
          <span className="hidden xl:inline">Create Post</span>
        </button>
      </div>

      {/* Bottom Controls: Theme Switcher & User Profile */}
      <div className="flex flex-col gap-3 pt-4 border-t border-border-hairline">
        <div className="hidden xl:block">
          <ThemeSwitcher className="w-full justify-between" />
        </div>

        {/* User Mini Profile */}
        {user && (
          <div className="flex items-center justify-between p-2 rounded-2xl bg-raised border border-border-hairline hover:border-primary/30 transition-colors">
            <Link
              href={`/in/${user.username}`}
              className="flex items-center gap-3 min-w-0 flex-1 group"
            >
              <Avatar
                src={user.image}
                alt={user.name}
                size="sm"
                withOrbit
                status="online"
              />
              <div className="hidden xl:flex flex-col min-w-0">
                <span className="text-xs font-serif font-bold text-foreground truncate group-hover:text-primary transition-colors">
                  {user.name}
                </span>
                <span className="text-[10px] font-mono text-muted-text truncate">
                  @{user.username} {user.domainEmoji && `• ${user.domainEmoji}`}
                </span>
              </div>
            </Link>

            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="hidden xl:flex p-1.5 rounded-lg text-muted-text hover:text-destructive hover:bg-destructive/10 transition-colors"
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
