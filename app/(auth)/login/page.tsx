"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Sparkles, ArrowRight, Loader2, ShieldCheck, User } from "lucide-react";
import { toast } from "sonner";

export default function LoginPage() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier || !password) {
      toast.error("Please enter email/username and password");
      return;
    }

    setLoading(true);
    try {
      const res = await signIn("credentials", {
        email: identifier,
        password,
        redirect: false,
      });

      if (res?.error) {
        toast.error("Invalid credentials. Check email/username and password.");
      } else {
        toast.success("Welcome back to Orbit!");
        router.push("/feed");
        router.refresh();
      }
    } catch (err) {
      toast.error("Authentication error");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoLogin = async (email: string, pass: string) => {
    setIdentifier(email);
    setPassword(pass);
    setLoading(true);
    try {
      const res = await signIn("credentials", {
        email,
        password: pass,
        redirect: false,
      });

      if (res?.error) {
        toast.error("Demo login failed");
      } else {
        toast.success("Logged in as test account!");
        router.push("/feed");
        router.refresh();
      }
    } catch (err) {
      toast.error("Authentication error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Glow background */}
      <div className="absolute w-[500px] h-[300px] bg-gradient-to-tr from-cyan-500/20 via-indigo-500/20 to-purple-500/10 blur-[100px] pointer-events-none -z-10" />

      <div className="w-full max-w-md flex flex-col gap-6">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center gap-2">
          <Link href="/" className="flex items-center gap-2 group mb-2">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-500/25 group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="font-heading font-extrabold text-2xl tracking-tight bg-gradient-to-r from-white via-slate-200 to-cyan-400 bg-clip-text text-transparent">
              Orbit
            </span>
          </Link>
          <h1 className="font-heading font-bold text-xl text-foreground">Sign In to Your Domain</h1>
          <p className="text-xs text-muted-foreground">
            Access your specialized craft circle, peer network, and real-time feeds.
          </p>
        </div>

        {/* Quick Demo Login Panel */}
        <div className="p-4 rounded-3xl glass-panel border border-cyan-500/30 bg-cyan-500/[0.03] flex flex-col gap-3 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-cyan-300 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              <span>Quick Demo Accounts</span>
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 font-semibold border border-cyan-500/20">
              One-Click
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleQuickDemoLogin("aarav@orbit.test", "Test@1234")}
              disabled={loading}
              className="p-3 rounded-2xl bg-white/[0.05] hover:bg-cyan-500/20 text-left border border-white/10 hover:border-cyan-500/40 transition-all group flex flex-col"
            >
              <span className="text-xs font-bold text-foreground group-hover:text-cyan-300">
                Aarav Sharma 💻
              </span>
              <span className="text-[10px] text-muted-foreground">Software Engineering</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickDemoLogin("meera@orbit.test", "Test@1234")}
              disabled={loading}
              className="p-3 rounded-2xl bg-white/[0.05] hover:bg-purple-500/20 text-left border border-white/10 hover:border-purple-500/40 transition-all group flex flex-col"
            >
              <span className="text-xs font-bold text-foreground group-hover:text-purple-300">
                Meera Patel 🎨
              </span>
              <span className="text-[10px] text-muted-foreground">Design & UX</span>
            </button>
          </div>
        </div>

        {/* Standard Login Form */}
        <form onSubmit={handleSubmit} className="p-6 rounded-3xl glass-panel border border-white/10 flex flex-col gap-4 shadow-xl">
          <div>
            <label className="text-xs font-semibold text-foreground block mb-1.5">
              Email or Username
            </label>
            <input
              type="text"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="aarav@orbit.test or aarav"
              className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-foreground placeholder:text-muted-foreground/70 focus:outline-none focus:ring-1 focus:ring-cyan-500"
              required
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-foreground">Password</label>
            </div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-foreground placeholder:text-muted-foreground/70 focus:outline-none focus:ring-1 focus:ring-cyan-500"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-2 w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-cyan-500/25 active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <span>Sign In to Orbit</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          <p className="text-center text-xs text-muted-foreground pt-2">
            New to the network?{" "}
            <Link href="/signup" className="text-cyan-400 hover:underline font-semibold">
              Create an account
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
