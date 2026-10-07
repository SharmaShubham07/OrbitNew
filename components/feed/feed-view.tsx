"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { PostCard } from "@/components/feed/post-card";
import { CreatePostModal } from "@/components/feed/create-post-modal";
import { Sparkles, Globe, Users, Loader2, Plus, Filter } from "lucide-react";
import { cn } from "@/lib/utils";

interface FeedViewProps {
  currentUser?: any;
}

export function FeedView({ currentUser }: FeedViewProps) {
  const searchParams = useSearchParams();
  const initialTab = searchParams.get("tab") || "foryou";
  const tagParam = searchParams.get("tag");

  const [activeTab, setActiveTab] = useState<string>(initialTab);
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  useEffect(() => {
    if (initialTab) setActiveTab(initialTab);
  }, [initialTab]);

  const fetchPosts = async (tab: string, cursor?: string | null, isLoadMore = false) => {
    if (!isLoadMore) setLoading(true);
    else setLoadingMore(true);

    try {
      let url = `/api/posts?tab=${tab}&limit=10`;
      if (cursor) url += `&cursor=${cursor}`;
      if (tagParam) url += `&tag=${tagParam}`;

      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        if (isLoadMore) {
          setPosts((prev) => [...prev, ...(data.posts || [])]);
        } else {
          setPosts(data.posts || []);
        }
        setNextCursor(data.nextCursor);
      }
    } catch (err) {
      console.error("Failed to fetch posts:", err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchPosts(activeTab);
  }, [activeTab, tagParam]);

  const handlePostCreated = (newPost: any) => {
    setPosts((prev) => [newPost, ...prev]);
  };

  const handlePostDeleted = (postId: string) => {
    setPosts((prev) => prev.filter((p) => p.id !== postId));
  };

  const tabs = [
    { id: "foryou", label: "For You", icon: Sparkles },
    {
      id: "domain",
      label: currentUser?.primaryDomain?.name ? `My Domain (${currentUser.primaryDomain.emoji})` : "My Domain",
      icon: Globe,
    },
    { id: "connections", label: "Connections", icon: Users },
  ];

  return (
    <div className="flex-1 max-w-2xl mx-auto py-6 px-4 flex flex-col gap-6 pb-28">
      {/* Feed Tabs Bar */}
      <div className="flex items-center justify-between p-1.5 rounded-2xl glass-panel sticky top-2 z-20 shadow-md">
        <div className="flex items-center gap-1 w-full sm:w-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setNextCursor(null);
                }}
                className={cn(
                  "flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex-1 sm:flex-initial justify-center",
                  isActive
                    ? "bg-gradient-to-r from-cyan-500/20 to-indigo-500/20 text-cyan-300 border border-cyan-500/30 shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                )}
              >
                <Icon className={cn("w-3.5 h-3.5", isActive ? "text-cyan-400" : "")} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {tagParam && (
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-cyan-500/10 text-cyan-300 text-xs font-medium rounded-xl border border-cyan-500/20">
            <span>Filter: #{tagParam}</span>
          </div>
        )}
      </div>

      {/* Top Post Prompt Pill (Quick Trigger) */}
      <div
        onClick={() => setIsCreateModalOpen(true)}
        className="p-4 rounded-3xl glass-panel flex items-center gap-3 cursor-pointer hover:border-white/20 transition-all group shadow-sm hover:scale-[1.01]"
      >
        <div className="orbit-ring-container flex-shrink-0">
          <div className="orbit-ring opacity-75" />
          <img
            src={
              currentUser?.image ||
              `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser?.username || "user"}`
            }
            alt="Me"
            className="w-10 h-10 rounded-full object-cover border-2 border-background z-10"
          />
        </div>
        <div className="flex-1 bg-white/[0.04] group-hover:bg-white/[0.07] border border-white/5 rounded-2xl px-4 py-2.5 text-xs text-muted-foreground transition-colors flex items-center justify-between">
          <span>Start a post, share craft insights, or run a poll...</span>
          <Plus className="w-4 h-4 text-cyan-400 group-hover:rotate-90 transition-transform duration-300" />
        </div>
      </div>

      {/* Posts Stream */}
      {loading ? (
        <div className="flex flex-col gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-6 rounded-3xl glass-panel animate-pulse flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-white/5" />
                <div className="flex flex-col gap-2">
                  <div className="w-32 h-3 bg-white/5 rounded" />
                  <div className="w-48 h-2.5 bg-white/5 rounded" />
                </div>
              </div>
              <div className="w-full h-16 bg-white/5 rounded-xl" />
              <div className="w-full h-40 bg-white/5 rounded-2xl" />
            </div>
          ))}
        </div>
      ) : posts.length === 0 ? (
        <div className="p-12 rounded-3xl glass-panel text-center flex flex-col items-center justify-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center text-2xl">
            🪐
          </div>
          <h3 className="font-heading font-bold text-base text-foreground">
            No posts in this circle yet
          </h3>
          <p className="text-xs text-muted-foreground max-w-sm">
            Be the first to share your engineering architectures, design systems, or industry breakthroughs.
          </p>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="mt-2 px-5 py-2.5 rounded-2xl bg-cyan-500 text-black text-xs font-bold shadow-lg shadow-cyan-500/20 hover:bg-cyan-400 transition-all"
          >
            Create Post
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-5">
          {posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              currentUserId={currentUser?.id}
              currentUserImage={currentUser?.image}
              onPostDeleted={handlePostDeleted}
            />
          ))}

          {/* Load More Trigger */}
          {nextCursor && (
            <div className="flex justify-center pt-4">
              <button
                onClick={() => fetchPosts(activeTab, nextCursor, true)}
                disabled={loadingMore}
                className="flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-white/[0.05] hover:bg-white/[0.1] text-xs font-semibold text-cyan-300 border border-white/10 transition-all"
              >
                {loadingMore ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
                    <span>Loading older posts...</span>
                  </>
                ) : (
                  <span>Load more orbit posts</span>
                )}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Signature Floating Composer Pill at Bottom of Feed */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-30 hidden md:flex">
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-2.5 py-3 px-6 rounded-full bg-gradient-to-r from-cyan-500 via-indigo-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white text-xs font-bold shadow-2xl shadow-cyan-500/30 hover:shadow-cyan-500/50 hover:scale-105 active:scale-95 transition-all border border-white/20 backdrop-blur-md"
        >
          <Sparkles className="w-4 h-4" />
          <span>New Orbit Post</span>
        </button>
      </div>

      {/* Modal */}
      <CreatePostModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onPostCreated={handlePostCreated}
        currentUser={currentUser}
      />
    </div>
  );
}
