"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Sparkles, TrendingUp, Users, ArrowUpRight, UserPlus, Check, Globe } from "lucide-react";
import { cn } from "@/components/ui/button";
import { toast } from "sonner";
import { Avatar } from "@/components/ui/avatar";

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
    <aside className="hidden lg:flex flex-col gap-6 w-80 xl:w-96 py-6 px-4 h-screen sticky top-0 overflow-y-auto border-l border-border-hairline bg-surface/40">
      {/* 01 // Domain Pulse Card */}
      <div className="p-6 rounded-3xl bg-surface border border-border-hairline shadow-editorial-sm space-y-3 relative group">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-primary tracking-widest">
              01
            </span>
            <span className="font-mono text-[10px] text-muted-text uppercase tracking-wider">
              {"// DOMAIN PULSE"}
            </span>
          </div>
          <span className="font-mono text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-bold">
            LIVE CIRCLE
          </span>
        </div>

        <div className="flex items-center gap-3 pt-1">
          <div className="w-12 h-12 rounded-2xl bg-raised border border-border-hairline flex items-center justify-center text-2xl shadow-editorial-sm">
            {user?.domainEmoji || "🪐"}
          </div>
          <div>
            <h3 className="font-serif font-bold text-base text-foreground">
              {user?.domainName || "Software Engineering"}
            </h3>
            <p className="text-xs text-muted-text font-sans">
              Active domain community
            </p>
          </div>
        </div>

        <p className="text-xs text-muted-text font-sans leading-relaxed">
          High-signal discussions with architects, designers, and domain specialists.
        </p>

        <Link
          href={
            user?.domainName
              ? `/domain/${user.domainName.toLowerCase().replace(/\s+/g, "-")}`
              : "/feed?tab=domain"
          }
          className="flex items-center justify-between w-full py-2 px-3 rounded-2xl bg-raised hover:bg-surface border border-border-hairline text-xs font-mono font-bold text-foreground transition-colors group/link"
        >
          <span>Circle Feed & Members</span>
          <ArrowUpRight className="w-3.5 h-3.5 text-primary group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 transition-transform" />
        </Link>
      </div>

      {/* 02 // Suggested Connections */}
      <div className="p-6 rounded-3xl bg-surface border border-border-hairline shadow-editorial-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-primary tracking-widest">
              02
            </span>
            <span className="font-mono text-[10px] text-muted-text uppercase tracking-wider">
              {"// SUGGESTED PEERS"}
            </span>
          </div>
          <Link
            href="/network"
            className="text-[11px] font-mono font-bold text-primary hover:underline"
          >
            ALL →
          </Link>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3 animate-pulse">
                <div className="w-9 h-9 rounded-full bg-muted" />
                <div className="flex-1 space-y-1">
                  <div className="w-24 h-3 bg-muted rounded" />
                  <div className="w-32 h-2.5 bg-muted rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : suggestions.length > 0 ? (
          <div className="space-y-3">
            {suggestions.map(({ user: candidate, sameDomain }) => {
              const isSent = pendingRequests.has(candidate.id);

              return (
                <div
                  key={candidate.id}
                  className="flex items-center justify-between gap-3 p-2 rounded-2xl hover:bg-raised transition-colors"
                >
                  <Link
                    href={`/in/${candidate.username}`}
                    className="flex items-center gap-2.5 min-w-0 flex-1 group"
                  >
                    <Avatar
                      src={candidate.image}
                      alt={candidate.name}
                      size="sm"
                      withOrbit
                    />
                    <div className="flex flex-col min-w-0">
                      <span className="text-xs font-serif font-bold text-foreground truncate group-hover:text-primary transition-colors">
                        {candidate.name}
                      </span>
                      <span className="text-[11px] text-muted-text truncate font-sans">
                        {candidate.headline || `@${candidate.username}`}
                      </span>
                      {sameDomain && (
                        <span className="text-[10px] font-mono text-primary font-bold mt-0.5">
                          Same domain circle
                        </span>
                      )}
                    </div>
                  </Link>

                  <button
                    onClick={() => handleConnect(candidate.id, candidate.name)}
                    disabled={isSent}
                    className={cn(
                      "p-2 rounded-xl text-xs font-mono font-bold flex items-center justify-center transition-all shadow-editorial-sm",
                      isSent
                        ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                        : "bg-raised hover:bg-surface text-foreground border border-border-hairline active:scale-95"
                    )}
                    title={isSent ? "Request Sent" : "Connect"}
                  >
                    {isSent ? <Check className="w-3.5 h-3.5" /> : <UserPlus className="w-3.5 h-3.5 text-primary" />}
                  </button>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-xs text-muted-text font-sans">
            You are connected with active members in your circle!
          </p>
        )}
      </div>

      {/* 03 // Trending Topics */}
      <div className="p-6 rounded-3xl bg-surface border border-border-hairline shadow-editorial-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-primary tracking-widest">
              03
            </span>
            <span className="font-mono text-[10px] text-muted-text uppercase tracking-wider">
              {"// TRENDING DISCUSSIONS"}
            </span>
          </div>
        </div>

        <div className="space-y-2">
          {trendingTags.map((t) => (
            <Link
              key={t.tag}
              href={`/feed?tag=${t.tag}`}
              className="flex items-center justify-between p-2 rounded-2xl hover:bg-raised transition-colors group"
            >
              <div className="flex flex-col">
                <span className="text-xs font-mono font-bold text-foreground group-hover:text-primary transition-colors">
                  #{t.tag}
                </span>
                <span className="text-[10px] font-mono text-muted-text">{t.count}</span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-lg bg-raised text-muted-text border border-border-hairline">
                {t.domain}
              </span>
            </Link>
          ))}
        </div>
      </div>

      {/* Magazine Footer Info */}
      <div className="px-2 text-[10px] font-mono text-muted-text flex flex-wrap gap-x-3 gap-y-1">
        <span>ORBIT JOURNAL © 2026</span>
        <span>ISSUE 12</span>
        <Link href="/privacy" className="hover:underline">PRIVACY</Link>
        <Link href="/terms" className="hover:underline">TERMS</Link>
      </div>
    </aside>
  );
}
