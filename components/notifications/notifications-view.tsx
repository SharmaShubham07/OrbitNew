"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { formatTimeAgo, formatDate } from "@/lib/utils";
import { useSocket } from "@/components/providers/socket-provider";
import {
  Bell,
  Heart,
  MessageSquare,
  UserPlus,
  CheckCheck,
  Sparkles,
  Loader2,
  Check,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { SectionHeader } from "@/components/ui/section-header";
import { EmptyState } from "@/components/ui/empty-state";

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

  const handleConnectionAction = async (
    connectionId: string,
    action: "ACCEPT" | "DECLINE",
    e: React.MouseEvent
  ) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const res = await fetch(`/api/connections/${connectionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: action === "ACCEPT" ? "ACCEPTED" : "DECLINED" }),
      });

      if (res.ok) {
        toast.success(action === "ACCEPT" ? "Connection accepted!" : "Request declined");
        loadNotifications();
      } else {
        toast.error("Action failed");
      }
    } catch (err) {
      toast.error("Error processing request");
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "LIKE":
        return <Heart className="w-3.5 h-3.5 text-rose-500 fill-current" />;
      case "COMMENT":
        return <MessageSquare className="w-3.5 h-3.5 text-primary" />;
      case "CONNECT_REQUEST":
      case "CONNECT_ACCEPT":
        return <UserPlus className="w-3.5 h-3.5 text-secondary" />;
      default:
        return <Sparkles className="w-3.5 h-3.5 text-accent" />;
    }
  };

  // Group notifications by date: Today, Yesterday, Earlier
  const groupNotifications = () => {
    const today: any[] = [];
    const yesterday: any[] = [];
    const earlier: any[] = [];

    const now = new Date();
    const todayStr = now.toDateString();
    const yesterdayDate = new Date(now);
    yesterdayDate.setDate(now.getDate() - 1);
    const yesterdayStr = yesterdayDate.toDateString();

    notifications.forEach((n) => {
      const itemDate = new Date(n.createdAt).toDateString();
      if (itemDate === todayStr) {
        today.push(n);
      } else if (itemDate === yesterdayStr) {
        yesterday.push(n);
      } else {
        earlier.push(n);
      }
    });

    return { today, yesterday, earlier };
  };

  const { today, yesterday, earlier } = groupNotifications();

  return (
    <div className="flex-1 max-w-3xl mx-auto py-6 px-4 flex flex-col gap-6 pb-24">
      {/* Header Card */}
      <div className="p-6 rounded-3xl bg-surface border border-border-hairline shadow-editorial-sm flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="font-serif font-bold text-2xl text-foreground flex items-center gap-2">
            <Bell className="w-5 h-5 text-primary" />
            <span>Activity & Notices</span>
          </h1>
          <p className="text-xs text-muted-text font-sans">
            Reactions, circle comments, and peer connection updates.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={handleMarkAllRead}
          className="font-mono text-xs font-bold gap-1.5"
        >
          <CheckCheck className="w-4 h-4" />
          <span>Mark All Read</span>
        </Button>
      </div>

      {/* Notifications Grouped List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-6 h-6 text-primary animate-spin" />
        </div>
      ) : notifications.length === 0 ? (
        <EmptyState
          icon={<Bell className="w-7 h-7" />}
          title="You are all caught up"
          description="When peers react to your articles, comment on your designs, or request to connect, they will appear here."
        />
      ) : (
        <div className="space-y-6">
          {/* Today Group */}
          {today.length > 0 && (
            <div className="space-y-3">
              <span className="font-mono text-xs uppercase font-bold text-primary tracking-widest px-2">
                01 // TODAY
              </span>
              <div className="space-y-2.5">
                {today.map((n) => renderNotificationCard(n, getIcon, handleConnectionAction))}
              </div>
            </div>
          )}

          {/* Yesterday Group */}
          {yesterday.length > 0 && (
            <div className="space-y-3">
              <span className="font-mono text-xs uppercase font-bold text-muted-text tracking-widest px-2">
                02 // YESTERDAY
              </span>
              <div className="space-y-2.5">
                {yesterday.map((n) => renderNotificationCard(n, getIcon, handleConnectionAction))}
              </div>
            </div>
          )}

          {/* Earlier Group */}
          {earlier.length > 0 && (
            <div className="space-y-3">
              <span className="font-mono text-xs uppercase font-bold text-muted-text tracking-widest px-2">
                03 // EARLIER
              </span>
              <div className="space-y-2.5">
                {earlier.map((n) => renderNotificationCard(n, getIcon, handleConnectionAction))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function renderNotificationCard(
  n: any,
  getIcon: (type: string) => React.ReactNode,
  handleConnectionAction: any
) {
  return (
    <Link
      key={n.id}
      href={n.link || "/feed"}
      className={`p-4 rounded-3xl bg-surface border transition-all duration-200 hover:shadow-editorial-md flex items-start gap-3.5 group ${
        !n.isRead
          ? "border-primary/40 bg-raised shadow-editorial-sm"
          : "border-border-hairline"
      }`}
    >
      <div className="relative shrink-0">
        <Avatar
          src={n.actor?.image}
          alt={n.actor?.name || "Member"}
          size="md"
        />
        <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-surface border border-border-hairline flex items-center justify-center shadow-editorial-sm">
          {getIcon(n.type)}
        </div>
      </div>

      <div className="flex-1 flex flex-col min-w-0 space-y-1">
        <div className="flex items-center justify-between">
          <span className="font-serif font-bold text-sm text-foreground group-hover:text-primary transition-colors">
            {n.title}
          </span>
          <span className="font-mono text-[10px] text-muted-text">
            {formatTimeAgo(n.createdAt)}
          </span>
        </div>
        <p className="text-xs text-foreground/80 font-sans leading-relaxed line-clamp-2">
          {n.message}
        </p>

        {/* Inline Quick Actions for Connection Requests */}
        {n.type === "CONNECT_REQUEST" && (
          <div className="flex items-center gap-2 pt-2">
            <button
              onClick={(e) => handleConnectionAction(n.id, "ACCEPT", e)}
              className="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-primary text-primary-foreground font-mono text-[11px] font-bold shadow-editorial-sm hover:brightness-110"
            >
              <Check className="w-3 h-3" />
              <span>Accept</span>
            </button>
            <button
              onClick={(e) => handleConnectionAction(n.id, "DECLINE", e)}
              className="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-raised border border-border-hairline text-muted-text hover:text-foreground font-mono text-[11px]"
            >
              <X className="w-3 h-3" />
              <span>Ignore</span>
            </button>
          </div>
        )}
      </div>

      {!n.isRead && (
        <span className="w-2 h-2 rounded-full bg-primary mt-2 shrink-0 animate-pulse" />
      )}
    </Link>
  );
}
