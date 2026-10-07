"use client";

import { useState, useEffect } from "react";
import { PostCard } from "@/components/feed/post-card";
import { Bookmark, Loader2 } from "lucide-react";

export function SavedView({ currentUser }: { currentUser?: any }) {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSaved() {
      try {
        const res = await fetch("/api/posts?tab=saved");
        if (res.ok) {
          const data = await res.json();
          setPosts(data.posts || []);
        }
      } catch (err) {
        console.error("Saved posts fetch error:", err);
      } finally {
        setLoading(false);
      }
    }
    loadSaved();
  }, []);

  return (
    <div className="flex-1 max-w-2xl mx-auto py-6 px-4 flex flex-col gap-6 pb-24">
      <div className="p-5 rounded-3xl glass-panel">
        <h1 className="font-heading font-bold text-xl text-foreground flex items-center gap-2">
          <Bookmark className="w-5 h-5 text-amber-400" />
          <span>Saved Orbit Posts</span>
        </h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          Archived posts, technical papers, and articles saved for future review.
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-6 h-6 text-cyan-400 animate-spin" />
        </div>
      ) : posts.length === 0 ? (
        <div className="p-12 rounded-3xl glass-panel text-center flex flex-col items-center justify-center gap-3">
          <Bookmark className="w-12 h-12 text-muted-foreground/40" />
          <h3 className="font-heading font-bold text-base text-foreground">
            No saved posts yet
          </h3>
          <p className="text-xs text-muted-foreground max-w-sm">
            Click the bookmark icon on any post in your feed to save it here for quick reference.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-5">
          {posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              currentUserId={currentUser?.id}
              currentUserImage={currentUser?.image}
            />
          ))}
        </div>
      )}
    </div>
  );
}
