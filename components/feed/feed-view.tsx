"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { PostCard } from "@/components/feed/post-card";
import { CreatePostModal } from "@/components/feed/create-post-modal";
import { TemplateStudioModal } from "@/components/templates/template-studio-modal";
import {
  Sparkles,
  Globe,
  Users,
  Loader2,
  Plus,
  ArrowUp,
  Layout,
  RefreshCw,
} from "lucide-react";
import { cn } from "@/components/ui/button";
import { PostCardSkeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";

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
  const [isStudioOpen, setIsStudioOpen] = useState(false);
  const [hasNewPostsNotification, setHasNewPostsNotification] = useState(false);

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
    if (newPost && newPost.id) {
      setPosts((prev) => [newPost, ...prev]);
    } else {
      fetchPosts(activeTab);
    }
  };

  const handlePostDeleted = (postId: string) => {
    setPosts((prev) => prev.filter((p) => p.id !== postId));
  };

  const tabs = [
    { id: "foryou", label: "For You", icon: Sparkles },
    {
      id: "domain",
      label: currentUser?.primaryDomain?.name
        ? `${currentUser.primaryDomain.emoji} ${currentUser.primaryDomain.name}`
        : "My Circle",
      icon: Globe,
    },
    { id: "connections", label: "Connections", icon: Users },
  ];

  return (
    <div className="flex-1 max-w-3xl mx-auto py-6 px-4 flex flex-col gap-6 pb-28">
      {/* Floating 'New Posts Available' Pill */}
      {hasNewPostsNotification && (
        <button
          onClick={() => {
            fetchPosts(activeTab);
            setHasNewPostsNotification(false);
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          className="fixed top-20 left-1/2 -translate-x-1/2 z-30 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary text-primary-foreground font-mono text-xs font-bold shadow-editorial-lift animate-bounce"
        >
          <ArrowUp className="w-3.5 h-3.5" />
          <span>New Orbit Posts Available</span>
        </button>
      )}

      {/* Editorial Feed Header & Filter Tabs */}
      <div className="flex items-center justify-between p-1.5 rounded-2xl bg-surface border border-border-hairline sticky top-2 z-20 shadow-editorial-sm backdrop-blur-md">
        <div className="flex items-center gap-1 w-full sm:w-auto overflow-x-auto no-scrollbar">
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
                  "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono tracking-wider transition-all duration-200 flex-1 sm:flex-initial justify-center whitespace-nowrap",
                  isActive
                    ? "bg-raised text-foreground font-bold shadow-editorial-sm border border-border-hairline"
                    : "text-muted-text hover:text-foreground hover:bg-raised/50"
                )}
              >
                <Icon className={cn("w-3.5 h-3.5", isActive ? "text-primary" : "")} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {tagParam && (
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-raised text-primary text-xs font-mono font-bold rounded-xl border border-border-hairline">
            <span>#{tagParam}</span>
          </div>
        )}
      </div>

      {/* Top Editorial Post Prompt Pill */}
      <div className="p-4 rounded-3xl bg-surface border border-border-hairline shadow-editorial-sm space-y-3">
        <div
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="orbit-ring-container shrink-0">
            <div className="orbit-ring opacity-80" />
            <img
              src={
                currentUser?.image ||
                `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser?.username || "user"}`
              }
              alt="Me"
              className="w-10 h-10 rounded-full object-cover border-2 border-background z-10"
            />
          </div>
          <div className="flex-1 bg-raised group-hover:bg-raised/70 border border-border-hairline rounded-2xl px-4 py-2.5 text-xs text-muted-text transition-colors flex items-center justify-between font-sans">
            <span>Share an engineering insight, design review, or milestone...</span>
            <Plus className="w-4 h-4 text-primary group-hover:rotate-90 transition-transform duration-300" />
          </div>
        </div>

        {/* Quick Studio Shortcut Bar */}
        <div className="pt-2 border-t border-border-hairline flex items-center justify-between">
          <div className="flex items-center gap-2 text-[11px] font-mono text-muted-text">
            <span>PRO TOOLS:</span>
            <button
              onClick={() => setIsStudioOpen(true)}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-primary/10 text-primary hover:bg-primary/20 font-bold transition-colors"
            >
              <Layout className="w-3.5 h-3.5" />
              <span>16+ Post Templates</span>
            </button>
          </div>
          <button
            onClick={() => fetchPosts(activeTab)}
            title="Refresh Feed"
            className="p-1 text-muted-text hover:text-foreground"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Posts Stream (Bento Feed layout) */}
      {loading ? (
        <div className="space-y-4">
          <PostCardSkeleton />
          <PostCardSkeleton />
        </div>
      ) : posts.length === 0 ? (
        <EmptyState
          icon={<Sparkles className="w-7 h-7" />}
          title="No posts in this circle yet"
          description="Be the first to share your engineering architectures, design systems, or industry breakthroughs."
          action={
            <Button
              variant="primary"
              size="md"
              onClick={() => setIsStudioOpen(true)}
              className="font-mono text-xs font-bold"
            >
              Launch Template Studio
            </Button>
          }
        />
      ) : (
        <div className="space-y-6">
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
              <Button
                variant="outline"
                size="md"
                onClick={() => fetchPosts(activeTab, nextCursor, true)}
                isLoading={loadingMore}
                className="font-mono text-xs font-bold"
              >
                Load older posts
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Signature Floating Composer Pill at Bottom of Feed */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-30 hidden md:flex items-center gap-2 p-1.5 rounded-full bg-surface border-2 border-border-hairline shadow-editorial-lift backdrop-blur-md">
        <button
          onClick={() => setIsStudioOpen(true)}
          className="flex items-center gap-2 py-2.5 px-5 rounded-full bg-primary text-primary-foreground text-xs font-mono font-bold shadow-editorial-sm hover:brightness-110 active:scale-95 transition-all"
        >
          <Sparkles className="w-4 h-4" />
          <span>Post Template Studio</span>
        </button>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-1.5 py-2.5 px-4 rounded-full bg-raised hover:bg-raised/70 text-foreground text-xs font-mono font-bold border border-border-hairline transition-colors"
        >
          <Plus className="w-3.5 h-3.5 text-primary" />
          <span>Quick Note</span>
        </button>
      </div>

      {/* Modals */}
      <CreatePostModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onPostCreated={handlePostCreated}
        currentUser={currentUser}
      />

      <TemplateStudioModal
        isOpen={isStudioOpen}
        onClose={() => setIsStudioOpen(false)}
        domainId={currentUser?.primaryDomainId}
        onPostPublished={() => {
          setIsStudioOpen(false);
          fetchPosts(activeTab);
        }}
      />
    </div>
  );
}
