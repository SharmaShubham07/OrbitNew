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
} from "lucide-react";
import { toast } from "sonner";

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
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-xl rounded-3xl glass-dropdown border border-white/10 p-6 flex flex-col gap-4 shadow-2xl animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center text-white">
              <Sparkles className="w-4 h-4" />
            </div>
            <h3 className="font-heading font-bold text-base text-foreground">
              Create Orbit Post
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Domain Circle Selector */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-muted-foreground font-medium">Post to Domain:</span>
          <select
            value={selectedDomainId}
            onChange={(e) => setSelectedDomainId(e.target.value)}
            className="bg-white/[0.06] border border-white/10 rounded-xl px-3 py-1.5 text-xs text-cyan-300 font-medium focus:outline-none focus:ring-1 focus:ring-cyan-500"
          >
            {DOMAINS.map((dom) => (
              <option key={dom.id} value={dom.id} className="bg-slate-900 text-white">
                {dom.emoji} {dom.name}
              </option>
            ))}
          </select>

          {/* Toggle Type */}
          <div className="ml-auto flex items-center gap-1 bg-white/[0.04] p-1 rounded-xl border border-white/5">
            <button
              onClick={() => setPostType("POST")}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                postType === "POST" ? "bg-cyan-500 text-black font-semibold" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Standard
            </button>
            <button
              onClick={() => setPostType("POLL")}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                postType === "POLL" ? "bg-cyan-500 text-black font-semibold" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Poll
            </button>
          </div>
        </div>

        {/* Text Area */}
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={
            postType === "POLL"
              ? "Add some context for your poll question... (#tags work too!)"
              : "What are you architecting, learning, or launching? Use #hashtags to tag topics..."
          }
          className="w-full bg-white/[0.03] border border-white/10 rounded-2xl p-4 text-sm text-foreground placeholder:text-muted-foreground/70 focus:outline-none focus:ring-1 focus:ring-cyan-500 min-h-[130px] resize-none leading-relaxed"
        />

        {/* Poll Builder Mode */}
        {postType === "POLL" && (
          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 flex flex-col gap-3">
            <div>
              <label className="text-xs font-semibold text-foreground mb-1 block">
                Poll Question
              </label>
              <input
                type="text"
                value={pollQuestion}
                onChange={(e) => setPollQuestion(e.target.value)}
                placeholder="e.g. Which database do you choose for real-time analytics?"
                className="w-full bg-white/[0.05] border border-white/10 rounded-xl px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-cyan-500"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-foreground">Options</label>
              {pollOptions.map((opt, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={opt}
                    onChange={(e) => updatePollOption(i, e.target.value)}
                    placeholder={`Option ${i + 1}`}
                    className="flex-1 bg-white/[0.05] border border-white/10 rounded-xl px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-cyan-500"
                  />
                  {pollOptions.length > 2 && (
                    <button
                      type="button"
                      onClick={() => removePollOption(i)}
                      className="p-2 text-muted-foreground hover:text-rose-400"
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
                  className="flex items-center gap-1.5 text-xs text-cyan-400 hover:text-cyan-300 font-medium mt-1 w-fit"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add another option</span>
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 pt-2 border-t border-white/5">
              <span className="text-xs text-muted-foreground">Poll duration:</span>
              <select
                value={pollDuration}
                onChange={(e) => setPollDuration(Number(e.target.value))}
                className="bg-white/[0.05] border border-white/10 rounded-lg px-2 py-1 text-xs text-foreground"
              >
                <option value={1} className="bg-slate-900">1 Day</option>
                <option value={3} className="bg-slate-900">3 Days</option>
                <option value={7} className="bg-slate-900">7 Days</option>
                <option value={14} className="bg-slate-900">14 Days</option>
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
                className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.04] border border-white/10"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  {m.type === "IMAGE" && <ImageIcon className="w-4 h-4 text-cyan-400 flex-shrink-0" />}
                  {m.type === "VIDEO" && <BarChart2 className="w-4 h-4 text-purple-400 flex-shrink-0" />}
                  {m.type === "DOCUMENT" && <FileText className="w-4 h-4 text-rose-400 flex-shrink-0" />}
                  <span className="text-xs text-foreground truncate">{m.name || "Attached media"}</span>
                </div>
                <button
                  onClick={() => setMediaList(mediaList.filter((_, i) => i !== idx))}
                  className="p-1 text-muted-foreground hover:text-rose-400"
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
        <div className="flex items-center justify-between pt-3 border-t border-white/10">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-xs font-medium text-foreground transition-colors"
            >
              {uploading ? (
                <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
              ) : (
                <Paperclip className="w-4 h-4 text-cyan-400" />
              )}
              <span>Attach Media / PDF</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting || uploading}
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-cyan-500/25 active:scale-95 transition-all disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Publishing...</span>
                </>
              ) : (
                <span>Post Orbit</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
