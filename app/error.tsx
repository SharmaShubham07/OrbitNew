"use client";

import { useEffect } from "react";
import { RotateCcw } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global boundary error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center items-center p-4 text-center">
      <div className="w-16 h-16 rounded-3xl bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center justify-center text-2xl mb-4">
        ⚡
      </div>
      <h2 className="font-heading font-bold text-2xl text-foreground">
        Orbit Transmission Glitch
      </h2>
      <p className="text-xs text-muted-foreground mt-2 max-w-md">
        An unexpected error occurred while rendering this view. Our telemetry is on it.
      </p>

      <button
        onClick={() => reset()}
        className="mt-6 flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-white/[0.08] hover:bg-white/[0.14] text-foreground text-xs font-semibold border border-white/10 transition-colors"
      >
        <RotateCcw className="w-4 h-4" />
        <span>Try Again</span>
      </button>
    </div>
  );
}
