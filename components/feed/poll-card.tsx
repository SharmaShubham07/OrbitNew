"use client";

import { useState } from "react";
import { Check, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface PollOption {
  id: string;
  text: string;
  voteCount: number;
}

interface PollCardProps {
  poll: {
    id: string;
    question: string;
    expiresAt: string | Date;
    isExpired: boolean;
    userVotedOptionId?: string | null;
    totalVotes: number;
    options: PollOption[];
  };
  postId: string;
  currentUserId?: string;
  onPollUpdate?: (updatedPoll: any) => void;
}

export function PollCard({ poll, postId, currentUserId, onPollUpdate }: PollCardProps) {
  const [currentPoll, setCurrentPoll] = useState(poll);
  const [voting, setVoting] = useState<string | null>(null);

  const hasVoted = Boolean(currentPoll.userVotedOptionId);
  const totalVotes = currentPoll.totalVotes || 0;

  const handleVote = async (optionId: string) => {
    if (hasVoted || currentPoll.isExpired || voting || !currentUserId) {
      if (!currentUserId) toast.error("Please login to vote");
      return;
    }

    setVoting(optionId);
    try {
      const res = await fetch(`/api/posts/${postId}/poll`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ optionId }),
      });

      if (res.ok) {
        const data = await res.json();
        setCurrentPoll(data.poll);
        if (onPollUpdate) onPollUpdate(data.poll);
        toast.success("Vote recorded!");
      } else {
        const err = await res.json();
        toast.error(err.error || "Failed to vote");
      }
    } catch (err) {
      toast.error("Voting error");
    } finally {
      setVoting(null);
    }
  };

  return (
    <div className="my-3 p-4 rounded-2xl bg-white/[0.03] border border-white/10 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h4 className="font-heading font-semibold text-sm text-foreground">
          {currentPoll.question}
        </h4>
        <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 font-medium">
          {currentPoll.isExpired ? "Closed" : "Active Poll"}
        </span>
      </div>

      <div className="flex flex-col gap-2">
        {currentPoll.options.map((opt) => {
          const isUserVote = currentPoll.userVotedOptionId === opt.id;
          const percentage = totalVotes > 0 ? Math.round((opt.voteCount / totalVotes) * 100) : 0;

          return (
            <button
              key={opt.id}
              onClick={() => handleVote(opt.id)}
              disabled={hasVoted || currentPoll.isExpired || Boolean(voting)}
              className={cn(
                "relative flex items-center justify-between p-3 rounded-xl border text-xs font-medium transition-all text-left overflow-hidden group",
                isUserVote
                  ? "border-cyan-500/50 bg-cyan-500/10 text-cyan-200"
                  : "border-white/10 bg-white/[0.02] hover:bg-white/[0.06] text-foreground"
              )}
            >
              {/* Animated fill bar if voted or expired */}
              {(hasVoted || currentPoll.isExpired) && (
                <div
                  className={cn(
                    "absolute top-0 bottom-0 left-0 transition-all duration-500 rounded-xl",
                    isUserVote ? "bg-cyan-500/25" : "bg-white/[0.08]"
                  )}
                  style={{ width: `${percentage}%` }}
                />
              )}

              <div className="relative z-10 flex items-center gap-2">
                {isUserVote && <Check className="w-3.5 h-3.5 text-cyan-400" />}
                {voting === opt.id && <Loader2 className="w-3.5 h-3.5 text-cyan-400 animate-spin" />}
                <span>{opt.text}</span>
              </div>

              {(hasVoted || currentPoll.isExpired) && (
                <div className="relative z-10 font-mono text-[11px] text-muted-foreground font-semibold">
                  {percentage}% ({opt.voteCount})
                </div>
              )}
            </button>
          );
        })}
      </div>

      <div className="flex items-center justify-between text-[11px] text-muted-foreground/80 pt-1">
        <span>{totalVotes} total votes</span>
        <span>
          {currentPoll.isExpired
            ? "Poll ended"
            : `Ends ${new Date(currentPoll.expiresAt).toLocaleDateString()}`}
        </span>
      </div>
    </div>
  );
}
