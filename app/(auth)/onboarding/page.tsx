"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { DOMAINS, SAMPLE_SKILLS } from "@/lib/constants";
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Check,
  Upload,
  Globe2,
  Code2,
  User,
  Loader2,
  MapPin,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Step 1: Headline & Location
  const [headline, setHeadline] = useState("");
  const [location, setLocation] = useState("San Francisco, CA");

  // Step 2: Primary Domain & Skills
  const [primaryDomainId, setPrimaryDomainId] = useState(DOMAINS[0].id);
  const [selectedSkills, setSelectedSkills] = useState<string[]>(["TypeScript", "React"]);
  const [customSkill, setCustomSkill] = useState("");

  // Step 3: Avatar & Bio
  const [bio, setBio] = useState("");
  const [avatarImage, setAvatarImage] = useState("");
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const toggleSkill = (skill: string) => {
    if (selectedSkills.includes(skill)) {
      setSelectedSkills(selectedSkills.filter((s) => s !== skill));
    } else {
      setSelectedSkills([...selectedSkills, skill]);
    }
  };

  const addCustomSkill = () => {
    const clean = customSkill.trim();
    if (clean && !selectedSkills.includes(clean)) {
      setSelectedSkills([...selectedSkills, clean]);
      setCustomSkill("");
    }
  };

  const handleAvatarUpload = async (file: File) => {
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Avatar exceeds 10MB limit");
      return;
    }

    setUploadingAvatar(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        setAvatarImage(data.url);
        toast.success("Avatar uploaded");
      } else {
        toast.error("Upload failed");
      }
    } catch (err) {
      toast.error("Upload error");
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleFinishOnboarding = async () => {
    if (!headline.trim()) {
      toast.error("Please provide a professional headline");
      setStep(1);
      return;
    }

    if (selectedSkills.length === 0) {
      toast.error("Please select at least one craft skill");
      setStep(2);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          headline: headline.trim(),
          bio: bio.trim() || undefined,
          location: location.trim() || undefined,
          primaryDomainId,
          skills: selectedSkills,
          avatarImage: avatarImage || undefined,
        }),
      });

      if (res.ok) {
        toast.success("Onboarding complete! Welcome to Orbit.");
        router.push("/feed");
        router.refresh();
      } else {
        const err = await res.json();
        toast.error(err.error || "Failed to save profile");
      }
    } catch (err) {
      toast.error("Error completing onboarding");
    } finally {
      setLoading(false);
    }
  };

  const selectedDomainObj = DOMAINS.find((d) => d.id === primaryDomainId) || DOMAINS[0];

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute w-[600px] h-[400px] bg-gradient-to-tr from-cyan-500/20 via-indigo-500/20 to-purple-500/10 blur-[140px] pointer-events-none -z-10" />

      <div className="w-full max-w-2xl flex flex-col gap-6">
        {/* Progress Tracker */}
        <div className="flex flex-col items-center text-center gap-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-300 text-xs font-semibold border border-cyan-500/20 mb-1">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Orbit Onboarding · Step {step} of 3</span>
          </div>

          <div className="flex items-center gap-2 w-48 mt-1">
            <div className={`h-1.5 flex-1 rounded-full ${step >= 1 ? "bg-cyan-400" : "bg-white/10"}`} />
            <div className={`h-1.5 flex-1 rounded-full ${step >= 2 ? "bg-cyan-400" : "bg-white/10"}`} />
            <div className={`h-1.5 flex-1 rounded-full ${step >= 3 ? "bg-cyan-400" : "bg-white/10"}`} />
          </div>
        </div>

        {/* Step 1: Headline & Role */}
        {step === 1 && (
          <div className="p-8 rounded-3xl glass-panel border border-white/10 flex flex-col gap-6 shadow-2xl animate-in fade-in duration-300">
            <div>
              <h2 className="font-heading font-bold text-xl text-foreground">
                Define Your Professional Headline
              </h2>
              <p className="text-xs text-muted-foreground mt-1">
                Tell your peer circle what you build, architect, or specialize in.
              </p>
            </div>

            <div className="flex flex-col gap-4">
              <div>
                <label className="text-xs font-semibold text-foreground block mb-1.5">
                  Professional Headline
                </label>
                <input
                  type="text"
                  value={headline}
                  onChange={(e) => setHeadline(e.target.value)}
                  placeholder="e.g. Senior Frontend Engineer | Next.js & WebGL Craftsman"
                  className="w-full bg-white/[0.04] border border-white/10 rounded-2xl px-4 py-3 text-xs text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground block mb-1.5">
                  Location / Base
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-muted-foreground absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="San Francisco, CA or Remote"
                    className="w-full bg-white/[0.04] border border-white/10 rounded-2xl pl-10 pr-4 py-3 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-cyan-500"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-white/10">
              <button
                type="button"
                onClick={() => {
                  if (!headline.trim()) {
                    toast.error("Please enter your professional headline");
                    return;
                  }
                  setStep(2);
                }}
                className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-bold shadow-lg shadow-cyan-500/25 active:scale-95 transition-all"
              >
                <span>Continue: Pick Domain & Skills</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Domain & Skills */}
        {step === 2 && (
          <div className="p-8 rounded-3xl glass-panel border border-white/10 flex flex-col gap-6 shadow-2xl animate-in fade-in duration-300">
            <div>
              <h2 className="font-heading font-bold text-xl text-foreground">
                Choose Your Primary Craft Circle
              </h2>
              <p className="text-xs text-muted-foreground mt-1">
                Your primary domain dictates your default feed, trending topics, and member directory.
              </p>
            </div>

            {/* 10 Domains Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 max-h-60 overflow-y-auto p-1">
              {DOMAINS.map((dom) => {
                const isSelected = primaryDomainId === dom.id;

                return (
                  <button
                    key={dom.id}
                    type="button"
                    onClick={() => setPrimaryDomainId(dom.id)}
                    className={cn(
                      "p-3 rounded-2xl border text-center flex flex-col items-center justify-center gap-1.5 transition-all relative group",
                      isSelected
                        ? "border-cyan-400 bg-cyan-500/15 text-cyan-200 shadow-md shadow-cyan-500/15"
                        : "border-white/10 bg-white/[0.02] hover:bg-white/[0.06] text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {isSelected && (
                      <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-cyan-400 text-black flex items-center justify-center text-[10px] font-bold">
                        ✓
                      </span>
                    )}
                    <span className="text-2xl group-hover:scale-110 transition-transform">
                      {dom.emoji}
                    </span>
                    <span className="text-[11px] font-semibold leading-tight">{dom.name}</span>
                  </button>
                );
              })}
            </div>

            {/* Skills selection */}
            <div>
              <label className="text-xs font-semibold text-foreground block mb-2">
                Select Your Core Technical & Creative Skills
              </label>
              <div className="flex flex-wrap gap-1.5 mb-3">
                {SAMPLE_SKILLS.map((sk) => {
                  const isSelected = selectedSkills.includes(sk);
                  return (
                    <button
                      key={sk}
                      type="button"
                      onClick={() => toggleSkill(sk)}
                      className={cn(
                        "px-3 py-1 rounded-xl text-xs font-medium transition-colors",
                        isSelected
                          ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
                          : "bg-white/[0.03] text-muted-foreground hover:text-foreground border border-white/5"
                      )}
                    >
                      {isSelected ? `✓ ${sk}` : `+ ${sk}`}
                    </button>
                  );
                })}
              </div>

              {/* Custom Skill Add */}
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={customSkill}
                  onChange={(e) => setCustomSkill(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addCustomSkill();
                    }
                  }}
                  placeholder="Add custom skill or specialty..."
                  className="flex-1 bg-white/[0.04] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-foreground outline-none"
                />
                <button
                  type="button"
                  onClick={addCustomSkill}
                  className="px-4 py-2 rounded-xl bg-white/[0.08] hover:bg-white/[0.14] text-xs font-semibold text-foreground"
                >
                  Add Tag
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-white/10">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-semibold text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (selectedSkills.length === 0) {
                    toast.error("Please pick at least one skill");
                    return;
                  }
                  setStep(3);
                }}
                className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-bold shadow-lg shadow-cyan-500/25 active:scale-95 transition-all"
              >
                <span>Continue: Profile & Avatar</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Avatar & Bio */}
        {step === 3 && (
          <div className="p-8 rounded-3xl glass-panel border border-white/10 flex flex-col gap-6 shadow-2xl animate-in fade-in duration-300">
            <div>
              <h2 className="font-heading font-bold text-xl text-foreground">
                Set Up Your Orbit Avatar & Bio
              </h2>
              <p className="text-xs text-muted-foreground mt-1">
                Upload a professional photo or use your generated craft avatar.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-6">
              {/* Avatar Orbit Preview */}
              <div className="orbit-ring-container flex-shrink-0">
                <div className="orbit-ring-pulse" />
                <div className="orbit-ring opacity-90" />
                <img
                  src={avatarImage || `https://api.dicebear.com/7.x/avataaars/svg?seed=user_${Date.now()}`}
                  alt="Avatar"
                  className="w-24 h-24 rounded-full object-cover border-4 border-background z-10 shadow-xl"
                />
              </div>

              <div className="flex flex-col gap-2">
                <input
                  type="file"
                  ref={avatarInputRef}
                  onChange={(e) => e.target.files?.[0] && handleAvatarUpload(e.target.files[0])}
                  className="hidden"
                  accept="image/*"
                />
                <button
                  type="button"
                  onClick={() => avatarInputRef.current?.click()}
                  disabled={uploadingAvatar}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.08] hover:bg-white/[0.14] text-xs font-semibold text-foreground border border-white/10 transition-colors w-fit"
                >
                  <Upload className="w-4 h-4 text-cyan-400" />
                  <span>{uploadingAvatar ? "Uploading photo..." : "Upload Profile Photo"}</span>
                </button>
                <span className="text-[11px] text-muted-foreground">
                  JPG, PNG, or WEBP up to 10MB.
                </span>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground block mb-1.5">
                About / Professional Bio
              </label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={4}
                placeholder="Share your technical interests, notable projects you've built, or what you're currently working on..."
                className="w-full bg-white/[0.04] border border-white/10 rounded-2xl p-4 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-cyan-500 resize-none leading-relaxed"
              />
            </div>

            {/* Summary Preview Pill */}
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span>Selected Domain:</span>
                <strong className="text-cyan-300">
                  {selectedDomainObj.emoji} {selectedDomainObj.name}
                </strong>
              </div>
              <span className="text-muted-foreground">{selectedSkills.length} skills tagged</span>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-white/10">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-semibold text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>

              <button
                type="button"
                onClick={handleFinishOnboarding}
                disabled={loading}
                className="flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white text-xs font-bold shadow-xl shadow-cyan-500/30 active:scale-95 transition-all"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <span>Enter Orbit Feed</span>
                    <Sparkles className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
