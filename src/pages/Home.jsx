import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "../utils";
import { base44 } from "@/api/base44Client";
import DisclaimerBanner from "@/components/DisclaimerBanner";
import MoodWidget from "@/components/dashboard/MoodWidget";
import HabitWidget from "@/components/dashboard/HabitWidget";
import QuickActions from "@/components/dashboard/QuickActions";
import MilestoneCard from "@/components/dashboard/MilestoneCard";
import WelcomeTutorial from "@/components/WelcomeTutorial";
import IntegrationCalendar from "@/components/dashboard/IntegrationCalendar";
import SplashScreen from "@/components/SplashScreen";
import { Loader2 } from "lucide-react";

export default function Home() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showTutorial, setShowTutorial] = useState(false);
  const [showSplash, setShowSplash] = useState(!localStorage.getItem("hasSeenSplash"));

  useEffect(() => {
    async function init() {
      const u = await base44.auth.me();
      setUser(u);
      const profiles = await base44.entities.UserProfile.list();
      
      // If user has Tester role, ensure premium is granted
      if (u?.role === 'tester' && profiles.length > 0 && !profiles[0].premium) {
        await base44.entities.UserProfile.update(profiles[0].id, { premium: true });
        profiles[0].premium = true;
      }
      
      if (profiles.length === 0) {
        navigate(createPageUrl("Onboarding"));
        return;
      }
      setProfile(profiles[0]);
      // Show tutorial if first time (check a flag in profile or localStorage)
      const hasSeenTutorial = localStorage.getItem("hasSeenTutorial");
      if (!hasSeenTutorial) {
        setShowTutorial(true);
      }
      setLoading(false);
    }
    init();
  }, []);

  const completeTutorial = () => {
    localStorage.setItem("hasSeenTutorial", "true");
    setShowTutorial(false);
  };

  const completeSplash = () => {
    localStorage.setItem("hasSeenSplash", "true");
    setShowSplash(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-teal-500 animate-spin" />
      </div>
    );
  }

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 18) return "Good afternoon";
    return "Good evening";
  };

  const firstName = user?.full_name?.split(" ")[0] || "there";

  return (
    <>
      {showSplash && <SplashScreen onComplete={completeSplash} />}
      <div className="max-w-lg mx-auto px-4 py-6 space-y-5">
        {showTutorial && <WelcomeTutorial onComplete={completeTutorial} />}

        {/* Greeting */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-slate-800 dark:text-white tracking-tight mb-1" style={{ fontFamily: "'Cormorant', serif" }}>
            {greeting()}, {firstName}
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Your recovery journey for today
          </p>
        </div>

        {/* Milestone */}
        <MilestoneCard treatmentDate={profile?.treatment_date} userType={profile?.user_type} />

        {/* Integration Calendar */}
        <IntegrationCalendar />

        {/* Quick Actions */}
        <QuickActions />

        {/* Mood & Habits */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <MoodWidget />
          <HabitWidget />
        </div>

        {/* Daily Tip */}
        <DailyTip profile={profile} />

        {/* Disclaimer */}
        <DisclaimerBanner compact />
      </div>
    </>
  );
}

function DailyTip({ profile }) {
  const [tip, setTip] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTip() {
      const challenges = profile?.current_challenges?.join(", ") || "general recovery";
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `You are IboGuide, a supportive aftercare coach for Ibogaine recovery. Generate a brief, encouraging daily tip (2-3 sentences) for someone dealing with: ${challenges}. Draw from SAMHSA wellness guidelines, mindfulness practices, or evidence-based recovery strategies. Be warm and specific. Do NOT give medical advice. Format as JSON.`,
        response_json_schema: {
          type: "object",
          properties: {
            tip: { type: "string" },
            category: { type: "string" }
          }
        }
      });
      setTip(res);
      setLoading(false);
    }
    fetchTip();
  }, []);

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-violet-50 to-blue-50 dark:from-violet-950/20 dark:to-blue-950/20 rounded-2xl p-5 border border-violet-100 dark:border-violet-900/50 animate-pulse">
        <div className="h-4 bg-violet-200/50 rounded w-1/3 mb-3" />
        <div className="h-3 bg-violet-200/50 rounded w-full mb-2" />
        <div className="h-3 bg-violet-200/50 rounded w-2/3" />
      </div>
    );
  }

  return (
    <div className="glass rounded-2xl p-5 border border-white/30 dark:border-white/10 shadow-lg hover:shadow-xl transition-all duration-300 texture-overlay group">
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-teal-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl" />
      <div className="relative">
        <p className="text-xs font-medium text-emerald-700 dark:text-emerald-400 mb-2">💡 Daily Insight</p>
        <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{tip?.tip}</p>
      </div>
    </div>
  );
}