"use client";

import { useState } from "react";
import Link from "next/link";
import { formatTimeAgo, cn } from "@/lib/utils";
import { REACTIONS } from "@/lib/constants";
import { PollCard } from "@/components/feed/poll-card";
import { PostComments } from "@/components/feed/post-comments";
import {
  MessageSquare,
  Share2,
  Bookmark,
  MoreHorizontal,
  Trash2,
  Edit2,
  FileText,
  ExternalLink,
  Check,
} from "lucide-react";
import { toast } from "sonner";

interface PostCardProps {
  post: any;
  currentUserId?: string;
  currentUserImage?: string | null;
  onPostDeleted?: (postId: string) => void;
  onPostUpdated?: (updatedPost: any) => void;
}

export function PostCard({
  post,
  currentUserId,
  currentUserImage,
  onPostDeleted,
  onPostUpdated,
}: PostCardProps) {
  const [currentPost, setCurrentPost] = useState(post);
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  const [showReactionPicker, setShowReactionPicker] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(currentPost.content);
  const [isBookmarked, setIsBookmarked] = useState(currentPost.isBookmarked);
  const [userReaction, setUserReaction] = useState<string | null>(currentPost.userReaction);
  const [likeCount, setLikeCount] = useState(currentPost.likeCount || 0);
  const [commentCount, setCommentCount] = useState(currentPost._count?.comments || 0);

  const isAuthor = currentUserId === currentPost.authorId;

  const handleReaction = async (type: string) => {
    if (!currentUserId) {
      toast.error("Please login to react to posts");
      return;
    }

    // Optimistic UI update
    const previousReaction = userReaction;
    const previousCount = likeCount;

    if (previousReaction === type) {
      setUserReaction(null);
      setLikeCount((prev: number) => Math.max(0, prev - 1));
    } else {
      setUserReaction(type);
      if (!previousReaction) {
        setLikeCount((prev: number) => prev + 1);
      }
    }
    setShowReactionPicker(false);

    try {
      const res = await fetch(`/api/posts/${currentPost.id}/react`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type }),
      });

      if (res.ok) {
        const data = await res.json();
        setUserReaction(data.currentReaction);
        setLikeCount(data.reactionCount);
      } else {
        // Revert on error
        setUserReaction(previousReaction);
        setLikeCount(previousCount);
        toast.error("Failed to update reaction");
      }
    } catch (err) {
      setUserReaction(previousReaction);
      setLikeCount(previousCount);
    }
  };

  const handleBookmark = async () => {
    if (!currentUserId) {
      toast.error("Please login to save posts");
      return;
    }

    const previousState = isBookmarked;
    setIsBookmarked(!isBookmarked);

    try {
      const res = await fetch(`/api/posts/${currentPost.id}/bookmark`, {
        method: "POST",
      });
      if (res.ok) {
        const data = await res.json();
        setIsBookmarked(data.isBookmarked);
        toast.success(data.isBookmarked ? "Post saved to your bookmarks" : "Post removed from bookmarks");
      } else {
        setIsBookmarked(previousState);
      }
    } catch (err) {
      setIsBookmarked(previousState);
    }
  };

  const handleShare = async () => {
    const url = `${window.location.origin}/feed?post=${currentPost.id}`;
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(url);
      toast.success("Post link copied to clipboard!");
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this post?")) return;

    try {
      const res = await fetch(`/api/posts/${currentPost.id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        toast.success("Post deleted");
        if (onPostDeleted) onPostDeleted(currentPost.id);
      } else {
        toast.error("Failed to delete post");
      }
    } catch (err) {
      toast.error("Delete error");
    }
  };

  const handleSaveEdit = async () => {
    if (!editContent.trim()) return;

    try {
      const res = await fetch(`/api/posts/${currentPost.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: editContent }),
      });

      if (res.ok) {
        setCurrentPost((prev: any) => ({ ...prev, content: editContent }));
        setIsEditing(false);
        toast.success("Post updated");
      } else {
        toast.error("Failed to update post");
      }
    } catch (err) {
      toast.error("Update error");
    }
  };

  // Parse hashtags into clickable elements
  const renderFormattedContent = (content: string) => {
    const parts = content.split(/(#[a-zA-Z0-9_]+)/g);
    return parts.map((part, i) => {
      if (part.startsWith("#")) {
        const tag = part.slice(1);
        return (
          <Link
            key={i}
            href={`/feed?tag=${tag}`}
            className="text-cyan-400 hover:text-cyan-300 font-semibold hover:underline"
          >
            {part}
          </Link>
        );
      }
      return part;
    });
  };

  const activeReactionObj = REACTIONS.find((r) => r.type === userReaction);

  return (
    <article className="p-5 md:p-6 rounded-3xl glass-panel relative group transition-all duration-200 hover:border-white/15">
      {/* Top Header: Author info, Domain chip, Options */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          {/* Author avatar with orbit ring */}
          <Link href={`/in/${currentPost.author?.username}`} className="orbit-ring-container flex-shrink-0">
            <div className="orbit-ring opacity-80" />
            <img
              src={
                currentPost.author?.image ||
                `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentPost.author?.username}`
              }
              alt={currentPost.author?.name || "Author"}
              className="w-11 h-11 rounded-full object-cover border-2 border-background z-10"
            />
          </Link>

          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <Link
                href={`/in/${currentPost.author?.username}`}
                className="font-heading font-bold text-sm text-foreground hover:text-cyan-400 transition-colors"
              >
                {currentPost.author?.name}
              </Link>

              {/* Domain chip */}
              {currentPost.domain && (
                <Link
                  href={`/domain/${currentPost.domain.slug}`}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-white/[0.06] hover:bg-white/[0.12] text-cyan-300 border border-white/10 transition-colors"
                >
                  <span>{currentPost.domain.emoji}</span>
                  <span className="hidden sm:inline">{currentPost.domain.name}</span>
                </Link>
              )}
            </div>

            <span className="text-[11px] text-muted-foreground truncate max-w-[200px] sm:max-w-md">
              {currentPost.author?.headline || `@${currentPost.author?.username}`}
            </span>
            <span className="text-[10px] text-muted-foreground/70 mt-0.5">
              {formatTimeAgo(currentPost.createdAt)}
            </span>
          </div>
        </div>

        {/* Options Menu */}
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-1.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors"
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>

          {showMenu && (
            <div className="absolute right-0 top-8 w-36 py-1 rounded-2xl glass-dropdown z-20 shadow-xl animate-in fade-in zoom-in-95 duration-150">
              {isAuthor && (
                <>
                  <button
                    onClick={() => {
                      setIsEditing(true);
                      setShowMenu(false);
                    }}
                    className="flex items-center gap-2 w-full px-3 py-2 text-xs text-foreground hover:bg-white/10 transition-colors"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Edit Post</span>
                  </button>
                  <button
                    onClick={() => {
                      handleDelete();
                      setShowMenu(false);
                    }}
                    className="flex items-center gap-2 w-full px-3 py-2 text-xs text-rose-400 hover:bg-rose-500/10 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Post</span>
                  </button>
                </>
              )}
              <button
                onClick={() => {
                  handleBookmark();
                  setShowMenu(false);
                }}
                className="flex items-center gap-2 w-full px-3 py-2 text-xs text-foreground hover:bg-white/10 transition-colors"
              >
                <Bookmark className="w-3.5 h-3.5" />
                <span>{isBookmarked ? "Remove Bookmark" : "Bookmark Post"}</span>
              </button>
              <button
                onClick={() => {
                  handleShare();
                  setShowMenu(false);
                }}
                className="flex items-center gap-2 w-full px-3 py-2 text-xs text-foreground hover:bg-white/10 transition-colors"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Copy Link</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Post Body */}
      {isEditing ? (
        <div className="flex flex-col gap-2 my-3">
          <textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            className="w-full bg-white/[0.04] border border-white/10 rounded-2xl p-3 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-cyan-500 min-h-[90px]"
          />
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setIsEditing(false)}
              className="px-3 py-1 rounded-xl text-xs text-muted-foreground hover:text-foreground"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveEdit}
              className="px-3 py-1 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-semibold"
            >
              Save
            </button>
          </div>
        </div>
      ) : (
        <div className="text-xs sm:text-sm text-foreground/95 whitespace-pre-line leading-relaxed my-3 font-normal">
          {renderFormattedContent(currentPost.content)}
        </div>
      )}

      {/* Media Attachments */}
      {currentPost.media && currentPost.media.length > 0 && (
        <div className="my-3 rounded-2xl overflow-hidden border border-white/10 bg-black/40">
          {currentPost.media.map((item: any) => {
            if (item.type === "IMAGE") {
              return (
                <img
                  key={item.id}
                  src={item.url}
                  alt={item.name || "Post attachment"}
                  className="w-full max-h-[480px] object-cover"
                />
              );
            }
            if (item.type === "VIDEO") {
              return (
                <video
                  key={item.id}
                  src={item.url}
                  controls
                  className="w-full max-h-[480px] rounded-2xl"
                />
              );
            }
            if (item.type === "DOCUMENT") {
              return (
                <div
                  key={item.id}
                  className="p-4 flex items-center justify-between bg-white/[0.03] hover:bg-white/[0.06] transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-foreground truncate max-w-xs sm:max-w-md">
                        {item.name || "Document Attachment (PDF)"}
                      </p>
                      <p className="text-[10px] text-muted-foreground">PDF Document</p>
                    </div>
                  </div>
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20 text-xs font-semibold border border-cyan-500/20 transition-colors"
                  >
                    <span>Open</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              );
            }
            return null;
          })}
        </div>
      )}

      {/* Interactive Poll */}
      {currentPost.poll && (
        <PollCard
          poll={currentPost.poll}
          postId={currentPost.id}
          currentUserId={currentUserId}
          onPollUpdate={(updatedPoll) =>
            setCurrentPost((prev: any) => ({ ...prev, poll: updatedPoll }))
          }
        />
      )}

      {/* Metrics Row */}
      <div className="flex items-center justify-between text-[11px] text-muted-foreground/80 py-2 border-b border-white/5">
        <div className="flex items-center gap-1.5">
          {likeCount > 0 && (
            <span className="flex items-center gap-1 text-foreground font-medium">
              <span>👍🔥</span>
              <span>{likeCount}</span>
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <span>{commentCount} comments</span>
        </div>
      </div>

      {/* Action Buttons Bar */}
      <div className="flex items-center justify-between pt-2">
        {/* Like / Reactions Button with Hover Picker */}
        <div
          className="relative"
          onMouseEnter={() => setShowReactionPicker(true)}
          onMouseLeave={() => setShowReactionPicker(false)}
        >
          <button
            onClick={() => handleReaction(userReaction ? userReaction : "LIKE")}
            className={cn(
              "flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium transition-all",
              userReaction
                ? `${activeReactionObj?.color} bg-white/[0.04]`
                : "text-muted-foreground hover:text-foreground hover:bg-white/[0.04]"
            )}
          >
            <span>{activeReactionObj?.emoji || "👍"}</span>
            <span>{activeReactionObj?.label || "Like"}</span>
          </button>

          {/* Reaction Popover */}
          {showReactionPicker && (
            <div className="absolute bottom-9 left-0 p-1.5 rounded-2xl glass-dropdown flex items-center gap-1 z-30 shadow-2xl animate-in fade-in zoom-in-90 duration-150">
              {REACTIONS.map((r) => (
                <button
                  key={r.type}
                  onClick={() => handleReaction(r.type)}
                  className="p-1.5 text-lg hover:scale-130 transition-transform rounded-xl hover:bg-white/10"
                  title={r.label}
                >
                  {r.emoji}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Comment Button */}
        <button
          onClick={() => setIsCommentsOpen(!isCommentsOpen)}
          className={cn(
            "flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium transition-colors",
            isCommentsOpen
              ? "text-cyan-400 bg-cyan-500/10"
              : "text-muted-foreground hover:text-foreground hover:bg-white/[0.04]"
          )}
        >
          <MessageSquare className="w-4 h-4" />
          <span>Comment</span>
        </button>

        {/* Share Button */}
        <button
          onClick={handleShare}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-white/[0.04] transition-colors"
        >
          <Share2 className="w-4 h-4" />
          <span>Share</span>
        </button>

        {/* Bookmark Button */}
        <button
          onClick={handleBookmark}
          className={cn(
            "flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium transition-colors",
            isBookmarked
              ? "text-amber-400 bg-amber-400/10"
              : "text-muted-foreground hover:text-foreground hover:bg-white/[0.04]"
          )}
          title={isBookmarked ? "Saved" : "Save post"}
        >
          <Bookmark className="w-4 h-4" />
        </button>
      </div>

      {/* Expandable Comments Tree */}
      {isCommentsOpen && (
        <PostComments
          postId={currentPost.id}
          currentUserId={currentUserId}
          currentUserImage={currentUserImage}
          onCommentCountChange={(count) => setCommentCount(count)}
        />
      )}
    </article>
  );
}
