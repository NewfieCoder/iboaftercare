import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sparkles, Salad, Dumbbell, Moon, Heart, Loader2 } from "lucide-react";
import { toast } from "sonner";


export default function WellnessPlanner() {
  const [profile, setProfile] = useState(null);
  const [user, setUser] = useState(null);
  const [plans, setPlans] = useState([]);
  const [generating, setGenerating] = useState(false);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const currentUser = await base44.auth.me().catch(() => null);
      const profiles = await base44.entities.UserProfile.list();
      const wellnessPlans = await base44.entities.WellnessPlan.list('-created_date');
      
      setUser(currentUser);
      if (profiles.length > 0) setProfile(profiles[0]);
      setPlans(wellnessPlans);
    } catch (e) {
      console.error('Failed to load data:', e);
    } finally {
      setLoading(false);
    }
  }

  async function generatePlan(planType) {
    setGenerating(true);
    
    const prompts = {
      nutrition: `Create a 7-day nutrition plan for neuroregeneration after Ibogaine treatment. Focus on:
- Omega-3 rich foods (per Ambio guidelines for brain health)
- Anti-inflammatory foods
- Avoid stimulants (caffeine, sugar spikes)
- Hydration goals (1 oz/kg body weight)
- Simple, affordable meals
Return JSON: {days: [{day: 1, breakfast: "", lunch: "", dinner: "", snacks: "", hydration: ""}]}`,
      
      exercise: `Create a 14-day gentle exercise plan for post-Ibogaine integration (or pre-treatment prep). Per SAMHSA stress reduction guidelines:
- Start with light activities (walking, yoga, stretching)
- Gradual intensity increase
- Mindful movement focus
- 20-30 min sessions
Return JSON: {weeks: [{week: 1, days: [{day: 1, activity: "", duration: "", intensity: ""}]}]}`,
      
      sleep: `Create a sleep optimization plan for Ibogaine recovery. Include:
- Sleep hygiene practices
- Herbal/natural sleep aids (chamomile, magnesium - informational only)
- Bedtime routine suggestions
- Wake time consistency
- Nap guidance
Return JSON: {practices: [{practice: "", timing: "", benefit: ""}], routine: {evening: [], morning: []}}`,
      
      mindfulness: `Create a 21-day mindfulness/meditation plan inspired by Ambio integration practices. Include:
- Daily meditation prompts
- Breathwork exercises (SAMHSA coping techniques)
- Gratitude practices (Davis et al. persisting effects research)
- Body scan techniques
- Integration reflection prompts
Return JSON: {days: [{day: 1, practice: "", duration: "", focus: ""}]}`
    };

    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: prompts[planType],
        response_json_schema: { type: "object" }
      });

      const planContent = typeof result === 'string' ? result : JSON.stringify(result);
      
      await base44.entities.WellnessPlan.create({
        plan_type: planType,
        ai_generated: true,
        plan_content: planContent,
        goals: profile?.goals || [],
        duration_days: planType === 'nutrition' ? 7 : planType === 'exercise' ? 14 : planType === 'mindfulness' ? 21 : 30,
        progress: 0,
        is_active: true
      });

      toast.success("Plan generated successfully!");
      loadData();
    } catch (e) {
      toast.error("Failed to generate plan");
    } finally {
      setGenerating(false);
    }
  }

  const planTypes = [
    { type: "nutrition", icon: Salad, label: "Nutrition", color: "text-green-600" },
    { type: "exercise", icon: Dumbbell, label: "Exercise", color: "text-blue-600" },
    { type: "sleep", icon: Moon, label: "Sleep", color: "text-indigo-600" },
    { type: "mindfulness", icon: Heart, label: "Mindfulness", color: "text-rose-600" }
  ];

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
          Holistic Wellness Planner
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          AI-customized plans based on Ambio, SAMHSA, and research-backed practices
        </p>
      </div>

      <Tabs defaultValue="nutrition" className="space-y-6">
        <TabsList className="grid grid-cols-2 md:grid-cols-4 gap-2 bg-transparent h-auto">
          {planTypes.map(({ type, icon: Icon, label, color }) => (
            <TabsTrigger 
              key={type} 
              value={type}
              className="flex items-center gap-2 h-auto py-3 data-[state=active]:bg-teal-50 dark:data-[state=active]:bg-teal-900/30"
            >
              <Icon className={`w-4 h-4 ${color}`} />
              <span>{label}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        {planTypes.map(({ type, icon: Icon, label }) => {
          const existingPlan = plans.find(p => p.plan_type === type && p.is_active);
          
          return (
            <TabsContent key={type} value={type}>
              {!existingPlan ? (
                <Card className="p-8 text-center">
                  <Icon className="w-16 h-16 mx-auto mb-4 text-teal-600" />
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                    Generate {label} Plan
                  </h2>
                  <p className="text-slate-600 dark:text-slate-400 mb-6">
                    AI will create a personalized {label.toLowerCase()} plan based on your profile and evidence-based practices.
                  </p>
                  <Button 
                    onClick={() => generatePlan(type)}
                    disabled={generating}
                    className="rounded-xl gap-2 bg-gradient-to-r from-teal-600 to-emerald-600"
                  >
                    {generating ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        Generate Plan
                      </>
                    )}
                  </Button>
                </Card>
              ) : (
                <Card className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
                        Your {label} Plan
                      </h2>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        {existingPlan.duration_days}-day AI-generated plan
                      </p>
                    </div>
                    <Button 
                      variant="outline" 
                      onClick={() => generatePlan(type)}
                      disabled={generating}
                      className="rounded-xl"
                    >
                      Regenerate
                    </Button>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-900/50 rounded-2xl p-6 mb-4">
                    <pre className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap font-sans">
                      {JSON.stringify(JSON.parse(existingPlan.plan_content), null, 2)}
                    </pre>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-slate-200 dark:bg-slate-700 h-2 rounded-full">
                      <div 
                        className="bg-teal-600 h-full rounded-full transition-all"
                        style={{ width: `${existingPlan.progress}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                      {existingPlan.progress}%
                    </span>
                  </div>
                </Card>
              )}
            </TabsContent>
          );
        })}
      </Tabs>

      <Card className="mt-6 p-6 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 border-amber-200 dark:border-amber-800">
        <div className="flex items-start gap-3">
          <Sparkles className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5" />
          <div>
            <h3 className="font-semibold text-slate-900 dark:text-white mb-1">Evidence-Based Wellness</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Plans incorporate practices from Ambio neuroregeneration protocols, SAMHSA stress management, 
              and research on post-psychedelic integration. Always consult healthcare providers for medical guidance.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}