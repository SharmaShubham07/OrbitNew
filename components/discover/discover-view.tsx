"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { DOMAINS, SAMPLE_SKILLS } from "@/lib/constants";
import { PostCard } from "@/components/feed/post-card";
import {
  Search,
  Users,
  Compass,
  Briefcase,
  Globe2,
  FileText,
  Sparkles,
  Loader2,
  MapPin,
  UserPlus,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export function DiscoverView({ currentUser }: { currentUser?: any }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all"); // "all", "people", "posts", "domains", "jobs"
  const [selectedDomain, setSelectedDomain] = useState("all");
  const [selectedSkill, setSelectedSkill] = useState("");
  const [results, setResults] = useState<{
    users: any[];
    posts: any[];
    domains: any[];
    jobs: any[];
  }>({
    users: [],
    posts: [],
    domains: [],
    jobs: [],
  });
  const [loading, setLoading] = useState(true);

  const performSearch = async () => {
    setLoading(true);
    try {
      let url = `/api/search?q=${encodeURIComponent(query)}&category=${category}`;
      if (selectedDomain !== "all") url += `&domainId=${selectedDomain}`;
      if (selectedSkill) url += `&skill=${encodeURIComponent(selectedSkill)}`;

      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setResults(data.results || { users: [], posts: [], domains: [], jobs: [] });
      }
    } catch (err) {
      console.error("Search error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    performSearch();
  }, [category, selectedDomain, selectedSkill]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    performSearch();
  };

  const handleSendConnect = async (targetUserId: string, name: string) => {
    try {
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
      }
    } catch (err) {
      toast.error("Error connecting");
    }
  };

  const categories = [
    { id: "all", label: "All Categories", icon: Compass },
    { id: "people", label: "People & Talent", icon: Users },
    { id: "posts", label: "Craft Posts", icon: FileText },
    { id: "domains", label: "Domain Circles", icon: Globe2 },
    { id: "jobs", label: "Opportunities", icon: Briefcase },
  ];

  return (
    <div className="flex-1 max-w-4xl mx-auto py-6 px-4 flex flex-col gap-6 pb-24">
      {/* Header */}
      <div className="p-5 rounded-3xl glass-panel flex flex-col gap-4">
        <div>
          <h1 className="font-heading font-bold text-xl text-foreground flex items-center gap-2">
            <Compass className="w-5 h-5 text-cyan-400" />
            <span>Discover & Search</span>
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Search across people, specialized posts, domain circles, and job opportunities.
          </p>
        </div>

        {/* Search Input */}
        <form onSubmit={handleSearchSubmit} className="relative">
          <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 top-3" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search keywords, skills (Rust, Figma, LLM), names, or topics..."
            className="w-full bg-white/[0.04] border border-white/10 rounded-2xl pl-10 pr-24 py-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-cyan-500"
          />
          <button
            type="submit"
            className="absolute right-2 top-1.5 px-4 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-bold transition-all"
          >
            Search
          </button>
        </form>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isActive = category === cat.id;

            return (
              <button
                key={cat.id}
                onClick={() => setCategory(cat.id)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all",
                  isActive
                    ? "bg-cyan-500 text-black font-bold shadow-sm"
                    : "bg-white/[0.03] hover:bg-white/[0.08] text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* Filter Row */}
        <div className="flex items-center gap-3 pt-2 border-t border-white/5 flex-wrap">
          <select
            value={selectedDomain}
            onChange={(e) => setSelectedDomain(e.target.value)}
            className="bg-white/[0.04] border border-white/10 rounded-xl px-3 py-1 text-xs text-cyan-300 outline-none"
          >
            <option value="all" className="bg-slate-900">All Domains</option>
            {DOMAINS.map((d) => (
              <option key={d.id} value={d.id} className="bg-slate-900">
                {d.emoji} {d.name}
              </option>
            ))}
          </select>

          <div className="flex items-center gap-1 overflow-x-auto max-w-md py-0.5">
            <span className="text-[11px] text-muted-foreground mr-1">Skills:</span>
            {SAMPLE_SKILLS.slice(0, 6).map((sk) => (
              <button
                key={sk}
                onClick={() => setSelectedSkill(selectedSkill === sk ? "" : sk)}
                className={cn(
                  "px-2 py-0.5 rounded-lg text-[10px] font-medium transition-colors whitespace-nowrap",
                  selectedSkill === sk
                    ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                    : "bg-white/[0.03] text-muted-foreground hover:text-foreground"
                )}
              >
                {sk}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results Content */}
      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="w-6 h-6 text-cyan-400 animate-spin" />
        </div>
      ) : (
        <div className="flex flex-col gap-8">
          {/* Domains Section */}
          {(category === "all" || category === "domains") && results.domains?.length > 0 && (
            <div className="flex flex-col gap-3">
              <h3 className="font-heading font-bold text-sm text-foreground flex items-center gap-2">
                <Globe2 className="w-4 h-4 text-cyan-400" />
                <span>Domain Circles ({results.domains.length})</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {results.domains.map((dom) => (
                  <Link
                    key={dom.id}
                    href={`/domain/${dom.slug}`}
                    className="p-4 rounded-3xl glass-panel border border-white/10 hover:border-cyan-500/30 transition-all flex items-start gap-3.5 group"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-2xl flex-shrink-0 group-hover:scale-105 transition-transform">
                      {dom.emoji}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="font-heading font-bold text-sm text-foreground group-hover:text-cyan-400 transition-colors">
                        {dom.name}
                      </span>
                      <span className="text-[11px] text-muted-foreground line-clamp-2 mt-0.5">
                        {dom.description}
                      </span>
                      <span className="text-[10px] text-cyan-400 font-semibold mt-1">
                        {dom.memberCount || 0} members in circle
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* People Section */}
          {(category === "all" || category === "people") && results.users?.length > 0 && (
            <div className="flex flex-col gap-3">
              <h3 className="font-heading font-bold text-sm text-foreground flex items-center gap-2">
                <Users className="w-4 h-4 text-indigo-400" />
                <span>People & Craft Specialists ({results.users.length})</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {results.users.map((u) => (
                  <div
                    key={u.id}
                    className="p-5 rounded-3xl glass-panel border border-white/10 flex flex-col justify-between gap-3"
                  >
                    <div className="flex items-start gap-3">
                      <Link href={`/in/${u.username}`} className="orbit-ring-container flex-shrink-0">
                        <div className="orbit-ring opacity-75" />
                        <img
                          src={u.image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.username}`}
                          alt={u.name}
                          className="w-12 h-12 rounded-full object-cover border-2 border-background z-10"
                        />
                      </Link>

                      <div className="flex flex-col min-w-0 flex-1">
                        <Link
                          href={`/in/${u.username}`}
                          className="font-heading font-bold text-sm text-foreground hover:text-cyan-400 transition-colors truncate"
                        >
                          {u.name}
                        </Link>
                        <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                          {u.headline || `@${u.username}`}
                        </p>
                        {u.primaryDomain && (
                          <span className="text-[10px] text-cyan-300 font-medium mt-1">
                            {u.primaryDomain.emoji} {u.primaryDomain.name}
                          </span>
                        )}
                      </div>
                    </div>

                    {u.skills && u.skills.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-1">
                        {u.skills.slice(0, 3).map((sk: any) => (
                          <span
                            key={sk.id}
                            className="px-2 py-0.5 rounded-lg text-[10px] bg-white/[0.04] text-muted-foreground"
                          >
                            {sk.skill.name}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center gap-2 pt-2 border-t border-white/5">
                      <Link
                        href={`/in/${u.username}`}
                        className="flex-1 py-1.5 text-center rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-xs font-semibold text-foreground transition-colors"
                      >
                        View Profile
                      </Link>
                      {currentUser?.id !== u.id && (
                        <button
                          onClick={() => handleSendConnect(u.id, u.name)}
                          className="p-1.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/20"
                          title="Connect"
                        >
                          <UserPlus className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Posts Section */}
          {(category === "all" || category === "posts") && results.posts?.length > 0 && (
            <div className="flex flex-col gap-3">
              <h3 className="font-heading font-bold text-sm text-foreground flex items-center gap-2">
                <FileText className="w-4 h-4 text-amber-400" />
                <span>Craft Posts & Discussions ({results.posts.length})</span>
              </h3>
              <div className="flex flex-col gap-4">
                {results.posts.map((post) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    currentUserId={currentUser?.id}
                    currentUserImage={currentUser?.image}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Jobs Section */}
          {(category === "all" || category === "jobs") && results.jobs?.length > 0 && (
            <div className="flex flex-col gap-3">
              <h3 className="font-heading font-bold text-sm text-foreground flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-emerald-400" />
                <span>Open Opportunities ({results.jobs.length})</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {results.jobs.map((job) => (
                  <div
                    key={job.id}
                    className="p-5 rounded-3xl glass-panel border border-white/10 flex flex-col justify-between gap-3"
                  >
                    <div>
                      <h4 className="font-heading font-bold text-sm text-foreground">
                        {job.title}
                      </h4>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {job.company} · {job.location}
                      </p>
                      <p className="text-xs text-foreground/80 line-clamp-2 mt-2">
                        {job.description}
                      </p>
                    </div>

                    <Link
                      href="/jobs"
                      className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold mt-1"
                    >
                      View in Jobs Portal →
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* No results fallback */}
          {results.domains?.length === 0 &&
            results.users?.length === 0 &&
            results.posts?.length === 0 &&
            results.jobs?.length === 0 && (
              <div className="p-12 rounded-3xl glass-panel text-center flex flex-col items-center justify-center gap-3">
                <Compass className="w-12 h-12 text-muted-foreground/40" />
                <h3 className="font-heading font-bold text-base text-foreground">
                  No matching results found
                </h3>
                <p className="text-xs text-muted-foreground max-w-sm">
                  Try searching for different keywords, adjusting your domain circle, or exploring all categories.
                </p>
              </div>
            )}
        </div>
      )}
    </div>
  );
}
