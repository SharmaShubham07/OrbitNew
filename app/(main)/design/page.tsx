"use client";

import * as React from "react";
import {
  Sparkles,
  Palette,
  Layout,
  Type,
  CheckCircle2,
  Sliders,
  Download,
  Send,
  Eye,
  Bell,
  Heart,
  MessageSquare,
  Share2,
  Bookmark,
  Compass,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { IconButton } from "@/components/ui/icon-button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Chip } from "@/components/ui/chip";
import { Avatar } from "@/components/ui/avatar";
import { Tabs } from "@/components/ui/tabs";
import { Stat } from "@/components/ui/stat";
import { SectionHeader } from "@/components/ui/section-header";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton, PostCardSkeleton } from "@/components/ui/skeleton";
import { ThemeSwitcher } from "@/components/ui/theme-switcher";
import { TEMPLATE_DEFINITIONS } from "@/components/templates/template-definitions";
import { TemplateCardRenderer } from "@/components/templates/template-card-renderer";
import { TemplateStudioModal } from "@/components/templates/template-studio-modal";

export default function DesignSystemPage() {
  const [activeTab, setActiveTab] = React.useState("all");
  const [selectedTemplateForStudio, setSelectedTemplateForStudio] = React.useState<string | null>(null);

  const tabs = [
    { id: "all", label: "All Components" },
    { id: "tokens", label: "Color Tokens" },
    { id: "typography", label: "Typography" },
    { id: "buttons", label: "Buttons & Chips" },
    { id: "cards", label: "Cards & Bento" },
    { id: "templates", label: "16+ Post Templates" },
  ];

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 space-y-12">
      {/* Design System Hero Header */}
      <div className="p-8 rounded-3xl bg-surface border-2 border-border-hairline shadow-editorial-md space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs uppercase font-bold text-primary tracking-widest">
                ORBIT DESIGN SYSTEM // SPEC v2.0
              </span>
              <Chip variant="stamp">EDITORIAL SOCIAL</Chip>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
              Component & Template Laboratory
            </h1>
            <p className="text-xs sm:text-sm text-muted-text font-sans max-w-2xl">
              An interactive playground documenting our warm paper aesthetic, Fraunces variable serif typography, high-contrast color tokens, and 16+ post templates.
            </p>
          </div>

          <div className="shrink-0 flex items-center gap-3">
            <ThemeSwitcher />
            <Button
              variant="primary"
              size="sm"
              onClick={() => setSelectedTemplateForStudio("pull-quote")}
              className="gap-2 font-mono text-xs font-bold"
            >
              <Sparkles className="w-4 h-4" />
              <span>Open Studio</span>
            </Button>
          </div>
        </div>

        <Tabs
          items={tabs}
          activeId={activeTab}
          onChange={setActiveTab}
          variant="editorial"
        />
      </div>

      {/* 1. THEME TOKENS */}
      {(activeTab === "all" || activeTab === "tokens") && (
        <section className="space-y-6">
          <SectionHeader
            number="01"
            title="Design Tokens & Theme Palettes"
            subtitle="Three distinct editorial styles with WCAG AA compliance"
          />

          <div className="grid sm:grid-cols-3 gap-6">
            {/* Paper Theme */}
            <Card variant="paper" className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs uppercase font-bold text-paper-terracotta">
                  01 // PAPER (DEFAULT)
                </span>
                <span className="text-[10px] font-mono text-muted-text">LIGHT</span>
              </div>
              <p className="text-xs text-muted-text">
                Warm beige tones inspired by printed journals. Terracotta & olive accents.
              </p>
              <div className="grid grid-cols-4 gap-2 pt-2">
                <div className="h-10 rounded-xl bg-[#EDE6DA] border border-[#CFC5B3] flex items-center justify-center text-[10px] font-mono text-[#1E1B16]">#EDE6DA</div>
                <div className="h-10 rounded-xl bg-[#F7F2E9] border border-[#CFC5B3] flex items-center justify-center text-[10px] font-mono text-[#1E1B16]">#F7F2E9</div>
                <div className="h-10 rounded-xl bg-[#B5552F] text-white flex items-center justify-center text-[10px] font-mono">#B5552F</div>
                <div className="h-10 rounded-xl bg-[#6F7B4A] text-white flex items-center justify-center text-[10px] font-mono">#6F7B4A</div>
              </div>
            </Card>

            {/* Cobalt Coast Theme */}
            <Card variant="paper" className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs uppercase font-bold text-[#1F4BD8]">
                  02 // COBALT COAST
                </span>
                <span className="text-[10px] font-mono text-muted-text">BOLD</span>
              </div>
              <p className="text-xs text-muted-text">
                Electric cobalt grid with sun cream surfaces and coral highlights.
              </p>
              <div className="grid grid-cols-4 gap-2 pt-2">
                <div className="h-10 rounded-xl bg-[#F6EFD9] border border-[#D1E0F5] flex items-center justify-center text-[10px] font-mono text-[#0B1F66]">#F6EFD9</div>
                <div className="h-10 rounded-xl bg-[#1F4BD8] text-white flex items-center justify-center text-[10px] font-mono">#1F4BD8</div>
                <div className="h-10 rounded-xl bg-[#0B1F66] text-white flex items-center justify-center text-[10px] font-mono">#0B1F66</div>
                <div className="h-10 rounded-xl bg-[#F2674A] text-white flex items-center justify-center text-[10px] font-mono">#F2674A</div>
              </div>
            </Card>

            {/* Midnight Theme */}
            <Card variant="paper" className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs uppercase font-bold text-[#E8A94A]">
                  03 // MIDNIGHT
                </span>
                <span className="text-[10px] font-mono text-muted-text">DARK</span>
              </div>
              <p className="text-xs text-muted-text">
                Deep obsidian slate with luminous amber and teal accents. Zero harsh neon.
              </p>
              <div className="grid grid-cols-4 gap-2 pt-2">
                <div className="h-10 rounded-xl bg-[#0E0F14] border border-[#2A2D3A] text-white flex items-center justify-center text-[10px] font-mono">#0E0F14</div>
                <div className="h-10 rounded-xl bg-[#171922] border border-[#2A2D3A] text-white flex items-center justify-center text-[10px] font-mono">#171922</div>
                <div className="h-10 rounded-xl bg-[#E8A94A] text-black flex items-center justify-center text-[10px] font-mono">#E8A94A</div>
                <div className="h-10 rounded-xl bg-[#4FD1B5] text-black flex items-center justify-center text-[10px] font-mono">#4FD1B5</div>
              </div>
            </Card>
          </div>
        </section>
      )}

      {/* 2. TYPOGRAPHY SCALE */}
      {(activeTab === "all" || activeTab === "typography") && (
        <section className="space-y-6">
          <SectionHeader
            number="02"
            title="Typography Hierarchy"
            subtitle="Fraunces (Headlines) • DM Sans (Body) • JetBrains Mono (Metas)"
          />

          <Card variant="paper" className="space-y-6">
            <div className="space-y-1">
              <span className="font-mono text-[10px] uppercase tracking-widest text-muted-text">
                Display 56 / 64
              </span>
              <div className="font-serif text-4xl sm:text-5xl lg:text-6xl font-black leading-tight text-foreground">
                Editorial Professionalism
              </div>
            </div>

            <div className="space-y-1">
              <span className="font-mono text-[10px] uppercase tracking-widest text-muted-text">
                H1 Serif Heading 40px
              </span>
              <h1 className="font-serif text-3xl sm:text-4xl font-bold text-foreground">
                Domain-First Knowledge Circles
              </h1>
            </div>

            <div className="space-y-1">
              <span className="font-mono text-[10px] uppercase tracking-widest text-muted-text">
                Italic Pull-Quote Serif 24px
              </span>
              <p className="font-serif italic text-xl sm:text-2xl text-foreground">
                &ldquo;Craft is what happens when attention to detail meets unwavering care for the reader.&rdquo;
              </p>
            </div>

            <div className="space-y-1">
              <span className="font-mono text-[10px] uppercase tracking-widest text-muted-text">
                UI & Body Text (DM Sans) 16px
              </span>
              <p className="font-sans text-sm sm:text-base text-foreground leading-relaxed max-w-3xl">
                Orbit moves past stale corporate feeds and algorithmic noise by giving each discipline its own dedicated circle with curated feeds, peer directories, and customizable post templates.
              </p>
            </div>

            <div className="space-y-1">
              <span className="font-mono text-[10px] uppercase tracking-widest text-muted-text">
                Labels & Metas (JetBrains Mono) 12px
              </span>
              <p className="font-mono text-xs uppercase tracking-widest text-primary font-bold">
                ISSUE NO. 14 // PUBLISHED VIA ORBIT ARCHIVE // 2026
              </p>
            </div>
          </Card>
        </section>
      )}

      {/* 3. BUTTONS & CHIPS */}
      {(activeTab === "all" || activeTab === "buttons") && (
        <section className="space-y-6">
          <SectionHeader
            number="03"
            title="Interactive Controls, Buttons & Avatars"
            subtitle="Accessible touch targets (44px) with animated orbit rings"
          />

          <Card variant="paper" className="space-y-6">
            {/* Buttons */}
            <div className="space-y-2">
              <span className="font-mono text-xs uppercase text-muted-text font-bold">
                Button Variants
              </span>
              <div className="flex flex-wrap items-center gap-3">
                <Button variant="primary">Primary Action</Button>
                <Button variant="secondary">Secondary Action</Button>
                <Button variant="outline">Outline Button</Button>
                <Button variant="editorial">Editorial Button</Button>
                <Button variant="ghost">Ghost Button</Button>
                <Button variant="danger">Destructive</Button>
                <Button variant="primary" isLoading>Loading State</Button>
              </div>
            </div>

            {/* Chips & Stamps */}
            <div className="space-y-2">
              <span className="font-mono text-xs uppercase text-muted-text font-bold">
                Chip & Stamp Badges
              </span>
              <div className="flex flex-wrap items-center gap-2.5">
                <Chip variant="default">Default Chip</Chip>
                <Chip variant="domain" icon={<Sparkles className="w-3 h-3" />}>Software Engineering</Chip>
                <Chip variant="stamp">STAMP #402</Chip>
                <Chip variant="accent">Featured Role</Chip>
                <Chip variant="outline">Interactive Filter</Chip>
              </div>
            </div>

            {/* Orbit Avatars */}
            <div className="space-y-2">
              <span className="font-mono text-xs uppercase text-muted-text font-bold">
                Avatars with Double Orbit Ring
              </span>
              <div className="flex items-center gap-6">
                <Avatar alt="Aarav Chen" size="sm" withOrbit status="online" />
                <Avatar alt="Meera Patel" size="md" withOrbit status="busy" />
                <Avatar alt="Sophia Kim" size="lg" withOrbit status="online" />
                <Avatar alt="Vikram Rao" size="xl" withOrbit status="offline" />
              </div>
            </div>
          </Card>
        </section>
      )}

      {/* 4. CARDS & BENTO SKELETONS */}
      {(activeTab === "all" || activeTab === "cards") && (
        <section className="space-y-6">
          <SectionHeader
            number="04"
            title="Card Variants & Shimmer Skeletons"
            subtitle="Paper, Raised, Tile, and Striped layouts with tactile depth"
          />

          <div className="grid sm:grid-cols-3 gap-6">
            <Card variant="paper" interactive>
              <CardTitle>Paper Card</CardTitle>
              <CardDescription>Clean linen background with subtle border</CardDescription>
              <div className="mt-4 text-xs text-muted-text">Hover to test elevation lift</div>
            </Card>

            <Card variant="raised" interactive>
              <CardTitle>Raised Card</CardTitle>
              <CardDescription>Ivory background with enhanced drop shadow</CardDescription>
              <div className="mt-4 text-xs text-muted-text">Ideal for bento priority widgets</div>
            </Card>

            <Card variant="striped" interactive>
              <CardTitle>Striped Card</CardTitle>
              <CardDescription>Cobalt awning diagonal pattern</CardDescription>
              <div className="mt-4 text-xs text-muted-text">High-energy visual breaks</div>
            </Card>
          </div>

          <div className="space-y-2">
            <span className="font-mono text-xs uppercase text-muted-text font-bold">
              Shimmer Skeleton Feed Loaders
            </span>
            <PostCardSkeleton />
          </div>
        </section>
      )}

      {/* 5. 16+ POST TEMPLATES GALLERY */}
      {(activeTab === "all" || activeTab === "templates") && (
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <SectionHeader
              number="05"
              title="Post Template Studio Gallery"
              subtitle="All 16 production templates rendered live with custom schemas"
              className="mb-0 border-b-0 pb-0"
            />
            <Button
              variant="editorial"
              size="sm"
              onClick={() => setSelectedTemplateForStudio("pull-quote")}
              className="gap-2 text-xs font-mono"
            >
              <Sparkles className="w-4 h-4" />
              <span>Launch Live Studio</span>
            </Button>
          </div>

          <div className="grid sm:grid-cols-2 gap-8">
            {TEMPLATE_DEFINITIONS.map((def, idx) => (
              <div key={def.id} className="space-y-2">
                <div className="flex items-center justify-between px-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-primary">
                      {idx + 1 < 10 ? `0${idx + 1}` : idx + 1}
                    </span>
                    <span className="font-serif font-bold text-sm text-foreground">
                      {def.title}
                    </span>
                  </div>
                  <button
                    onClick={() => setSelectedTemplateForStudio(def.id)}
                    className="text-xs font-mono text-primary hover:underline"
                  >
                    Customize in Studio →
                  </button>
                </div>

                <div className="shadow-editorial-md rounded-3xl overflow-hidden">
                  <TemplateCardRenderer
                    templateId={def.id}
                    data={def.defaultData}
                    aspectRatio="auto"
                  />
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Template Studio Modal instance */}
      <TemplateStudioModal
        isOpen={!!selectedTemplateForStudio}
        onClose={() => setSelectedTemplateForStudio(null)}
        initialTemplateId={selectedTemplateForStudio || "pull-quote"}
      />
    </div>
  );
}
