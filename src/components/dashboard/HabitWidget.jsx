import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Check, Plus, Flame } from "lucide-react";
import { motion } from "framer-motion";

export default function HabitWidget() {
  const [habits, setHabits] = useState([]);
  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    loadHabits();
  }, []);

  async function loadHabits() {
    const h = await base44.entities.HabitTracker.filter({ is_active: true });
    setHabits(h);
  }

  async function toggleCompletion(habit) {
    const completions = habit.completions || [];
    let newCompletions;
    let newStreak = habit.current_streak || 0;

    if (completions.includes(today)) {
      newCompletions = completions.filter(d => d !== today);
      newStreak = Math.max(0, newStreak - 1);
    } else {
      newCompletions = [...completions, today];
      newStreak = newStreak + 1;
    }

    const longestStreak = Math.max(habit.longest_streak || 0, newStreak);
    await base44.entities.HabitTracker.update(habit.id, {
      completions: newCompletions,
      current_streak: newStreak,
      longest_streak: longestStreak,
    });
    loadHabits();
  }

  const completedToday = habits.filter(h => (h.completions || []).includes(today)).length;

  return (
    <motion.div 
      className="glass border border-white/30 dark:border-white/10 rounded-2xl p-5 shadow-lg hover:shadow-xl transition-all duration-300 texture-overlay"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-slate-900 dark:text-white">Today's Habits</h3>
        <span className="text-xs font-medium text-emerald-700 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-900/30 px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
          {completedToday}/{habits.length}
        </span>
      </div>
      {habits.length === 0 ? (
        <p className="text-sm text-slate-500 dark:text-slate-400">No habits yet. Add some in Progress.</p>
      ) : (
        <div className="space-y-2">
          {habits.slice(0, 5).map(habit => {
            const done = (habit.completions || []).includes(today);
            return (
              <button
                key={habit.id}
                onClick={() => toggleCompletion(habit)}
                className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-200 group ${
                  done
                    ? "glass border-emerald-300/50 dark:border-emerald-700/50"
                    : "glass border-white/30 dark:border-white/10 hover:border-emerald-200 dark:hover:border-emerald-800"
                }`}
                style={{
                  boxShadow: done ? '0 0 15px rgba(16, 185, 129, 0.15)' : undefined
                }}
              >
                <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-all duration-200 ${
                  done ? "bg-gradient-to-br from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/30" : "border-2 border-slate-300 dark:border-slate-600 group-hover:border-emerald-400"
                }`}>
                  {done && <Check className="w-3.5 h-3.5" />}
                </div>
                <span className={`text-sm font-medium flex-1 text-left ${
                  done ? "text-emerald-700 dark:text-emerald-300 line-through" : "text-slate-700 dark:text-slate-300"
                }`}>{habit.habit_name}</span>
                {(habit.current_streak || 0) > 0 && (
                  <span className="flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400">
                    <Flame className="w-3.5 h-3.5" style={{ filter: 'drop-shadow(0 0 4px rgba(251, 191, 36, 0.4))' }} />{habit.current_streak}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}