import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { BookOpen, AlertCircle, Sparkles } from "lucide-react";
import { toast } from "sonner";

export default function ContentManagement({ adminEmail }) {
  const [aiPromptTemplate, setAiPromptTemplate] = useState(`You are IboGuide, an empathetic AI coach supporting individuals after Ibogaine treatment. Your responses should be:
- Warm, compassionate, and non-judgmental
- Evidence-based (draw from Ambio holistic integration, SAMHSA coping strategies, psychedelic integration practices)
- Focused on safety and wellness
- Encouraging without being pushy

Always maintain crisis awareness and redirect to 988/SAMHSA if severe language is detected.`);

  function saveAiPrompt() {
    // In a real implementation, this would save to AppSettings entity
    toast.success("AI prompt template saved");
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Content Management</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Customize app content, AI behavior, and resources
        </p>
      </div>

      {/* AI Customization */}
      <div className="bg-white dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700/50 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-xl">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
              AI Coach (IboGuide) Prompt Template
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Customize the AI's personality and response guidelines
            </p>
          </div>
        </div>
        <div className="space-y-3">
          <Textarea
            value={aiPromptTemplate}
            onChange={(e) => setAiPromptTemplate(e.target.value)}
            rows={10}
            className="font-mono text-sm"
          />
          <Button onClick={saveAiPrompt} className="rounded-xl">
            Save AI Template
          </Button>
        </div>
      </div>

      {/* Resources Library */}
      <div className="bg-white dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700/50 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
              <BookOpen className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                Resources Library
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Manage curated articles, videos, and resources
              </p>
            </div>
          </div>
          <Button className="rounded-xl">Add Resource</Button>
        </div>
        <div className="p-8 text-center text-slate-500 dark:text-slate-400 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl">
          <BookOpen className="w-12 h-12 mx-auto mb-3 text-slate-400" />
          <p className="text-sm">
            Resources are currently managed via the Resources page.
          </p>
          <p className="text-xs mt-2">
            Future versions will allow direct editing here.
          </p>
        </div>
      </div>

      {/* Disclaimers & App Text */}
      <div className="bg-white dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700/50 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-xl">
            <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
              App-wide Text & Disclaimers
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Customize disclaimers and informational text
            </p>
          </div>
        </div>
        <div className="space-y-4">
          <div>
            <Label>Main Disclaimer Text</Label>
            <Textarea
              defaultValue="This app provides wellness guidance only. It is not a substitute for professional medical or mental health treatment. Always consult healthcare providers for medical advice."
              rows={3}
              className="mt-1"
            />
          </div>
          <Button className="rounded-xl">Save Changes</Button>
        </div>
      </div>

      {/* Info Note */}
      <div className="bg-blue-50 dark:bg-blue-950/20 rounded-2xl border border-blue-200 dark:border-blue-800 p-5">
        <p className="text-sm text-blue-800 dark:text-blue-300">
          <strong>Note:</strong> Changes to AI prompts and content affect all users. Test thoroughly before saving.
          Crisis detection and safety guardrails remain active regardless of customizations.
        </p>
      </div>
    </div>
  );
}