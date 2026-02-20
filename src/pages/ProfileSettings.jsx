import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "../utils";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { User, Moon, Bell, Shield, LogOut, Trash2, Loader2, ExternalLink, ChevronRight } from "lucide-react";
import DisclaimerBanner from "@/components/DisclaimerBanner";

export default function ProfileSettings() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    async function load() {
      const u = await base44.auth.me();
      setUser(u);
      const profiles = await base44.entities.UserProfile.list();
      if (profiles.length > 0) {
        setProfile(profiles[0]);
        setDarkMode(profiles[0].dark_mode || false);
      }
      setLoading(false);
    }
    load();
  }, []);

  async function toggleDarkMode(val) {
    setDarkMode(val);
    if (profile) {
      await base44.entities.UserProfile.update(profile.id, { dark_mode: val });
    }
    window.dispatchEvent(new CustomEvent("darkModeToggle", { detail: val }));
  }

  async function deleteAllData() {
    setDeleting(true);
    // Delete all user data
    const [moods, journals, habits, goals] = await Promise.all([
      base44.entities.MoodLog.list(),
      base44.entities.JournalEntry.list(),
      base44.entities.HabitTracker.list(),
      base44.entities.Goal.list(),
    ]);
    await Promise.all([
      ...moods.map(m => base44.entities.MoodLog.delete(m.id)),
      ...journals.map(j => base44.entities.JournalEntry.delete(j.id)),
      ...habits.map(h => base44.entities.HabitTracker.delete(h.id)),
      ...goals.map(g => base44.entities.Goal.delete(g.id)),
    ]);
    if (profile) await base44.entities.UserProfile.delete(profile.id);
    setDeleting(false);
    setShowDeleteConfirm(false);
    base44.auth.logout();
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-teal-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Settings</h1>

      {/* Profile Card */}
      <div className="bg-white dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700/50 p-5">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center">
            <User className="w-7 h-7 text-white" />
          </div>
          <div>
            <p className="font-semibold text-slate-900 dark:text-white">{user?.full_name || "User"}</p>
            <p className="text-sm text-slate-500 dark:text-slate-400">{user?.email}</p>
            {profile?.treatment_date && (
              <p className="text-xs text-teal-600 dark:text-teal-400 mt-1">
                Treatment: {new Date(profile.treatment_date).toLocaleDateString()}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Preferences */}
      <div className="bg-white dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700/50 divide-y divide-slate-100 dark:divide-slate-700/50">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-100 dark:bg-slate-700 rounded-xl">
              <Moon className="w-5 h-5 text-slate-600 dark:text-slate-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-900 dark:text-white">Dark Mode</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Easier on the eyes at night</p>
            </div>
          </div>
          <Switch checked={darkMode} onCheckedChange={toggleDarkMode} />
        </div>
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-100 dark:bg-slate-700 rounded-xl">
              <Bell className="w-5 h-5 text-slate-600 dark:text-slate-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-900 dark:text-white">Daily Reminders</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">{profile?.daily_reminder_time || "Not set"}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recovery Info */}
      {profile && (
        <div className="bg-white dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700/50 p-5">
          <h3 className="font-semibold text-sm text-slate-900 dark:text-white mb-3">Recovery Profile</h3>
          <div className="space-y-3">
            {profile.primary_reason && (
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400">Treatment Reason</p>
                <p className="text-sm text-slate-900 dark:text-white">{profile.primary_reason}</p>
              </div>
            )}
            {profile.treatment_facility && (
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400">Facility</p>
                <p className="text-sm text-slate-900 dark:text-white">{profile.treatment_facility}</p>
              </div>
            )}
            {profile.current_challenges?.length > 0 && (
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Current Challenges</p>
                <div className="flex flex-wrap gap-1">
                  {profile.current_challenges.map(c => (
                    <span key={c} className="text-xs bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2 py-1 rounded-full">{c}</span>
                  ))}
                </div>
              </div>
            )}
            {profile.goals?.length > 0 && (
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Goals</p>
                <div className="flex flex-wrap gap-1">
                  {profile.goals.map(g => (
                    <span key={g} className="text-xs bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-300 px-2 py-1 rounded-full">{g}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Privacy & Legal */}
      <div className="bg-white dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700/50 divide-y divide-slate-100 dark:divide-slate-700/50">
        <Link to={createPageUrl("Privacy")} className="w-full flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-100 dark:bg-slate-700 rounded-xl">
              <Shield className="w-5 h-5 text-slate-600 dark:text-slate-400" />
            </div>
            <p className="text-sm font-medium text-slate-900 dark:text-white">Privacy Policy</p>
          </div>
          <ChevronRight className="w-5 h-5 text-slate-400" />
        </Link>
      </div>

      {/* Danger Zone */}
      <div className="space-y-3">
        <Button
          variant="outline"
          onClick={() => base44.auth.logout()}
          className="w-full rounded-xl gap-2 text-slate-700 dark:text-slate-300"
        >
          <LogOut className="w-4 h-4" /> Sign Out
        </Button>
        <Button
          variant="outline"
          onClick={() => setShowDeleteConfirm(true)}
          className="w-full rounded-xl gap-2 text-red-600 border-red-200 dark:border-red-900 hover:bg-red-50 dark:hover:bg-red-950/20"
        >
          <Trash2 className="w-4 h-4" /> Delete All My Data
        </Button>
      </div>

      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-sm w-full p-6">
            <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-2">Delete All Data?</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
              This will permanently delete all your mood logs, journal entries, habits, goals, and profile. This cannot be undone.
            </p>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setShowDeleteConfirm(false)} className="flex-1 rounded-xl">Cancel</Button>
              <Button onClick={deleteAllData} disabled={deleting} className="flex-1 rounded-xl bg-red-600 hover:bg-red-700 text-white">
                {deleting ? "Deleting..." : "Delete Everything"}
              </Button>
            </div>
          </div>
        </div>
      )}

      <DisclaimerBanner />
    </div>
  );
}