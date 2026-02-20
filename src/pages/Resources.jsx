import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Search, BookOpen, Brain, Heart, Dumbbell, Users, Apple, ExternalLink, Sparkles, Loader2 } from "lucide-react";
import DisclaimerBanner from "@/components/DisclaimerBanner";

const categories = [
  { id: "all", label: "All", icon: BookOpen },
  { id: "integration", label: "Integration", icon: Brain },
  { id: "cravings", label: "Cravings", icon: Heart },
  { id: "physical", label: "Physical", icon: Dumbbell },
  { id: "emotional", label: "Emotional", icon: Heart },
  { id: "community", label: "Community", icon: Users },
];

const resources = [
  {
    title: "Understanding Your Gray Day",
    description: "After Ibogaine treatment, the first 24-72 hours involve deep rest and gentle recovery. Learn how to honor this critical healing phase.",
    category: "integration",
    source: "Ambio Life Sciences Guidelines",
    tips: ["Rest as much as possible", "Stay hydrated with warm fluids", "Avoid screens and stimulation", "Gentle stretching only"],
  },
  {
    title: "Journaling for Integration",
    description: "Writing about visions, insights, and emotional experiences helps consolidate the psychological benefits of Ibogaine treatment.",
    category: "integration",
    source: "Psychedelic Integration Best Practices",
    tips: ["Write without judgment", "Describe visions in detail", "Note recurring themes", "Connect insights to daily life"],
  },
  {
    title: "Evidence-Based Craving Management",
    description: "SAMHSA-recommended techniques for managing cravings including the HALT method, urge surfing, and distraction strategies.",
    category: "cravings",
    source: "SAMHSA National Guidelines",
    tips: ["HALT: Check if Hungry, Angry, Lonely, Tired", "Practice urge surfing — observe without acting", "Use the 5-4-3-2-1 grounding technique", "Call a support person"],
  },
  {
    title: "Deep Breathing for Anxiety Relief",
    description: "Simple breathing exercises that activate the parasympathetic nervous system to reduce anxiety and stress responses.",
    category: "emotional",
    source: "Evidence-Based Wellness Practices",
    tips: ["4-7-8 breathing: inhale 4s, hold 7s, exhale 8s", "Box breathing: 4s each — in, hold, out, hold", "Practice 3-5 minutes, twice daily", "Use during craving episodes"],
  },
  {
    title: "Nutrition for Neuroregeneration",
    description: "Research suggests specific nutrients support brain recovery. Focus on omega-3 fatty acids, antioxidants, and anti-inflammatory foods.",
    category: "physical",
    source: "Nature Medicine / Nutritional Neuroscience",
    tips: ["Omega-3 rich foods: salmon, walnuts, flaxseed", "Antioxidant-rich berries and leafy greens", "Avoid processed sugars and stimulants", "Stay well-hydrated (8+ glasses water daily)"],
  },
  {
    title: "Building a Recovery Exercise Routine",
    description: "Regular physical activity supports mood regulation and reduces cravings. Studies show 81-88% symptom reduction with consistent habits.",
    category: "physical",
    source: "Published Recovery Outcomes Research",
    tips: ["Start with 15-minute walks", "Yoga supports mind-body integration", "Swimming is gentle on the body", "Gradually increase to 30 min, 5x/week"],
  },
  {
    title: "Cognitive Reframing Techniques",
    description: "Replace negative thought patterns with balanced perspectives using evidence-based cognitive behavioral strategies.",
    category: "emotional",
    source: "SAMHSA / CBT Best Practices",
    tips: ["Identify the automatic negative thought", "Ask: Is this thought based on facts?", "Generate a balanced alternative", "Practice daily with a thought journal"],
  },
  {
    title: "Finding Support Communities",
    description: "Connection is key to recovery. Explore free, evidence-based support groups for ongoing peer support.",
    category: "community",
    source: "Community Resources",
    links: [
      { name: "SMART Recovery", url: "https://www.smartrecovery.org" },
      { name: "SAMHSA Helpline", url: "https://www.samhsa.gov/find-help/national-helpline" },
      { name: "988 Crisis Lifeline", url: "https://988lifeline.org" },
    ],
  },
  {
    title: "Mindfulness & Meditation Basics",
    description: "Mindfulness practice helps integrate Ibogaine experiences and builds emotional resilience for long-term recovery.",
    category: "integration",
    source: "Psychedelic Integration / Mindfulness Research",
    tips: ["Start with 5 minutes of focused breathing", "Body scan meditation before sleep", "Loving-kindness meditation for self-compassion", "Consistency matters more than duration"],
  },
  {
    title: "Gratitude Practice for Recovery",
    description: "Research shows daily gratitude practices significantly improve mood and reduce depressive symptoms in recovery.",
    category: "emotional",
    source: "Published Positive Psychology Research",
    tips: ["Write 3 things you're grateful for each morning", "Be specific, not generic", "Include gratitude for your own growth", "Share gratitude with someone daily"],
  },
];

export default function Resources() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [aiAnswer, setAiAnswer] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [expandedId, setExpandedId] = useState(null);

  const filtered = resources.filter(r => {
    const matchesCategory = activeCategory === "all" || r.category === activeCategory;
    const matchesSearch = !searchQuery || r.title.toLowerCase().includes(searchQuery.toLowerCase()) || r.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  async function aiSearch() {
    if (!searchQuery.trim()) return;
    setAiLoading(true);
    setAiAnswer("");
    const res = await base44.integrations.Core.InvokeLLM({
      prompt: `You are IboGuide, an aftercare support coach for Ibogaine recovery. A user is asking: "${searchQuery}". Provide a helpful, evidence-based answer (3-5 sentences) drawing from SAMHSA guidelines, published research, and psychedelic integration best practices. Do NOT give medical advice. Cite your source type (e.g., "Based on SAMHSA guidelines..."). Return as JSON.`,
      response_json_schema: {
        type: "object",
        properties: { answer: { type: "string" }, source: { type: "string" } }
      }
    });
    setAiAnswer(res.answer + (res.source ? `\n\n— ${res.source}` : ""));
    setAiLoading(false);
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight mb-5">
        Resources
      </h1>

      {/* AI Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <input
          type="text"
          placeholder="Ask anything about recovery..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          onKeyDown={e => e.key === "Enter" && aiSearch()}
          className="w-full pl-11 pr-12 py-3.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30 text-slate-900 dark:text-white placeholder:text-slate-400"
        />
        <button onClick={aiSearch} disabled={aiLoading} className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg bg-teal-50 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 hover:bg-teal-100">
          {aiLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
        </button>
      </div>

      {/* AI Answer */}
      {aiAnswer && (
        <div className="bg-gradient-to-br from-teal-50 to-emerald-50 dark:from-teal-950/20 dark:to-emerald-950/20 rounded-2xl p-4 mb-4 border border-teal-100 dark:border-teal-900/50">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-teal-600 dark:text-teal-400" />
            <span className="text-xs font-medium text-teal-700 dark:text-teal-300">IboGuide Answer</span>
          </div>
          <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">{aiAnswer}</p>
        </div>
      )}

      {/* Category Filter */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-thin">
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
              activeCategory === cat.id
                ? "bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800"
                : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700"
            }`}
          >
            <cat.icon className="w-4 h-4" />
            {cat.label}
          </button>
        ))}
      </div>

      {/* Resource Cards */}
      <div className="space-y-3">
        {filtered.map((resource, idx) => (
          <div key={idx} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
            <button
              onClick={() => setExpandedId(expandedId === idx ? null : idx)}
              className="w-full text-left p-4"
            >
              <p className="font-semibold text-sm text-slate-900 dark:text-white mb-1">{resource.title}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{resource.description}</p>
              <span className="inline-block mt-2 text-[10px] font-medium text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-900/20 px-2 py-0.5 rounded-full">
                {resource.source}
              </span>
            </button>
            {expandedId === idx && (
              <div className="px-4 pb-4 pt-0 border-t border-slate-100 dark:border-slate-700/50">
                {resource.tips && (
                  <ul className="space-y-2 mt-3">
                    {resource.tips.map((tip, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300">
                        <span className="text-teal-500 mt-1">•</span>
                        {tip}
                      </li>
                    ))}
                  </ul>
                )}
                {resource.links && (
                  <div className="space-y-2 mt-3">
                    {resource.links.map((link, i) => (
                      <a key={i} href={link.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-teal-600 dark:text-teal-400 hover:underline">
                        <ExternalLink className="w-4 h-4" />
                        {link.name}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-6">
        <DisclaimerBanner compact />
      </div>
    </div>
  );
}