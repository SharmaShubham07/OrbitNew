"use client";

import { useState, useRef } from "react";
import { DOMAINS, SAMPLE_SKILLS } from "@/lib/constants";
import {
  X,
  Upload,
  Plus,
  Trash2,
  Loader2,
  Briefcase,
  GraduationCap,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
  onProfileUpdated: () => void;
}

export function EditProfileModal({
  isOpen,
  onClose,
  user,
  onProfileUpdated,
}: EditProfileModalProps) {
  const [activeTab, setActiveTab] = useState<"general" | "experience" | "education">("general");

  // General fields
  const [name, setName] = useState(user.name || "");
  const [headline, setHeadline] = useState(user.headline || "");
  const [bio, setBio] = useState(user.bio || "");
  const [location, setLocation] = useState(user.location || "");
  const [website, setWebsite] = useState(user.website || "");
  const [github, setGithub] = useState(user.github || "");
  const [linkedin, setLinkedin] = useState(user.linkedin || "");
  const [twitter, setTwitter] = useState(user.twitter || "");
  const [avatarImage, setAvatarImage] = useState(user.image || "");
  const [coverImage, setCoverImage] = useState(user.profile?.coverImage || "");
  const [primaryDomainId, setPrimaryDomainId] = useState(
    user.primaryDomainId || DOMAINS[0].id
  );
  const [isOpenToWork, setIsOpenToWork] = useState(user.profile?.isOpenToWork ?? false);
  const [isHiring, setIsHiring] = useState(user.profile?.isHiring ?? false);

  // Skills
  const [skills, setSkills] = useState<string[]>(
    user.skills?.map((s: any) => s.skill.name) || []
  );
  const [newSkillInput, setNewSkillInput] = useState("");

  // Experiences
  const [experiences, setExperiences] = useState<any[]>(
    user.experiences?.map((e: any) => ({
      title: e.title,
      company: e.company,
      location: e.location || "",
      startDate: e.startDate ? new Date(e.startDate).toISOString().slice(0, 7) : "",
      endDate: e.endDate ? new Date(e.endDate).toISOString().slice(0, 7) : "",
      isCurrent: e.isCurrent,
      description: e.description || "",
    })) || []
  );

  // Educations
  const [educations, setEducations] = useState<any[]>(
    user.educations?.map((ed: any) => ({
      institution: ed.institution,
      degree: ed.degree,
      fieldOfStudy: ed.fieldOfStudy || "",
      startDate: ed.startDate ? new Date(ed.startDate).toISOString().slice(0, 7) : "",
      endDate: ed.endDate ? new Date(ed.endDate).toISOString().slice(0, 7) : "",
      grade: ed.grade || "",
    })) || []
  );

  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);

  const avatarInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleImageUpload = async (file: File, type: "avatar" | "cover") => {
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Image exceeds 10MB limit");
      return;
    }

    if (type === "avatar") setUploadingAvatar(true);
    else setUploadingCover(true);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      if (res.ok) {
        const data = await res.json();
        if (type === "avatar") setAvatarImage(data.url);
        else setCoverImage(data.url);
        toast.success(`${type === "avatar" ? "Avatar" : "Cover banner"} updated`);
      } else {
        toast.error("Upload failed");
      }
    } catch (err) {
      toast.error("Upload error");
    } finally {
      if (type === "avatar") setUploadingAvatar(false);
      else setUploadingCover(false);
    }
  };

  const addSkill = (skillName: string) => {
    const clean = skillName.trim();
    if (clean && !skills.includes(clean)) {
      setSkills([...skills, clean]);
    }
    setNewSkillInput("");
  };

  const removeSkill = (skillName: string) => {
    setSkills(skills.filter((s) => s !== skillName));
  };

  const addExperience = () => {
    setExperiences([
      ...experiences,
      {
        title: "",
        company: "",
        location: "",
        startDate: "",
        endDate: "",
        isCurrent: true,
        description: "",
      },
    ]);
  };

  const removeExperience = (index: number) => {
    setExperiences(experiences.filter((_, i) => i !== index));
  };

  const updateExperience = (index: number, field: string, value: any) => {
    const updated = [...experiences];
    updated[index][field] = value;
    setExperiences(updated);
  };

  const addEducation = () => {
    setEducations([
      ...educations,
      {
        institution: "",
        degree: "",
        fieldOfStudy: "",
        startDate: "",
        endDate: "",
        grade: "",
      },
    ]);
  };

  const removeEducation = (index: number) => {
    setEducations(educations.filter((_, i) => i !== index));
  };

  const updateEducation = (index: number, field: string, value: any) => {
    const updated = [...educations];
    updated[index][field] = value;
    setEducations(updated);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        name,
        headline,
        bio,
        location,
        website,
        github,
        twitter,
        linkedin,
        avatarImage,
        coverImage,
        primaryDomainId,
        isOpenToWork,
        isHiring,
        skills,
        experiences,
        educations,
      };

      const res = await fetch(`/api/users/${user.username}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        toast.success("Profile saved successfully!");
        onProfileUpdated();
        onClose();
      } else {
        const err = await res.json();
        toast.error(err.error || "Failed to save profile");
      }
    } catch (err) {
      toast.error("Save error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-2xl max-h-[90vh] rounded-3xl glass-dropdown border border-white/10 flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-5 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <h3 className="font-heading font-bold text-base text-foreground">
              Edit Orbit Profile
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex items-center gap-2 px-6 pt-4 border-b border-white/5">
          <button
            onClick={() => setActiveTab("general")}
            className={`pb-3 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === "general"
                ? "border-cyan-400 text-cyan-400"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            Basic & Bio
          </button>
          <button
            onClick={() => setActiveTab("experience")}
            className={`pb-3 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === "experience"
                ? "border-cyan-400 text-cyan-400"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span>Experience ({experiences.length})</span>
          </button>
          <button
            onClick={() => setActiveTab("education")}
            className={`pb-3 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === "education"
                ? "border-cyan-400 text-cyan-400"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5" />
            <span>Education ({educations.length})</span>
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 p-6 overflow-y-auto flex flex-col gap-5">
          {activeTab === "general" && (
            <div className="flex flex-col gap-4">
              {/* Media Uploads */}
              <div className="flex items-center gap-4">
                {/* Avatar preview */}
                <div className="relative group">
                  <img
                    src={avatarImage || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`}
                    alt="Avatar"
                    className="w-16 h-16 rounded-full object-cover border-2 border-cyan-400"
                  />
                  <input
                    type="file"
                    ref={avatarInputRef}
                    onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0], "avatar")}
                    className="hidden"
                    accept="image/*"
                  />
                  <button
                    type="button"
                    onClick={() => avatarInputRef.current?.click()}
                    disabled={uploadingAvatar}
                    className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    {uploadingAvatar ? <Loader2 className="w-4 h-4 animate-spin text-white" /> : <Upload className="w-4 h-4 text-white" />}
                  </button>
                </div>

                <div className="flex-1">
                  <label className="text-xs font-semibold text-foreground">Avatar & Cover</label>
                  <p className="text-[11px] text-muted-foreground">
                    Click avatar to change profile image or upload a custom banner.
                  </p>
                  <input
                    type="file"
                    ref={coverInputRef}
                    onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0], "cover")}
                    className="hidden"
                    accept="image/*"
                  />
                  <button
                    type="button"
                    onClick={() => coverInputRef.current?.click()}
                    disabled={uploadingCover}
                    className="mt-1 px-3 py-1 bg-white/[0.05] hover:bg-white/[0.1] text-xs font-medium rounded-xl border border-white/10"
                  >
                    {uploadingCover ? "Uploading banner..." : "Upload Cover Banner"}
                  </button>
                </div>
              </div>

              {/* Name & Headline */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-foreground mb-1 block">Full Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-3 py-2 text-xs text-foreground focus:ring-1 focus:ring-cyan-500 outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-foreground mb-1 block">Primary Domain</label>
                  <select
                    value={primaryDomainId}
                    onChange={(e) => setPrimaryDomainId(e.target.value)}
                    className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-3 py-2 text-xs text-cyan-300 font-medium focus:ring-1 focus:ring-cyan-500 outline-none"
                  >
                    {DOMAINS.map((dom) => (
                      <option key={dom.id} value={dom.id} className="bg-slate-900 text-white">
                        {dom.emoji} {dom.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground mb-1 block">Headline</label>
                <input
                  type="text"
                  value={headline}
                  onChange={(e) => setHeadline(e.target.value)}
                  placeholder="e.g. Staff Systems Engineer | Distributed Systems & Rust"
                  className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-3 py-2 text-xs text-foreground focus:ring-1 focus:ring-cyan-500 outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground mb-1 block">About / Bio</label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={3}
                  className="w-full bg-white/[0.04] border border-white/10 rounded-xl p-3 text-xs text-foreground focus:ring-1 focus:ring-cyan-500 outline-none resize-none"
                />
              </div>

              {/* Status Badges */}
              <div className="flex items-center gap-6 p-3 rounded-2xl bg-white/[0.02] border border-white/5">
                <label className="flex items-center gap-2 cursor-pointer text-xs">
                  <input
                    type="checkbox"
                    checked={isOpenToWork}
                    onChange={(e) => setIsOpenToWork(e.target.checked)}
                    className="rounded text-cyan-500"
                  />
                  <span>Open to Work</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-xs">
                  <input
                    type="checkbox"
                    checked={isHiring}
                    onChange={(e) => setIsHiring(e.target.checked)}
                    className="rounded text-indigo-500"
                  />
                  <span>Hiring for my team</span>
                </label>
              </div>

              {/* Skills Tags */}
              <div>
                <label className="text-xs font-semibold text-foreground mb-1 block">Skills & Craft Tags</label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {skills.map((s) => (
                    <span
                      key={s}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-[11px] bg-cyan-500/10 text-cyan-300 border border-cyan-500/20"
                    >
                      <span>{s}</span>
                      <button
                        type="button"
                        onClick={() => removeSkill(s)}
                        className="hover:text-rose-400"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newSkillInput}
                    onChange={(e) => setNewSkillInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addSkill(newSkillInput);
                      }
                    }}
                    placeholder="Add custom skill (e.g. WebRTC)..."
                    className="flex-1 bg-white/[0.04] border border-white/10 rounded-xl px-3 py-1.5 text-xs text-foreground outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => addSkill(newSkillInput)}
                    className="px-3 py-1.5 rounded-xl bg-cyan-500/20 text-cyan-400 text-xs font-medium hover:bg-cyan-500/30"
                  >
                    Add
                  </button>
                </div>

                {/* Suggestions */}
                <div className="flex flex-wrap gap-1 mt-2">
                  {SAMPLE_SKILLS.filter((s) => !skills.includes(s))
                    .slice(0, 8)
                    .map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => addSkill(s)}
                        className="text-[10px] px-2 py-0.5 rounded-lg bg-white/[0.03] hover:bg-white/[0.08] text-muted-foreground transition-colors"
                      >
                        + {s}
                      </button>
                    ))}
                </div>
              </div>

              {/* Location and Links */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="text-xs font-semibold text-foreground mb-1 block">Location</label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="City, Country"
                    className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-3 py-1.5 text-xs text-foreground outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-foreground mb-1 block">Website</label>
                  <input
                    type="text"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    placeholder="https://..."
                    className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-3 py-1.5 text-xs text-foreground outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-foreground mb-1 block">GitHub</label>
                  <input
                    type="text"
                    value={github}
                    onChange={(e) => setGithub(e.target.value)}
                    placeholder="https://github.com/..."
                    className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-3 py-1.5 text-xs text-foreground outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-foreground mb-1 block">LinkedIn</label>
                  <input
                    type="text"
                    value={linkedin}
                    onChange={(e) => setLinkedin(e.target.value)}
                    placeholder="https://linkedin.com/in/..."
                    className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-3 py-1.5 text-xs text-foreground outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === "experience" && (
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">Add work history & leadership roles.</p>
                <button
                  type="button"
                  onClick={addExperience}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-cyan-500/20 text-cyan-400 text-xs font-semibold hover:bg-cyan-500/30"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Role</span>
                </button>
              </div>

              {experiences.map((exp, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-cyan-400">Position #{idx + 1}</span>
                    <button
                      type="button"
                      onClick={() => removeExperience(idx)}
                      className="text-muted-foreground hover:text-rose-400 p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] text-muted-foreground block mb-1">Title</label>
                      <input
                        type="text"
                        value={exp.title}
                        onChange={(e) => updateExperience(idx, "title", e.target.value)}
                        placeholder="e.g. Senior Backend Engineer"
                        className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-3 py-1.5 text-xs text-foreground outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-muted-foreground block mb-1">Company</label>
                      <input
                        type="text"
                        value={exp.company}
                        onChange={(e) => updateExperience(idx, "company", e.target.value)}
                        placeholder="e.g. Vortex Labs"
                        className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-3 py-1.5 text-xs text-foreground outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="text-[11px] text-muted-foreground block mb-1">Start Month/Year</label>
                      <input
                        type="month"
                        value={exp.startDate}
                        onChange={(e) => updateExperience(idx, "startDate", e.target.value)}
                        className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-3 py-1.5 text-xs text-foreground outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-muted-foreground block mb-1">End Month/Year</label>
                      <input
                        type="month"
                        disabled={exp.isCurrent}
                        value={exp.endDate}
                        onChange={(e) => updateExperience(idx, "endDate", e.target.value)}
                        className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-3 py-1.5 text-xs text-foreground outline-none disabled:opacity-40"
                      />
                    </div>
                    <div className="flex items-end pb-2">
                      <label className="flex items-center gap-2 cursor-pointer text-xs">
                        <input
                          type="checkbox"
                          checked={exp.isCurrent}
                          onChange={(e) => updateExperience(idx, "isCurrent", e.target.checked)}
                          className="rounded text-cyan-500"
                        />
                        <span>Current Role</span>
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] text-muted-foreground block mb-1">Description</label>
                    <textarea
                      value={exp.description}
                      onChange={(e) => updateExperience(idx, "description", e.target.value)}
                      rows={2}
                      placeholder="Highlights, achievements, technologies used..."
                      className="w-full bg-white/[0.04] border border-white/10 rounded-xl p-2.5 text-xs text-foreground outline-none resize-none"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === "education" && (
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">Add university degrees and academic credentials.</p>
                <button
                  type="button"
                  onClick={addEducation}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-cyan-500/20 text-cyan-400 text-xs font-semibold hover:bg-cyan-500/30"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Education</span>
                </button>
              </div>

              {educations.map((edu, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-indigo-400">Education #{idx + 1}</span>
                    <button
                      type="button"
                      onClick={() => removeEducation(idx)}
                      className="text-muted-foreground hover:text-rose-400 p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] text-muted-foreground block mb-1">Institution</label>
                      <input
                        type="text"
                        value={edu.institution}
                        onChange={(e) => updateEducation(idx, "institution", e.target.value)}
                        placeholder="e.g. Stanford University"
                        className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-3 py-1.5 text-xs text-foreground outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-muted-foreground block mb-1">Degree</label>
                      <input
                        type="text"
                        value={edu.degree}
                        onChange={(e) => updateEducation(idx, "degree", e.target.value)}
                        placeholder="e.g. Master of Science"
                        className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-3 py-1.5 text-xs text-foreground outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="text-[11px] text-muted-foreground block mb-1">Field of Study</label>
                      <input
                        type="text"
                        value={edu.fieldOfStudy}
                        onChange={(e) => updateEducation(idx, "fieldOfStudy", e.target.value)}
                        placeholder="Computer Science"
                        className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-3 py-1.5 text-xs text-foreground outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-muted-foreground block mb-1">Start Year</label>
                      <input
                        type="month"
                        value={edu.startDate}
                        onChange={(e) => updateEducation(idx, "startDate", e.target.value)}
                        className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-3 py-1.5 text-xs text-foreground outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-muted-foreground block mb-1">End Year</label>
                      <input
                        type="month"
                        value={edu.endDate}
                        onChange={(e) => updateEducation(idx, "endDate", e.target.value)}
                        className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-3 py-1.5 text-xs text-foreground outline-none"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 flex items-center justify-end gap-2 bg-background/50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-medium text-muted-foreground hover:text-foreground"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-bold shadow-lg shadow-cyan-500/20 active:scale-95 transition-all"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Save Profile</span>}
          </button>
        </div>
      </div>
    </div>
  );
}
