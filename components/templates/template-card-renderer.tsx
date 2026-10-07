"use client";

import * as React from "react";
import Image from "next/image";
import {
  Quote,
  Star,
  Sparkles,
  Trophy,
  Briefcase,
  Lightbulb,
  CheckCircle2,
  Calendar,
  TrendingUp,
  BookOpen,
  HelpCircle,
  Wrench,
  Layers,
  HeartHandshake,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Sliders,
} from "lucide-react";
import { TEMPLATE_DEFINITIONS } from "./template-definitions";
import { cn } from "@/components/ui/button";

export interface TemplateCardRendererProps {
  templateId: string;
  data: Record<string, any>;
  isEditing?: boolean;
  onDataChange?: (newData: Record<string, any>) => void;
  aspectRatio?: "1:1" | "4:5" | "16:9" | "auto";
  className?: string;
}

export function TemplateCardRenderer({
  templateId,
  data,
  isEditing = false,
  onDataChange,
  aspectRatio = "auto",
  className = "",
}: TemplateCardRendererProps) {
  const definition = TEMPLATE_DEFINITIONS.find((t) => t.id === templateId) || TEMPLATE_DEFINITIONS[0];
  const mergedData = { ...definition.defaultData, ...data };

  const currentPaletteId = mergedData.themeVariant || "palette-1";
  const palette =
    definition.colorPalettes.find((p) => p.id === currentPaletteId) ||
    definition.colorPalettes[0];

  const updateField = (field: string, value: any) => {
    if (onDataChange) {
      onDataChange({ ...mergedData, [field]: value });
    }
  };

  // State for interactive slider in Before/After template
  const [sliderPos, setSliderPos] = React.useState(50);
  // State for carousel slide navigation
  const [activeSlide, setActiveSlide] = React.useState(0);
  // State for poll voting in feed
  const [userVotedIdx, setUserVotedIdx] = React.useState<number | null>(null);

  const aspectStyles = {
    "1:1": "aspect-square",
    "4:5": "aspect-[4/5]",
    "16:9": "aspect-[16/9]",
    auto: "min-h-[280px]",
  };

  // Helper for inline editable text
  const renderField = (
    fieldKey: string,
    value: string,
    elementClasses: string,
    isTextarea = false,
    placeholder = "Click to edit..."
  ) => {
    if (!isEditing) {
      return <span className={elementClasses}>{value}</span>;
    }

    if (isTextarea) {
      return (
        <textarea
          value={value}
          onChange={(e) => updateField(fieldKey, e.target.value)}
          placeholder={placeholder}
          rows={3}
          className={cn(
            "w-full bg-black/5 dark:bg-white/10 p-2 rounded-xl border border-current/20 focus:outline-none focus:ring-2 focus:ring-primary font-inherit resize-none",
            elementClasses
          )}
        />
      );
    }

    return (
      <input
        type="text"
        value={value}
        onChange={(e) => updateField(fieldKey, e.target.value)}
        placeholder={placeholder}
        className={cn(
          "bg-black/5 dark:bg-white/10 px-2 py-1 rounded-lg border border-current/20 focus:outline-none focus:ring-2 focus:ring-primary font-inherit w-full",
          elementClasses
        )}
      />
    );
  };

  return (
    <div
      id="template-card-export"
      className={cn(
        "relative rounded-3xl p-6 sm:p-8 flex flex-col justify-between overflow-hidden transition-all duration-300 border-2 select-text",
        palette.bg,
        palette.text,
        palette.border,
        aspectStyles[aspectRatio],
        className
      )}
    >
      {/* ========================================================================= */}
      {/* 1. PULL QUOTE */}
      {/* ========================================================================= */}
      {templateId === "pull-quote" && (
        <div className="flex flex-col justify-between h-full space-y-6">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-2xl bg-black/5 dark:bg-white/10 flex items-center justify-center">
              <Quote className={cn("w-5 h-5", palette.accent)} />
            </div>
            <span className="font-mono text-[10px] uppercase tracking-widest opacity-60">
              {renderField("citation", mergedData.citation, "font-mono text-[10px]")}
            </span>
          </div>

          <blockquote className="font-serif italic text-xl sm:text-2xl lg:text-3xl leading-snug tracking-tight my-auto">
            &ldquo;{renderField("quote", mergedData.quote, "font-serif italic", true)}&rdquo;
          </blockquote>

          <div className="pt-4 border-t border-current/15 flex items-center justify-between">
            <div>
              <div className="font-serif font-bold text-base">
                {renderField("author", mergedData.author, "font-bold")}
              </div>
              <div className="text-xs opacity-70 font-sans">
                {renderField("role", mergedData.role, "text-xs font-sans")}
                {mergedData.organization && ` • ${mergedData.organization}`}
              </div>
            </div>
            <div className="w-2.5 h-2.5 rounded-full bg-current opacity-40" />
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. BOOK & ARTICLE REVIEW */}
      {/* ========================================================================= */}
      {templateId === "book-review" && (
        <div className="flex flex-col justify-between h-full space-y-4">
          <div className="flex items-center justify-between border-b border-current/15 pb-3">
            <span className="font-mono text-[10px] uppercase tracking-widest font-bold">
              {renderField("tag", mergedData.tag, "font-mono text-[10px]")}
            </span>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  className={cn(
                    "w-4 h-4 fill-current",
                    s <= (mergedData.rating || 5) ? palette.accent : "opacity-20"
                  )}
                />
              ))}
            </div>
          </div>

          <div className="grid sm:grid-cols-3 gap-4 items-center">
            {mergedData.coverUrl && (
              <div className="relative aspect-[3/4] w-24 sm:w-full rounded-2xl overflow-hidden border border-current/20 shadow-editorial-sm shrink-0">
                <Image
                  src={mergedData.coverUrl}
                  alt={mergedData.title || "Book Cover"}
                  fill
                  className="object-cover"
                />
              </div>
            )}
            <div className="sm:col-span-2 space-y-2">
              <h3 className="font-serif text-xl sm:text-2xl font-bold leading-tight">
                {renderField("title", mergedData.title, "font-serif text-xl font-bold")}
              </h3>
              <p className="text-xs opacity-75 font-mono uppercase">
                BY {renderField("author", mergedData.author, "font-mono text-xs")}
              </p>
              <p className="text-xs sm:text-sm font-sans italic opacity-90 pt-1">
                &ldquo;{renderField("verdict", mergedData.verdict, "font-sans italic", true)}&rdquo;
              </p>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-black/5 dark:bg-white/10 space-y-1.5 text-xs font-sans">
            <div className="font-mono text-[10px] uppercase tracking-wider opacity-70">
              Key Insights:
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className={cn("w-3.5 h-3.5 shrink-0", palette.accent)} />
              <span>{renderField("takeaway1", mergedData.takeaway1, "text-xs")}</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className={cn("w-3.5 h-3.5 shrink-0", palette.accent)} />
              <span>{renderField("takeaway2", mergedData.takeaway2, "text-xs")}</span>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. PHOTO COLLAGE GRID */}
      {/* ========================================================================= */}
      {templateId === "photo-collage" && (
        <div className="flex flex-col justify-between h-full space-y-4">
          <div className="space-y-0.5">
            <h3 className="font-serif text-lg sm:text-xl font-bold">
              {renderField("title", mergedData.title, "font-serif text-lg font-bold")}
            </h3>
            <p className="font-mono text-[10px] uppercase tracking-widest opacity-70">
              {renderField("subtitle", mergedData.subtitle, "font-mono text-[10px]")}
            </p>
          </div>

          <div className="grid grid-cols-3 gap-2.5 my-auto">
            {[
              { img: mergedData.image1, cap: mergedData.caption1, key: "caption1" },
              { img: mergedData.image2, cap: mergedData.caption2, key: "caption2" },
              { img: mergedData.image3, cap: mergedData.caption3, key: "caption3" },
            ].map((item, idx) => (
              <div
                key={idx}
                className="bg-white p-2 rounded-2xl shadow-editorial-sm border border-black/10 flex flex-col space-y-1.5 text-stone-900"
              >
                <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-stone-200">
                  <Image
                    src={item.img || "https://images.unsplash.com/photo-1497366216548-37526070297c?w=400"}
                    alt={item.cap || "Photo"}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="text-[10px] font-mono tracking-tight text-stone-700 truncate px-1">
                  {renderField(item.key, item.cap, "text-[10px] font-mono text-stone-800")}
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between text-[10px] font-mono opacity-60 pt-2 border-t border-current/15">
            <span>ORBIT PHOTO DIARY</span>
            <span>POLAROID ARCHIVE // 03 SLOTS</span>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. MILESTONE POSTER */}
      {/* ========================================================================= */}
      {templateId === "milestone-poster" && (
        <div className="flex flex-col justify-between h-full space-y-4">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] uppercase tracking-widest font-bold px-2.5 py-1 rounded-full bg-black/5 dark:bg-white/10">
              {renderField("milestoneType", mergedData.milestoneType, "font-mono text-[10px]")}
            </span>
            <div className="font-serif text-3xl font-black opacity-40">
              {mergedData.badgeNumber || "01"}
            </div>
          </div>

          <div className="space-y-2 my-auto">
            <h3 className="font-serif text-2xl sm:text-3xl font-extrabold leading-tight">
              {renderField("headline", mergedData.headline, "font-serif text-2xl font-bold", true)}
            </h3>
            <div className="flex items-center gap-2 font-mono text-xs opacity-80">
              <Trophy className={cn("w-4 h-4", palette.accent)} />
              <span>AT {renderField("organization", mergedData.organization, "font-mono text-xs font-bold")}</span>
            </div>
            <p className="text-xs sm:text-sm font-sans opacity-90 pt-2 border-t border-current/15">
              {renderField("reflection", mergedData.reflection, "text-xs font-sans", true)}
            </p>
          </div>

          <div className="flex items-center justify-between text-[10px] font-mono opacity-70">
            <span>OFFICIAL CERTIFIED POST</span>
            <span>{renderField("dateLabel", mergedData.dateLabel, "font-mono text-[10px]")}</span>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. HIRING POSTER */}
      {/* ========================================================================= */}
      {templateId === "hiring-poster" && (
        <div className="flex flex-col justify-between h-full space-y-4">
          <div className="flex items-center justify-between border-b border-current/15 pb-2">
            <span className="font-mono text-[10px] uppercase tracking-widest font-extrabold px-2.5 py-0.5 rounded-md bg-black/10 dark:bg-white/20">
              {renderField("tag", mergedData.tag, "font-mono text-[10px]")}
            </span>
            <span className="font-mono text-xs opacity-75">
              {renderField("location", mergedData.location, "font-mono text-xs")}
            </span>
          </div>

          <div className="space-y-2 my-auto">
            <div className="font-mono text-xs opacity-75">
              {renderField("company", mergedData.company, "font-mono text-xs")}
            </div>
            <h3 className="font-serif text-2xl sm:text-3xl font-bold leading-tight">
              {renderField("role", mergedData.role, "font-serif text-2xl font-bold")}
            </h3>
            <div className="font-mono text-sm font-bold text-primary dark:text-amber-400">
              {renderField("compensation", mergedData.compensation, "font-mono text-sm font-bold")}
            </div>
            <p className="text-xs font-sans opacity-85">
              {renderField("perks", mergedData.perks, "text-xs font-sans")}
            </p>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-current/15">
            <div className="text-[10px] font-mono opacity-75">
              APPLY: {renderField("applyEmail", mergedData.applyEmail, "text-[10px] font-mono")}
            </div>
            <button
              type="button"
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-primary text-primary-foreground text-xs font-mono font-bold shadow-editorial-sm hover:brightness-110"
            >
              <span>Apply Now</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. TIP OF THE DAY */}
      {/* ========================================================================= */}
      {templateId === "tip-of-day" && (
        <div className="flex flex-col justify-between h-full space-y-4">
          <div className="flex items-center justify-between border-b border-current/15 pb-2">
            <span className="font-mono text-[10px] uppercase tracking-widest font-bold">
              {renderField("tipNumber", mergedData.tipNumber, "font-mono text-[10px]")}
            </span>
            <span className="font-mono text-[10px] opacity-70">
              {renderField("domain", mergedData.domain, "font-mono text-[10px]")}
            </span>
          </div>

          <div className="space-y-3 my-auto">
            <h3 className="font-serif text-xl sm:text-2xl font-bold leading-snug">
              {renderField("title", mergedData.title, "font-serif text-xl font-bold")}
            </h3>
            <div className="space-y-1.5 text-xs sm:text-sm font-sans opacity-90 pl-1">
              <div>{renderField("tip1", mergedData.tip1, "text-xs sm:text-sm font-sans")}</div>
              <div>{renderField("tip2", mergedData.tip2, "text-xs sm:text-sm font-sans")}</div>
              <div>{renderField("tip3", mergedData.tip3, "text-xs sm:text-sm font-sans")}</div>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-black/5 dark:bg-white/10 flex items-start gap-2 text-xs font-sans italic">
            <Lightbulb className={cn("w-4 h-4 shrink-0 mt-0.5", palette.accent)} />
            <div>{renderField("keyInsight", mergedData.keyInsight, "text-xs font-sans italic")}</div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 7. CAROUSEL SLIDE DECK */}
      {/* ========================================================================= */}
      {templateId === "carousel-deck" && (
        <div className="flex flex-col justify-between h-full space-y-4">
          <div className="flex items-center justify-between border-b border-current/15 pb-2">
            <span className="font-mono text-[10px] uppercase tracking-widest font-bold">
              CAROUSEL DECK // {activeSlide + 1} OF {mergedData.slides?.length || 4}
            </span>
            <div className="flex items-center gap-1">
              {mergedData.slides?.map((_: any, idx: number) => (
                <button
                  key={idx}
                  onClick={() => setActiveSlide(idx)}
                  className={cn(
                    "w-2 h-2 rounded-full transition-all",
                    activeSlide === idx ? "bg-current scale-125" : "bg-current/25"
                  )}
                />
              ))}
            </div>
          </div>

          <div className="my-auto space-y-3">
            <div className="font-mono text-xs font-bold text-primary dark:text-amber-400">
              SLIDE {mergedData.slides?.[activeSlide]?.slideNumber || `0${activeSlide + 1}`}
            </div>
            <h3 className="font-serif text-xl sm:text-2xl font-bold leading-tight">
              {mergedData.slides?.[activeSlide]?.headline || "Slide Headline"}
            </h3>
            <p className="text-xs sm:text-sm font-sans opacity-90 leading-relaxed">
              {mergedData.slides?.[activeSlide]?.body || "Slide content and takeaways."}
            </p>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-current/15">
            <button
              type="button"
              onClick={() => setActiveSlide((prev) => Math.max(0, prev - 1))}
              disabled={activeSlide === 0}
              className="p-1.5 rounded-xl bg-black/5 dark:bg-white/10 disabled:opacity-30 hover:bg-black/10"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-[10px] font-mono opacity-70">
              SWIPE / CLICK TO NAVIGATE
            </span>
            <button
              type="button"
              onClick={() =>
                setActiveSlide((prev) =>
                  Math.min((mergedData.slides?.length || 4) - 1, prev + 1)
                )
              }
              disabled={activeSlide === (mergedData.slides?.length || 4) - 1}
              className="p-1.5 rounded-xl bg-black/5 dark:bg-white/10 disabled:opacity-30 hover:bg-black/10"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 8. STYLED POLL */}
      {/* ========================================================================= */}
      {templateId === "styled-poll" && (
        <div className="flex flex-col justify-between h-full space-y-4">
          <div className="flex items-center justify-between border-b border-current/15 pb-2">
            <span className="font-mono text-[10px] uppercase tracking-widest font-bold">
              {renderField("domain", mergedData.domain, "font-mono text-[10px]")}
            </span>
            <span className="font-mono text-[10px] opacity-70">
              {mergedData.totalVotes || 842} VOTES
            </span>
          </div>

          <div className="space-y-3 my-auto">
            <h3 className="font-serif text-lg sm:text-xl font-bold leading-tight">
              {renderField("question", mergedData.question, "font-serif text-lg font-bold", true)}
            </h3>

            <div className="space-y-2 pt-1">
              {mergedData.options?.map((opt: any, idx: number) => {
                const isSelected = userVotedIdx === idx;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setUserVotedIdx(idx)}
                    className={cn(
                      "w-full text-left p-2.5 rounded-2xl border transition-all relative overflow-hidden flex items-center justify-between text-xs font-sans",
                      isSelected
                        ? "border-primary bg-primary/10 font-bold"
                        : "border-current/20 bg-black/5 dark:bg-white/5 hover:bg-black/10"
                    )}
                  >
                    <div
                      className="absolute inset-y-0 left-0 bg-primary/20 transition-all duration-500 pointer-events-none"
                      style={{ width: `${opt.percent || 33}%` }}
                    />
                    <span className="relative z-10">{opt.label}</span>
                    <span className="relative z-10 font-mono text-[11px] font-bold">
                      {opt.percent}%
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="text-[10px] font-mono opacity-60 text-center">
            EDITORIAL SURVEY // REALTIME PERCENTAGE SYNC
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 9. BEFORE / AFTER */}
      {/* ========================================================================= */}
      {templateId === "before-after" && (
        <div className="flex flex-col justify-between h-full space-y-4">
          <div className="space-y-0.5">
            <h3 className="font-serif text-lg sm:text-xl font-bold">
              {renderField("title", mergedData.title, "font-serif text-lg font-bold")}
            </h3>
            <p className="font-mono text-[10px] uppercase tracking-widest opacity-70">
              {renderField("subtitle", mergedData.subtitle, "font-mono text-[10px]")}
            </p>
          </div>

          <div className="relative my-auto rounded-2xl overflow-hidden border border-current/20 bg-black/5 dark:bg-white/5 p-4 min-h-[140px] flex flex-col justify-center">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 rounded-xl bg-black/5 dark:bg-white/10 space-y-1">
                <span className="font-mono text-[10px] font-bold uppercase opacity-75">
                  {renderField("beforeLabel", mergedData.beforeLabel, "font-mono text-[10px]")}
                </span>
                <p className="text-xs font-sans opacity-90">
                  {renderField("beforeDesc", mergedData.beforeDesc, "text-xs font-sans")}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-primary/15 border border-primary/30 space-y-1">
                <span className="font-mono text-[10px] font-bold uppercase text-primary">
                  {renderField("afterLabel", mergedData.afterLabel, "font-mono text-[10px] text-primary")}
                </span>
                <p className="text-xs font-sans font-medium">
                  {renderField("afterDesc", mergedData.afterDesc, "text-xs font-sans")}
                </p>
              </div>
            </div>

            <div className="mt-3 flex items-center gap-2">
              <Sliders className="w-3.5 h-3.5 opacity-60" />
              <input
                type="range"
                min={0}
                max={100}
                value={sliderPos}
                onChange={(e) => setSliderPos(Number(e.target.value))}
                className="w-full h-1.5 bg-current/20 rounded-lg appearance-none cursor-pointer accent-primary"
              />
            </div>
          </div>

          <div className="text-[10px] font-mono opacity-60 flex justify-between">
            <span>BEFORE & AFTER SNAPSHOT</span>
            <span>RATIO: {sliderPos}%</span>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 10. EVENT INVITE */}
      {/* ========================================================================= */}
      {templateId === "event-invite" && (
        <div className="flex flex-col justify-between h-full space-y-4">
          <div className="flex items-center justify-between border-b border-current/15 pb-2">
            <span className="font-mono text-[10px] uppercase tracking-widest font-bold">
              {renderField("tag", mergedData.tag, "font-mono text-[10px]")}
            </span>
            <span className="font-mono text-[10px] opacity-70">
              {renderField("time", mergedData.time, "font-mono text-[10px]")}
            </span>
          </div>

          <div className="grid sm:grid-cols-4 gap-4 items-center my-auto">
            <div className="p-3 rounded-2xl bg-black/10 dark:bg-white/15 text-center flex flex-col justify-center items-center border border-current/20">
              <span className="font-mono text-[10px] font-bold uppercase tracking-widest">
                {renderField("dateMonth", mergedData.dateMonth, "font-mono text-[10px]")}
              </span>
              <span className="font-serif text-3xl sm:text-4xl font-black">
                {renderField("dateDay", mergedData.dateDay, "font-serif text-3xl font-bold")}
              </span>
            </div>
            <div className="sm:col-span-3 space-y-1.5">
              <h3 className="font-serif text-xl sm:text-2xl font-bold leading-tight">
                {renderField("title", mergedData.title, "font-serif text-xl font-bold")}
              </h3>
              <p className="text-xs font-mono opacity-75">
                LOC: {renderField("location", mergedData.location, "text-xs font-mono")}
              </p>
              <p className="text-xs font-sans opacity-85">
                SPEAKERS: {renderField("speakers", mergedData.speakers, "text-xs font-sans")}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-current/15">
            <span className="text-[10px] font-mono opacity-70">LIMITED CAPACITY // RSVP OPEN</span>
            <button
              type="button"
              className="px-4 py-1.5 rounded-xl bg-primary text-primary-foreground text-xs font-mono font-bold shadow-editorial-sm"
            >
              RSVP Now
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 11. CASE STUDY SNAPSHOT */}
      {/* ========================================================================= */}
      {templateId === "case-study" && (
        <div className="flex flex-col justify-between h-full space-y-4">
          <div className="flex items-center justify-between border-b border-current/15 pb-2">
            <span className="font-mono text-[10px] uppercase tracking-widest font-bold">
              {renderField("tag", mergedData.tag, "font-mono text-[10px]")}
            </span>
            <TrendingUp className={cn("w-4 h-4", palette.accent)} />
          </div>

          <div className="space-y-3 my-auto">
            <h3 className="font-serif text-xl sm:text-2xl font-bold leading-tight">
              {renderField("title", mergedData.title, "font-serif text-xl font-bold")}
            </h3>

            <div className="grid grid-cols-3 gap-2 text-center pt-1">
              <div className="p-2.5 rounded-2xl bg-black/5 dark:bg-white/10 border border-current/15">
                <div className="font-serif text-xl sm:text-2xl font-bold text-primary">
                  {renderField("metric1", mergedData.metric1, "font-serif text-xl font-bold")}
                </div>
                <div className="font-mono text-[9px] uppercase tracking-tight opacity-75 mt-0.5">
                  {renderField("metric1Label", mergedData.metric1Label, "font-mono text-[9px]")}
                </div>
              </div>

              <div className="p-2.5 rounded-2xl bg-black/5 dark:bg-white/10 border border-current/15">
                <div className="font-serif text-xl sm:text-2xl font-bold text-primary">
                  {renderField("metric2", mergedData.metric2, "font-serif text-xl font-bold")}
                </div>
                <div className="font-mono text-[9px] uppercase tracking-tight opacity-75 mt-0.5">
                  {renderField("metric2Label", mergedData.metric2Label, "font-mono text-[9px]")}
                </div>
              </div>

              <div className="p-2.5 rounded-2xl bg-black/5 dark:bg-white/10 border border-current/15">
                <div className="font-serif text-xl sm:text-2xl font-bold text-primary">
                  {renderField("metric3", mergedData.metric3, "font-serif text-xl font-bold")}
                </div>
                <div className="font-mono text-[9px] uppercase tracking-tight opacity-75 mt-0.5">
                  {renderField("metric3Label", mergedData.metric3Label, "font-mono text-[9px]")}
                </div>
              </div>
            </div>

            <p className="text-xs font-sans opacity-85 leading-relaxed pt-1">
              {renderField("summary", mergedData.summary, "text-xs font-sans", true)}
            </p>
          </div>

          <div className="text-[10px] font-mono opacity-60 text-right">
            METRICS VERIFIED // ARCHITECTURAL BENCHMARK
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 12. WEEKLY REFLECTION */}
      {/* ========================================================================= */}
      {templateId === "weekly-reflection" && (
        <div className="flex flex-col justify-between h-full space-y-4">
          <div className="flex items-center justify-between border-b border-current/15 pb-2">
            <span className="font-mono text-[10px] uppercase tracking-widest font-bold">
              {renderField("issueTitle", mergedData.issueTitle, "font-mono text-[10px]")}
            </span>
            <span className="font-mono text-[10px] opacity-70">
              {renderField("dateRange", mergedData.dateRange, "font-mono text-[10px]")}
            </span>
          </div>

          <div className="space-y-2.5 my-auto text-xs font-sans">
            <div className="p-2.5 rounded-xl bg-black/5 dark:bg-white/10">
              <span className="font-mono text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400">
                01 WINS:
              </span>{" "}
              <span>{renderField("wins", mergedData.wins, "text-xs font-sans")}</span>
            </div>
            <div className="p-2.5 rounded-xl bg-black/5 dark:bg-white/10">
              <span className="font-mono text-[10px] uppercase font-bold text-amber-600 dark:text-amber-400">
                02 BLOCKERS & LEARNINGS:
              </span>{" "}
              <span>{renderField("blockers", mergedData.blockers, "text-xs font-sans")}</span>
            </div>
            <div className="p-2.5 rounded-xl bg-black/5 dark:bg-white/10">
              <span className="font-mono text-[10px] uppercase font-bold text-primary">
                03 READING LIST:
              </span>{" "}
              <span>{renderField("reading", mergedData.reading, "text-xs font-sans")}</span>
            </div>
          </div>

          <div className="text-[10px] font-mono opacity-60 text-center">
            JOURNAL LOG // PUBLISHED VIA ORBIT
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 13. QUESTION TO NETWORK */}
      {/* ========================================================================= */}
      {templateId === "question-card" && (
        <div className="flex flex-col justify-between h-full space-y-4">
          <div className="flex items-center justify-between border-b border-current/15 pb-2">
            <span className="font-mono text-[10px] uppercase tracking-widest font-bold">
              {renderField("tag", mergedData.tag, "font-mono text-[10px]")}
            </span>
            <HelpCircle className={cn("w-4 h-4", palette.accent)} />
          </div>

          <div className="space-y-3 my-auto text-center py-2">
            <h3 className="font-serif text-xl sm:text-2xl lg:text-3xl font-bold leading-snug">
              &ldquo;{renderField("question", mergedData.question, "font-serif text-xl font-bold", true)}&rdquo;
            </h3>
            <p className="text-xs font-sans opacity-80 max-w-md mx-auto">
              {renderField("context", mergedData.context, "text-xs font-sans", true)}
            </p>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-current/15 text-[10px] font-mono opacity-70">
            <span>THREAD OPEN FOR DISCUSSION</span>
            <span>REPLY TO SHARE INSIGHTS</span>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 14. RESOURCE LIST */}
      {/* ========================================================================= */}
      {templateId === "resource-list" && (
        <div className="flex flex-col justify-between h-full space-y-4">
          <div className="flex items-center justify-between border-b border-current/15 pb-2">
            <span className="font-mono text-[10px] uppercase tracking-widest font-bold">
              {renderField("category", mergedData.category, "font-mono text-[10px]")}
            </span>
            <Wrench className={cn("w-4 h-4", palette.accent)} />
          </div>

          <div className="space-y-2 my-auto">
            <h3 className="font-serif text-lg sm:text-xl font-bold">
              {renderField("title", mergedData.title, "font-serif text-lg font-bold")}
            </h3>
            <div className="space-y-1.5 pt-1">
              {mergedData.items?.map((item: any, idx: number) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2 rounded-xl bg-black/5 dark:bg-white/10 text-xs font-sans"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] font-bold text-primary">
                      0{idx + 1}
                    </span>
                    <span className="font-bold">{item.name}</span>
                  </div>
                  <span className="text-[11px] opacity-75 font-mono">{item.desc}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="text-[10px] font-mono opacity-60 text-right">
            RECOMMENDED BY PRACTITIONERS
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 15. PORTFOLIO SHOWCASE */}
      {/* ========================================================================= */}
      {templateId === "portfolio-showcase" && (
        <div className="flex flex-col justify-between h-full space-y-4">
          <div className="flex items-center justify-between border-b border-current/15 pb-2">
            <span className="font-mono text-[10px] uppercase tracking-widest font-bold">
              {renderField("tag", mergedData.tag, "font-mono text-[10px]")}
            </span>
            <span className="font-mono text-xs opacity-70">
              {renderField("stats", mergedData.stats, "font-mono text-xs")}
            </span>
          </div>

          <div className="grid sm:grid-cols-3 gap-4 items-center my-auto">
            <div className="relative aspect-video sm:aspect-square w-full rounded-2xl overflow-hidden border border-current/20 shadow-editorial-sm">
              <Image
                src={mergedData.heroImage || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600"}
                alt={mergedData.projectTitle || "Project"}
                fill
                className="object-cover"
              />
            </div>
            <div className="sm:col-span-2 space-y-1.5">
              <div className="font-mono text-[10px] uppercase opacity-75">
                {renderField("role", mergedData.role, "font-mono text-[10px]")}
              </div>
              <h3 className="font-serif text-xl sm:text-2xl font-bold leading-tight">
                {renderField("projectTitle", mergedData.projectTitle, "font-serif text-xl font-bold")}
              </h3>
              <p className="text-xs font-sans opacity-85 leading-relaxed">
                {renderField("summary", mergedData.summary, "text-xs font-sans", true)}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-current/15 text-[10px] font-mono opacity-70">
            <span>ORBIT DESIGN ARCHIVE</span>
            <span>VIEW CASE STUDY</span>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 16. THANK YOU & SHOUTOUT */}
      {/* ========================================================================= */}
      {templateId === "thank-you-card" && (
        <div className="flex flex-col justify-between h-full space-y-4">
          <div className="flex items-center justify-between border-b border-current/15 pb-2">
            <span className="font-mono text-[10px] uppercase tracking-widest font-bold">
              {renderField("badgeText", mergedData.badgeText, "font-mono text-[10px]")}
            </span>
            <HeartHandshake className={cn("w-4 h-4", palette.accent)} />
          </div>

          <div className="space-y-3 my-auto">
            <div className="space-y-0.5">
              <div className="font-mono text-[10px] uppercase opacity-70">SHOUTOUT TO:</div>
              <h3 className="font-serif text-2xl sm:text-3xl font-bold">
                {renderField("recipientName", mergedData.recipientName, "font-serif text-2xl font-bold")}
              </h3>
              <div className="font-mono text-xs opacity-75">
                {renderField("recipientRole", mergedData.recipientRole, "font-mono text-xs")}
              </div>
            </div>

            <p className="text-xs sm:text-sm font-sans italic opacity-90 p-3 rounded-2xl bg-black/5 dark:bg-white/10">
              &ldquo;{renderField("message", mergedData.message, "text-xs font-sans italic", true)}&rdquo;
            </p>

            <div className="font-serif font-bold text-xs opacity-80 text-right">
              {renderField("authorSignature", mergedData.authorSignature, "font-serif text-xs font-bold")}
            </div>
          </div>

          <div className="text-[10px] font-mono opacity-60 text-center">
            RECOGNITION OF PEER EXCELLENCE // ORBIT CIRCLES
          </div>
        </div>
      )}
    </div>
  );
}
