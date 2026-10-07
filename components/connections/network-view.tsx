"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSocket } from "@/components/providers/socket-provider";
import {
  Users,
  UserCheck,
  Clock,
  Sparkles,
  MessageSquare,
  Check,
  X,
  UserPlus,
  Trash2,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface NetworkViewProps {
  currentUser?: any;
}

export function NetworkView({ currentUser }: NetworkViewProps) {
  const [activeTab, setActiveTab] = useState<"connections" | "pending" | "suggestions">("connections");
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const { openChatWithUser } = useSocket();

  const loadNetworkData = async () => {
    try {
      const res = await fetch("/api/connections");
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (err) {
      console.error("Network data fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNetworkData();
  }, []);

  const handleConnectionAction = async (id: string, action: "ACCEPT" | "DECLINE" | "WITHDRAW") => {
    setActionLoading(id);
    try {
      const res = await fetch(`/api/connections/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });

      if (res.ok) {
        toast.success(`Connection ${action.toLowerCase()}ed`);
        loadNetworkData();
      } else {
        const err = await res.json();
        toast.error(err.error || "Action failed");
      }
    } catch (err) {
      toast.error("Error updating connection");
    } finally {
      setActionLoading(null);
    }
  };

  const handleRemoveConnection = async (connectionId: string, name: string) => {
    if (!confirm(`Are you sure you want to remove ${name} from your connections?`)) return;

    setActionLoading(connectionId);
    try {
      const res = await fetch(`/api/connections/${connectionId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        toast.success("Connection removed");
        loadNetworkData();
      } else {
        toast.error("Failed to remove connection");
      }
    } catch (err) {
      toast.error("Delete error");
    } finally {
      setActionLoading(null);
    }
  };

  const handleSendConnect = async (targetUserId: string, name: string) => {
    setActionLoading(targetUserId);
    try {
      const res = await fetch("/api/connections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetUserId }),
      });

      if (res.ok) {
        toast.success(`Request sent to ${name}`);
        loadNetworkData();
      } else {
        const err = await res.json();
        toast.error(err.error || "Failed to send request");
      }
    } catch (err) {
      toast.error("Send error");
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 max-w-4xl mx-auto py-8 px-4 animate-pulse flex flex-col gap-6">
        <div className="h-12 w-80 bg-white/5 rounded-2xl" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-36 rounded-3xl bg-white/5" />
          ))}
        </div>
      </div>
    );
  }

  const incomingCount = data?.incomingPending?.length || 0;
  const outgoingCount = data?.outgoingPending?.length || 0;
  const totalPending = incomingCount + outgoingCount;

  return (
    <div className="flex-1 max-w-4xl mx-auto py-6 px-4 flex flex-col gap-6 pb-24">
      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-3xl glass-panel">
        <div>
          <h1 className="font-heading font-bold text-xl text-foreground flex items-center gap-2">
            <Users className="w-5 h-5 text-cyan-400" />
            <span>Orbit Network</span>
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Manage your verified craft connections and peer circles.
          </p>
        </div>

        <div className="flex items-center gap-1.5 bg-white/[0.04] p-1 rounded-2xl border border-white/5">
          <button
            onClick={() => setActiveTab("connections")}
            className={cn(
              "px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all",
              activeTab === "connections"
                ? "bg-cyan-500 text-black font-bold shadow-md"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            My Connections ({data?.totalConnections || 0})
          </button>
          <button
            onClick={() => setActiveTab("pending")}
            className={cn(
              "relative px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all",
              activeTab === "pending"
                ? "bg-cyan-500 text-black font-bold shadow-md"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <span>Pending ({totalPending})</span>
            {incomingCount > 0 && (
              <span className="ml-1 px-1.5 py-0.2 bg-rose-500 text-white rounded-full text-[10px] font-bold animate-pulse">
                {incomingCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab("suggestions")}
            className={cn(
              "px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all",
              activeTab === "suggestions"
                ? "bg-cyan-500 text-black font-bold shadow-md"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            Discover People
          </button>
        </div>
      </div>

      {/* Pending Requests Tab */}
      {activeTab === "pending" && (
        <div className="flex flex-col gap-6">
          {/* Incoming */}
          <div className="flex flex-col gap-3">
            <h3 className="font-heading font-bold text-sm text-foreground px-1">
              Received Requests ({incomingCount})
            </h3>
            {incomingCount === 0 ? (
              <p className="text-xs text-muted-foreground p-4 rounded-2xl glass-panel text-center">
                No pending requests waiting for your response.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {data.incomingPending.map((req: any) => (
                  <div
                    key={req.id}
                    className="p-4 rounded-3xl glass-panel flex flex-col justify-between gap-3 border border-white/10"
                  >
                    <Link
                      href={`/in/${req.user.username}`}
                      className="flex items-center gap-3 group"
                    >
                      <div className="orbit-ring-container flex-shrink-0">
                        <div className="orbit-ring opacity-75" />
                        <img
                          src={req.user.image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${req.user.username}`}
                          alt={req.user.name}
                          className="w-11 h-11 rounded-full object-cover border-2 border-background z-10"
                        />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-xs font-bold text-foreground group-hover:text-cyan-400 transition-colors truncate">
                          {req.user.name}
                        </span>
                        <span className="text-[11px] text-muted-foreground truncate">
                          {req.user.headline || `@${req.user.username}`}
                        </span>
                        {req.user.primaryDomain && (
                          <span className="text-[10px] text-cyan-400 font-medium mt-0.5">
                            {req.user.primaryDomain.emoji} {req.user.primaryDomain.name}
                          </span>
                        )}
                      </div>
                    </Link>

                    <div className="flex items-center gap-2 pt-2 border-t border-white/5">
                      <button
                        onClick={() => handleConnectionAction(req.id, "ACCEPT")}
                        disabled={actionLoading === req.id}
                        className="flex-1 flex items-center justify-center gap-1 py-1.5 px-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-bold transition-all active:scale-95"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Accept</span>
                      </button>
                      <button
                        onClick={() => handleConnectionAction(req.id, "DECLINE")}
                        disabled={actionLoading === req.id}
                        className="py-1.5 px-3 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-muted-foreground hover:text-foreground text-xs font-medium transition-colors"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Outgoing */}
          <div className="flex flex-col gap-3">
            <h3 className="font-heading font-bold text-sm text-foreground px-1">
              Sent Requests ({outgoingCount})
            </h3>
            {outgoingCount === 0 ? (
              <p className="text-xs text-muted-foreground p-4 rounded-2xl glass-panel text-center">
                No active outgoing invitations.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {data.outgoingPending.map((req: any) => (
                  <div
                    key={req.id}
                    className="p-4 rounded-3xl glass-panel flex items-center justify-between gap-3 border border-white/10"
                  >
                    <Link
                      href={`/in/${req.user.username}`}
                      className="flex items-center gap-3 min-w-0 flex-1 group"
                    >
                      <img
                        src={req.user.image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${req.user.username}`}
                        alt={req.user.name}
                        className="w-10 h-10 rounded-full object-cover border border-white/10"
                      />
                      <div className="flex flex-col min-w-0">
                        <span className="text-xs font-bold text-foreground group-hover:text-cyan-400 truncate">
                          {req.user.name}
                        </span>
                        <span className="text-[11px] text-muted-foreground truncate">
                          {req.user.headline || `@${req.user.username}`}
                        </span>
                      </div>
                    </Link>

                    <button
                      onClick={() => handleConnectionAction(req.id, "WITHDRAW")}
                      disabled={actionLoading === req.id}
                      className="px-3 py-1 rounded-xl text-xs text-rose-400 hover:bg-rose-500/10 border border-rose-500/20 font-medium transition-colors"
                    >
                      Withdraw
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Active Connections List */}
      {activeTab === "connections" && (
        <div className="flex flex-col gap-4">
          {data?.connections?.length === 0 ? (
            <div className="p-12 rounded-3xl glass-panel text-center flex flex-col items-center justify-center gap-3">
              <Users className="w-12 h-12 text-muted-foreground" />
              <h3 className="font-heading font-bold text-base text-foreground">
                No active connections yet
              </h3>
              <p className="text-xs text-muted-foreground max-w-sm">
                Grow your network by connecting with colleagues and peers in your domain.
              </p>
              <button
                onClick={() => setActiveTab("suggestions")}
                className="mt-2 px-5 py-2.5 rounded-2xl bg-cyan-500 text-black text-xs font-bold"
              >
                Browse Suggestions
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {data.connections.map(({ connectionId, user }: any) => (
                <div
                  key={connectionId}
                  className="p-5 rounded-3xl glass-panel flex flex-col justify-between gap-4 border border-white/10 hover:border-white/20 transition-all"
                >
                  <div className="flex items-start gap-3.5">
                    <Link href={`/in/${user.username}`} className="orbit-ring-container flex-shrink-0">
                      <div className="orbit-ring opacity-80" />
                      <img
                        src={user.image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`}
                        alt={user.name}
                        className="w-12 h-12 rounded-full object-cover border-2 border-background z-10"
                      />
                    </Link>

                    <div className="flex flex-col min-w-0 flex-1">
                      <Link
                        href={`/in/${user.username}`}
                        className="font-heading font-bold text-sm text-foreground hover:text-cyan-400 transition-colors truncate"
                      >
                        {user.name}
                      </Link>
                      <span className="text-xs text-muted-foreground truncate">
                        {user.headline || `@${user.username}`}
                      </span>
                      {user.primaryDomain && (
                        <span className="text-[11px] text-cyan-400 font-medium mt-1">
                          {user.primaryDomain.emoji} {user.primaryDomain.name}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-3 border-t border-white/5">
                    <button
                      onClick={() => openChatWithUser(user)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/20 text-xs font-semibold transition-all active:scale-95"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Message</span>
                    </button>
                    <button
                      onClick={() => handleRemoveConnection(connectionId, user.name)}
                      disabled={actionLoading === connectionId}
                      className="p-2 rounded-xl text-muted-foreground hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                      title="Remove connection"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Suggestions / Discover Tab */}
      {activeTab === "suggestions" && (
        <div className="flex flex-col gap-6">
          {/* Domain Specific */}
          <div className="flex flex-col gap-3">
            <h3 className="font-heading font-bold text-sm text-foreground px-1 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>People in Your Primary Domain</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {data.domainSuggestions?.map(({ user, sharedSkillsCount }: any) => (
                <div
                  key={user.id}
                  className="p-5 rounded-3xl glass-panel flex flex-col justify-between gap-4 border border-white/10"
                >
                  <div className="flex flex-col items-center text-center gap-2">
                    <Link href={`/in/${user.username}`} className="orbit-ring-container">
                      <div className="orbit-ring opacity-80" />
                      <img
                        src={user.image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`}
                        alt={user.name}
                        className="w-14 h-14 rounded-full object-cover border-2 border-background z-10"
                      />
                    </Link>

                    <Link
                      href={`/in/${user.username}`}
                      className="font-heading font-bold text-sm text-foreground hover:text-cyan-400 transition-colors"
                    >
                      {user.name}
                    </Link>
                    <p className="text-[11px] text-muted-foreground line-clamp-2">
                      {user.headline || `@${user.username}`}
                    </p>
                    {user.primaryDomain && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 font-medium">
                        {user.primaryDomain.emoji} {user.primaryDomain.name}
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => handleSendConnect(user.id, user.name)}
                    disabled={actionLoading === user.id}
                    className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-cyan-500/20 active:scale-95 transition-all"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Connect</span>
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* All Suggestions */}
          <div className="flex flex-col gap-3">
            <h3 className="font-heading font-bold text-sm text-foreground px-1">
              People You May Know (Cross-Domain)
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {data.suggestions?.map(({ user, sharedSkillsCount }: any) => (
                <div
                  key={user.id}
                  className="p-5 rounded-3xl glass-panel flex flex-col justify-between gap-4 border border-white/10"
                >
                  <div className="flex flex-col items-center text-center gap-2">
                    <Link href={`/in/${user.username}`} className="orbit-ring-container">
                      <div className="orbit-ring opacity-75" />
                      <img
                        src={user.image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`}
                        alt={user.name}
                        className="w-14 h-14 rounded-full object-cover border-2 border-background z-10"
                      />
                    </Link>

                    <Link
                      href={`/in/${user.username}`}
                      className="font-heading font-bold text-sm text-foreground hover:text-cyan-400 transition-colors"
                    >
                      {user.name}
                    </Link>
                    <p className="text-[11px] text-muted-foreground line-clamp-2">
                      {user.headline || `@${user.username}`}
                    </p>
                    {user.primaryDomain && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/[0.04] text-muted-foreground">
                        {user.primaryDomain.emoji} {user.primaryDomain.name}
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => handleSendConnect(user.id, user.name)}
                    disabled={actionLoading === user.id}
                    className="w-full py-2 px-3 rounded-xl bg-white/[0.08] hover:bg-white/[0.14] text-foreground text-xs font-semibold flex items-center justify-center gap-1.5 border border-white/10 transition-colors"
                  >
                    <UserPlus className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Connect</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
