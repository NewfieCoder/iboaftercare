import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "../utils";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { ChevronRight, ChevronLeft, Heart, Shield, Sparkles } from "lucide-react";
import DisclaimerBanner from "@/components/DisclaimerBanner";
import Logo from "@/components/Logo";
import { motion } from "framer-motion";

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
  const [loading, setLoading] = useState(true);

  const [userType, setUserType] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [treatmentDate, setTreatmentDate] = useState("");
  const [facility, setFacility] = useState("");
  const [primaryReason, setPrimaryReason] = useState("");
  const [selectedChallenges, setSelectedChallenges] = useState([]);
  const [selectedGoals, setSelectedGoals] = useState([]);
  const [reminderTime, setReminderTime] = useState("09:00");
  const [fullName, setFullName] = useState("");
  const [birthdate, setBirthdate] = useState("");
  const [gender, setGender] = useState("");
  const [heightCm, setHeightCm] = useState("");
  const [weightKg, setWeightKg] = useState("");
  const [saving, setSaving] = useState(false);
  const [ageError, setAgeError] = useState("");

  useEffect(() => {
    async function checkOnboarding() {
      try {
        const profiles = await base44.entities.UserProfile.list();
        if (profiles.length > 0 && profiles[0]?.onboarding_complete) {
          navigate(createPageUrl("Home"), { replace: true });
          return;
        }
      } catch (e) {
        console.error("Error checking onboarding status:", e);
      }
      setLoading(false);
    }
    checkOnboarding();
  }, [navigate]);

  const toggleItem = (item, list, setter) => {
    setter(list.includes(item) ? list.filter((i) => i !== item) : [...list, item]);
  };

  const calculateAge = (birthDate) => {
    if (!birthDate) return null;
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const isAdult = () => {
    const age = calculateAge(birthdate);
    return age !== null && age >= 18;
  };

  const handleComplete = async () => {
    if (!isAdult()) {
      setAgeError("You must be at least 18 years old to use this app.");
      return;
    }
    setAgeError("");
    setSaving(true);

    await base44.entities.UserProfile.create({
      full_name: fullName,
      birthdate: birthdate,
      biological_gender: gender,
      height_cm: heightCm ? parseFloat(heightCm) : null,
      weight_kg: weightKg ? parseFloat(weightKg) : null,
      user_type: userType,
      treatment_confirmed: true,
      age_verified: true,
      treatment_date: treatmentDate,
      treatment_facility: facility,
      primary_reason: primaryReason,
      current_challenges: selectedChallenges,
      goals: selectedGoals,
      daily_reminder_time: reminderTime,
      onboarding_complete: true,
      dark_mode: false,
      has_purchased: false,
    });

    navigate(createPageUrl("Home"));
  };

  const canProceed = () => {
    if (step === 1) return userType !== "";
    if (step === 2) return confirmed && treatmentDate;
    if (step === 3) return primaryReason;
    if (step === 6) return fullName && birthdate && gender && isAdult();
    return true;
  };

  const steps = [
    // Welcome step
    <div key="welcome" className="flex flex-col items-center text-center px-4">
      <div className="mb-8">
        <Logo variant="icon" className="w-24 h-24" />
      </div>
      <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-3 tracking-tight">
        Welcome to IboAftercare Coach
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

    // User Type Selection (step 1)
    <div key="usertype" className="px-4">
      <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Your Journey Stage</h2>
      <p className="text-slate-500 dark:text-slate-400 mb-6 text-sm">
        Are you preparing for treatment or have you already completed it?
      </p>
      <div className="space-y-3">
        <button
          onClick={() => setUserType("pre-treatment")}
          className={`w-full p-6 rounded-2xl text-left transition-all duration-300 border glass ${
            userType === "pre-treatment"
              ? "border-emerald-300 dark:border-emerald-700"
              : "border-white/30 dark:border-white/10 hover:border-emerald-200 hover:shadow-lg"
          }`}
        >
          <h3 className="font-semibold text-slate-900 dark:text-white mb-1">Pre-Treatment Preparation</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            I'm planning to undergo Ibogaine treatment and want to prepare
          </p>
        </button>
        <button
          onClick={() => setUserType("post-treatment")}
          className={`w-full p-6 rounded-2xl text-left transition-all duration-300 border glass ${
            userType === "post-treatment"
              ? "border-emerald-300 dark:border-emerald-700"
              : "border-white/30 dark:border-white/10 hover:border-emerald-200 hover:shadow-lg"
          }`}
        >
          <h3 className="font-semibold text-slate-900 dark:text-white mb-1">Post-Treatment Integration</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            I've completed Ibogaine treatment and need ongoing support
          </p>
        </button>
      </div>
    </div>,

    // Confirmation & Treatment Date (step 2)
    <div key="confirm" className="px-4">
      <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Before We Begin</h2>
      <p className="text-slate-500 dark:text-slate-400 mb-8 text-sm">
        {userType === "pre-treatment"
          ? "This app provides informational preparation support (not medical advice). You must be 18+ with a confirmed treatment date."
          : "This app is for individuals who have completed Ibogaine treatment (18+). Please confirm your eligibility."}
      </p>
      <div className="space-y-4">
        <label
          className="flex items-start gap-3 p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 cursor-pointer"
          onClick={() => setConfirmed(!confirmed)}
        >
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
          <Input
            type="date"
            value={treatmentDate}
            onChange={(e) => setTreatmentDate(e.target.value)}
            className="rounded-xl"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Treatment Facility (optional)</label>
          <Input
            placeholder="e.g., Ambio Life Sciences, Beond"
            value={facility}
            onChange={(e) => setFacility(e.target.value)}
            className="rounded-xl"
          />
        </div>
      </div>
    </div>,

    // ... (the rest of the steps array remains unchanged – reason, challenges, goals, personal info, reminders)
    // Just make sure to include the age error display in the personal info step:

    // Inside the personal info step JSX:
    <div key="personal" className="px-4">
      {/* ... existing content ... */}
      <div className="space-y-4">
        {/* ... name, birthdate, gender, height, weight ... */}

        {birthdate && !isAdult() && (
          <p className="text-sm text-red-600 mt-1">
            You must be at least 18 years old to continue.
          </p>
        )}
        {ageError && (
          <p className="text-sm text-red-600 mt-4 text-center font-medium">{ageError}</p>
        )}
      </div>
    </div>,

    // ... reminders step unchanged ...
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-100 via-teal-50 to-cyan-100 dark:from-emerald-950 dark:via-teal-950 dark:to-cyan-950">
        <div className="text-center">
          <Logo variant="icon" className="w-16 h-16 mx-auto mb-4 animate-pulse" />
          <p className="text-sm text-slate-600 dark:text-slate-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-100 via-teal-50 to-cyan-100 dark:from-emerald-950 dark:via-teal-950 dark:to-cyan-950" />
        <svg className="absolute inset-0 w-full h-full opacity-30 dark:opacity-20" preserveAspectRatio="none">
          <path d="M-50,100 Q200,150 400,80 T900,120" stroke="#D4AF37" strokeWidth="2" fill="none" opacity="0.4"/>
        </svg>
      </div>

      {/* Progress bar */}
      <div className="px-6 pt-8 pb-4">
        <div className="flex gap-1.5 max-w-md mx-auto">
          {steps.map((_, i) => (
            <motion.div
              key={i}
              className={`h-1 flex-1 rounded-full transition-all duration-500 ${
                i <= step ? "bg-gradient-to-r from-emerald-500 to-teal-500" : "bg-white/40 dark:bg-slate-800/40"
              }`}
              initial={{ scaleX: 0 }}
              animate={{ scaleX: i <= step ? 1 : 0.3 }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
            />
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col max-w-lg mx-auto w-full py-6">
        <motion.div
          key={step}
          className="flex-1"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          {steps[step]}
        </motion.div>

        {/* Navigation */}
        <div className="px-4 pt-8 pb-6 flex gap-3">
          {step > 0 && (
            <Button variant="outline" onClick={() => setStep(step - 1)} className="rounded-xl px-6">
              <ChevronLeft className="w-4 h-4 mr-1" /> Back
            </Button>
          )}
          <Button
            onClick={() => (step < steps.length - 1 ? setStep(step + 1) : handleComplete())}
            disabled={!canProceed() || saving}
            className="flex-1 bg-teal-600 hover:bg-teal-700 text-white rounded-xl h-12 text-base font-medium"
          >
            {saving
              ? "Setting up..."
              : step < steps.length - 1
              ? (
                <>
                  Continue <ChevronRight className="w-4 h-4 ml-1" />
                </>
              )
              : "Start My Journey"}
          </Button>
        </div>
      </div>
    </div>
  );
}