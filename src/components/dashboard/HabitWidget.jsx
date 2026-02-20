import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Check, Plus, Flame } from "lucide-react";

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
    <div className="bg-white dark:bg-slate-800/50 rounded-2xl p-5 border border-slate-200 dark:border-slate-700/50">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-slate-900 dark:text-white">Today's Habits</h3>
        <span className="text-xs font-medium text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-900/30 px-2.5 py-1 rounded-full">
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
                className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${
                  done
                    ? "bg-teal-50 dark:bg-teal-900/20 border border-teal-200 dark:border-teal-800"
                    : "bg-slate-50 dark:bg-slate-700/30 border border-slate-100 dark:border-slate-700 hover:border-teal-200"
                }`}
              >
                <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                  done ? "bg-teal-500 text-white" : "border-2 border-slate-300 dark:border-slate-600"
                }`}>
                  {done && <Check className="w-3.5 h-3.5" />}
                </div>
                <span className={`text-sm font-medium flex-1 text-left ${
                  done ? "text-teal-700 dark:text-teal-300 line-through" : "text-slate-700 dark:text-slate-300"
                }`}>{habit.habit_name}</span>
                {(habit.current_streak || 0) > 0 && (
                  <span className="flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400">
                    <Flame className="w-3.5 h-3.5" />{habit.current_streak}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}