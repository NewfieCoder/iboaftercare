import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { TrendingUp, TrendingDown, Minus, Loader2, Lightbulb } from "lucide-react";

export default function MoodPatternAnalysis() {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    analyzeMoodPatterns();
  }, []);

  async function analyzeMoodPatterns() {
    const moods = await base44.entities.MoodLog.filter({}, "-log_date", 30);
    
    if (moods.length < 3) {
      setLoading(false);
      return;
    }

    // Calculate trends
    const avgMood = moods.reduce((sum, m) => sum + m.mood_score, 0) / moods.length;
    const recentAvg = moods.slice(0, 7).reduce((sum, m) => sum + m.mood_score, 0) / Math.min(7, moods.length);
    const trend = recentAvg > avgMood + 0.5 ? "up" : recentAvg < avgMood - 0.5 ? "down" : "stable";

    // Identify patterns
    const eveningMoods = moods.filter(m => {
      const hour = new Date(m.created_date).getHours();
      return hour >= 18;
    });
    const morningMoods = moods.filter(m => {
      const hour = new Date(m.created_date).getHours();
      return hour < 12;
    });

    const eveningAvg = eveningMoods.length > 0
      ? eveningMoods.reduce((sum, m) => sum + m.mood_score, 0) / eveningMoods.length
      : null;
    const morningAvg = morningMoods.length > 0
      ? morningMoods.reduce((sum, m) => sum + m.mood_score, 0) / morningMoods.length
      : null;

    // Get AI insights
    const profile = await base44.entities.UserProfile.list();
    const challenges = profile[0]?.current_challenges?.join(", ") || "general recovery";

    const insights = await base44.integrations.Core.InvokeLLM({
      prompt: `Analyze this mood data for someone in Ibogaine recovery dealing with: ${challenges}.

Mood trend: ${trend} (recent avg: ${recentAvg.toFixed(1)}, overall avg: ${avgMood.toFixed(1)})
Morning mood avg: ${morningAvg?.toFixed(1) || "N/A"}
Evening mood avg: ${eveningAvg?.toFixed(1) || "N/A"}

Provide 2-3 brief, actionable insights based on SAMHSA wellness guidelines or integration practices. Keep it supportive and specific. Format as JSON.`,
      response_json_schema: {
        type: "object",
        properties: {
          insights: {
            type: "array",
            items: { type: "string" }
          }
        }
      }
    });

    setAnalysis({
      trend,
      avgMood: avgMood.toFixed(1),
      recentAvg: recentAvg.toFixed(1),
      eveningAvg: eveningAvg?.toFixed(1),
      morningAvg: morningAvg?.toFixed(1),
      insights: insights.insights
    });
    setLoading(false);
  }

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 rounded-2xl border border-blue-100 dark:border-blue-900/50 p-5 animate-pulse">
        <div className="flex items-center gap-3 mb-4">
          <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
          <div className="h-4 bg-blue-200/50 rounded w-32" />
        </div>
        <div className="space-y-2">
          <div className="h-3 bg-blue-200/50 rounded w-full" />
          <div className="h-3 bg-blue-200/50 rounded w-3/4" />
        </div>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700/50 p-5 text-center">
        <Lightbulb className="w-6 h-6 text-slate-400 mx-auto mb-2" />
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Log at least 3 moods to see pattern insights
        </p>
      </div>
    );
  }

  const TrendIcon = analysis.trend === "up" ? TrendingUp : analysis.trend === "down" ? TrendingDown : Minus;
  const trendColor = analysis.trend === "up" ? "text-emerald-600" : analysis.trend === "down" ? "text-rose-600" : "text-slate-600";

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 rounded-2xl border border-blue-100 dark:border-blue-900/50 p-5">
      <div className="flex items-center gap-2 mb-4">
        <Lightbulb className="w-5 h-5 text-blue-600 dark:text-blue-400" />
        <h3 className="font-semibold text-sm text-slate-900 dark:text-white">Mood Pattern Insights</h3>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="text-center">
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Trend</p>
          <div className="flex items-center justify-center gap-1">
            <TrendIcon className={`w-4 h-4 ${trendColor}`} />
            <span className="text-sm font-semibold text-slate-900 dark:text-white capitalize">
              {analysis.trend}
            </span>
          </div>
        </div>
        {analysis.morningAvg && (
          <div className="text-center">
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Morning</p>
            <p className="text-sm font-semibold text-slate-900 dark:text-white">
              {analysis.morningAvg}/10
            </p>
          </div>
        )}
        {analysis.eveningAvg && (
          <div className="text-center">
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Evening</p>
            <p className="text-sm font-semibold text-slate-900 dark:text-white">
              {analysis.eveningAvg}/10
            </p>
          </div>
        )}
      </div>

      <div className="space-y-2">
        {analysis.insights.map((insight, i) => (
          <div key={i} className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0 mt-1.5" />
            <p>{insight}</p>
          </div>
        ))}
      </div>
    </div>
  );
}