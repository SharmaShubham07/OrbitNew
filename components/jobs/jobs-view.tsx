"use client";

import { useState, useEffect } from "react";
import { DOMAINS } from "@/lib/constants";
import { formatTimeAgo, formatDate, cn } from "@/lib/utils";
import {
  Briefcase,
  MapPin,
  Building,
  Plus,
  Search,
  Check,
  X,
  Loader2,
  DollarSign,
  Clock,
  Sparkles,
  Send,
} from "lucide-react";
import { toast } from "sonner";

export function JobsView({ currentUser }: { currentUser?: any }) {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDomain, setSelectedDomain] = useState("all");
  const [selectedWorkplace, setSelectedWorkplace] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Post Job Modal State
  const [isPostJobModalOpen, setIsPostJobModalOpen] = useState(false);
  const [jobTitle, setJobTitle] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [jobDomainId, setJobDomainId] = useState(currentUser?.primaryDomainId || DOMAINS[0].id);
  const [location, setLocation] = useState("San Francisco, CA");
  const [workplace, setWorkplace] = useState("REMOTE");
  const [jobType, setJobType] = useState("FULL_TIME");
  const [salaryRange, setSalaryRange] = useState("$160k - $220k + Equity");
  const [description, setDescription] = useState("");
  const [requirements, setRequirements] = useState("");
  const [submittingJob, setSubmittingJob] = useState(false);

  // Apply Modal State
  const [applyingJob, setApplyingJob] = useState<any | null>(null);
  const [applicationNote, setApplicationNote] = useState("");
  const [submittingApp, setSubmittingApp] = useState(false);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      let url = `/api/jobs?domainId=${selectedDomain}&workplace=${selectedWorkplace}`;
      if (searchQuery.trim()) url += `&q=${encodeURIComponent(searchQuery.trim())}`;

      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setJobs(data.jobs || []);
      }
    } catch (err) {
      console.error("Jobs fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [selectedDomain, selectedWorkplace]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchJobs();
  };

  const handlePostJob = async () => {
    if (!jobTitle || !companyName || !description) {
      toast.error("Please fill in all required job fields");
      return;
    }

    setSubmittingJob(true);
    try {
      const res = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: jobTitle,
          company: companyName,
          domainId: jobDomainId,
          location,
          workplace,
          jobType,
          salaryRange,
          description,
          requirements,
        }),
      });

      if (res.ok) {
        toast.success("Job opportunity posted!");
        setIsPostJobModalOpen(false);
        fetchJobs();
        // Reset
        setJobTitle("");
        setCompanyName("");
        setDescription("");
      } else {
        const err = await res.json();
        toast.error(err.error || "Failed to post job");
      }
    } catch (err) {
      toast.error("Submission error");
    } finally {
      setSubmittingJob(false);
    }
  };

  const handleApply = async () => {
    if (!applyingJob) return;

    setSubmittingApp(true);
    try {
      const res = await fetch(`/api/jobs/${applyingJob.id}/apply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          note: applicationNote.trim(),
        }),
      });

      if (res.ok) {
        toast.success("Application submitted successfully!");
        setApplyingJob(null);
        setApplicationNote("");
        fetchJobs();
      } else {
        const err = await res.json();
        toast.error(err.error || "Failed to submit application");
      }
    } catch (err) {
      toast.error("Apply error");
    } finally {
      setSubmittingApp(false);
    }
  };

  return (
    <div className="flex-1 max-w-4xl mx-auto py-6 px-4 flex flex-col gap-6 pb-24">
      {/* Header & Post CTA */}
      <div className="p-5 rounded-3xl glass-panel flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading font-bold text-xl text-foreground flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-cyan-400" />
            <span>Craft Opportunities & Jobs</span>
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Discover roles in high-impact engineering teams, design studios, and AI labs.
          </p>
        </div>

        <button
          onClick={() => setIsPostJobModalOpen(true)}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-cyan-500/25 active:scale-95 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Post an Opportunity</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="p-4 rounded-3xl glass-panel flex flex-col sm:flex-row items-center gap-3">
        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by title, keywords, or company..."
            className="w-full bg-white/[0.04] border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-cyan-500"
          />
        </form>

        {/* Domain Filter */}
        <select
          value={selectedDomain}
          onChange={(e) => setSelectedDomain(e.target.value)}
          className="bg-white/[0.04] border border-white/10 rounded-xl px-3 py-2 text-xs text-cyan-300 font-medium focus:outline-none w-full sm:w-auto"
        >
          <option value="all" className="bg-slate-900">All Domains</option>
          {DOMAINS.map((dom) => (
            <option key={dom.id} value={dom.id} className="bg-slate-900">
              {dom.emoji} {dom.name}
            </option>
          ))}
        </select>

        {/* Workplace Filter */}
        <select
          value={selectedWorkplace}
          onChange={(e) => setSelectedWorkplace(e.target.value)}
          className="bg-white/[0.04] border border-white/10 rounded-xl px-3 py-2 text-xs text-foreground font-medium focus:outline-none w-full sm:w-auto"
        >
          <option value="all" className="bg-slate-900">Any Location Style</option>
          <option value="REMOTE" className="bg-slate-900">Remote Only</option>
          <option value="HYBRID" className="bg-slate-900">Hybrid</option>
          <option value="ON_SITE" className="bg-slate-900">On-Site</option>
        </select>
      </div>

      {/* Jobs List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-6 h-6 text-cyan-400 animate-spin" />
        </div>
      ) : jobs.length === 0 ? (
        <div className="p-12 rounded-3xl glass-panel text-center flex flex-col items-center justify-center gap-3">
          <Briefcase className="w-12 h-12 text-muted-foreground/40" />
          <h3 className="font-heading font-bold text-base text-foreground">
            No opportunities matching your criteria
          </h3>
          <p className="text-xs text-muted-foreground max-w-sm">
            Try adjusting your filters or be the first to post an open opportunity in this circle.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {jobs.map((job) => (
            <div
              key={job.id}
              className="p-6 rounded-3xl glass-panel border border-white/10 hover:border-white/20 transition-all flex flex-col gap-4 group"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="flex items-start gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500/10 to-indigo-500/10 border border-cyan-500/20 flex items-center justify-center text-xl flex-shrink-0">
                    {job.domain?.emoji || "💼"}
                  </div>

                  <div className="flex flex-col">
                    <h3 className="font-heading font-bold text-base text-foreground group-hover:text-cyan-400 transition-colors">
                      {job.title}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5 flex-wrap">
                      <span className="font-semibold text-foreground">{job.company}</span>
                      <span>·</span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-rose-400" />
                        {job.location} ({job.workplace.toLowerCase()})
                      </span>
                      <span>·</span>
                      <span>{job.jobType.replace("_", " ").toLowerCase()}</span>
                    </div>
                  </div>
                </div>

                {job.domain && (
                  <span className="self-start px-3 py-1 rounded-full text-xs font-semibold bg-white/[0.05] text-cyan-300 border border-white/10">
                    {job.domain.emoji} {job.domain.name}
                  </span>
                )}
              </div>

              {/* Description & Salary */}
              <p className="text-xs text-foreground/80 leading-relaxed line-clamp-3">
                {job.description}
              </p>

              {job.requirements && (
                <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5 text-xs text-muted-foreground">
                  <strong className="text-foreground">Requirements:</strong> {job.requirements}
                </div>
              )}

              {/* Footer Row */}
              <div className="flex items-center justify-between pt-3 border-t border-white/5 flex-wrap gap-3">
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  {job.salaryRange && (
                    <span className="font-semibold text-emerald-400">
                      💰 {job.salaryRange}
                    </span>
                  )}
                  <span>Posted {formatTimeAgo(job.createdAt)}</span>
                </div>

                <div>
                  {job.hasApplied ? (
                    <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500/15 text-emerald-400 text-xs font-bold border border-emerald-500/30">
                      <Check className="w-4 h-4" />
                      <span>Application Submitted</span>
                    </span>
                  ) : (
                    <button
                      onClick={() => setApplyingJob(job)}
                      className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-bold shadow-md shadow-cyan-500/20 active:scale-95 transition-all"
                    >
                      Quick Apply
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Post Job Modal */}
      {isPostJobModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-xl max-h-[90vh] rounded-3xl glass-dropdown border border-white/10 p-6 flex flex-col gap-4 shadow-2xl overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="font-heading font-bold text-base text-foreground flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <span>Post Craft Opportunity</span>
              </h3>
              <button
                onClick={() => setIsPostJobModalOpen(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex flex-col gap-3">
              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">Role Title</label>
                <input
                  type="text"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  placeholder="e.g. Senior Distributed Systems Engineer"
                  className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-3 py-2 text-xs text-foreground outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1">Company</label>
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="e.g. Vortex Labs"
                    className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-3 py-2 text-xs text-foreground outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1">Domain</label>
                  <select
                    value={jobDomainId}
                    onChange={(e) => setJobDomainId(e.target.value)}
                    className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-3 py-2 text-xs text-cyan-300 font-medium outline-none"
                  >
                    {DOMAINS.map((dom) => (
                      <option key={dom.id} value={dom.id} className="bg-slate-900">
                        {dom.emoji} {dom.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1">Location</label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="City or Remote"
                    className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-3 py-2 text-xs text-foreground outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1">Workplace</label>
                  <select
                    value={workplace}
                    onChange={(e) => setWorkplace(e.target.value)}
                    className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-3 py-2 text-xs text-foreground outline-none"
                  >
                    <option value="REMOTE" className="bg-slate-900">Remote</option>
                    <option value="HYBRID" className="bg-slate-900">Hybrid</option>
                    <option value="ON_SITE" className="bg-slate-900">On-Site</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1">Salary Range</label>
                  <input
                    type="text"
                    value={salaryRange}
                    onChange={(e) => setSalaryRange(e.target.value)}
                    placeholder="e.g. $180k - $240k"
                    className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-3 py-2 text-xs text-foreground outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">Job Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  placeholder="Outline mission, core responsibilities, and team culture..."
                  className="w-full bg-white/[0.04] border border-white/10 rounded-xl p-3 text-xs text-foreground outline-none resize-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">Requirements</label>
                <textarea
                  value={requirements}
                  onChange={(e) => setRequirements(e.target.value)}
                  rows={2}
                  placeholder="Key technical skills, background, or qualifications..."
                  className="w-full bg-white/[0.04] border border-white/10 rounded-xl p-3 text-xs text-foreground outline-none resize-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-white/10">
              <button
                type="button"
                onClick={() => setIsPostJobModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs text-muted-foreground hover:text-foreground"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handlePostJob}
                disabled={submittingJob}
                className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-bold shadow-md shadow-cyan-500/20"
              >
                {submittingJob ? "Posting..." : "Publish Job"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Apply Modal */}
      {applyingJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-3xl glass-dropdown border border-white/10 p-6 flex flex-col gap-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div>
                <h3 className="font-heading font-bold text-base text-foreground">
                  Apply for {applyingJob.title}
                </h3>
                <p className="text-xs text-muted-foreground">{applyingJob.company}</p>
              </div>
              <button
                onClick={() => setApplyingJob(null)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground block mb-1">
                Note for the Hiring Team (optional)
              </label>
              <textarea
                value={applicationNote}
                onChange={(e) => setApplicationNote(e.target.value)}
                rows={4}
                placeholder="Share your relevant craft experience, portfolio links, or why this role excites you..."
                className="w-full bg-white/[0.04] border border-white/10 rounded-xl p-3 text-xs text-foreground outline-none resize-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-white/10">
              <button
                type="button"
                onClick={() => setApplyingJob(null)}
                className="px-4 py-2 rounded-xl text-xs text-muted-foreground hover:text-foreground"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleApply}
                disabled={submittingApp}
                className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-bold"
              >
                {submittingApp ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                <span>Submit Application</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
