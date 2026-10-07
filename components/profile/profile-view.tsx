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
  Layers,
  FileText,
} from "lucide-react";
import { toast } from "sonner";
import { Avatar } from "@/components/ui/avatar";
import { Chip } from "@/components/ui/chip";
import { Button } from "@/components/ui/button";
import { Stat } from "@/components/ui/stat";
import { SectionHeader } from "@/components/ui/section-header";

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
      <div className="flex-1 max-w-4xl mx-auto py-8 px-4 animate-pulse space-y-6">
        <div className="h-48 rounded-3xl bg-muted" />
        <div className="h-64 rounded-3xl bg-muted" />
      </div>
    );
  }

  if (!profileUser) {
    return (
      <div className="flex-1 max-w-xl mx-auto py-20 px-4 text-center space-y-4">
        <h2 className="font-serif font-bold text-2xl">Member Not Found</h2>
        <p className="text-xs text-muted-text font-sans">
          The Orbit magazine profile for @{username} doesn&apos;t exist or is currently unavailable.
        </p>
        <Link href="/feed" className="inline-block px-5 py-2.5 rounded-2xl bg-primary text-primary-foreground text-xs font-mono font-bold">
          Back to Feed
        </Link>
      </div>
    );
  }

  const isOwn = profileUser.isOwnProfile;

  return (
    <div className="flex-1 max-w-4xl mx-auto py-6 px-4 flex flex-col gap-8 pb-24">
      {/* Magazine Cover Hero Header */}
      <div className="rounded-3xl bg-surface border-2 border-border-hairline shadow-editorial-lift overflow-hidden relative">
        {/* Cover Banner with Editorial Gradient */}
        <div className="h-48 sm:h-60 w-full relative bg-gradient-to-r from-primary/20 via-accent/20 to-secondary/20">
          {profileUser.profile?.coverImage && (
            <img
              src={profileUser.profile.coverImage}
              alt="Cover"
              className="w-full h-full object-cover"
            />
          )}
          <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-surface/80 backdrop-blur-md border border-border-hairline font-mono text-[10px] uppercase font-bold tracking-widest text-foreground">
            ORBIT ISSUE NO. 14 // PORTFOLIO
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-surface via-transparent to-transparent" />
        </div>

        {/* Profile Info Container */}
        <div className="px-6 pb-6 pt-0 relative flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-16 sm:-mt-20">
          {/* Avatar with Animated Orbit Ring */}
          <div className="flex flex-col sm:flex-row sm:items-end gap-4">
            <Avatar
              src={profileUser.image}
              alt={profileUser.name}
              size="2xl"
              withOrbit
              status="online"
              className="shadow-editorial-lift"
            />

            <div className="flex flex-col mb-1 space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="font-serif font-black text-2xl sm:text-3xl lg:text-4xl text-foreground tracking-tight">
                  {profileUser.name}
                </h1>
                {profileUser.primaryDomain && (
                  <Chip variant="domain" icon={<span>{profileUser.primaryDomain.emoji}</span>}>
                    {profileUser.primaryDomain.name}
                  </Chip>
                )}
              </div>
              <p className="text-xs font-mono text-muted-text">
                @{profileUser.username}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2.5 flex-wrap">
            {isOwn ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditModalOpen(true)}
                className="gap-2 font-mono text-xs font-bold"
              >
                <Edit className="w-3.5 h-3.5" />
                <span>Edit Profile</span>
              </Button>
            ) : (
              <>
                {connectionStatus === "ACCEPTED" ? (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => openChatWithUser(profileUser)}
                    className="gap-2 font-mono text-xs font-bold shadow-editorial-md"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Direct Message</span>
                  </Button>
                ) : connectionStatus === "PENDING_SENT" ? (
                  <Button
                    variant="outline"
                    size="sm"
                    disabled
                    className="gap-2 font-mono text-xs"
                  >
                    <Clock className="w-3.5 h-3.5" />
                    <span>Request Pending</span>
                  </Button>
                ) : connectionStatus === "PENDING_RECEIVED" ? (
                  <Link href="/network">
                    <Button variant="primary" size="sm" className="gap-2 font-mono text-xs">
                      <Check className="w-3.5 h-3.5" />
                      <span>Respond to Request</span>
                    </Button>
                  </Link>
                ) : (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleConnect}
                    className="gap-2 font-mono text-xs font-bold shadow-editorial-md"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Connect Circle</span>
                  </Button>
                )}
              </>
            )}
          </div>
        </div>

        {/* Headline & Details */}
        <div className="px-6 pb-6 flex flex-col gap-4 border-t border-border-hairline pt-4">
          <p className="text-sm sm:text-base text-foreground font-sans leading-relaxed">
            {profileUser.headline || "Professional Member on Orbit"}
          </p>

          {/* Status Chips */}
          <div className="flex items-center gap-2 flex-wrap">
            {profileUser.profile?.isOpenToWork && (
              <Chip variant="stamp" className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30">
                🟢 OPEN TO WORK
              </Chip>
            )}
            {profileUser.profile?.isHiring && (
              <Chip variant="stamp" className="bg-primary/10 text-primary border-primary/30">
                🟣 ACTIVELY HIRING
              </Chip>
            )}
            {profileUser.location && (
              <span className="flex items-center gap-1 text-xs font-mono text-muted-text">
                <MapPin className="w-3.5 h-3.5 text-primary" />
                <span>{profileUser.location}</span>
              </span>
            )}
          </div>

          {/* Magazine Stats Strip ("Issue No. 12" style) */}
          <div className="grid grid-cols-3 gap-3 pt-3 border-t border-border-hairline">
            <Stat
              label="Connections"
              value={profileUser.totalConnections || 0}
              suffix="peers"
            />
            <Stat
              label="Orbit Posts"
              value={userPosts.length}
              suffix="published"
            />
            <Stat
              label="Profile Views"
              value={profileUser.profileViews || 0}
              suffix="readers"
            />
          </div>

          {/* Social Links Bar */}
          <div className="flex items-center justify-between pt-2 border-t border-border-hairline text-xs text-muted-text">
            <div className="flex items-center gap-2 font-mono text-[11px]">
              {profileUser.mutualConnections && profileUser.mutualConnections.length > 0 && (
                <span>
                  Mutual connections:{" "}
                  <strong className="text-foreground">
                    {profileUser.mutualConnections.map((m: any) => m.name).join(", ")}
                  </strong>
                </span>
              )}
            </div>

            <div className="flex items-center gap-3">
              {profileUser.website && (
                <a
                  href={profileUser.website}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-primary transition-colors"
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
                  className="hover:text-foreground transition-colors"
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
                  className="hover:text-primary transition-colors"
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
                  className="hover:text-foreground transition-colors"
                  title="Twitter"
                >
                  <Twitter className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: About & Stamped Skills + Numbered Experience Timeline */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: About & Stamped Skills */}
        <div className="md:col-span-1 flex flex-col gap-6">
          {/* About Card */}
          <div className="p-6 rounded-3xl bg-surface border border-border-hairline shadow-editorial-sm space-y-3">
            <SectionHeader
              number="01"
              title="About"
              className="mb-0 border-b-0 pb-0"
            />
            <p className="text-xs sm:text-sm text-foreground/90 font-sans leading-relaxed whitespace-pre-line">
              {profileUser.profile?.about || profileUser.bio || "No biographical statement provided yet."}
            </p>
          </div>

          {/* Stamped Skills Card */}
          <div className="p-6 rounded-3xl bg-surface border border-border-hairline shadow-editorial-sm space-y-3">
            <SectionHeader
              number="02"
              title="Craft Skills"
              className="mb-0 border-b-0 pb-0"
            />
            {profileUser.skills && profileUser.skills.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {profileUser.skills.map((s: any) => (
                  <Chip key={s.id} variant="stamp">
                    {s.skill.name}
                  </Chip>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-text font-sans">No craft skills tagged yet.</p>
            )}
          </div>
        </div>

        {/* Right Column: Numbered Experience Timeline & Posts */}
        <div className="md:col-span-2 flex flex-col gap-6">
          {/* Numbered Career Timeline */}
          <div className="p-6 rounded-3xl bg-surface border border-border-hairline shadow-editorial-sm space-y-4">
            <SectionHeader
              number="03"
              title="Career & Leadership Timeline"
              className="mb-0 border-b-0 pb-0"
            />

            {profileUser.experiences && profileUser.experiences.length > 0 ? (
              <div className="space-y-4 pt-2">
                {profileUser.experiences.map((exp: any, idx: number) => (
                  <div key={exp.id} className="flex items-start gap-3.5 group">
                    <div className="w-8 h-8 rounded-xl bg-raised border border-border-hairline flex items-center justify-center font-mono text-xs font-bold text-primary shrink-0 mt-0.5 shadow-editorial-sm">
                      0{idx + 1}
                    </div>
                    <div className="flex flex-col flex-1">
                      <h4 className="font-serif font-bold text-sm sm:text-base text-foreground">
                        {exp.title}
                      </h4>
                      <p className="text-xs font-mono font-bold text-primary">
                        {exp.company}
                      </p>
                      <p className="text-[11px] font-mono text-muted-text mt-0.5">
                        {formatDate(exp.startDate)} – {exp.isCurrent ? "Present" : exp.endDate ? formatDate(exp.endDate) : "Present"}{" "}
                        {exp.location && `• ${exp.location}`}
                      </p>
                      {exp.description && (
                        <p className="text-xs text-foreground/80 font-sans mt-1.5 leading-relaxed">
                          {exp.description}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-text font-sans">No career timeline added yet.</p>
            )}
          </div>

          {/* Education */}
          <div className="p-6 rounded-3xl bg-surface border border-border-hairline shadow-editorial-sm space-y-4">
            <SectionHeader
              number="04"
              title="Education & Research"
              className="mb-0 border-b-0 pb-0"
            />

            {profileUser.educations && profileUser.educations.length > 0 ? (
              <div className="space-y-3 pt-1">
                {profileUser.educations.map((edu: any) => (
                  <div key={edu.id} className="flex items-start gap-3.5">
                    <div className="w-8 h-8 rounded-xl bg-raised border border-border-hairline flex items-center justify-center text-primary shrink-0 mt-0.5">
                      <GraduationCap className="w-4 h-4" />
                    </div>
                    <div className="flex flex-col flex-1">
                      <h4 className="font-serif font-bold text-sm text-foreground">
                        {edu.institution}
                      </h4>
                      <p className="text-xs font-mono text-muted-text">
                        {edu.degree} {edu.fieldOfStudy && `• ${edu.fieldOfStudy}`}
                      </p>
                      <p className="text-[11px] font-mono text-muted-text/80 mt-0.5">
                        {formatDate(edu.startDate)} – {edu.endDate ? formatDate(edu.endDate) : "Present"}{" "}
                        {edu.grade && `• Grade: ${edu.grade}`}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-text font-sans">No education details listed yet.</p>
            )}
          </div>

          {/* Published Orbit Posts */}
          <div className="space-y-4">
            <SectionHeader
              number="05"
              title={`Published Articles & Cards (${userPosts.length})`}
              className="mb-0 border-b-0 pb-0"
            />

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
              <div className="p-6 rounded-3xl bg-surface border border-border-hairline text-center text-xs text-muted-text font-sans">
                No recent cards published by @{username}.
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
