import Link from "next/link";
import { Sparkles, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex flex-col justify-center items-center p-4 text-center">
      <div className="w-16 h-16 rounded-3xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center text-3xl mb-4 shadow-xl">
        🪐
      </div>
      <h1 className="font-heading font-extrabold text-3xl sm:text-4xl text-foreground">
        404 – Orbit Coordinates Not Found
      </h1>
      <p className="text-xs sm:text-sm text-muted-foreground mt-2 max-w-md leading-relaxed">
        The domain, profile, or post you are searching for has drifted out of orbit or does not exist.
      </p>

      <Link
        href="/feed"
        className="mt-6 flex items-center gap-2 px-6 py-3 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-bold shadow-lg shadow-cyan-500/25 transition-all"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Return to Feed</span>
      </Link>
    </div>
  );
}
