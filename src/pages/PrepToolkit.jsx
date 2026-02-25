import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ClipboardList, Heart, BookOpen, Calendar, Lock, Crown } from "lucide-react";
import { toast } from "sonner";
import PremiumUpsell from "@/components/PremiumUpsell";

const checklistTemplates = {
  "medical-screening": {
    title: "Medical Screening Checklist",
    description: "Essential pre-treatment medical tests per GITA guidelines",
    items: [
      { text: "EKG/ECG (electrocardiogram)", source: "GITA" },
      { text: "Liver function tests (ALT, AST)", source: "GITA" },
      { text: "Complete blood count (CBC)", source: "GITA" },
      { text: "Kidney function tests", source: "GITA" },
      { text: "Pregnancy test (if applicable)", source: "GITA" },
      { text: "Mental health evaluation", source: "Clinical Best Practice" },
      { text: "Medication review with provider", source: "Clinical Best Practice" }
    ]
  },
  "preparation": {
    title: "Physical Preparation",
    description: "Optimize your body for treatment per Ambio/clinical recommendations",
    items: [
      { text: "Hydration: 1 oz/kg body weight daily", source: "Clinical Guidelines" },
      { text: "Reduce/eliminate caffeine 1 week prior", source: "Ambio" },
      { text: "Avoid alcohol 1-2 weeks prior", source: "Clinical Best Practice" },
      { text: "Improve sleep hygiene", source: "SAMHSA" },
      { text: "Light exercise (walking, yoga)", source: "Ambio" },
      { text: "Healthy diet (omega-3s, whole foods)", source: "Ambio" }
    ]
  },
  "mental-prep": {
    title: "Mental & Spiritual Preparation",
    description: "Set intentions and prepare mindset",
    items: [
      { text: "Write intentions (What do you seek?)", source: "Integration Best Practice" },
      { text: "Journal about fears and hopes", source: "Therapeutic Practice" },
      { text: "Practice meditation/mindfulness", source: "SAMHSA" },
      { text: "Connect with support network", source: "SAMHSA" },
      { text: "Review integration plan with counselor", source: "Davis et al" },
      { text: "Prepare questions for treatment staff", source: "Clinical Best Practice" }
    ]
  },
  "logistics": {
    title: "Logistics & Planning",
    description: "Practical arrangements for treatment",
    items: [
      { text: "Book treatment facility", source: "" },
      { text: "Arrange transportation", source: "" },
      { text: "Notify employer/arrange time off", source: "" },
      { text: "Arrange childcare/pet care", source: "" },
      { text: "Pack comfort items (photos, journal)", source: "" },
      { text: "Set up post-treatment support", source: "Integration Best Practice" },
      { text: "Financial planning complete", source: "" }
    ]
  }
};

export default function PrepToolkit() {
  const [profile, setProfile] = useState(null);
  const [checklists, setChecklists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUpsell, setShowUpsell] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const profiles = await base44.entities.UserProfile.list();
    const userChecklists = await base44.entities.PrepChecklist.list();
    
    if (profiles.length > 0) setProfile(profiles[0]);
    setChecklists(userChecklists);
    
    // Create default checklists if none exist
    if (userChecklists.length === 0 && profiles[0]?.user_type === "pre-treatment") {
      for (const [type, template] of Object.entries(checklistTemplates)) {
        await base44.entities.PrepChecklist.create({
          checklist_type: type,
          items: template.items.map(item => ({ ...item, completed: false })),
          completed_count: 0,
          total_count: template.items.length
        });
      }
      loadData();
    }
    setLoading(false);
  }

  async function toggleItem(checklistId, itemIndex) {
    const checklist = checklists.find(c => c.id === checklistId);
    const updatedItems = [...checklist.items];
    updatedItems[itemIndex].completed = !updatedItems[itemIndex].completed;
    const completedCount = updatedItems.filter(i => i.completed).length;

    await base44.entities.PrepChecklist.update(checklistId, {
      items: updatedItems,
      completed_count: completedCount
    });
    
    loadData();
    if (completedCount === updatedItems.length) {
      toast.success("Checklist complete! 🎉");
    }
  }

  if (profile?.user_type !== "pre-treatment") {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card className="p-8 text-center">
          <Lock className="w-12 h-12 mx-auto mb-4 text-slate-400" />
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
            Pre-Treatment Toolkit
          </h2>
          <p className="text-slate-600 dark:text-slate-400">
            This feature is for users preparing for treatment. Your profile is set to post-treatment mode.
          </p>
        </Card>
      </div>
    );
  }

  if (!profile?.premium) {
    return (
      <>
        <div className="max-w-4xl mx-auto p-6">
          <Card className="p-8 text-center">
            <Crown className="w-12 h-12 mx-auto mb-4 text-amber-500" />
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
              Premium Feature
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              The Pre-Treatment Prep Toolkit is available with Premium subscription.
            </p>
            <Button onClick={() => setShowUpsell(true)} className="rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600">
              Upgrade to Premium
            </Button>
          </Card>
        </div>
        {showUpsell && <PremiumUpsell onClose={() => setShowUpsell(false)} />}
      </>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
          Pre-Treatment Prep Toolkit
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          Comprehensive checklists based on GITA, Ambio, and clinical best practices
        </p>
      </div>

      <Tabs defaultValue="medical-screening" className="space-y-6">
        <TabsList className="grid grid-cols-2 md:grid-cols-4 gap-2 bg-transparent h-auto">
          {Object.keys(checklistTemplates).map(type => {
            const checklist = checklists.find(c => c.checklist_type === type);
            const progress = checklist ? Math.round((checklist.completed_count / checklist.total_count) * 100) : 0;
            
            return (
              <TabsTrigger 
                key={type} 
                value={type}
                className="flex-col h-auto py-3 px-4 data-[state=active]:bg-teal-50 dark:data-[state=active]:bg-teal-900/30"
              >
                <span className="text-sm font-medium">{checklistTemplates[type].title}</span>
                <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full mt-2">
                  <div 
                    className="bg-teal-600 h-full rounded-full transition-all"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <span className="text-xs text-slate-500 dark:text-slate-400 mt-1">{progress}%</span>
              </TabsTrigger>
            );
          })}
        </TabsList>

        {Object.entries(checklistTemplates).map(([type, template]) => {
          const checklist = checklists.find(c => c.checklist_type === type);
          
          return (
            <TabsContent key={type} value={type}>
              <Card className="p-6">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                    {template.title}
                  </h2>
                  <p className="text-slate-600 dark:text-slate-400">{template.description}</p>
                </div>

                <div className="space-y-3">
                  {checklist?.items.map((item, idx) => (
                    <label
                      key={idx}
                      className="flex items-start gap-3 p-4 bg-white dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 cursor-pointer hover:border-teal-300 dark:hover:border-teal-700 transition-all"
                      onClick={() => toggleItem(checklist.id, idx)}
                    >
                      <Checkbox checked={item.completed} className="mt-0.5" />
                      <div className="flex-1">
                        <p className={`text-sm font-medium ${item.completed ? 'text-slate-400 line-through' : 'text-slate-900 dark:text-white'}`}>
                          {item.text}
                        </p>
                        {item.source && (
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                            Source: {item.source}
                          </p>
                        )}
                      </div>
                    </label>
                  ))}
                </div>
              </Card>
            </TabsContent>
          );
        })}
      </Tabs>

      {/* Countdown to Treatment */}
      {profile?.treatment_date && (
        <Card className="mt-6 p-6 bg-gradient-to-br from-teal-50 to-emerald-50 dark:from-teal-950/30 dark:to-emerald-950/30 border-teal-200 dark:border-teal-800">
          <div className="flex items-center gap-4">
            <Calendar className="w-10 h-10 text-teal-600 dark:text-teal-400" />
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white mb-1">Treatment Countdown</h3>
              <p className="text-2xl font-bold text-teal-600 dark:text-teal-400">
                {Math.max(0, Math.ceil((new Date(profile.treatment_date) - new Date()) / (1000 * 60 * 60 * 24)))} days remaining
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Scheduled: {new Date(profile.treatment_date).toLocaleDateString()}
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}