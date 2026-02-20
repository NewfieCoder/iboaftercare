import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Target, Plus, CheckCircle2, Pause, Play, Trash2 } from "lucide-react";

const categories = ["Integration", "Physical Health", "Mental Health", "Relationships", "Lifestyle", "Career"];

export default function GoalsSection() {
  const [goals, setGoals] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Integration");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => { load(); }, []);

  async function load() {
    const g = await base44.entities.Goal.list("-created_date");
    setGoals(g);
  }

  async function createGoal() {
    if (!title.trim()) return;
    setSaving(true);
    await base44.entities.Goal.create({
      title, category, description, status: "Active", progress: 0,
    });
    setTitle(""); setDescription(""); setShowForm(false); setSaving(false);
    load();
  }

  async function updateProgress(goal, val) {
    await base44.entities.Goal.update(goal.id, { progress: val[0] });
    load();
  }

  async function toggleStatus(goal) {
    const next = goal.status === "Active" ? "Paused" : goal.status === "Paused" ? "Active" : "Active";
    await base44.entities.Goal.update(goal.id, { status: next });
    load();
  }

  async function completeGoal(goal) {
    await base44.entities.Goal.update(goal.id, { status: "Completed", progress: 100 });
    load();
  }

  async function deleteGoal(goal) {
    await base44.entities.Goal.delete(goal.id);
    load();
  }

  const statusColor = {
    Active: "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 dark:text-emerald-400",
    Paused: "text-amber-600 bg-amber-50 dark:bg-amber-900/20 dark:text-amber-400",
    Completed: "text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400",
  };

  return (
    <div>
      {!showForm ? (
        <Button onClick={() => setShowForm(true)} className="w-full bg-blue-600 hover:bg-blue-700 rounded-xl mb-4 gap-2">
          <Plus className="w-4 h-4" /> Add Goal
        </Button>
      ) : (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 mb-4 space-y-3">
          <Input placeholder="Goal title (e.g., Meditate 10 min daily)" value={title} onChange={e => setTitle(e.target.value)} className="rounded-xl" />
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
            <SelectContent>
              {categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
          <Input placeholder="Description (optional)" value={description} onChange={e => setDescription(e.target.value)} className="rounded-xl" />
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setShowForm(false)} className="rounded-xl">Cancel</Button>
            <Button onClick={createGoal} disabled={saving || !title.trim()} className="rounded-xl bg-blue-600 hover:bg-blue-700 flex-1">
              {saving ? "..." : "Create Goal"}
            </Button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {goals.map(goal => (
          <div key={goal.id} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Target className="w-4 h-4 text-blue-500" />
                  <p className="font-medium text-sm text-slate-900 dark:text-white">{goal.title}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500">{goal.category}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColor[goal.status] || ""}`}>
                    {goal.status}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {goal.status !== "Completed" && (
                  <>
                    <button onClick={() => toggleStatus(goal)} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700">
                      {goal.status === "Active" ? <Pause className="w-4 h-4 text-slate-400" /> : <Play className="w-4 h-4 text-slate-400" />}
                    </button>
                    <button onClick={() => completeGoal(goal)} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    </button>
                  </>
                )}
                <button onClick={() => deleteGoal(goal)} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700">
                  <Trash2 className="w-4 h-4 text-slate-400" />
                </button>
              </div>
            </div>
            {goal.status !== "Completed" && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500 dark:text-slate-400">Progress</span>
                  <span className="text-xs font-medium text-slate-700 dark:text-slate-300">{goal.progress || 0}%</span>
                </div>
                <Slider
                  value={[goal.progress || 0]}
                  max={100}
                  step={5}
                  onValueCommit={(val) => updateProgress(goal, val)}
                  className="w-full"
                />
              </div>
            )}
          </div>
        ))}
        {goals.length === 0 && (
          <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-8">No goals yet. Set your first recovery goal!</p>
        )}
      </div>
    </div>
  );
}