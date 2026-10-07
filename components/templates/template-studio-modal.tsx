"use client";

import * as React from "react";
import { toPng } from "html-to-image";
import confetti from "canvas-confetti";
import {
  Sparkles,
  Download,
  Send,
  Search,
  Sliders,
  Palette,
  Layers,
  Ratio,
  RefreshCw,
  X,
  Type,
  LayoutGrid,
} from "lucide-react";
import { TEMPLATE_DEFINITIONS, TemplateDefinition } from "./template-definitions";
import { TemplateCardRenderer } from "./template-card-renderer";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { IconButton } from "@/components/ui/icon-button";
import { Chip } from "@/components/ui/chip";
import { toast } from "sonner";

export interface TemplateStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTemplateId?: string;
  initialData?: Record<string, any>;
  onPostPublished?: () => void;
  domainId?: string;
}

export function TemplateStudioModal({
  isOpen,
  onClose,
  initialTemplateId,
  initialData,
  onPostPublished,
  domainId,
}: TemplateStudioModalProps) {
  const [selectedTemplateId, setSelectedTemplateId] = React.useState<string>(
    initialTemplateId || "pull-quote"
  );
  const [activeCategory, setActiveCategory] = React.useState<string>("All");
  const [searchQuery, setSearchQuery] = React.useState("");
  const [aspectRatio, setAspectRatio] = React.useState<"1:1" | "4:5" | "16:9">("1:1");
  const [isExporting, setIsExporting] = React.useState(false);
  const [isPublishing, setIsPublishing] = React.useState(false);
  const [viewMode, setViewMode] = React.useState<"editor" | "picker">("editor");

  // Template custom state
  const [customData, setCustomData] = React.useState<Record<string, any>>(
    initialData || {}
  );

  const currentDef =
    TEMPLATE_DEFINITIONS.find((t) => t.id === selectedTemplateId) ||
    TEMPLATE_DEFINITIONS[0];

  // Sync if initial props change
  React.useEffect(() => {
    if (initialTemplateId) {
      setSelectedTemplateId(initialTemplateId);
    }
    if (initialData) {
      setCustomData(initialData);
    } else {
      const def = TEMPLATE_DEFINITIONS.find((t) => t.id === (initialTemplateId || "pull-quote"));
      if (def) setCustomData(def.defaultData);
    }
  }, [initialTemplateId, initialData, isOpen]);

  const categories = [
    "All",
    "Quotes",
    "Reviews",
    "Announcements",
    "Milestones",
    "Photo Collage",
    "Carousel",
    "Polls",
    "Job Posts",
    "Tips & Threads",
  ];

  const filteredTemplates = TEMPLATE_DEFINITIONS.filter((t) => {
    const matchCategory = activeCategory === "All" || t.category === activeCategory;
    const matchSearch =
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchSearch;
  });

  const handleSelectTemplate = (template: TemplateDefinition) => {
    setSelectedTemplateId(template.id);
    setCustomData(template.defaultData);
    setViewMode("editor");
    toast.success(`Loaded "${template.title}" template`);
  };

  const handlePaletteSelect = (paletteId: string) => {
    setCustomData((prev) => ({ ...prev, themeVariant: paletteId }));
  };

  const handleExportPNG = async () => {
    const node = document.getElementById("template-card-export");
    if (!node) return;
    try {
      setIsExporting(true);
      const dataUrl = await toPng(node, { quality: 0.95, pixelRatio: 2 });
      const link = document.createElement("a");
      link.download = `orbit-${selectedTemplateId}-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
      toast.success("Template exported as high-res PNG!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to export PNG. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  const handlePublishToFeed = async () => {
    try {
      setIsPublishing(true);
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: customData.headline || customData.quote || customData.title || "Published a crafted post via Template Studio",
          postType: "TEMPLATE",
          templateId: selectedTemplateId,
          templateData: JSON.stringify(customData),
          domainId: domainId || undefined,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to publish template post");
      }

      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });

      toast.success("Post published to Orbit feed!");
      if (onPostPublished) onPostPublished();
      onClose();
    } catch (err: any) {
      toast.error(err.message || "Failed to publish");
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="xl"
      className="p-0 max-h-[92vh]"
    >
      <div className="flex flex-col h-full">
        {/* Studio Top Navigation */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-hairline bg-surface shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif text-lg font-bold text-foreground">
                  Post Template Studio
                </h3>
                <span className="font-mono text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-full bg-raised border border-border-hairline text-muted-text">
                  PRO CRAFT
                </span>
              </div>
              <p className="text-xs text-muted-text font-sans">
                {viewMode === "editor"
                  ? `Editing "${currentDef.title}" • Click fields on card to edit`
                  : "Choose from 16+ magazine-grade post layouts"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {viewMode === "editor" ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setViewMode("picker")}
                className="gap-1.5"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Switch Template</span>
              </Button>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setViewMode("editor")}
              >
                Back to Canvas
              </Button>
            )}
            <IconButton label="Close" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </IconButton>
          </div>
        </div>

        {/* View Mode 1: Template Picker Grid */}
        {viewMode === "picker" && (
          <div className="p-6 space-y-6 overflow-y-auto max-h-[75vh]">
            {/* Category Filter Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-2 no-scrollbar">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-mono tracking-wider transition-colors shrink-0 ${
                    activeCategory === cat
                      ? "bg-primary text-primary-foreground font-bold shadow-editorial-sm"
                      : "bg-surface hover:bg-raised text-muted-text border border-border-hairline"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-text" />
              <input
                type="text"
                placeholder="Search templates by name, purpose, or tag..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-xs rounded-2xl bg-raised border border-border-hairline focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* Template Catalog Grid */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTemplates.map((template) => (
                <div
                  key={template.id}
                  onClick={() => handleSelectTemplate(template)}
                  className={`group relative p-5 rounded-3xl bg-surface border-2 transition-all cursor-pointer hover:shadow-editorial-lift hover:-translate-y-1 ${
                    selectedTemplateId === template.id
                      ? "border-primary shadow-editorial-md"
                      : "border-border-hairline hover:border-foreground/30"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-[10px] uppercase tracking-widest text-primary font-bold">
                      {template.category}
                    </span>
                    <span className="text-[10px] font-mono text-muted-text">
                      {template.colorPalettes.length} PALETTES
                    </span>
                  </div>
                  <h4 className="font-serif text-lg font-bold text-foreground group-hover:text-primary transition-colors">
                    {template.title}
                  </h4>
                  <p className="text-xs text-muted-text mt-1 line-clamp-2">
                    {template.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* View Mode 2: Live Canvas Editor & Styler */}
        {viewMode === "editor" && (
          <div className="grid lg:grid-cols-12 flex-1 overflow-hidden">
            {/* Left/Center: Live Canvas Preview */}
            <div className="lg:col-span-8 p-6 bg-raised/40 flex flex-col items-center justify-center overflow-y-auto border-r border-border-hairline">
              <div className="w-full max-w-lg mx-auto shadow-editorial-lift rounded-3xl">
                <TemplateCardRenderer
                  templateId={selectedTemplateId}
                  data={customData}
                  isEditing={true}
                  onDataChange={(newData) => setCustomData(newData)}
                  aspectRatio={aspectRatio}
                />
              </div>

              <div className="mt-4 text-center">
                <span className="text-[11px] font-mono text-muted-text">
                  TIP: Text & metrics are directly editable on the canvas above
                </span>
              </div>
            </div>

            {/* Right: Controls, Palette, Aspect Ratio & Actions */}
            <div className="lg:col-span-4 p-6 flex flex-col justify-between space-y-6 bg-surface overflow-y-auto">
              <div className="space-y-6">
                {/* 1. Color Palette Variations */}
                <div className="space-y-2.5">
                  <div className="flex items-center gap-2">
                    <Palette className="w-4 h-4 text-primary" />
                    <span className="font-mono text-xs uppercase font-bold tracking-wider">
                      Color Variation
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {currentDef.colorPalettes.map((p) => {
                      const isSelected =
                        (customData.themeVariant || "palette-1") === p.id;
                      return (
                        <button
                          key={p.id}
                          onClick={() => handlePaletteSelect(p.id)}
                          className={`p-2 rounded-2xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                            isSelected
                              ? "border-primary ring-2 ring-primary/20 bg-raised"
                              : "border-border-hairline hover:bg-raised/50"
                          }`}
                        >
                          <div className={`w-5 h-5 rounded-full ${p.bg} border border-black/20`} />
                          <span className="text-[10px] font-mono tracking-tight text-foreground truncate w-full">
                            {p.name}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Aspect Ratio Selector */}
                <div className="space-y-2.5">
                  <div className="flex items-center gap-2">
                    <Ratio className="w-4 h-4 text-primary" />
                    <span className="font-mono text-xs uppercase font-bold tracking-wider">
                      Aspect Ratio
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: "1:1", label: "1:1 Square" },
                      { id: "4:5", label: "4:5 Portrait" },
                      { id: "16:9", label: "16:9 Deck" },
                    ].map((r) => (
                      <button
                        key={r.id}
                        onClick={() => setAspectRatio(r.id as any)}
                        className={`py-2 px-2 rounded-2xl text-xs font-mono border transition-all ${
                          aspectRatio === r.id
                            ? "bg-primary text-primary-foreground font-bold border-primary shadow-editorial-sm"
                            : "bg-surface border-border-hairline text-muted-text hover:bg-raised"
                        }`}
                      >
                        {r.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 3. Reset to Template Defaults */}
                <div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCustomData(currentDef.defaultData)}
                    className="w-full text-xs font-mono gap-1.5"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Reset Content to Defaults</span>
                  </Button>
                </div>
              </div>

              {/* Action Buttons: Export PNG & Publish to Feed */}
              <div className="space-y-2.5 pt-4 border-t border-border-hairline">
                <Button
                  variant="outline"
                  onClick={handleExportPNG}
                  isLoading={isExporting}
                  className="w-full gap-2 text-xs font-mono font-bold"
                >
                  <Download className="w-4 h-4" />
                  <span>Export as PNG (High-Res)</span>
                </Button>

                <Button
                  variant="primary"
                  onClick={handlePublishToFeed}
                  isLoading={isPublishing}
                  className="w-full gap-2 text-sm font-bold shadow-editorial-md"
                >
                  <Send className="w-4 h-4" />
                  <span>Publish to Orbit Feed</span>
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
