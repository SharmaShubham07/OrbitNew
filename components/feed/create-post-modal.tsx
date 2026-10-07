"use client";

import { useState, useRef } from "react";
import { DOMAINS } from "@/lib/constants";
import {
  X,
  Image as ImageIcon,
  BarChart2,
  Paperclip,
  Loader2,
  Sparkles,
  Plus,
  Trash2,
  FileText,
  Layout,
} from "lucide-react";
import { toast } from "sonner";
import { TemplateStudioModal } from "@/components/templates/template-studio-modal";
import { Button } from "@/components/ui/button";
import { IconButton } from "@/components/ui/icon-button";

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPostCreated: (post: any) => void;
  currentUser?: {
    id: string;
    name: string;
    username: string;
    image?: string | null;
    primaryDomainId?: string | null;
  } | null;
}

export function CreatePostModal({
  isOpen,
  onClose,
  onPostCreated,
  currentUser,
}: CreatePostModalProps) {
  const [content, setContent] = useState("");
  const [selectedDomainId, setSelectedDomainId] = useState(
    currentUser?.primaryDomainId || DOMAINS[0].id
  );
  const [postType, setPostType] = useState<"POST" | "POLL">("POST");

  // Media attachments
  const [mediaList, setMediaList] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);

  // Poll state
  const [pollQuestion, setPollQuestion] = useState("");
  const [pollOptions, setPollOptions] = useState<string[]>(["", ""]);
  const [pollDuration, setPollDuration] = useState(3);

  const [submitting, setSubmitting] = useState(false);
  const [isTemplateStudioOpen, setIsTemplateStudioOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen && !isTemplateStudioOpen) return null;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size cannot exceed 10MB");
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        setMediaList((prev) => [...prev, data]);
        toast.success("File attached");
      } else {
        const err = await res.json();
        toast.error(err.error || "Upload failed");
      }
    } catch (err) {
      toast.error("Upload error");
    } finally {
      setUploading(false);
    }
  };

  const addPollOption = () => {
    if (pollOptions.length < 4) {
      setPollOptions([...pollOptions, ""]);
    }
  };

  const removePollOption = (index: number) => {
    if (pollOptions.length > 2) {
      setPollOptions(pollOptions.filter((_, i) => i !== index));
    }
  };

  const updatePollOption = (index: number, text: string) => {
    const updated = [...pollOptions];
    updated[index] = text;
    setPollOptions(updated);
  };

  const handleSubmit = async () => {
    if (!content.trim() && postType !== "POLL") {
      toast.error("Please add some content to your post");
      return;
    }

    if (postType === "POLL") {
      if (!pollQuestion.trim()) {
        toast.error("Please provide a question for the poll");
        return;
      }
      const validOptions = pollOptions.map((o) => o.trim()).filter(Boolean);
      if (validOptions.length < 2) {
        toast.error("Please provide at least 2 valid poll options");
        return;
      }
    }

    setSubmitting(true);
    try {
      const payload: any = {
        content: content.trim() || pollQuestion,
        domainId: selectedDomainId,
        postType,
        media: mediaList,
      };

      if (postType === "POLL") {
        payload.poll = {
          question: pollQuestion.trim(),
          options: pollOptions.map((o) => o.trim()).filter(Boolean),
          durationDays: pollDuration,
        };
      }

      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const data = await res.json();
        toast.success("Post published to your domain orbit!");
        onPostCreated(data.post);
        onClose();
        // Reset
        setContent("");
        setMediaList([]);
        setPollQuestion("");
        setPollOptions(["", ""]);
        setPostType("POST");
      } else {
        const err = await res.json();
        toast.error(err.error || "Failed to publish post");
      }
    } catch (err) {
      toast.error("Submission error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-xl rounded-3xl bg-surface border-2 border-border-hairline p-6 flex flex-col gap-4 shadow-editorial-lift animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-border-hairline">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-base text-foreground">
                    Create Orbit Post
                  </h3>
                  <p className="text-[11px] font-mono text-muted-text">
                    EDITORIAL CRAFT COMPOSER
                  </p>
                </div>
              </div>
              <IconButton label="Close" size="sm" onClick={onClose}>
                <X className="w-4 h-4" />
              </IconButton>
            </div>

            {/* Post Template Studio Banner Trigger */}
            <button
              type="button"
              onClick={() => {
                onClose();
                setIsTemplateStudioOpen(true);
              }}
              className="flex items-center justify-between p-3.5 rounded-2xl bg-gradient-to-r from-primary/15 via-accent/15 to-secondary/15 border-2 border-primary/30 hover:border-primary transition-all text-left group shadow-editorial-sm"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shadow-editorial-sm">
                  <Layout className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-serif font-bold text-xs sm:text-sm text-foreground group-hover:text-primary transition-colors">
                    Post Template Studio (16+ Designs)
                  </div>
                  <div className="text-[11px] text-muted-text font-sans">
                    Pull-quotes, book reviews, milestone posters, carousels & polls
                  </div>
                </div>
              </div>
              <span className="font-mono text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-full bg-surface border border-border-hairline text-foreground group-hover:bg-primary group-hover:text-primary-foreground transition-colors shrink-0">
                Open Studio →
              </span>
            </button>

            {/* Domain Circle Selector */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-mono uppercase text-muted-text font-bold">
                Circle:
              </span>
              <select
                value={selectedDomainId}
                onChange={(e) => setSelectedDomainId(e.target.value)}
                className="bg-raised border border-border-hairline rounded-xl px-3 py-1.5 text-xs text-foreground font-medium focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {DOMAINS.map((dom) => (
                  <option key={dom.id} value={dom.id} className="bg-surface text-foreground">
                    {dom.emoji} {dom.name}
                  </option>
                ))}
              </select>

              {/* Toggle Type */}
              <div className="ml-auto flex items-center gap-1 bg-raised p-1 rounded-xl border border-border-hairline">
                <button
                  type="button"
                  onClick={() => setPostType("POST")}
                  className={`px-3 py-1 rounded-lg text-xs font-mono tracking-wider transition-colors ${
                    postType === "POST"
                      ? "bg-surface text-foreground font-bold shadow-editorial-sm border border-border-hairline"
                      : "text-muted-text hover:text-foreground"
                  }`}
                >
                  Standard
                </button>
                <button
                  type="button"
                  onClick={() => setPostType("POLL")}
                  className={`px-3 py-1 rounded-lg text-xs font-mono tracking-wider transition-colors ${
                    postType === "POLL"
                      ? "bg-surface text-foreground font-bold shadow-editorial-sm border border-border-hairline"
                      : "text-muted-text hover:text-foreground"
                  }`}
                >
                  Poll
                </button>
              </div>
            </div>

            {/* Text Area */}
            <div className="relative">
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder={
                  postType === "POLL"
                    ? "Add context for your survey discussion... (#hashtags work too)"
                    : "Share an engineering breakthrough, design perspective, or launch... Use #hashtags..."
                }
                className="w-full bg-raised border border-border-hairline rounded-2xl p-4 text-xs sm:text-sm text-foreground placeholder:text-muted-text focus:outline-none focus:ring-2 focus:ring-primary min-h-[120px] resize-none leading-relaxed font-sans"
              />
              <span className="absolute bottom-2.5 right-3 text-[10px] font-mono text-muted-text">
                {content.length} chars
              </span>
            </div>

            {/* Poll Builder Mode */}
            {postType === "POLL" && (
              <div className="p-4 rounded-2xl bg-raised border border-border-hairline flex flex-col gap-3">
                <div>
                  <label className="text-xs font-mono uppercase font-bold text-foreground mb-1 block">
                    Poll Question
                  </label>
                  <input
                    type="text"
                    value={pollQuestion}
                    onChange={(e) => setPollQuestion(e.target.value)}
                    placeholder="e.g. Which CSS paradigm are you betting on for large-scale apps?"
                    className="w-full bg-surface border border-border-hairline rounded-xl px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs font-mono uppercase text-muted-text font-bold">
                    Options
                  </label>
                  {pollOptions.map((opt, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={opt}
                        onChange={(e) => updatePollOption(i, e.target.value)}
                        placeholder={`Option ${i + 1}`}
                        className="flex-1 bg-surface border border-border-hairline rounded-xl px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                      {pollOptions.length > 2 && (
                        <button
                          type="button"
                          onClick={() => removePollOption(i)}
                          className="p-2 text-muted-text hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}

                  {pollOptions.length < 4 && (
                    <button
                      type="button"
                      onClick={addPollOption}
                      className="flex items-center gap-1.5 text-xs text-primary hover:underline font-mono font-bold mt-1 w-fit"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add option</span>
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-border-hairline">
                  <span className="text-xs font-mono text-muted-text">Duration:</span>
                  <select
                    value={pollDuration}
                    onChange={(e) => setPollDuration(Number(e.target.value))}
                    className="bg-surface border border-border-hairline rounded-lg px-2 py-1 text-xs text-foreground font-mono"
                  >
                    <option value={1}>1 Day</option>
                    <option value={3}>3 Days</option>
                    <option value={7}>7 Days</option>
                    <option value={14}>14 Days</option>
                  </select>
                </div>
              </div>
            )}

            {/* Media Attachments Preview */}
            {mediaList.length > 0 && (
              <div className="flex flex-col gap-2">
                {mediaList.map((m, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-raised border border-border-hairline"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      {m.type === "IMAGE" && (
                        <ImageIcon className="w-4 h-4 text-primary shrink-0" />
                      )}
                      {m.type === "VIDEO" && (
                        <BarChart2 className="w-4 h-4 text-secondary shrink-0" />
                      )}
                      {m.type === "DOCUMENT" && (
                        <FileText className="w-4 h-4 text-accent shrink-0" />
                      )}
                      <span className="text-xs text-foreground truncate font-sans">
                        {m.name || "Attached media"}
                      </span>
                    </div>
                    <button
                      onClick={() => setMediaList(mediaList.filter((_, i) => i !== idx))}
                      className="p-1 text-muted-text hover:text-destructive"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Hidden File Input */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              className="hidden"
              accept="image/*,video/mp4,video/webm,application/pdf"
            />

            {/* Footer actions */}
            <div className="flex items-center justify-between pt-3 border-t border-border-hairline">
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="text-xs font-mono gap-1.5"
                >
                  {uploading ? (
                    <Loader2 className="w-4 h-4 animate-spin text-primary" />
                  ) : (
                    <Paperclip className="w-4 h-4 text-primary" />
                  )}
                  <span>Attach Media</span>
                </Button>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="text-xs font-mono"
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  onClick={handleSubmit}
                  isLoading={submitting || uploading}
                  className="font-mono text-xs font-bold"
                >
                  Post to Circle
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Post Template Studio Modal */}
      <TemplateStudioModal
        isOpen={isTemplateStudioOpen}
        onClose={() => setIsTemplateStudioOpen(false)}
        domainId={selectedDomainId}
        onPostPublished={() => {
          setIsTemplateStudioOpen(false);
          if (onPostCreated) onPostCreated({});
        }}
      />
    </>
  );
}
