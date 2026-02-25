import { useState } from "react";
import { BarChart3, PenLine, Target, Flame } from "lucide-react";
import MoodChart from "@/components/progress/MoodChart";
import JournalSection from "@/components/progress/JournalSection";
import GoalsSection from "@/components/progress/GoalsSection";
import HabitManager from "@/components/progress/HabitManager";
import MoodPatternAnalysis from "@/components/progress/MoodPatternAnalysis";
import DisclaimerBanner from "@/components/DisclaimerBanner";

const tabs = [
  { id: "overview", label: "Overview", icon: BarChart3 },
  { id: "habits", label: "Habits", icon: Flame },
  { id: "journal", label: "Journal", icon: PenLine },
  { id: "goals", label: "Goals", icon: Target },
];

export default function Progress() {
  const params = new URLSearchParams(window.location.search);
  const [activeTab, setActiveTab] = useState(params.get("tab") || "overview");

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight mb-5">
        Progress
      </h1>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 rounded-xl p-1 mb-6 overflow-x-auto">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all flex-1 justify-center ${
              activeTab === tab.id
                ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm"
                : "text-slate-500 dark:text-slate-400"
            }`}
          >
            <tab.icon className="w-4 h-4" />
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700/50 p-5">
            <h3 className="font-semibold text-slate-900 dark:text-white mb-3">Mood & Cravings Trends</h3>
            <MoodChart />
            <div className="flex items-center gap-6 mt-3 pt-3 border-t border-slate-100 dark:border-slate-700/50">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-teal-500" />
                <span className="text-xs text-slate-500 dark:text-slate-400">Mood</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-rose-500" />
                <span className="text-xs text-slate-500 dark:text-slate-400">Cravings</span>
              </div>
            </div>
          </div>
          <MoodPatternAnalysis />
          <DisclaimerBanner compact />
        </div>
      )}
      {activeTab === "habits" && <HabitManager />}
      {activeTab === "journal" && <JournalSection />}
      {activeTab === "goals" && <GoalsSection />}
    </div>
  );
}