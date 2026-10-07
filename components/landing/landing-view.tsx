"use client";

import Link from "next/link";
import { DOMAINS } from "@/lib/constants";
import {
  Sparkles,
  ArrowRight,
  Shield,
  Zap,
  Globe,
  Users,
  CheckCircle2,
  Code2,
  Palette,
  Brain,
  Rocket,
  MessageSquare,
} from "lucide-react";

export function LandingView() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-cyan-500/30 selection:text-cyan-200 overflow-x-hidden">
      {/* Top Navigation */}
      <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-background/70 border-b border-white/5 px-6 py-4 flex items-center justify-between max-w-7xl mx-auto">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 via-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition-transform">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="font-heading font-bold text-xl tracking-tight bg-gradient-to-r from-white via-slate-200 to-cyan-400 bg-clip-text text-transparent">
              Orbit
            </span>
            <span className="text-[10px] text-muted-foreground font-medium -mt-1 tracking-wider uppercase">
              Domain Network
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="px-4 py-2 rounded-xl text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors"
          >
            Sign In
          </Link>
          <Link
            href="/signup"
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-cyan-500/20 active:scale-95 transition-all"
          >
            Join Orbit Free
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-16 pb-20 px-6 max-w-6xl mx-auto text-center flex flex-col items-center">
        {/* Glow background */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-cyan-500/20 via-indigo-500/20 to-purple-500/10 blur-[120px] pointer-events-none -z-10" />

        {/* Orbit Tag Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-500/10 text-cyan-300 text-xs font-semibold border border-cyan-500/20 shadow-sm mb-6 animate-in fade-in zoom-in duration-500">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
          <span>The Domain-First Professional Network</span>
        </div>

        {/* Hero Title */}
        <h1 className="font-heading font-extrabold text-4xl sm:text-6xl md:text-7xl tracking-tight max-w-4xl text-foreground leading-[1.1]">
          No algorithmic noise. <br />
          Just <span className="bg-gradient-to-r from-cyan-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">high-signal craft.</span>
        </h1>

        {/* Subtitle */}
        <p className="mt-6 text-sm sm:text-base md:text-lg text-muted-foreground max-w-2xl leading-relaxed">
          Orbit replaces monolithic corporate feeds with dedicated domain circles. Connect with verified engineers, designers, researchers, and builders in your exact discipline.
        </p>

        {/* CTA Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row items-center gap-4">
          <Link
            href="/signup"
            className="flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-black text-sm font-bold shadow-xl shadow-cyan-500/30 hover:scale-105 active:scale-95 transition-all"
          >
            <span>Launch Your Orbit</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <Link
            href="/login"
            className="flex items-center gap-2 px-7 py-3.5 rounded-2xl bg-white/[0.06] hover:bg-white/[0.1] text-foreground text-sm font-semibold border border-white/10 transition-colors"
          >
            <span>Explore Demo Accounts</span>
          </Link>
        </div>

        {/* Orbit Live Metrics Showcase */}
        <div className="mt-14 grid grid-cols-2 sm:grid-cols-4 gap-4 w-full max-w-3xl">
          <div className="p-4 rounded-2xl glass-panel border border-white/5">
            <span className="font-heading font-bold text-2xl text-cyan-400">10</span>
            <p className="text-xs text-muted-foreground mt-0.5">Specialized Domains</p>
          </div>
          <div className="p-4 rounded-2xl glass-panel border border-white/5">
            <span className="font-heading font-bold text-2xl text-indigo-400">0%</span>
            <p className="text-xs text-muted-foreground mt-0.5">Influencer Spam</p>
          </div>
          <div className="p-4 rounded-2xl glass-panel border border-white/5">
            <span className="font-heading font-bold text-2xl text-amber-400">Real-time</span>
            <p className="text-xs text-muted-foreground mt-0.5">Socket Collaboration</p>
          </div>
          <div className="p-4 rounded-2xl glass-panel border border-white/5">
            <span className="font-heading font-bold text-2xl text-emerald-400">100%</span>
            <p className="text-xs text-muted-foreground mt-0.5">Verified Peer Circles</p>
          </div>
        </div>
      </section>

      {/* Domain Circles Showcase */}
      <section className="py-16 px-6 max-w-6xl mx-auto w-full">
        <div className="text-center mb-12">
          <h2 className="font-heading font-bold text-2xl sm:text-3xl text-foreground">
            Explore Craft Circles
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Pick your primary domain at signup. Follow secondary circles to cross-pollinate ideas.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {DOMAINS.map((dom) => (
            <div
              key={dom.id}
              className="p-5 rounded-3xl glass-panel border border-white/10 hover:border-cyan-500/40 transition-all flex flex-col justify-between gap-3 group hover:scale-[1.02]"
            >
              <div>
                <div className="w-12 h-12 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-center text-2xl mb-3 group-hover:scale-110 transition-transform">
                  {dom.emoji}
                </div>
                <h3 className="font-heading font-bold text-sm text-foreground group-hover:text-cyan-400 transition-colors">
                  {dom.name}
                </h3>
                <p className="text-[11px] text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
                  {dom.description}
                </p>
              </div>

              <span className="text-[10px] text-cyan-400 font-semibold">
                Explore circle →
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Bento Feature Grid */}
      <section className="py-16 px-6 max-w-6xl mx-auto w-full">
        <div className="text-center mb-12">
          <h2 className="font-heading font-bold text-2xl sm:text-3xl text-foreground">
            Engineered for Modern Craft
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Built from scratch with zero legacy bloated feeds.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="p-8 rounded-3xl glass-panel border border-white/10 flex flex-col justify-between gap-4">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
              <Globe className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-heading font-bold text-base text-foreground mb-1">
                Domain-First Feeds
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Filter instantly between &apos;For You&apos;, &apos;My Domain&apos;, and &apos;Direct Connections&apos;. Every post is anchored in verified craft topics.
              </p>
            </div>
          </div>

          {/* Card 2 */}
          <div className="p-8 rounded-3xl glass-panel border border-white/10 flex flex-col justify-between gap-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
              <MessageSquare className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-heading font-bold text-base text-foreground mb-1">
                Real-Time Socket Chat
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Direct peer-to-peer collaboration with typing indicators, online status, file uploads, and unread sync.
              </p>
            </div>
          </div>

          {/* Card 3 */}
          <div className="p-8 rounded-3xl glass-panel border border-white/10 flex flex-col justify-between gap-4">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-heading font-bold text-base text-foreground mb-1">
                Interactive Polls & Rich Media
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Run live architecture polls with live vote tallies, attach PDFs, architecture diagrams, and videos seamlessly.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Demo Test Credentials Highlight */}
      <section className="py-12 px-6 max-w-4xl mx-auto w-full">
        <div className="p-8 rounded-3xl bg-gradient-to-r from-cyan-950/40 via-indigo-950/40 to-slate-900 border border-cyan-500/30 text-center flex flex-col items-center gap-4 shadow-2xl">
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 text-cyan-300 flex items-center justify-center">
            <Rocket className="w-6 h-6" />
          </div>
          <h3 className="font-heading font-bold text-xl text-foreground">
            Experience Orbit Instantly
          </h3>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-lg">
            Use the One-Click Demo buttons on the Login page to instantly enter as <strong>Aarav (Software Engineering)</strong> or <strong>Meera (Design & UX)</strong>.
          </p>

          <Link
            href="/login"
            className="px-6 py-2.5 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-bold shadow-lg shadow-cyan-500/25 transition-all"
          >
            Go to Quick Login
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto py-8 border-t border-white/5 px-6 max-w-7xl mx-auto w-full flex flex-col sm:flex-row items-center justify-between text-xs text-muted-foreground gap-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-cyan-400" />
          <span className="font-semibold text-foreground">Orbit Professional Network</span>
          <span>© 2026</span>
        </div>

        <div className="flex items-center gap-6">
          <Link href="/login" className="hover:text-cyan-400">Sign In</Link>
          <Link href="/signup" className="hover:text-cyan-400">Join Network</Link>
          <a href="https://github.com" target="_blank" rel="noreferrer" className="hover:text-cyan-400">Open Source</a>
        </div>
      </footer>
    </div>
  );
}
