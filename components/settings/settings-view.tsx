"use client";

import { useState, useEffect } from "react";
import { signOut } from "next-auth/react";
import {
  Settings,
  Lock,
  Eye,
  Bell,
  Trash2,
  Check,
  Loader2,
  Shield,
} from "lucide-react";
import { toast } from "sonner";

export function SettingsView() {
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Password fields
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);

  // Privacy toggles
  const [isPrivate, setIsPrivate] = useState(false);
  const [isOpenToWork, setIsOpenToWork] = useState(false);
  const [isHiring, setIsHiring] = useState(false);

  // Notification toggles
  const [notifyOnLike, setNotifyOnLike] = useState(true);
  const [notifyOnComment, setNotifyOnComment] = useState(true);
  const [notifyOnConnect, setNotifyOnConnect] = useState(true);
  const [notifyOnMessage, setNotifyOnMessage] = useState(true);

  const [savingPreferences, setSavingPreferences] = useState(false);

  // Delete account modal/state
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    async function loadSettings() {
      try {
        const res = await fetch("/api/settings");
        if (res.ok) {
          const data = await res.json();
          setSettings(data.settings);
          setIsPrivate(data.settings.isPrivate);
          setIsOpenToWork(data.settings.isOpenToWork);
          setIsHiring(data.settings.isHiring);
          setNotifyOnLike(data.settings.notifyOnLike);
          setNotifyOnComment(data.settings.notifyOnComment);
          setNotifyOnConnect(data.settings.notifyOnConnect);
          setNotifyOnMessage(data.settings.notifyOnMessage);
        }
      } catch (err) {
        console.error("Settings load error:", err);
      } finally {
        setLoading(false);
      }
    }
    loadSettings();
  }, []);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) {
      toast.error("Please fill in current and new password");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("New password must be at least 6 characters");
      return;
    }

    setChangingPassword(true);
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      if (res.ok) {
        toast.success("Password updated successfully!");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        const err = await res.json();
        toast.error(err.error || "Failed to update password");
      }
    } catch (err) {
      toast.error("Error updating password");
    } finally {
      setChangingPassword(false);
    }
  };

  const handleSavePreferences = async () => {
    setSavingPreferences(true);
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          isPrivate,
          isOpenToWork,
          isHiring,
          notifyOnLike,
          notifyOnComment,
          notifyOnConnect,
          notifyOnMessage,
        }),
      });

      if (res.ok) {
        toast.success("Preferences saved");
      } else {
        toast.error("Failed to update preferences");
      }
    } catch (err) {
      toast.error("Error saving preferences");
    } finally {
      setSavingPreferences(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmation !== "DELETE") {
      toast.error("Please type DELETE to confirm");
      return;
    }

    setDeleting(true);
    try {
      const res = await fetch("/api/settings", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirmation: "DELETE" }),
      });

      if (res.ok) {
        toast.success("Account deleted");
        signOut({ callbackUrl: "/" });
      } else {
        toast.error("Failed to delete account");
      }
    } catch (err) {
      toast.error("Delete error");
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 max-w-3xl mx-auto py-8 px-4 flex justify-center">
        <Loader2 className="w-6 h-6 text-cyan-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex-1 max-w-3xl mx-auto py-6 px-4 flex flex-col gap-6 pb-24">
      {/* Header */}
      <div className="p-5 rounded-3xl glass-panel">
        <h1 className="font-heading font-bold text-xl text-foreground flex items-center gap-2">
          <Settings className="w-5 h-5 text-cyan-400" />
          <span>Account & Security Settings</span>
        </h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          Manage your credentials, privacy mode, and notification preferences.
        </p>
      </div>

      {/* Security: Change Password */}
      <form onSubmit={handlePasswordChange} className="p-6 rounded-3xl glass-panel border border-white/10 flex flex-col gap-4">
        <h3 className="font-heading font-bold text-sm text-foreground flex items-center gap-2">
          <Lock className="w-4 h-4 text-indigo-400" />
          <span>Change Password</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="text-xs text-muted-foreground block mb-1">Current Password</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-3 py-2 text-xs text-foreground outline-none"
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground block mb-1">New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-3 py-2 text-xs text-foreground outline-none"
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground block mb-1">Confirm New Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-3 py-2 text-xs text-foreground outline-none"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={changingPassword || !newPassword}
            className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 text-black text-xs font-bold transition-all"
          >
            {changingPassword ? "Updating..." : "Update Password"}
          </button>
        </div>
      </form>

      {/* Privacy & Visibility */}
      <div className="p-6 rounded-3xl glass-panel border border-white/10 flex flex-col gap-4">
        <h3 className="font-heading font-bold text-sm text-foreground flex items-center gap-2">
          <Eye className="w-4 h-4 text-emerald-400" />
          <span>Privacy & Visibility</span>
        </h3>

        <div className="flex flex-col gap-3">
          <label className="flex items-center justify-between p-3 rounded-2xl bg-white/[0.02] border border-white/5 cursor-pointer hover:bg-white/[0.04] transition-colors">
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-foreground">Private Profile</span>
              <span className="text-[11px] text-muted-foreground">
                Only accepted connections can view your full activity and contact information.
              </span>
            </div>
            <input
              type="checkbox"
              checked={isPrivate}
              onChange={(e) => setIsPrivate(e.target.checked)}
              className="w-4 h-4 rounded text-cyan-500"
            />
          </label>

          <label className="flex items-center justify-between p-3 rounded-2xl bg-white/[0.02] border border-white/5 cursor-pointer hover:bg-white/[0.04] transition-colors">
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-foreground">Open to Work Badge</span>
              <span className="text-[11px] text-muted-foreground">
                Display the green &apos;Open to Work&apos; badge to recruiters and founders.
              </span>
            </div>
            <input
              type="checkbox"
              checked={isOpenToWork}
              onChange={(e) => setIsOpenToWork(e.target.checked)}
              className="w-4 h-4 rounded text-emerald-500"
            />
          </label>

          <label className="flex items-center justify-between p-3 rounded-2xl bg-white/[0.02] border border-white/5 cursor-pointer hover:bg-white/[0.04] transition-colors">
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-foreground">Hiring Badge</span>
              <span className="text-[11px] text-muted-foreground">
                Display the purple &apos;Hiring&apos; badge to attract domain candidates.
              </span>
            </div>
            <input
              type="checkbox"
              checked={isHiring}
              onChange={(e) => setIsHiring(e.target.checked)}
              className="w-4 h-4 rounded text-indigo-500"
            />
          </label>
        </div>

        <div className="flex justify-end">
          <button
            onClick={handleSavePreferences}
            disabled={savingPreferences}
            className="px-5 py-2 rounded-xl bg-white/[0.08] hover:bg-white/[0.14] text-foreground text-xs font-bold border border-white/10 transition-all"
          >
            {savingPreferences ? "Saving..." : "Save Visibility Settings"}
          </button>
        </div>
      </div>

      {/* Notification Preferences */}
      <div className="p-6 rounded-3xl glass-panel border border-white/10 flex flex-col gap-4">
        <h3 className="font-heading font-bold text-sm text-foreground flex items-center gap-2">
          <Bell className="w-4 h-4 text-amber-400" />
          <span>Notification Preferences</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <label className="flex items-center gap-3 p-3 rounded-2xl bg-white/[0.02] border border-white/5 cursor-pointer">
            <input
              type="checkbox"
              checked={notifyOnLike}
              onChange={(e) => setNotifyOnLike(e.target.checked)}
              className="rounded text-cyan-500"
            />
            <span className="text-xs text-foreground">Post Reactions & Likes</span>
          </label>

          <label className="flex items-center gap-3 p-3 rounded-2xl bg-white/[0.02] border border-white/5 cursor-pointer">
            <input
              type="checkbox"
              checked={notifyOnComment}
              onChange={(e) => setNotifyOnComment(e.target.checked)}
              className="rounded text-cyan-500"
            />
            <span className="text-xs text-foreground">Post Comments & Replies</span>
          </label>

          <label className="flex items-center gap-3 p-3 rounded-2xl bg-white/[0.02] border border-white/5 cursor-pointer">
            <input
              type="checkbox"
              checked={notifyOnConnect}
              onChange={(e) => setNotifyOnConnect(e.target.checked)}
              className="rounded text-cyan-500"
            />
            <span className="text-xs text-foreground">Connection Requests & Acceptance</span>
          </label>

          <label className="flex items-center gap-3 p-3 rounded-2xl bg-white/[0.02] border border-white/5 cursor-pointer">
            <input
              type="checkbox"
              checked={notifyOnMessage}
              onChange={(e) => setNotifyOnMessage(e.target.checked)}
              className="rounded text-cyan-500"
            />
            <span className="text-xs text-foreground">Direct Orbit Messages</span>
          </label>
        </div>

        <div className="flex justify-end">
          <button
            onClick={handleSavePreferences}
            disabled={savingPreferences}
            className="px-5 py-2 rounded-xl bg-white/[0.08] hover:bg-white/[0.14] text-foreground text-xs font-bold border border-white/10 transition-all"
          >
            {savingPreferences ? "Saving..." : "Save Notification Preferences"}
          </button>
        </div>
      </div>

      {/* Danger Zone: Delete Account */}
      <div className="p-6 rounded-3xl glass-panel border border-rose-500/20 bg-rose-500/[0.02] flex flex-col gap-4">
        <h3 className="font-heading font-bold text-sm text-rose-400 flex items-center gap-2">
          <Trash2 className="w-4 h-4" />
          <span>Danger Zone: Delete Account</span>
        </h3>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Permanently remove your profile, posts, messages, and network connections from Orbit. This action cannot be undone.
        </p>

        <div className="flex items-center gap-3 flex-wrap">
          <input
            type="text"
            value={deleteConfirmation}
            onChange={(e) => setDeleteConfirmation(e.target.value)}
            placeholder="Type DELETE to confirm"
            className="bg-white/[0.04] border border-rose-500/30 rounded-xl px-3 py-2 text-xs text-foreground outline-none w-60"
          />
          <button
            onClick={handleDeleteAccount}
            disabled={deleteConfirmation !== "DELETE" || deleting}
            className="px-5 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 disabled:opacity-30 text-white text-xs font-bold shadow-md shadow-rose-500/20 transition-all"
          >
            {deleting ? "Deleting..." : "Permanently Delete Account"}
          </button>
        </div>
      </div>
    </div>
  );
}
