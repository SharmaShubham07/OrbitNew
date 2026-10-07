"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { DOMAINS } from "@/lib/constants";
import { PostCard } from "@/components/feed/post-card";
import { CreatePostModal } from "@/components/feed/create-post-modal";
import {
  Globe2,
  Users,
  Sparkles,
  FileText,
  Plus,
  Loader2,
  Check,
  UserPlus,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface DomainViewProps {
  slug: string;
  currentUser?: any;
}

export function DomainView({ slug, currentUser }: DomainViewProps) {
  const domainDef = DOMAINS.find((d) => d.slug === slug) || DOMAINS[0];

  const [activeTab, setActiveTab] = useState<"posts" | "members">("posts");
  const [posts, setPosts] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [memberCount, setMemberCount] = useState(0);

  const fetchDomainPosts = async () => {
    setLoadingPosts(true);
    try {
      const res = await fetch(`/api/posts?domainId=${domainDef.id}`);
      if (res.ok) {
        const data = await res.json();
        setPosts(data.posts || []);
      }
    } catch (err) {
      console.error("Domain posts fetch error:", err);
    } finally {
      setLoadingPosts(false);
    }
  };

  const fetchDomainMembers = async () => {
    setLoadingMembers(true);
    try {
      const res = await fetch(`/api/search?domainId=${domainDef.id}&category=people`);
      if (res.ok) {
        const data = await res.json();
        setMembers(data.results?.users || []);
        setMemberCount(data.results?.users?.length || 0);
      }
    } catch (err) {
      console.error("Domain members fetch error:", err);
    } finally {
      setLoadingMembers(false);
    }
  };

  useEffect(() => {
    fetchDomainPosts();
    fetchDomainMembers();
  }, [slug]);

  const handlePostCreated = (newPost: any) => {
    setPosts((prev) => [newPost, ...prev]);
  };

  return (
    <div className="flex-1 max-w-4xl mx-auto py-6 px-4 flex flex-col gap-6 pb-24">
      {/* Domain Hub Hero Banner */}
      <div className="rounded-3xl glass-panel overflow-hidden border border-white/10 relative p-6 sm:p-8 bg-gradient-to-br from-slate-900 via-indigo-950/40 to-slate-900">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
          <div className="flex items-start sm:items-center gap-4">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-3xl sm:text-4xl shadow-xl flex-shrink-0">
              {domainDef.emoji}
            </div>

            <div className="flex flex-col">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="font-heading font-bold text-xl sm:text-2xl text-foreground">
                  {domainDef.name}
                </h1>
                <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 font-semibold border border-cyan-500/20">
                  Domain Circle
                </span>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1 max-w-xl leading-relaxed">
                {domainDef.description}
              </p>
              <div className="flex items-center gap-4 text-xs text-muted-foreground font-medium mt-2">
                <span>👥 {memberCount} circle specialists</span>
                <span>💬 {posts.length} discussions</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 self-start sm:self-center">
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-cyan-500/25 active:scale-95 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Post to Circle</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="flex items-center gap-2 p-1.5 rounded-2xl glass-panel w-fit">
        <button
          onClick={() => setActiveTab("posts")}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all",
            activeTab === "posts"
              ? "bg-cyan-500 text-black font-bold shadow-sm"
              : "text-muted-foreground hover:text-foreground hover:bg-white/5"
          )}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Domain Feed ({posts.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("members")}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all",
            activeTab === "members"
              ? "bg-cyan-500 text-black font-bold shadow-sm"
              : "text-muted-foreground hover:text-foreground hover:bg-white/5"
          )}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Member Directory ({members.length})</span>
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === "posts" && (
        <div className="flex flex-col gap-5">
          {loadingPosts ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-6 h-6 text-cyan-400 animate-spin" />
            </div>
          ) : posts.length === 0 ? (
            <div className="p-12 rounded-3xl glass-panel text-center flex flex-col items-center justify-center gap-3">
              <Sparkles className="w-12 h-12 text-cyan-400" />
              <h3 className="font-heading font-bold text-base text-foreground">
                No posts in this domain yet
              </h3>
              <p className="text-xs text-muted-foreground max-w-sm">
                Share the latest breakthroughs or architectural insights with fellow specialists.
              </p>
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="mt-2 px-5 py-2.5 rounded-2xl bg-cyan-500 text-black text-xs font-bold"
              >
                Create First Post
              </button>
            </div>
          ) : (
            posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                currentUserId={currentUser?.id}
                currentUserImage={currentUser?.image}
              />
            ))
          )}
        </div>
      )}

      {activeTab === "members" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {loadingMembers ? (
            <div className="col-span-full flex justify-center py-12">
              <Loader2 className="w-6 h-6 text-cyan-400 animate-spin" />
            </div>
          ) : members.length === 0 ? (
            <div className="col-span-full p-12 rounded-3xl glass-panel text-center text-xs text-muted-foreground">
              No specialists registered in this circle yet.
            </div>
          ) : (
            members.map((u) => (
              <div
                key={u.id}
                className="p-5 rounded-3xl glass-panel border border-white/10 flex flex-col items-center text-center justify-between gap-3"
              >
                <Link href={`/in/${u.username}`} className="orbit-ring-container">
                  <div className="orbit-ring opacity-75" />
                  <img
                    src={u.image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.username}`}
                    alt={u.name}
                    className="w-14 h-14 rounded-full object-cover border-2 border-background z-10"
                  />
                </Link>

                <div className="flex flex-col min-w-0">
                  <Link
                    href={`/in/${u.username}`}
                    className="font-heading font-bold text-sm text-foreground hover:text-cyan-400 transition-colors truncate"
                  >
                    {u.name}
                  </Link>
                  <p className="text-[11px] text-muted-foreground line-clamp-2 mt-0.5">
                    {u.headline || `@${u.username}`}
                  </p>
                </div>

                <Link
                  href={`/in/${u.username}`}
                  className="w-full py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-xs font-semibold text-foreground transition-colors"
                >
                  View Profile
                </Link>
              </div>
            ))
          )}
        </div>
      )}

      {/* Create Modal */}
      <CreatePostModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onPostCreated={handlePostCreated}
        currentUser={{ ...currentUser, primaryDomainId: domainDef.id }}
      />
    </div>
  );
}
