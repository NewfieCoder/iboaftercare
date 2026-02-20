import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Calendar, Sparkles, Trophy, Loader2 } from "lucide-react";

const milestones = [
  { days: 7, label: "1 Week", message: "You've made it through your first week! Focus on gentle routines and rest per Ambio's 'Gray Day' approach." },
  { days: 14, label: "2 Weeks", message: "Two weeks of integration! Your brain is healing. Keep up mindfulness and gentle movement." },
  { days: 30, label: "1 Month", message: "One month milestone! Based on SAMHSA guidelines, now is a great time to strengthen your support network." },
  { days: 60, label: "2 Months", message: "Two months of progress! Focus on building sustainable habits and processing any lingering insights." },
  { days: 90, label: "3 Months", message: "Quarter-year achievement! Research shows this is when new neural pathways solidify. Keep going!" },
  { days: 180, label: "6 Months", message: "Half a year! You're well into long-term recovery. Celebrate this major milestone." },
  { days: 365, label: "1 Year", message: "One full year! This is a tremendous achievement. Your commitment to recovery is inspiring." }
];

export default function IntegrationCalendar() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [nextMilestone, setNextMilestone] = useState(null);
  const [aiMessage, setAiMessage] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const profiles = await base44.entities.UserProfile.list();
    if (profiles.length > 0) {
      const p = profiles[0];
      setProfile(p);
      
      if (p.treatment_date) {
        const treatmentDate = new Date(p.treatment_date);
        const today = new Date();
        const daysSince = Math.floor((today - treatmentDate) / (1000 * 60 * 60 * 24));
        
        // Find next milestone
        const upcoming = milestones.find(m => m.days > daysSince);
        if (upcoming) {
          setNextMilestone({
            ...upcoming,
            daysUntil: upcoming.days - daysSince
          });
        }
        
        // Check if we hit a milestone today (within 1 day)
        const recentMilestone = milestones.find(m => Math.abs(m.days - daysSince) <= 1);
        if (recentMilestone) {
          // Generate personalized AI message
          const res = await base44.integrations.Core.InvokeLLM({
            prompt: `A person in Ibogaine recovery has reached their ${recentMilestone.label} milestone (${daysSince} days post-treatment). They're working on: ${p.goals?.join(", ") || "general recovery"}. Generate a warm, celebratory message (2-3 sentences) with a specific evidence-based wellness tip from SAMHSA/Ambio/integration practices. Format as JSON.`,
            response_json_schema: {
              type: "object",
              properties: {
                message: { type: "string" }
              }
            }
          });
          setAiMessage(res.message);
        }
      }
    }
    setLoading(false);
  }

  if (loading) {
    return (
      <div className="bg-white dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700/50 p-5 animate-pulse">
        <div className="flex items-center gap-3 mb-3">
          <Loader2 className="w-5 h-5 text-teal-600 animate-spin" />
          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-32" />
        </div>
        <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-full" />
      </div>
    );
  }

  if (!profile?.treatment_date) {
    return null;
  }

  const treatmentDate = new Date(profile.treatment_date);
  const today = new Date();
  const daysSince = Math.floor((today - treatmentDate) / (1000 * 60 * 60 * 24));

  return (
    <div className="space-y-4">
      {/* Milestone Celebration */}
      {aiMessage && (
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 rounded-2xl border border-amber-200 dark:border-amber-800 p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-amber-100 dark:bg-amber-900/50 rounded-xl">
              <Trophy className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
            <h3 className="font-semibold text-slate-900 dark:text-white">Milestone Reached! 🎉</h3>
          </div>
          <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
            {aiMessage}
          </p>
        </div>
      )}

      {/* Next Milestone */}
      <div className="bg-white dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700/50 p-5">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 bg-teal-100 dark:bg-teal-900/30 rounded-xl">
            <Calendar className="w-5 h-5 text-teal-600 dark:text-teal-400" />
          </div>
          <h3 className="font-semibold text-slate-900 dark:text-white">Integration Journey</h3>
        </div>
        
        <div className="space-y-3">
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Days Since Treatment</p>
            <p className="text-2xl font-bold text-teal-600 dark:text-teal-400">{daysSince}</p>
          </div>
          
          {nextMilestone && (
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Next Milestone</p>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-900 dark:text-white">
                  {nextMilestone.label}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  in {nextMilestone.daysUntil} days
                </span>
              </div>
              <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden mt-2">
                <div
                  className="h-full bg-gradient-to-r from-teal-500 to-emerald-600"
                  style={{ width: `${(daysSince / nextMilestone.days) * 100}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}