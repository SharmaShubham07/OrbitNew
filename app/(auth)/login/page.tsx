"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Sparkles, ArrowRight, Loader2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ThemeSwitcher } from "@/components/ui/theme-switcher";

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
      <div className="absolute top-6 right-6">
        <ThemeSwitcher />
      </div>

      <div className="w-full max-w-md flex flex-col gap-6">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center gap-2">
          <Link href="/" className="flex items-center gap-2.5 group mb-2">
            <div className="w-10 h-10 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center shadow-editorial-sm group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5" />
            </div>
            <span className="font-serif font-black text-2xl tracking-tight text-foreground">
              Orbit
            </span>
          </Link>
          <h1 className="font-serif font-bold text-2xl text-foreground">
            Sign In to Your Circle
          </h1>
          <p className="text-xs text-muted-text font-sans">
            Access your specialized craft circle, peer network, and real-time feeds.
          </p>
        </div>

        {/* Quick Demo Login Panel */}
        <div className="p-4 rounded-3xl bg-surface border-2 border-primary/30 shadow-editorial-md flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs uppercase font-bold text-primary flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4" />
              <span>One-Click Demo Accounts</span>
            </span>
            <span className="font-mono text-[10px] px-2 py-0.5 rounded-full bg-raised border border-border-hairline text-muted-text font-bold">
              DEV DEMO
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleQuickDemoLogin("aarav@orbit.test", "Test@1234")}
              disabled={loading}
              className="p-3 rounded-2xl bg-raised hover:bg-surface text-left border border-border-hairline hover:border-primary transition-all flex flex-col shadow-editorial-sm"
            >
              <span className="font-serif font-bold text-xs text-foreground">
                Aarav Chen 💻
              </span>
              <span className="font-mono text-[10px] text-muted-text">
                Software Engineering
              </span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickDemoLogin("meera@orbit.test", "Test@1234")}
              disabled={loading}
              className="p-3 rounded-2xl bg-raised hover:bg-surface text-left border border-border-hairline hover:border-primary transition-all flex flex-col shadow-editorial-sm"
            >
              <span className="font-serif font-bold text-xs text-foreground">
                Meera Patel 🎨
              </span>
              <span className="font-mono text-[10px] text-muted-text">
                Design & UX
              </span>
            </button>
          </div>
        </div>

        {/* Standard Login Form */}
        <form
          onSubmit={handleSubmit}
          className="p-6 rounded-3xl bg-surface border border-border-hairline flex flex-col gap-4 shadow-editorial-md"
        >
          <div>
            <label className="font-mono text-xs uppercase text-muted-text font-bold block mb-1.5">
              Email or Username
            </label>
            <input
              type="text"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="aarav@orbit.test or aarav"
              className="w-full bg-raised border border-border-hairline rounded-2xl px-3.5 py-2.5 text-xs text-foreground placeholder:text-muted-text focus:outline-none focus:ring-2 focus:ring-primary font-sans"
              required
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="font-mono text-xs uppercase text-muted-text font-bold">
                Password
              </label>
            </div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-raised border border-border-hairline rounded-2xl px-3.5 py-2.5 text-xs text-foreground placeholder:text-muted-text focus:outline-none focus:ring-2 focus:ring-primary font-sans"
              required
            />
          </div>

          <Button
            type="submit"
            variant="primary"
            size="md"
            isLoading={loading}
            className="w-full font-mono text-xs font-bold gap-2 mt-2 shadow-editorial-sm"
          >
            <span>Sign In to Orbit</span>
            <ArrowRight className="w-4 h-4" />
          </Button>

          <p className="text-center text-xs text-muted-text pt-2 font-sans">
            New to the network?{" "}
            <Link href="/signup" className="text-primary hover:underline font-bold">
              Join Orbit Free
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
