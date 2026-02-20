import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Flame, Check, Trash2 } from "lucide-react";

const categories = ["Mindfulness", "Exercise", "Nutrition", "Sleep", "Social", "Journaling", "Other"];
const frequencies = ["Daily", "Weekly", "3x per week", "5x per week"];

export default function HabitManager() {
  const [habits, setHabits] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [category, setCategory] = useState("Mindfulness");
  const [frequency, setFrequency] = useState("Daily");
  const [saving, setSaving] = useState(false);
  const today = new Date().toISOString().split("T")[0];

  useEffect(() => { load(); }, []);

  async function load() {
    const h = await base44.entities.HabitTracker.list("-created_date");
    setHabits(h);
  }

  async function createHabit() {
    if (!name.trim()) return;
    setSaving(true);
    await base44.entities.HabitTracker.create({
      habit_name: name, category, target_frequency: frequency,
      is_active: true, current_streak: 0, longest_streak: 0, completions: [],
    });
    setName(""); setShowForm(false); setSaving(false);
    load();
  }

  async function toggleToday(habit) {
    const completions = habit.completions || [];
    let updated;
    let streak = habit.current_streak || 0;
    if (completions.includes(today)) {
      updated = completions.filter(d => d !== today);
      streak = Math.max(0, streak - 1);
    } else {
      updated = [...completions, today];
      streak += 1;
    }
    await base44.entities.HabitTracker.update(habit.id, {
      completions: updated,
      current_streak: streak,
      longest_streak: Math.max(habit.longest_streak || 0, streak),
    });
    load();
  }

  async function deleteHabit(id) {
    await base44.entities.HabitTracker.delete(id);
    load();
  }

  // Build last 7 days
  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().split("T")[0];
  });

  const dayLabels = ["S", "M", "T", "W", "T", "F", "S"];

  return (
    <div>
      {!showForm ? (
        <Button onClick={() => setShowForm(true)} className="w-full bg-amber-600 hover:bg-amber-700 rounded-xl mb-4 gap-2">
          <Plus className="w-4 h-4" /> Add Habit
        </Button>
      ) : (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 mb-4 space-y-3">
          <Input placeholder="Habit name (e.g., Morning meditation)" value={name} onChange={e => setName(e.target.value)} className="rounded-xl" />
          <div className="grid grid-cols-2 gap-2">
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
              <SelectContent>
                {categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={frequency} onValueChange={setFrequency}>
              <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
              <SelectContent>
                {frequencies.map(f => <SelectItem key={f} value={f}>{f}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setShowForm(false)} className="rounded-xl">Cancel</Button>
            <Button onClick={createHabit} disabled={saving || !name.trim()} className="rounded-xl bg-amber-600 hover:bg-amber-700 flex-1">
              {saving ? "..." : "Add Habit"}
            </Button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {habits.map(habit => {
          const completions = habit.completions || [];
          const doneToday = completions.includes(today);
          return (
            <div key={habit.id} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => toggleToday(habit)}
                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                      doneToday ? "bg-teal-500 text-white" : "border-2 border-slate-300 dark:border-slate-600"
                    }`}
                  >
                    {doneToday && <Check className="w-4 h-4" />}
                  </button>
                  <div>
                    <p className="font-medium text-sm text-slate-900 dark:text-white">{habit.habit_name}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{habit.category} · {habit.target_frequency}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {(habit.current_streak || 0) > 0 && (
                    <span className="flex items-center gap-1 text-xs font-medium text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-2 py-1 rounded-full">
                      <Flame className="w-3.5 h-3.5" />{habit.current_streak}
                    </span>
                  )}
                  <button onClick={() => deleteHabit(habit.id)} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700">
                    <Trash2 className="w-4 h-4 text-slate-400" />
                  </button>
                </div>
              </div>
              {/* 7-day grid */}
              <div className="flex gap-1.5">
                {last7.map((date, i) => {
                  const done = completions.includes(date);
                  return (
                    <div key={date} className="flex-1 flex flex-col items-center gap-1">
                      <span className="text-[10px] text-slate-400">{dayLabels[new Date(date).getDay()]}</span>
                      <div className={`w-6 h-6 rounded-md transition-colors ${
                        done ? "bg-teal-500" : "bg-slate-100 dark:bg-slate-700"
                      }`} />
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
        {habits.length === 0 && (
          <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-8">Build recovery habits one at a time</p>
        )}
      </div>
    </div>
  );
}