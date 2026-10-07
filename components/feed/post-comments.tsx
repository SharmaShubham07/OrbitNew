"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { formatTimeAgo } from "@/lib/utils";
import { Send, Reply, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface PostCommentsProps {
  postId: string;
  currentUserId?: string;
  currentUserImage?: string | null;
  onCommentCountChange?: (count: number) => void;
}

export function PostComments({
  postId,
  currentUserId,
  currentUserImage,
  onCommentCountChange,
}: PostCommentsProps) {
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState("");
  const [replyingTo, setReplyingTo] = useState<{ id: string; name: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function loadComments() {
      try {
        const res = await fetch(`/api/posts/${postId}/comment`);
        if (res.ok) {
          const data = await res.json();
          setComments(data.comments || []);
          if (onCommentCountChange) {
            const total = (data.comments || []).reduce(
              (sum: number, c: any) => sum + 1 + (c.replies?.length || 0),
              0
            );
            onCommentCountChange(total);
          }
        }
      } catch (err) {
        console.error("Failed to load comments:", err);
      } finally {
        setLoading(false);
      }
    }
    loadComments();
  }, [postId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || submitting || !currentUserId) {
      if (!currentUserId) toast.error("Please login to comment");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`/api/posts/${postId}/comment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: commentText.trim(),
          parentId: replyingTo?.id,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (replyingTo) {
          setComments((prev) =>
            prev.map((c) =>
              c.id === replyingTo.id
                ? { ...c, replies: [...(c.replies || []), data.comment] }
                : c
            )
          );
        } else {
          setComments((prev) => [...prev, data.comment]);
        }
        setCommentText("");
        setReplyingTo(null);
        toast.success("Comment posted");
      } else {
        const err = await res.json();
        toast.error(err.error || "Failed to post comment");
      }
    } catch (err) {
      toast.error("Failed to post comment");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mt-4 pt-4 border-t border-white/5 flex flex-col gap-4">
      {/* Comment Composer */}
      {currentUserId && (
        <form onSubmit={handleSubmit} className="flex flex-col gap-2">
          {replyingTo && (
            <div className="flex items-center justify-between px-3 py-1 text-[11px] bg-cyan-500/10 text-cyan-300 rounded-lg">
              <span>Replying to {replyingTo.name}</span>
              <button
                type="button"
                onClick={() => setReplyingTo(null)}
                className="text-muted-foreground hover:text-foreground font-semibold"
              >
                Cancel
              </button>
            </div>
          )}

          <div className="flex items-center gap-2">
            <img
              src={currentUserImage || `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUserId}`}
              alt="Me"
              className="w-7 h-7 rounded-full object-cover border border-white/10 flex-shrink-0"
            />
            <input
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder={replyingTo ? "Write a reply..." : "Add your professional insight..."}
              className="flex-1 bg-white/[0.04] border border-white/10 rounded-xl px-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-cyan-500"
            />
            <button
              type="submit"
              disabled={!commentText.trim() || submitting}
              className="p-1.5 rounded-xl bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30 disabled:opacity-40 transition-colors"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </button>
          </div>
        </form>
      )}

      {/* Comments List */}
      {loading ? (
        <div className="flex justify-center py-4">
          <Loader2 className="w-5 h-5 text-cyan-400 animate-spin" />
        </div>
      ) : comments.length === 0 ? (
        <p className="text-xs text-muted-foreground text-center py-2">
          No comments yet. Start the conversation!
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {comments.map((comment) => (
            <div key={comment.id} className="flex flex-col gap-2">
              <div className="flex items-start gap-2.5 group">
                <Link href={`/in/${comment.author.username}`}>
                  <img
                    src={comment.author.image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${comment.author.username}`}
                    alt={comment.author.name}
                    className="w-7 h-7 rounded-full object-cover border border-white/10"
                  />
                </Link>

                <div className="flex-1 bg-white/[0.02] p-2.5 rounded-2xl border border-white/5">
                  <div className="flex items-center justify-between mb-1">
                    <Link
                      href={`/in/${comment.author.username}`}
                      className="text-xs font-semibold hover:text-cyan-400 transition-colors"
                    >
                      {comment.author.name}{" "}
                      {comment.author.primaryDomain?.emoji && (
                        <span className="text-[10px] text-muted-foreground font-normal">
                          · {comment.author.primaryDomain.emoji}
                        </span>
                      )}
                    </Link>
                    <span className="text-[10px] text-muted-foreground">
                      {formatTimeAgo(comment.createdAt)}
                    </span>
                  </div>

                  <p className="text-xs text-foreground/90 leading-relaxed">{comment.content}</p>

                  {currentUserId && (
                    <button
                      onClick={() => setReplyingTo({ id: comment.id, name: comment.author.name })}
                      className="mt-1 flex items-center gap-1 text-[10px] text-muted-foreground hover:text-cyan-400 transition-colors"
                    >
                      <Reply className="w-3 h-3" />
                      <span>Reply</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Nested Replies */}
              {comment.replies && comment.replies.length > 0 && (
                <div className="ml-8 pl-3 border-l border-white/10 flex flex-col gap-2">
                  {comment.replies.map((reply: any) => (
                    <div key={reply.id} className="flex items-start gap-2.5">
                      <Link href={`/in/${reply.author.username}`}>
                        <img
                          src={reply.author.image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${reply.author.username}`}
                          alt={reply.author.name}
                          className="w-6 h-6 rounded-full object-cover border border-white/10"
                        />
                      </Link>
                      <div className="flex-1 bg-white/[0.02] p-2 rounded-2xl border border-white/5">
                        <div className="flex items-center justify-between mb-0.5">
                          <Link
                            href={`/in/${reply.author.username}`}
                            className="text-xs font-semibold hover:text-cyan-400 transition-colors"
                          >
                            {reply.author.name}
                          </Link>
                          <span className="text-[10px] text-muted-foreground">
                            {formatTimeAgo(reply.createdAt)}
                          </span>
                        </div>
                        <p className="text-xs text-foreground/90 leading-relaxed">{reply.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
