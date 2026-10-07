"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Users2, PlusCircle, MessageSquare, Bell, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSocket } from "@/components/providers/socket-provider";

interface MobileNavProps {
  user?: {
    username: string;
    image?: string | null;
  } | null;
  onOpenCreatePost?: () => void;
}

export function MobileNav({ user, onOpenCreatePost }: MobileNavProps) {
  const pathname = usePathname();
  const { unreadMessageCount, unreadNotificationCount } = useSocket();

  const navItems = [
    { label: "Feed", href: "/feed", icon: Home },
    { label: "Network", href: "/network", icon: Users2 },
    {
      label: "Create",
      href: "#",
      icon: PlusCircle,
      isAction: true,
    },
    {
      label: "Messages",
      href: "/messages",
      icon: MessageSquare,
      badge: unreadMessageCount > 0 ? unreadMessageCount : undefined,
    },
    {
      label: "Profile",
      href: user ? `/in/${user.username}` : "/login",
      icon: User,
      badge: unreadNotificationCount > 0 ? unreadNotificationCount : undefined,
    },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-background/80 backdrop-blur-xl border-t border-white/10 px-4 flex items-center justify-around z-40">
      {navItems.map((item) => {
        const isActive = item.href !== "#" && (pathname === item.href || (item.href !== "/feed" && pathname.startsWith(item.href)));
        const Icon = item.icon;

        if (item.isAction) {
          return (
            <button
              key={item.label}
              onClick={onOpenCreatePost}
              className="flex items-center justify-center -mt-5 w-12 h-12 rounded-full bg-gradient-to-tr from-cyan-500 to-indigo-600 text-white shadow-lg shadow-cyan-500/30 active:scale-95 transition-transform"
            >
              <Icon className="w-6 h-6" />
            </button>
          );
        }

        return (
          <Link
            key={item.label}
            href={item.href}
            className={cn(
              "relative flex flex-col items-center justify-center p-2 rounded-xl transition-all",
              isActive ? "text-cyan-400" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <div className="relative">
              <Icon className="w-5 h-5" />
              {item.badge !== undefined && (
                <span className="absolute -top-1 -right-1.5 flex items-center justify-center min-w-[16px] h-[16px] px-1 text-[9px] font-bold text-white bg-rose-500 rounded-full animate-pulse">
                  {item.badge > 9 ? "9+" : item.badge}
                </span>
              )}
            </div>
            <span className="text-[10px] font-medium mt-1">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
