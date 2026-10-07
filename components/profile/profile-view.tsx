"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { formatTimeAgo, formatDate, cn } from "@/lib/utils";
import { PostCard } from "@/components/feed/post-card";
import { EditProfileModal } from "@/components/profile/edit-profile-modal";
import { useSocket } from "@/components/providers/socket-provider";
import {
  MapPin,
  Globe,
  Github,
  Linkedin,
  Twitter,
  Briefcase,
  GraduationCap,
  Sparkles,
  Users,
  Eye,
  MessageSquare,
  UserPlus,
  Check,
  Edit,
  Clock,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";

interface ProfileViewProps {
  username: string;
  currentUser?: any;
}

export function ProfileView({ username, currentUser }: ProfileViewProps) {
  const [profileUser, setProfileUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [userPosts, setUserPosts] = useState<any[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<string>("NONE");

  const { openChatWithUser } = useSocket();

  const loadProfile = async () => {
    try {
      const res = await fetch(`/api/users/${username}`);
      if (res.ok) {
        const data = await res.json();
        setProfileUser(data.user);
        setConnectionStatus(data.user.connectionStatus);
      }
    } catch (err) {
      console.error("Failed to load profile:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadUserPosts = async () => {
    try {
      const res = await fetch(`/api/posts?username=${username}`);
      if (res.ok) {
        const data = await res.json();
        setUserPosts(data.posts || []);
      }
    } catch (err) {
      console.error("Failed to load user posts:", err);
    }
  };

  useEffect(() => {
    loadProfile();
    loadUserPosts();
  }, [username]);

  const handleConnect = async () => {
    if (!currentUser) {
      toast.error("Please login to connect");
      return;
    }

    try {
      const res = await fetch("/api/connections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetUserId: profileUser.id }),
      });

      if (res.ok) {
        setConnectionStatus("PENDING_SENT");
        toast.success("Connection request sent!");
      } else {
        const err = await res.json();
        toast.error(err.error || "Failed to send request");
      }
    } catch (err) {
      toast.error("Error sending connection");
    }
  };

  if (loading) {
    return (
      <div className="flex-1 max-w-4xl mx-auto py-8 px-4 animate-pulse flex flex-col gap-6">
        <div className="h-48 rounded-3xl bg-white/5" />
        <div className="h-64 rounded-3xl bg-white/5" />
      </div>
    );
  }

  if (!profileUser) {
    return (
      <div className="flex-1 max-w-xl mx-auto py-20 px-4 text-center">
        <h2 className="font-heading font-bold text-xl mb-2">User not found</h2>
        <p className="text-xs text-muted-foreground mb-4">
          The orbit profile for @{username} doesn&apos;t exist or is currently unavailable.
        </p>
        <Link href="/feed" className="px-4 py-2 rounded-xl bg-cyan-500 text-black text-xs font-bold">
          Back to Feed
        </Link>
      </div>
    );
  }

  const isOwn = profileUser.isOwnProfile;

  return (
    <div className="flex-1 max-w-4xl mx-auto py-6 px-4 flex flex-col gap-6 pb-24">
      {/* Profile Header Hero Card */}
      <div className="rounded-3xl glass-panel overflow-hidden border border-white/10 relative">
        {/* Cover Banner */}
        <div className="h-44 sm:h-56 w-full relative bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900">
          {profileUser.profile?.coverImage && (
            <img
              src={profileUser.profile.coverImage}
              alt="Cover"
              className="w-full h-full object-cover"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent" />
        </div>

        {/* Profile Info Container */}
        <div className="px-6 pb-6 pt-0 relative flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-16 sm:-mt-20">
          {/* Avatar with Animated Orbit Ring */}
          <div className="flex flex-col sm:flex-row sm:items-end gap-4">
            <div className="orbit-ring-container flex-shrink-0">
              <div className="orbit-ring-pulse" />
              <div className="orbit-ring opacity-90" />
              <img
                src={
                  profileUser.image ||
                  `https://api.dicebear.com/7.x/avataaars/svg?seed=${profileUser.username}`
                }
                alt={profileUser.name}
                className="w-28 h-28 sm:w-32 sm:h-32 rounded-full object-cover border-4 border-background z-10 shadow-2xl"
              />
            </div>

            <div className="flex flex-col mb-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="font-heading font-bold text-xl sm:text-2xl text-foreground">
                  {profileUser.name}
                </h1>
                {profileUser.primaryDomain && (
                  <Link
                    href={`/domain/${profileUser.primaryDomain.slug}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30"
                  >
                    <span>{profileUser.primaryDomain.emoji}</span>
                    <span>{profileUser.primaryDomain.name}</span>
                  </Link>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">@{profileUser.username}</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2.5 flex-wrap">
            {isOwn ? (
              <button
                onClick={() => setIsEditModalOpen(true)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-white/[0.08] hover:bg-white/[0.14] text-foreground text-xs font-semibold border border-white/10 transition-colors"
              >
                <Edit className="w-3.5 h-3.5" />
                <span>Edit Profile</span>
              </button>
            ) : (
              <>
                {connectionStatus === "ACCEPTED" ? (
                  <button
                    onClick={() => openChatWithUser(profileUser)}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-bold shadow-lg shadow-cyan-500/25 transition-all"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>Direct Orbit Chat</span>
                  </button>
                ) : connectionStatus === "PENDING_SENT" ? (
                  <button
                    disabled
                    className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-white/[0.05] text-muted-foreground text-xs font-medium border border-white/10"
                  >
                    <Clock className="w-4 h-4" />
                    <span>Request Pending</span>
                  </button>
                ) : connectionStatus === "PENDING_RECEIVED" ? (
                  <Link
                    href="/network"
                    className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold"
                  >
                    <Check className="w-4 h-4" />
                    <span>Respond to Request</span>
                  </Link>
                ) : (
                  <button
                    onClick={handleConnect}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-cyan-500/25 transition-all"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>Connect Circle</span>
                  </button>
                )}
              </>
            )}
          </div>
        </div>

        {/* Headline, Status Badges & Details */}
        <div className="px-6 pb-6 flex flex-col gap-4 border-t border-white/5 pt-4">
          <div className="flex flex-col gap-2">
            <p className="text-sm text-foreground/90 font-medium leading-relaxed">
              {profileUser.headline || "Professional on Orbit"}
            </p>

            {/* Status pills */}
            <div className="flex items-center gap-2 flex-wrap">
              {profileUser.profile?.isOpenToWork && (
                <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-medium">
                  🟢 Open to Work
                </span>
              )}
              {profileUser.profile?.isHiring && (
                <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 font-medium">
                  🟣 Hiring
                </span>
              )}
              {profileUser.location && (
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <MapPin className="w-3.5 h-3.5 text-rose-400" />
                  <span>{profileUser.location}</span>
                </span>
              )}
            </div>
          </div>

          {/* Stats & Mutuals Row */}
          <div className="flex items-center gap-6 text-xs text-muted-foreground pt-2 border-t border-white/5 flex-wrap">
            <div className="flex items-center gap-1.5">
              <Users className="w-4 h-4 text-cyan-400" />
              <span className="font-semibold text-foreground">
                {profileUser.totalConnections || 0}
              </span>{" "}
              connections
            </div>

            <div className="flex items-center gap-1.5">
              <Eye className="w-4 h-4 text-indigo-400" />
              <span className="font-semibold text-foreground">
                {profileUser.profileViews || 0}
              </span>{" "}
              profile views
            </div>

            {/* Social Links */}
            <div className="flex items-center gap-3 ml-auto">
              {profileUser.website && (
                <a
                  href={profileUser.website}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-cyan-400 transition-colors"
                  title="Website"
                >
                  <Globe className="w-4 h-4" />
                </a>
              )}
              {profileUser.github && (
                <a
                  href={profileUser.github}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-white transition-colors"
                  title="GitHub"
                >
                  <Github className="w-4 h-4" />
                </a>
              )}
              {profileUser.linkedin && (
                <a
                  href={profileUser.linkedin}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-blue-400 transition-colors"
                  title="LinkedIn"
                >
                  <Linkedin className="w-4 h-4" />
                </a>
              )}
              {profileUser.twitter && (
                <a
                  href={profileUser.twitter}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-sky-400 transition-colors"
                  title="Twitter"
                >
                  <Twitter className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>

          {/* Mutual Connections Preview */}
          {profileUser.mutualConnections && profileUser.mutualConnections.length > 0 && (
            <div className="flex items-center gap-2 pt-2 text-xs text-muted-foreground">
              <div className="flex -space-x-2">
                {profileUser.mutualConnections.map((m: any) => (
                  <img
                    key={m.id}
                    src={m.image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${m.username}`}
                    alt={m.name}
                    className="w-5 h-5 rounded-full border border-background object-cover"
                  />
                ))}
              </div>
              <span>
                Mutual connections:{" "}
                <strong className="text-foreground">
                  {profileUser.mutualConnections.map((m: any) => m.name).join(", ")}
                </strong>
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Main Grid: About & Skills + Experience & Education */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: About & Skills */}
        <div className="md:col-span-1 flex flex-col gap-6">
          {/* About */}
          <div className="p-5 rounded-3xl glass-panel flex flex-col gap-3">
            <h3 className="font-heading font-bold text-sm text-foreground flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>About</span>
            </h3>
            <p className="text-xs text-foreground/80 leading-relaxed whitespace-pre-line">
              {profileUser.profile?.about || profileUser.bio || "No biography provided yet."}
            </p>
          </div>

          {/* Skills */}
          <div className="p-5 rounded-3xl glass-panel flex flex-col gap-3">
            <h3 className="font-heading font-bold text-sm text-foreground">Craft Skills</h3>
            {profileUser.skills && profileUser.skills.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {profileUser.skills.map((s: any) => (
                  <span
                    key={s.id}
                    className="px-2.5 py-1 rounded-xl text-xs font-medium bg-white/[0.04] text-cyan-300 border border-white/10 hover:border-cyan-500/30 transition-colors"
                  >
                    {s.skill.name}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">No skills tagged yet.</p>
            )}
          </div>
        </div>

        {/* Right Column: Experience, Education, Posts */}
        <div className="md:col-span-2 flex flex-col gap-6">
          {/* Experience */}
          <div className="p-6 rounded-3xl glass-panel flex flex-col gap-4">
            <h3 className="font-heading font-bold text-sm text-foreground flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-indigo-400" />
              <span>Experience</span>
            </h3>

            {profileUser.experiences && profileUser.experiences.length > 0 ? (
              <div className="flex flex-col gap-4">
                {profileUser.experiences.map((exp: any) => (
                  <div key={exp.id} className="flex items-start gap-3.5 group">
                    <div className="w-9 h-9 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 flex-shrink-0 mt-0.5">
                      <Briefcase className="w-4 h-4" />
                    </div>
                    <div className="flex flex-col flex-1">
                      <h4 className="font-heading font-bold text-xs text-foreground">
                        {exp.title}
                      </h4>
                      <p className="text-xs text-cyan-300 font-medium">{exp.company}</p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        {formatDate(exp.startDate)} – {exp.isCurrent ? "Present" : exp.endDate ? formatDate(exp.endDate) : "Present"}{" "}
                        {exp.location && `· ${exp.location}`}
                      </p>
                      {exp.description && (
                        <p className="text-xs text-foreground/80 mt-1.5 leading-relaxed">
                          {exp.description}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">No work experience listed yet.</p>
            )}
          </div>

          {/* Education */}
          <div className="p-6 rounded-3xl glass-panel flex flex-col gap-4">
            <h3 className="font-heading font-bold text-sm text-foreground flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-amber-400" />
              <span>Education</span>
            </h3>

            {profileUser.educations && profileUser.educations.length > 0 ? (
              <div className="flex flex-col gap-4">
                {profileUser.educations.map((edu: any) => (
                  <div key={edu.id} className="flex items-start gap-3.5">
                    <div className="w-9 h-9 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 flex-shrink-0 mt-0.5">
                      <GraduationCap className="w-4 h-4" />
                    </div>
                    <div className="flex flex-col flex-1">
                      <h4 className="font-heading font-bold text-xs text-foreground">
                        {edu.institution}
                      </h4>
                      <p className="text-xs text-amber-300 font-medium">
                        {edu.degree} {edu.fieldOfStudy && `· ${edu.fieldOfStudy}`}
                      </p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        {formatDate(edu.startDate)} – {edu.endDate ? formatDate(edu.endDate) : "Present"}{" "}
                        {edu.grade && `· Grade: ${edu.grade}`}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">No education history listed yet.</p>
            )}
          </div>

          {/* Activity / User's Posts */}
          <div className="flex flex-col gap-4">
            <h3 className="font-heading font-bold text-sm text-foreground px-2">
              Recent Activity & Posts ({userPosts.length})
            </h3>
            {userPosts.length > 0 ? (
              userPosts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  currentUserId={currentUser?.id}
                  currentUserImage={currentUser?.image}
                />
              ))
            ) : (
              <div className="p-6 rounded-3xl glass-panel text-center text-xs text-muted-foreground">
                No recent posts published by @{username}.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {isOwn && (
        <EditProfileModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          user={profileUser}
          onProfileUpdated={loadProfile}
        />
      )}
    </div>
  );
}
