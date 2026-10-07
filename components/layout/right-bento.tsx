"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Sparkles, TrendingUp, Users, ArrowUpRight, UserPlus, Check, Globe } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface RightBentoProps {
  user?: {
    id: string;
    name: string;
    username: string;
    primaryDomainId?: string | null;
    domainName?: string | null;
    domainEmoji?: string | null;
    domainColor?: string | null;
  } | null;
}

export function RightBento({ user }: RightBentoProps) {
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [pendingRequests, setPendingRequests] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSuggestions() {
      try {
        const res = await fetch("/api/connections?type=suggestions");
        if (res.ok) {
          const data = await res.json();
          setSuggestions(data.suggestions?.slice(0, 4) || []);
        }
      } catch (err) {
        console.error("Failed to load suggestions:", err);
      } finally {
        setLoading(false);
      }
    }
    loadSuggestions();
  }, []);

  const handleConnect = async (targetUserId: string, name: string) => {
    try {
      setPendingRequests((prev) => new Set(prev).add(targetUserId));
      const res = await fetch("/api/connections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetUserId }),
      });

      if (res.ok) {
        toast.success(`Connection request sent to ${name}`);
      } else {
        const err = await res.json();
        toast.error(err.error || "Failed to send request");
        setPendingRequests((prev) => {
          const next = new Set(prev);
          next.delete(targetUserId);
          return next;
        });
      }
    } catch (err) {
      toast.error("Network error");
    }
  };

  const trendingTags = [
    { tag: "DistributedSystems", count: "1.4k posts", domain: "💻 SWE" },
    { tag: "DesignSystems", count: "980 posts", domain: "🎨 Design" },
    { tag: "LLMs", count: "2.1k posts", domain: "🧠 AI" },
    { tag: "ProductDiscovery", count: "640 posts", domain: "🚀 Product" },
    { tag: "WebSockets", count: "510 posts", domain: "⚡ Realtime" },
  ];

  return (
    <aside className="hidden lg:flex flex-col gap-6 w-80 xl:w-96 py-6 px-4 h-screen sticky top-0 overflow-y-auto border-l border-white/5">
      {/* Domain Pulse Card */}
      <div className="p-5 rounded-3xl glass-panel relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-cyan-500/20 transition-all duration-500" />
        
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-cyan-400 uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Domain Pulse</span>
          </div>
          <span className="text-[11px] px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 font-medium border border-cyan-500/20">
            Live
          </span>
        </div>

        <div className="flex items-center gap-3 mb-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-cyan-500/20 to-indigo-500/20 border border-cyan-500/30 flex items-center justify-center text-xl">
            {user?.domainEmoji || "🪐"}
          </div>
          <div>
            <h3 className="font-heading font-bold text-sm text-foreground">
              {user?.domainName || "Orbit Network"}
            </h3>
            <p className="text-xs text-muted-foreground">Your primary craft circle</p>
          </div>
        </div>

        <p className="text-xs text-muted-foreground/90 leading-relaxed mb-4">
          Connect directly with engineers, designers, and architects discussing production best practices.
        </p>

        <Link
          href={user?.domainName ? `/domain/${user.domainName.toLowerCase().replace(/\s+/g, "-")}` : "/feed?tab=domain"}
          className="flex items-center justify-between w-full py-2 px-3 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-xs font-medium text-foreground transition-colors group/link"
        >
          <span>Explore domain feed & directory</span>
          <ArrowUpRight className="w-3.5 h-3.5 text-cyan-400 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 transition-transform" />
        </Link>
      </div>

      {/* Suggested Connections (Bento Widget) */}
      <div className="p-5 rounded-3xl glass-panel">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
            <Users className="w-4 h-4 text-indigo-400" />
            <span>Suggested Connections</span>
          </div>
          <Link
            href="/network"
            className="text-[11px] text-cyan-400 hover:text-cyan-300 font-medium transition-colors"
          >
            View all
          </Link>
        </div>

        {loading ? (
          <div className="flex flex-col gap-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3 animate-pulse">
                <div className="w-9 h-9 rounded-full bg-white/5" />
                <div className="flex-1">
                  <div className="w-24 h-3 bg-white/5 rounded mb-1.5" />
                  <div className="w-32 h-2.5 bg-white/5 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : suggestions.length > 0 ? (
          <div className="flex flex-col gap-3.5">
            {suggestions.map(({ user: candidate, sameDomain, sharedSkillsCount }) => {
              const isSent = pendingRequests.has(candidate.id);

              return (
                <div
                  key={candidate.id}
                  className="flex items-center justify-between gap-3 p-2 rounded-2xl hover:bg-white/[0.03] transition-colors"
                >
                  <Link
                    href={`/in/${candidate.username}`}
                    className="flex items-center gap-2.5 min-w-0 flex-1 group"
                  >
                    <div className="orbit-ring-container flex-shrink-0">
                      <div className="orbit-ring opacity-60" />
                      <img
                        src={candidate.image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${candidate.username}`}
                        alt={candidate.name}
                        className="w-9 h-9 rounded-full object-cover border border-background z-10"
                      />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-xs font-semibold truncate group-hover:text-cyan-400 transition-colors">
                        {candidate.name}
                      </span>
                      <span className="text-[11px] text-muted-foreground truncate">
                        {candidate.headline || `@${candidate.username}`}
                      </span>
                      {sameDomain && (
                        <span className="text-[10px] text-cyan-400/90 font-medium mt-0.5">
                          Same domain · {candidate.primaryDomain?.emoji}
                        </span>
                      )}
                    </div>
                  </Link>

                  <button
                    onClick={() => handleConnect(candidate.id, candidate.name)}
                    disabled={isSent}
                    className={cn(
                      "p-1.5 rounded-xl text-xs font-medium flex items-center justify-center transition-all",
                      isSent
                        ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                        : "bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/20 active:scale-95"
                    )}
                    title={isSent ? "Request Sent" : "Connect"}
                  >
                    {isSent ? <Check className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
                  </button>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">You are connected with everyone in your area!</p>
        )}
      </div>

      {/* Trending Orbit Circles */}
      <div className="p-5 rounded-3xl glass-panel">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
            <TrendingUp className="w-4 h-4 text-rose-400" />
            <span>Trending in Orbit</span>
          </div>
        </div>

        <div className="flex flex-col gap-2.5">
          {trendingTags.map((t) => (
            <Link
              key={t.tag}
              href={`/feed?tag=${t.tag}`}
              className="flex items-center justify-between p-2 rounded-xl hover:bg-white/[0.04] transition-colors group"
            >
              <div className="flex flex-col">
                <span className="text-xs font-medium text-foreground group-hover:text-cyan-400 transition-colors">
                  #{t.tag}
                </span>
                <span className="text-[10px] text-muted-foreground">{t.count}</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-lg bg-white/[0.04] text-muted-foreground border border-white/5">
                {t.domain}
              </span>
            </Link>
          ))}
        </div>
      </div>

      {/* Footer Info */}
      <div className="px-2 text-[11px] text-muted-foreground/60 flex flex-wrap gap-x-3 gap-y-1">
        <span>Orbit © 2026</span>
        <Link href="/about" className="hover:underline">About</Link>
        <Link href="/privacy" className="hover:underline">Privacy</Link>
        <Link href="/terms" className="hover:underline">Terms</Link>
        <span>Domain-First Architecture</span>
      </div>
    </aside>
  );
}
