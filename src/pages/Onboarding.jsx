import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "../utils";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { TreePine, ChevronRight, ChevronLeft, Heart, Shield, Sparkles } from "lucide-react";
import DisclaimerBanner from "@/components/DisclaimerBanner";

const challenges = [
  "Anxiety", "Cravings", "Sleep Issues", "Depression", "Mood Swings",
  "Brain Fog", "Social Isolation", "Flashbacks", "Low Energy", "Anger/Irritability"
];

const goals = [
  "Build daily routines", "Process Ibogaine insights", "Manage cravings",
  "Improve sleep", "Start exercising", "Practice mindfulness",
  "Strengthen relationships", "Find community support", "Career focus", "Emotional healing"
];

const reasons = [
  "Opioid Addiction", "Alcohol Addiction", "PTSD", "TBI", "Depression", "Anxiety", "Other"
];

export default function Onboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [userType, setUserType] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [treatmentDate, setTreatmentDate] = useState("");
  const [facility, setFacility] = useState("");
  const [primaryReason, setPrimaryReason] = useState("");
  const [selectedChallenges, setSelectedChallenges] = useState([]);
  const [selectedGoals, setSelectedGoals] = useState([]);
  const [reminderTime, setReminderTime] = useState("09:00");
  const [saving, setSaving] = useState(false);

  const toggleItem = (item, list, setter) => {
    setter(list.includes(item) ? list.filter(i => i !== item) : [...list, item]);
  };

  const handleComplete = async () => {
    setSaving(true);
    await base44.entities.UserProfile.create({
      user_type: userType,
      treatment_confirmed: true,
      treatment_date: treatmentDate,
      treatment_facility: facility,
      primary_reason: primaryReason,
      current_challenges: selectedChallenges,
      goals: selectedGoals,
      daily_reminder_time: reminderTime,
      onboarding_complete: true,
      dark_mode: false,
      premium: false,
      premium_tier: "free"
    });
    navigate(createPageUrl("Home"));
  };

  const steps = [
    // Welcome
    <div key="welcome" className="flex flex-col items-center text-center px-4">
      <div className="w-24 h-24 bg-gradient-to-br from-teal-400 to-emerald-600 rounded-3xl flex items-center justify-center mb-8 shadow-lg shadow-teal-200/50">
        <TreePine className="w-14 h-14 text-white" />
      </div>
      <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-3 tracking-tight">
        Welcome to IboGuide
      </h1>
      <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-sm leading-relaxed">
        Your AI companion for Ibogaine preparation and integration support.
      </p>
      <div className="grid grid-cols-3 gap-4 mb-8 w-full max-w-sm">
        {[
          { icon: Heart, label: "Supportive", color: "text-rose-500 bg-rose-50 dark:bg-rose-950/30" },
          { icon: Shield, label: "Private", color: "text-blue-500 bg-blue-50 dark:bg-blue-950/30" },
          { icon: Sparkles, label: "AI-Powered", color: "text-amber-500 bg-amber-50 dark:bg-amber-950/30" },
        ].map(({ icon: Icon, label, color }) => (
          <div key={label} className={`flex flex-col items-center gap-2 p-4 rounded-2xl ${color}`}>
            <Icon className="w-6 h-6" />
            <span className="text-xs font-medium text-slate-700 dark:text-slate-300">{label}</span>
          </div>
        ))}
      </div>
      <DisclaimerBanner />
    </div>,

    // User Type Selection
    <div key="usertype" className="px-4">
      <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Your Journey Stage</h2>
      <p className="text-slate-500 dark:text-slate-400 mb-6 text-sm">
        Are you preparing for treatment or have you already completed it?
      </p>
      <div className="space-y-3">
        <button
          onClick={() => setUserType("pre-treatment")}
          className={`w-full p-6 rounded-2xl text-left transition-all border ${
            userType === "pre-treatment"
              ? "bg-teal-50 dark:bg-teal-900/30 border-teal-300 dark:border-teal-700"
              : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-teal-200"
          }`}
        >
          <h3 className="font-semibold text-slate-900 dark:text-white mb-1">Pre-Treatment Preparation</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            I'm planning to undergo Ibogaine treatment and want to prepare
          </p>
        </button>
        <button
          onClick={() => setUserType("post-treatment")}
          className={`w-full p-6 rounded-2xl text-left transition-all border ${
            userType === "post-treatment"
              ? "bg-teal-50 dark:bg-teal-900/30 border-teal-300 dark:border-teal-700"
              : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-teal-200"
          }`}
        >
          <h3 className="font-semibold text-slate-900 dark:text-white mb-1">Post-Treatment Integration</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            I've completed Ibogaine treatment and need ongoing support
          </p>
        </button>
      </div>
    </div>,

    // Confirmation
    <div key="confirm" className="px-4">
      <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Before We Begin</h2>
      <p className="text-slate-500 dark:text-slate-400 mb-8 text-sm">
        {userType === "pre-treatment" 
          ? "This app provides informational preparation support (not medical advice). You must be 18+ with a confirmed treatment date."
          : "This app is for individuals who have completed Ibogaine treatment (18+). Please confirm your eligibility."}
      </p>
      <div className="space-y-4">
        <label className="flex items-start gap-3 p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 cursor-pointer" onClick={() => setConfirmed(!confirmed)}>
          <Checkbox checked={confirmed} className="mt-0.5" />
          <span className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
            {userType === "pre-treatment"
              ? "I confirm I am 18+ with a scheduled Ibogaine treatment date. I understand this app provides informational prep only and is not a substitute for professional medical care."
              : "I confirm I am 18+ and have completed Ibogaine treatment at a recognized facility. I understand this app provides supportive information only and is not a substitute for professional care."}
          </span>
        </label>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
            {userType === "pre-treatment" ? "Scheduled Treatment Date" : "Treatment Completion Date"}
          </label>
          <Input type="date" value={treatmentDate} onChange={e => setTreatmentDate(e.target.value)} className="rounded-xl" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Treatment Facility (optional)</label>
          <Input placeholder="e.g., Ambio Life Sciences, Beond" value={facility} onChange={e => setFacility(e.target.value)} className="rounded-xl" />
        </div>
      </div>
    </div>,

    // Primary Reason
    <div key="reason" className="px-4">
      <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Your Journey</h2>
      <p className="text-slate-500 dark:text-slate-400 mb-6 text-sm">What was your primary reason for Ibogaine treatment?</p>
      <div className="grid grid-cols-2 gap-3">
        {reasons.map(reason => (
          <button
            key={reason}
            onClick={() => setPrimaryReason(reason)}
            className={`p-4 rounded-2xl text-sm font-medium text-left transition-all border ${
              primaryReason === reason
                ? "bg-teal-50 dark:bg-teal-900/30 border-teal-300 dark:border-teal-700 text-teal-700 dark:text-teal-300"
                : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-teal-200"
            }`}
          >
            {reason}
          </button>
        ))}
      </div>
    </div>,

    // Challenges
    <div key="challenges" className="px-4">
      <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
        {userType === "pre-treatment" ? "Preparation Concerns" : "Current Challenges"}
      </h2>
      <p className="text-slate-500 dark:text-slate-400 mb-6 text-sm">
        {userType === "pre-treatment" 
          ? "What are you most concerned about as you prepare?"
          : "Select any that apply to personalize your experience."}
      </p>
      <div className="flex flex-wrap gap-2">
        {(userType === "pre-treatment" 
          ? ["Tapering", "Medical Screening", "Anxiety/Fear", "Intentions", "Logistics", "Family Support", "Safety Concerns", "Financial", "What to Expect", "Provider Selection"]
          : challenges
        ).map(ch => (
          <button
            key={ch}
            onClick={() => toggleItem(ch, selectedChallenges, setSelectedChallenges)}
            className={`px-4 py-2.5 rounded-full text-sm font-medium transition-all border ${
              selectedChallenges.includes(ch)
                ? "bg-teal-50 dark:bg-teal-900/30 border-teal-300 dark:border-teal-700 text-teal-700 dark:text-teal-300"
                : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400"
            }`}
          >
            {ch}
          </button>
        ))}
      </div>
    </div>,

    // Goals
    <div key="goals" className="px-4">
      <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Your Goals</h2>
      <p className="text-slate-500 dark:text-slate-400 mb-6 text-sm">
        {userType === "pre-treatment" 
          ? "What do you hope to gain from preparation and treatment?"
          : "What would you like to work on? Pick as many as you like."}
      </p>
      <div className="flex flex-wrap gap-2">
        {(userType === "pre-treatment"
          ? ["Set Clear Intentions", "Physical Preparation", "Mental Readiness", "Understand Process", "Build Support Network", "Taper Safely", "Plan Integration", "Financial Planning", "Arrange Logistics", "Spiritual Prep"]
          : goals
        ).map(g => (
          <button
            key={g}
            onClick={() => toggleItem(g, selectedGoals, setSelectedGoals)}
            className={`px-4 py-2.5 rounded-full text-sm font-medium transition-all border ${
              selectedGoals.includes(g)
                ? "bg-teal-50 dark:bg-teal-900/30 border-teal-300 dark:border-teal-700 text-teal-700 dark:text-teal-300"
                : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400"
            }`}
          >
            {g}
          </button>
        ))}
      </div>
    </div>,

    // Reminders
    <div key="reminders" className="px-4">
      <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Daily Check-in</h2>
      <p className="text-slate-500 dark:text-slate-400 mb-8 text-sm">When would you like your daily reminder?</p>
      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Preferred Time</label>
          <Input type="time" value={reminderTime} onChange={e => setReminderTime(e.target.value)} className="rounded-xl" />
        </div>
      </div>
      <div className="mt-8 p-6 bg-gradient-to-br from-teal-50 to-emerald-50 dark:from-teal-950/30 dark:to-emerald-950/30 rounded-2xl border border-teal-100 dark:border-teal-900">
        <h3 className="font-semibold text-teal-800 dark:text-teal-200 mb-2">You're All Set! 🌱</h3>
        <p className="text-sm text-teal-700 dark:text-teal-300 leading-relaxed">
          IboGuide, your AI coach, will be ready to chat anytime. Start with a daily check-in or explore guided sessions for integration, mindfulness, and recovery support.
        </p>
      </div>
    </div>,
  ];

  const canProceed = () => {
    if (step === 1) return userType !== "";
    if (step === 2) return confirmed && treatmentDate;
    if (step === 3) return primaryReason;
    return true;
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col">
      {/* Progress */}
      <div className="px-6 pt-8 pb-4">
        <div className="flex gap-1.5 max-w-md mx-auto">
          {steps.map((_, i) => (
            <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-500 ${
              i <= step ? "bg-teal-500" : "bg-slate-200 dark:bg-slate-800"
            }`} />
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col max-w-lg mx-auto w-full py-6">
        <div className="flex-1">{steps[step]}</div>

        {/* Navigation */}
        <div className="px-4 pt-8 pb-6 flex gap-3">
          {step > 0 && (
            <Button variant="outline" onClick={() => setStep(step - 1)} className="rounded-xl px-6">
              <ChevronLeft className="w-4 h-4 mr-1" /> Back
            </Button>
          )}
          <Button
            onClick={() => step < steps.length - 1 ? setStep(step + 1) : handleComplete()}
            disabled={!canProceed() || saving}
            className="flex-1 bg-teal-600 hover:bg-teal-700 text-white rounded-xl h-12 text-base font-medium"
          >
            {saving ? "Setting up..." : step < steps.length - 1 ? (
              <>Continue <ChevronRight className="w-4 h-4 ml-1" /></>
            ) : "Start My Journey"}
          </Button>
        </div>
      </div>
    </div>
  );
}