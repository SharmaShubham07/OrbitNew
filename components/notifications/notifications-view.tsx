"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { formatTimeAgo } from "@/lib/utils";
import { useSocket } from "@/components/providers/socket-provider";
import {
  Bell,
  Heart,
  MessageSquare,
  UserPlus,
  CheckCheck,
  Sparkles,
  Loader2,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export function NotificationsView() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { setUnreadNotificationCount } = useSocket();

  const loadNotifications = async () => {
    try {
      const res = await fetch("/api/notifications");
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
        setUnreadNotificationCount(data.unreadCount || 0);
      }
    } catch (err) {
      console.error("Notifications fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const handleMarkAllRead = async () => {
    try {
      const res = await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      if (res.ok) {
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
        setUnreadNotificationCount(0);
        toast.success("All notifications marked as read");
      }
    } catch (err) {
      toast.error("Failed to update notifications");
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "LIKE":
        return <Heart className="w-4 h-4 text-rose-400" />;
      case "COMMENT":
        return <MessageSquare className="w-4 h-4 text-cyan-400" />;
      case "CONNECT_REQUEST":
      case "CONNECT_ACCEPT":
        return <UserPlus className="w-4 h-4 text-indigo-400" />;
      default:
        return <Sparkles className="w-4 h-4 text-amber-400" />;
    }
  };

  return (
    <div className="flex-1 max-w-3xl mx-auto py-6 px-4 flex flex-col gap-6 pb-24">
      {/* Header */}
      <div className="p-5 rounded-3xl glass-panel flex items-center justify-between">
        <div>
          <h1 className="font-heading font-bold text-xl text-foreground flex items-center gap-2">
            <Bell className="w-5 h-5 text-cyan-400" />
            <span>Activity Notifications</span>
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Stay updated with reactions, comments, and connection requests.
          </p>
        </div>

        <button
          onClick={handleMarkAllRead}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-xs font-semibold text-cyan-300 border border-white/10 transition-colors"
        >
          <CheckCheck className="w-4 h-4" />
          <span>Mark all read</span>
        </button>
      </div>

      {/* Notifications List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-6 h-6 text-cyan-400 animate-spin" />
        </div>
      ) : notifications.length === 0 ? (
        <div className="p-12 rounded-3xl glass-panel text-center flex flex-col items-center justify-center gap-3">
          <Bell className="w-12 h-12 text-muted-foreground/40" />
          <h3 className="font-heading font-bold text-base text-foreground">
            You are all caught up!
          </h3>
          <p className="text-xs text-muted-foreground max-w-sm">
            When peers react to your posts, comment on your code, or send connection requests, they will show up here.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {notifications.map((n) => (
            <Link
              key={n.id}
              href={n.link || "/feed"}
              className={cn(
                "p-4 rounded-3xl glass-panel flex items-start gap-3.5 border transition-all hover:border-white/20 group",
                !n.isRead ? "border-cyan-500/30 bg-cyan-500/[0.03]" : "border-white/5"
              )}
            >
              <div className="relative">
                <img
                  src={
                    n.actor?.image ||
                    `https://api.dicebear.com/7.x/avataaars/svg?seed=${n.actor?.username || "user"}`
                  }
                  alt={n.actor?.name}
                  className="w-11 h-11 rounded-full object-cover border border-white/10"
                />
                <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-background border border-white/10 flex items-center justify-center">
                  {getIcon(n.type)}
                </div>
              </div>

              <div className="flex-1 flex flex-col min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-heading font-bold text-xs text-foreground group-hover:text-cyan-400 transition-colors">
                    {n.title}
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    {formatTimeAgo(n.createdAt)}
                  </span>
                </div>
                <p className="text-xs text-foreground/80 leading-relaxed line-clamp-2">
                  {n.message}
                </p>
              </div>

              {!n.isRead && (
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#06b6d4] mt-2 flex-shrink-0" />
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
