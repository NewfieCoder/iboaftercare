import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Trophy, Star, Flame, Heart, Brain, Target, Crown, Check, Lock, Sparkles, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";
import PremiumUpsell from "@/components/PremiumUpsell";

const challenges = [
  {
    id: "week1",
    title: "First Week Strong",
    description: "Complete 7 consecutive daily check-ins",
    icon: Flame,
    color: "from-orange-500 to-red-600",
    days: 7,
    reward: "Foundation Builder Badge"
  },
  {
    id: "month1",
    title: "30-Day Milestone",
    description: "Reach 30 days post-treatment with consistent tracking",
    icon: Star,
    color: "from-yellow-500 to-amber-600",
    days: 30,
    reward: "Integration Warrior Badge"
  },
  {
    id: "month3",
    title: "90-Day Transformation",
    description: "Complete 90 days of recovery journey",
    icon: Trophy,
    color: "from-emerald-500 to-teal-600",
    days: 90,
    reward: "Transformation Champion Badge"
  },
  {
    id: "gratitude",
    title: "Gratitude Master",
    description: "Log gratitude for 21 consecutive days",
    icon: Heart,
    color: "from-pink-500 to-rose-600",
    days: 21,
    reward: "Grateful Heart Badge"
  },
  {
    id: "mindful",
    title: "Mindfulness Journey",
    description: "Complete 30 mindfulness sessions",
    icon: Brain,
    color: "from-purple-500 to-violet-600",
    days: 30,
    reward: "Zen Master Badge"
  },
  {
    id: "goals",
    title: "Goal Achiever",
    description: "Complete 5 recovery goals",
    icon: Target,
    color: "from-blue-500 to-indigo-600",
    days: null,
    reward: "Goal Crusher Badge"
  }
];

export default function MilestoneChallenges() {
  const [profile, setProfile] = useState(null);
  const [completedChallenges, setCompletedChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUpsell, setShowUpsell] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const profiles = await base44.entities.UserProfile.list();
    if (profiles.length > 0) {
      setProfile(profiles[0]);
      // Load completed challenges from profile (stored as JSON string)
      const completed = profiles[0].questionnaire_answers 
        ? JSON.parse(profiles[0].questionnaire_answers).completed_challenges || []
        : [];
      setCompletedChallenges(completed);
    }
    setLoading(false);
  }

  async function completeChallenge(challengeId) {
    const updated = [...completedChallenges, challengeId];
    setCompletedChallenges(updated);
    
    // Save to profile
    const currentData = profile.questionnaire_answers 
      ? JSON.parse(profile.questionnaire_answers) 
      : {};
    await base44.entities.UserProfile.update(profile.id, {
      questionnaire_answers: JSON.stringify({
        ...currentData,
        completed_challenges: updated
      })
    });

    // Celebrate!
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  }

  if (!profile?.premium) {
    return (
      <>
        <div className="max-w-4xl mx-auto px-4 py-4">
          <Card className="p-8 text-center">
            <Crown className="w-12 h-12 mx-auto mb-4 text-amber-500" />
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
              Premium Feature
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              Milestone Challenges & Badges are available with Premium subscription.
            </p>
            <Button 
              onClick={async () => {
                if (window.self !== window.top) {
                  alert('Checkout must be completed in the published app. Please open the app in a new tab to subscribe.');
                  return;
                }
                try {
                  const response = await base44.functions.invoke('createCheckoutSession', { tier: 'premium' });
                  if (response.data.url) window.location.href = response.data.url;
                } catch (error) {
                  console.error('Checkout error:', error);
                  setShowUpsell(true);
                }
              }}
              className="rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600"
            >
              Upgrade to Premium
            </Button>
          </Card>
        </div>
        {showUpsell && <PremiumUpsell onClose={() => setShowUpsell(false)} feature="Milestone Challenges" />}
      </>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-teal-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-4 space-y-6">
      <div className="text-center mb-8">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center mx-auto mb-4">
          <Trophy className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
          Milestone Challenges
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          Complete challenges and earn badges to celebrate your recovery journey
        </p>
      </div>

      {/* Progress Overview */}
      <Card className="p-6 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 border-emerald-200 dark:border-emerald-800">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Challenges Completed</p>
            <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
              {completedChallenges.length} / {challenges.length}
            </p>
          </div>
          <div className="flex gap-2">
            {completedChallenges.slice(0, 3).map((id, idx) => {
              const challenge = challenges.find(c => c.id === id);
              const Icon = challenge?.icon || Star;
              return (
                <motion.div
                  key={idx}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: idx * 0.1 }}
                  className={`w-12 h-12 rounded-xl bg-gradient-to-br ${challenge?.color || 'from-slate-400 to-slate-600'} flex items-center justify-center`}
                >
                  <Icon className="w-6 h-6 text-white" />
                </motion.div>
              );
            })}
            {completedChallenges.length > 3 && (
              <div className="w-12 h-12 rounded-xl bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-400 font-bold text-sm">
                +{completedChallenges.length - 3}
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Challenge Cards */}
      <div className="grid md:grid-cols-2 gap-4">
        {challenges.map((challenge, idx) => {
          const Icon = challenge.icon;
          const isCompleted = completedChallenges.includes(challenge.id);
          
          return (
            <motion.div
              key={challenge.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
            >
              <Card className={`p-6 relative overflow-hidden ${isCompleted ? 'border-2 border-emerald-500' : ''}`}>
                {isCompleted && (
                  <div className="absolute top-3 right-3">
                    <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center">
                      <Check className="w-5 h-5 text-white" />
                    </div>
                  </div>
                )}

                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${challenge.color} flex items-center justify-center mb-4 ${!isCompleted ? 'opacity-50' : ''}`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>

                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                  {challenge.title}
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                  {challenge.description}
                </p>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <span className="text-xs font-medium text-amber-600 dark:text-amber-400">
                      {challenge.reward}
                    </span>
                  </div>
                  {!isCompleted && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => completeChallenge(challenge.id)}
                      className="rounded-xl"
                    >
                      Complete
                    </Button>
                  )}
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>

      <Card className="p-6 bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-950/30 dark:to-purple-950/30 border-violet-200 dark:border-violet-800">
        <h3 className="font-semibold text-slate-900 dark:text-white mb-3">
          🎯 Challenge Tips
        </h3>
        <ul className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
          <li className="flex items-start gap-2">
            <span className="text-violet-500 mt-1">•</span>
            Track your progress daily to build momentum and complete time-based challenges
          </li>
          <li className="flex items-start gap-2">
            <span className="text-violet-500 mt-1">•</span>
            Badges appear in your profile and can be shared with your support network
          </li>
          <li className="flex items-start gap-2">
            <span className="text-violet-500 mt-1">•</span>
            New challenges unlock as you progress through your recovery journey
          </li>
        </ul>
      </Card>
    </div>
  );
}