"use client";

import { useState } from "react";
import Link from "next/link";
import { formatTimeAgo } from "@/lib/utils";
import { REACTIONS } from "@/lib/constants";
import { PollCard } from "@/components/feed/poll-card";
import { PostComments } from "@/components/feed/post-comments";
import { TemplateCardRenderer } from "@/components/templates/template-card-renderer";
import { TemplateStudioModal } from "@/components/templates/template-studio-modal";
import {
  MessageSquare,
  Share2,
  Bookmark,
  MoreHorizontal,
  Trash2,
  Edit2,
  FileText,
  ExternalLink,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { Chip } from "@/components/ui/chip";

interface PostCardProps {
  post: any;
  currentUserId?: string;
  currentUserImage?: string | null;
  onPostDeleted?: (postId: string) => void;
  onPostUpdated?: (updatedPost: any) => void;
  className?: string;
}

export function PostCard({
  post,
  currentUserId,
  currentUserImage,
  onPostDeleted,
  onPostUpdated,
  className = "",
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
  const [isRemixModalOpen, setIsRemixModalOpen] = useState(false);

  const isAuthor = currentUserId === currentPost.authorId;

  // Safe parsing for templateData
  let parsedTemplateData = {};
  if (currentPost.templateData) {
    try {
      parsedTemplateData =
        typeof currentPost.templateData === "string"
          ? JSON.parse(currentPost.templateData)
          : currentPost.templateData;
    } catch (e) {
      console.error("Error parsing templateData:", e);
    }
  }

  const handleReaction = async (type: string) => {
    if (!currentUserId) {
      toast.error("Please login to react to posts");
      return;
    }

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
        toast.success(data.isBookmarked ? "Saved to your bookmarks" : "Removed from bookmarks");
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
            className="text-primary hover:underline font-semibold"
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
    <>
      <article
        className={`p-6 rounded-3xl bg-surface border border-border-hairline shadow-editorial-sm hover:shadow-editorial-md transition-all duration-200 relative group flex flex-col justify-between ${className}`}
      >
        {/* Top Header: Author info, Domain chip, Options */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            {/* Author avatar with orbit ring */}
            <Link
              href={`/in/${currentPost.author?.username}`}
              className="orbit-ring-container shrink-0"
            >
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
                  className="font-serif font-bold text-sm text-foreground hover:text-primary transition-colors"
                >
                  {currentPost.author?.name}
                </Link>

                {/* Domain chip */}
                {currentPost.domain && (
                  <Link
                    href={`/domain/${currentPost.domain.slug}`}
                    className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider bg-raised border border-border-hairline text-foreground hover:border-primary/40 transition-colors"
                  >
                    <span>{currentPost.domain.emoji}</span>
                    <span className="hidden sm:inline font-bold">
                      {currentPost.domain.name}
                    </span>
                  </Link>
                )}
              </div>

              <span className="text-xs text-muted-text truncate max-w-[200px] sm:max-w-md font-sans">
                {currentPost.author?.headline || `@${currentPost.author?.username}`}
              </span>
              <span className="text-[10px] font-mono text-muted-text/80 mt-0.5">
                {formatTimeAgo(currentPost.createdAt)}
              </span>
            </div>
          </div>

          {/* Options Menu */}
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-1.5 rounded-xl text-muted-text hover:text-foreground hover:bg-raised transition-colors"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>

            {showMenu && (
              <div className="absolute right-0 top-8 w-44 py-1.5 rounded-2xl bg-surface border border-border-hairline z-20 shadow-editorial-lg animate-in fade-in zoom-in-95 duration-150">
                {isAuthor && (
                  <>
                    <button
                      onClick={() => {
                        setIsEditing(true);
                        setShowMenu(false);
                      }}
                      className="flex items-center gap-2 w-full px-3 py-2 text-xs text-foreground hover:bg-raised transition-colors"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>Edit Post</span>
                    </button>
                    <button
                      onClick={() => {
                        handleDelete();
                        setShowMenu(false);
                      }}
                      className="flex items-center gap-2 w-full px-3 py-2 text-xs text-rose-500 hover:bg-rose-500/10 transition-colors"
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
                  className="flex items-center gap-2 w-full px-3 py-2 text-xs text-foreground hover:bg-raised transition-colors"
                >
                  <Bookmark className="w-3.5 h-3.5" />
                  <span>{isBookmarked ? "Remove Bookmark" : "Save to Bookmarks"}</span>
                </button>
                <button
                  onClick={() => {
                    handleShare();
                    setShowMenu(false);
                  }}
                  className="flex items-center gap-2 w-full px-3 py-2 text-xs text-foreground hover:bg-raised transition-colors"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Copy Link</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* Post Body: If Post has a templateId, render custom TemplateCardRenderer! */}
        {/* ========================================================================= */}
        {currentPost.templateId ? (
          <div className="my-3 space-y-3">
            <div className="rounded-3xl overflow-hidden shadow-editorial-sm">
              <TemplateCardRenderer
                templateId={currentPost.templateId}
                data={parsedTemplateData}
                isEditing={false}
                aspectRatio="auto"
              />
            </div>

            {/* Remix Template Button */}
            <div className="flex items-center justify-between pt-1">
              <button
                onClick={() => setIsRemixModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-raised hover:bg-surface border border-border-hairline text-xs font-mono font-semibold text-primary transition-colors shadow-editorial-sm"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Remix This Template</span>
              </button>
              <span className="font-mono text-[10px] text-muted-text uppercase">
                TEMPLATE: {currentPost.templateId}
              </span>
            </div>
          </div>
        ) : (
          <>
            {isEditing ? (
              <div className="flex flex-col gap-2 my-3">
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="w-full bg-raised border border-border-hairline rounded-2xl p-3 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary min-h-[90px]"
                />
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setIsEditing(false)}
                    className="px-3 py-1 rounded-xl text-xs text-muted-text hover:text-foreground"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveEdit}
                    className="px-3 py-1 rounded-xl bg-primary text-primary-foreground text-xs font-bold shadow-editorial-sm"
                  >
                    Save
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-xs sm:text-sm text-foreground whitespace-pre-line leading-relaxed my-3 font-normal font-sans">
                {renderFormattedContent(currentPost.content)}
              </div>
            )}
          </>
        )}

        {/* Media Attachments */}
        {currentPost.media && currentPost.media.length > 0 && (
          <div className="my-3 rounded-2xl overflow-hidden border border-border-hairline bg-raised">
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
                    className="p-4 flex items-center justify-between bg-surface hover:bg-raised transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-foreground truncate max-w-xs sm:max-w-md">
                          {item.name || "Document Attachment (PDF)"}
                        </p>
                        <p className="text-[10px] font-mono text-muted-text">
                          PDF DOCUMENT
                        </p>
                      </div>
                    </div>
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary/10 text-primary hover:bg-primary/20 text-xs font-mono font-bold border border-primary/20 transition-colors"
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
        <div className="flex items-center justify-between text-[11px] font-mono text-muted-text py-2 border-b border-border-hairline">
          <div className="flex items-center gap-1.5">
            {likeCount > 0 && (
              <span className="flex items-center gap-1 text-foreground font-bold">
                <span>👍🔥</span>
                <span>{likeCount}</span>
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <span>{commentCount} COMMENTS</span>
          </div>
        </div>

        {/* Action Buttons Bar */}
        <div className="flex items-center justify-between pt-2">
          {/* Reaction Button with Hover Picker */}
          <div
            className="relative"
            onMouseEnter={() => setShowReactionPicker(true)}
            onMouseLeave={() => setShowReactionPicker(false)}
          >
            <button
              onClick={() => handleReaction(userReaction ? userReaction : "LIKE")}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-sans font-medium transition-all ${
                userReaction
                  ? "bg-primary/10 text-primary font-bold"
                  : "text-muted-text hover:text-foreground hover:bg-raised"
              }`}
            >
              <span>{activeReactionObj?.emoji || "👍"}</span>
              <span>{activeReactionObj?.label || "Like"}</span>
            </button>

            {/* Reaction Popover */}
            {showReactionPicker && (
              <div className="absolute bottom-9 left-0 p-1.5 rounded-2xl bg-surface border border-border-hairline flex items-center gap-1 z-30 shadow-editorial-lg animate-in fade-in zoom-in-90 duration-150">
                {REACTIONS.map((r) => (
                  <button
                    key={r.type}
                    onClick={() => handleReaction(r.type)}
                    className="p-1.5 text-lg hover:scale-125 transition-transform rounded-xl hover:bg-raised"
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
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-sans font-medium transition-colors ${
              isCommentsOpen
                ? "text-primary bg-primary/10 font-bold"
                : "text-muted-text hover:text-foreground hover:bg-raised"
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>Comment</span>
          </button>

          {/* Share Button */}
          <button
            onClick={handleShare}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-sans font-medium text-muted-text hover:text-foreground hover:bg-raised transition-colors"
          >
            <Share2 className="w-4 h-4" />
            <span>Share</span>
          </button>

          {/* Bookmark Button */}
          <button
            onClick={handleBookmark}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-sans font-medium transition-colors ${
              isBookmarked
                ? "text-accent text-amber-600 dark:text-amber-400 bg-amber-500/10 font-bold"
                : "text-muted-text hover:text-foreground hover:bg-raised"
            }`}
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

      {/* Remix Studio Modal */}
      {isRemixModalOpen && (
        <TemplateStudioModal
          isOpen={isRemixModalOpen}
          onClose={() => setIsRemixModalOpen(false)}
          initialTemplateId={currentPost.templateId}
          initialData={parsedTemplateData}
          domainId={currentPost.domainId}
        />
      )}
    </>
  );
}
