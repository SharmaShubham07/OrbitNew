"use client";

import { useState } from "react";
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
  Rocket,
  MessageSquare,
  Layout,
  Palette,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import { Card } from "@/components/ui/card";
import { ThemeSwitcher } from "@/components/ui/theme-switcher";
import { TemplateCardRenderer } from "@/components/templates/template-card-renderer";
import { TEMPLATE_DEFINITIONS } from "@/components/templates/template-definitions";

export function LandingView() {
  const [activeTemplateIdx, setActiveTemplateIdx] = useState(0);

  const featuredTemplates = [
    TEMPLATE_DEFINITIONS.find((t) => t.id === "pull-quote") || TEMPLATE_DEFINITIONS[0],
    TEMPLATE_DEFINITIONS.find((t) => t.id === "book-review") || TEMPLATE_DEFINITIONS[1],
    TEMPLATE_DEFINITIONS.find((t) => t.id === "milestone-poster") || TEMPLATE_DEFINITIONS[3],
    TEMPLATE_DEFINITIONS.find((t) => t.id === "case-study") || TEMPLATE_DEFINITIONS[10],
  ];

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-accent/30 selection:text-foreground overflow-x-hidden">
      {/* Top Editorial Navigation */}
      <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-surface/80 border-b border-border-hairline px-6 py-4 flex items-center justify-between max-w-7xl mx-auto">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center shadow-editorial-sm group-hover:scale-105 transition-transform">
            <Sparkles className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <span className="font-serif font-black text-2xl tracking-tight text-foreground">
              Orbit
            </span>
            <span className="font-mono text-[9px] text-muted-text font-bold -mt-1 tracking-widest uppercase">
              EDITORIAL NETWORK
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-3">
          <ThemeSwitcher />
          <Link
            href="/login"
            className="px-4 py-2 rounded-2xl text-xs font-mono font-bold text-muted-text hover:text-foreground hover:bg-raised transition-colors"
          >
            Sign In
          </Link>
          <Link href="/signup">
            <Button variant="primary" size="sm" className="font-mono text-xs font-bold">
              Join Orbit Free
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Editorial Spread */}
      <section className="relative pt-16 pb-20 px-6 max-w-6xl mx-auto text-center flex flex-col items-center">
        {/* Issue Stamp Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-surface border border-border-hairline shadow-editorial-sm mb-6 animate-in fade-in duration-500">
          <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          <span className="font-mono text-[11px] uppercase tracking-widest font-bold text-foreground">
            ISSUE NO. 14 // THE DOMAIN-FIRST NETWORK
          </span>
        </div>

        {/* Hero Title with Fraunces Typography */}
        <h1 className="font-serif font-black text-4xl sm:text-6xl md:text-7xl tracking-tight max-w-4xl text-foreground leading-[1.08]">
          No algorithmic noise. <br />
          Just <span className="italic text-primary font-normal">high-craft circles.</span>
        </h1>

        {/* Subtitle */}
        <p className="mt-6 text-sm sm:text-base md:text-lg text-muted-text max-w-2xl font-sans leading-relaxed">
          Orbit replaces corporate blue feeds with warm, tactile paper layouts and 16+ post templates. Join verified engineers, designers, researchers, and builders in specialized domain circles.
        </p>

        {/* CTA Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row items-center gap-4">
          <Link href="/signup">
            <Button
              variant="primary"
              size="lg"
              className="font-mono text-xs font-bold shadow-editorial-lift gap-2"
            >
              <span>Launch Your Orbit Circle</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>

          <Link href="/login">
            <Button
              variant="outline"
              size="lg"
              className="font-mono text-xs font-bold gap-2"
            >
              <span>Quick Demo Accounts</span>
            </Button>
          </Link>
        </div>

        {/* Live Rotating Post Template Showcase Collage */}
        <div className="mt-16 w-full max-w-4xl space-y-4">
          <div className="flex items-center justify-between px-2">
            <span className="font-mono text-xs uppercase font-bold text-primary tracking-widest">
              FEATURED POST TEMPLATES (16+ READY TO USE)
            </span>
            <div className="flex items-center gap-1.5">
              {featuredTemplates.map((t, idx) => (
                <button
                  key={t.id}
                  onClick={() => setActiveTemplateIdx(idx)}
                  className={`px-3 py-1 rounded-xl text-xs font-mono tracking-wider transition-all ${
                    activeTemplateIdx === idx
                      ? "bg-primary text-primary-foreground font-bold shadow-editorial-sm"
                      : "bg-surface text-muted-text border border-border-hairline hover:bg-raised"
                  }`}
                >
                  {t.title}
                </button>
              ))}
            </div>
          </div>

          <div className="shadow-editorial-lift rounded-3xl overflow-hidden border-2 border-border-hairline text-left">
            <TemplateCardRenderer
              templateId={featuredTemplates[activeTemplateIdx].id}
              data={featuredTemplates[activeTemplateIdx].defaultData}
              aspectRatio="auto"
            />
          </div>
        </div>
      </section>

      {/* Domain Circles Showcase */}
      <section className="py-16 px-6 max-w-6xl mx-auto w-full">
        <div className="text-center mb-12 space-y-1">
          <span className="font-mono text-xs uppercase font-bold text-primary tracking-widest">
            01 // CIRCLE DIRECTORY
          </span>
          <h2 className="font-serif font-bold text-2xl sm:text-3xl text-foreground">
            Explore Craft Disciplines
          </h2>
          <p className="text-xs sm:text-sm text-muted-text font-sans">
            Every user anchors in a primary domain. Follow secondary circles to cross-pollinate insights.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {DOMAINS.map((dom) => (
            <div
              key={dom.id}
              className="p-5 rounded-3xl bg-surface border border-border-hairline hover:border-primary transition-all flex flex-col justify-between gap-3 group hover:shadow-editorial-md"
            >
              <div>
                <div className="w-12 h-12 rounded-2xl bg-raised border border-border-hairline flex items-center justify-center text-2xl mb-3 shadow-editorial-sm group-hover:scale-110 transition-transform">
                  {dom.emoji}
                </div>
                <h3 className="font-serif font-bold text-base text-foreground group-hover:text-primary transition-colors">
                  {dom.name}
                </h3>
                <p className="text-xs text-muted-text font-sans mt-1 line-clamp-2 leading-relaxed">
                  {dom.description}
                </p>
              </div>

              <span className="text-[11px] font-mono font-bold text-primary uppercase">
                Explore Circle →
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Bento Editorial Pillars */}
      <section className="py-16 px-6 max-w-6xl mx-auto w-full">
        <div className="text-center mb-12 space-y-1">
          <span className="font-mono text-xs uppercase font-bold text-primary tracking-widest">
            02 // PLATFORM CRAFT
          </span>
          <h2 className="font-serif font-bold text-2xl sm:text-3xl text-foreground">
            Engineered for Signal, Not Noise
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card variant="paper" className="p-8 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-raised border border-border-hairline flex items-center justify-center text-primary shadow-editorial-sm">
              <Layout className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-lg text-foreground mb-1">
                Post Template Studio
              </h3>
              <p className="text-xs text-muted-text font-sans leading-relaxed">
                16+ bespoke editorial layouts including pull-quotes, reviews, hiring posters, and slide carousels with direct on-canvas editing and high-res PNG export.
              </p>
            </div>
          </Card>

          <Card variant="paper" className="p-8 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-raised border border-border-hairline flex items-center justify-center text-secondary shadow-editorial-sm">
              <MessageSquare className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-lg text-foreground mb-1">
                Real-Time Socket Messaging
              </h3>
              <p className="text-xs text-muted-text font-sans leading-relaxed">
                Instant 1-to-1 direct chat with typing indicators, presence status, attachments, and unread badges powered by Socket.IO.
              </p>
            </div>
          </Card>

          <Card variant="paper" className="p-8 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-raised border border-border-hairline flex items-center justify-center text-accent shadow-editorial-sm">
              <Palette className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-lg text-foreground mb-1">
                Three Editorial Themes
              </h3>
              <p className="text-xs text-muted-text font-sans leading-relaxed">
                Paper (warm default light), Cobalt Coast (bold electric grid), and Midnight (refined dark). Fully accessible and WCAG AA verified.
              </p>
            </div>
          </Card>
        </div>
      </section>

      {/* Demo Test Logins Banner */}
      <section className="py-12 px-6 max-w-4xl mx-auto w-full">
        <div className="p-8 rounded-3xl bg-surface border-2 border-primary text-center flex flex-col items-center gap-4 shadow-editorial-lift">
          <div className="w-12 h-12 rounded-2xl bg-raised border border-border-hairline text-primary flex items-center justify-center shadow-editorial-sm">
            <Rocket className="w-6 h-6" />
          </div>
          <h3 className="font-serif font-bold text-2xl text-foreground">
            Experience Orbit Right Now
          </h3>
          <p className="text-xs sm:text-sm text-muted-text font-sans max-w-lg">
            Use the One-Click Demo buttons on the login page to instantly test with <strong>Aarav (Software Engineering)</strong> or <strong>Meera (Design)</strong>.
          </p>

          <Link href="/login">
            <Button variant="primary" size="md" className="font-mono text-xs font-bold">
              Go to Quick Login & Demo Accounts
            </Button>
          </Link>
        </div>
      </section>

      {/* Editorial Footer */}
      <footer className="mt-auto py-8 border-t border-border-hairline px-6 max-w-7xl mx-auto w-full flex flex-col sm:flex-row items-center justify-between text-xs font-mono text-muted-text gap-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary" />
          <span className="font-bold text-foreground">ORBIT EDITORIAL NETWORK</span>
          <span>© 2026</span>
        </div>

        <div className="flex items-center gap-6">
          <Link href="/design" className="hover:text-primary">Design System</Link>
          <Link href="/login" className="hover:text-primary">Sign In</Link>
          <Link href="/signup" className="hover:text-primary">Join Circle</Link>
        </div>
      </footer>
    </div>
  );
}
