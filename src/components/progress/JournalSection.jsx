import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { PenLine, Sparkles, Loader2, ChevronDown, ChevronUp } from "lucide-react";
import moment from "moment";

export default function JournalSection() {
  const [entries, setEntries] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [loadingPrompt, setLoadingPrompt] = useState(false);
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => { load(); }, []);

  async function load() {
    const e = await base44.entities.JournalEntry.list("-entry_date", 20);
    setEntries(e);
  }

  async function generatePrompt() {
    setLoadingPrompt(true);
    const res = await base44.integrations.Core.InvokeLLM({
      prompt: "Generate one thoughtful, specific journaling prompt for someone in Ibogaine aftercare recovery. The prompt should help them process their experience, reflect on growth, or explore emotions. Keep it to 1-2 sentences. Return as JSON.",
      response_json_schema: {
        type: "object",
        properties: { prompt: { type: "string" } }
      }
    });
    setAiPrompt(res.prompt);
    setLoadingPrompt(false);
  }

  async function saveEntry() {
    if (!content.trim()) return;
    setSaving(true);
    await base44.entities.JournalEntry.create({
      title: title || "Untitled Entry",
      content,
      ai_prompt: aiPrompt,
      entry_date: new Date().toISOString().split("T")[0],
    });
    setTitle("");
    setContent("");
    setAiPrompt("");
    setShowForm(false);
    setSaving(false);
    load();
  }

  return (
    <div>
      {!showForm ? (
        <Button onClick={() => { setShowForm(true); generatePrompt(); }} className="w-full bg-violet-600 hover:bg-violet-700 rounded-xl mb-4 gap-2">
          <PenLine className="w-4 h-4" /> New Journal Entry
        </Button>
      ) : (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 mb-4 space-y-3">
          {aiPrompt && (
            <div className="bg-violet-50 dark:bg-violet-950/20 rounded-xl p-3 flex items-start gap-2">
              <Sparkles className="w-4 h-4 text-violet-500 mt-0.5 shrink-0" />
              <p className="text-sm text-violet-700 dark:text-violet-300">{aiPrompt}</p>
            </div>
          )}
          {loadingPrompt && (
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <Loader2 className="w-4 h-4 animate-spin" /> Generating prompt...
            </div>
          )}
          <Input placeholder="Title (optional)" value={title} onChange={e => setTitle(e.target.value)} className="rounded-xl" />
          <Textarea
            placeholder="Write your thoughts..."
            value={content}
            onChange={e => setContent(e.target.value)}
            rows={6}
            className="rounded-xl resize-none"
          />
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setShowForm(false)} className="rounded-xl">Cancel</Button>
            <Button onClick={saveEntry} disabled={saving || !content.trim()} className="rounded-xl bg-violet-600 hover:bg-violet-700 flex-1">
              {saving ? "Saving..." : "Save Entry"}
            </Button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {entries.map(entry => (
          <div key={entry.id} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4">
            <button onClick={() => setExpandedId(expandedId === entry.id ? null : entry.id)} className="w-full flex items-center justify-between">
              <div className="text-left">
                <p className="font-medium text-sm text-slate-900 dark:text-white">{entry.title || "Untitled"}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{moment(entry.entry_date).format("MMM D, YYYY")}</p>
              </div>
              {expandedId === entry.id ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
            </button>
            {expandedId === entry.id && (
              <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-700">
                {entry.ai_prompt && (
                  <p className="text-xs text-violet-600 dark:text-violet-400 mb-2 italic">Prompt: {entry.ai_prompt}</p>
                )}
                <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap">{entry.content}</p>
              </div>
            )}
          </div>
        ))}
        {entries.length === 0 && (
          <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-8">No journal entries yet</p>
        )}
      </div>
    </div>
  );
}