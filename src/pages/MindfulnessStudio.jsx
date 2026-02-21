import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Brain, Play, Pause, RotateCcw, Crown, Smartphone, Loader2 } from "lucide-react";
import PremiumUpsell from "@/components/PremiumUpsell";

const sessions = [
  {
    id: "breathwork",
    title: "4-7-8 Breathwork",
    duration: "5 min",
    type: "breathing",
    description: "Calm your nervous system with rhythmic breathing",
    guide: "Breathe in for 4 seconds... Hold for 7 seconds... Exhale slowly for 8 seconds... Feel your body relax with each breath."
  },
  {
    id: "body-scan",
    title: "Body Scan Meditation",
    duration: "10 min",
    type: "meditation",
    description: "Release tension and connect with your body",
    guide: "Close your eyes. Bring awareness to the top of your head... Notice any tension... Relax your forehead... Your jaw... Your shoulders... Let each part of your body soften and release."
  },
  {
    id: "gratitude",
    title: "Gratitude Reflection",
    duration: "7 min",
    type: "reflection",
    description: "Cultivate appreciation and positive emotion",
    guide: "Think of three things you're grateful for today... Feel the warmth of appreciation in your chest... Notice how gratitude shifts your perspective..."
  },
  {
    id: "integration",
    title: "Integration Meditation",
    duration: "15 min",
    type: "integration",
    description: "Process insights from your Ibogaine experience",
    guide: "Gently recall your treatment experience... What wisdom emerged?... What patterns did you recognize?... How can you integrate these insights into daily life?"
  }
];

export default function MindfulnessStudio() {
  const [profile, setProfile] = useState(null);
  const [showUpsell, setShowUpsell] = useState(false);
  const [activeSession, setActiveSession] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [timer, setTimer] = useState(0);
  const [deviceMotion, setDeviceMotion] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
    checkDeviceMotion();
  }, []);

  useEffect(() => {
    let interval;
    if (isPlaying) {
      interval = setInterval(() => {
        setTimer(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  async function loadData() {
    const profiles = await base44.entities.UserProfile.list();
    if (profiles.length > 0) setProfile(profiles[0]);
    setLoading(false);
  }

  function checkDeviceMotion() {
    if (typeof DeviceMotionEvent !== 'undefined' && typeof DeviceMotionEvent.requestPermission === 'function') {
      setDeviceMotion(true);
    } else if (window.DeviceMotionEvent) {
      setDeviceMotion(true);
    }
  }

  function startSession(session) {
    setActiveSession(session);
    setIsPlaying(true);
    setTimer(0);
  }

  function resetSession() {
    setIsPlaying(false);
    setTimer(0);
    setActiveSession(null);
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

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
              Mindfulness Studio with guided sessions is available with Premium subscription.
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
        {showUpsell && <PremiumUpsell onClose={() => setShowUpsell(false)} feature="Mindfulness Studio" />}
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
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center mx-auto mb-4">
          <Brain className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
          Mindfulness Studio
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          Guided meditation and breathwork for integration and healing
        </p>
      </div>

      {deviceMotion && (
        <Card className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border-blue-200 dark:border-blue-800">
          <div className="flex items-center gap-3">
            <Smartphone className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <p className="text-sm text-blue-800 dark:text-blue-300">
              <strong>Device Motion Detected:</strong> For an enhanced experience, hold your device during breathwork sessions for gentle haptic feedback (if supported).
            </p>
          </div>
        </Card>
      )}

      {activeSession ? (
        <Card className="p-8 text-center">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center mx-auto mb-6">
            <Brain className="w-10 h-10 text-white" />
          </div>
          
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
            {activeSession.title}
          </h2>
          
          <p className="text-4xl font-bold text-purple-600 dark:text-purple-400 mb-6">
            {formatTime(timer)}
          </p>

          <div className="bg-purple-50 dark:bg-purple-950/30 rounded-2xl p-6 mb-6 max-w-2xl mx-auto">
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed italic">
              "{activeSession.guide}"
            </p>
          </div>

          <div className="flex gap-3 justify-center">
            <Button
              onClick={() => setIsPlaying(!isPlaying)}
              className="rounded-xl gap-2 bg-gradient-to-r from-purple-600 to-violet-600"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              {isPlaying ? 'Pause' : 'Resume'}
            </Button>
            <Button
              onClick={resetSession}
              variant="outline"
              className="rounded-xl gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              End Session
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {sessions.map((session) => (
            <Card key={session.id} className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
                    {session.title}
                  </h3>
                  <p className="text-xs text-purple-600 dark:text-purple-400 font-medium">
                    {session.duration} • {session.type}
                  </p>
                </div>
              </div>
              
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                {session.description}
              </p>

              <Button
                onClick={() => startSession(session)}
                className="w-full rounded-xl gap-2 bg-gradient-to-r from-purple-600 to-violet-600"
              >
                <Play className="w-4 h-4" />
                Start Session
              </Button>
            </Card>
          ))}
        </div>
      )}

      <Card className="p-6 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 border-emerald-200 dark:border-emerald-800">
        <h3 className="font-semibold text-slate-900 dark:text-white mb-3">
          🧘 Mindfulness Best Practices
        </h3>
        <ul className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
          <li className="flex items-start gap-2">
            <span className="text-emerald-500 mt-1">•</span>
            Find a quiet, comfortable space where you won't be interrupted
          </li>
          <li className="flex items-start gap-2">
            <span className="text-emerald-500 mt-1">•</span>
            Practice at the same time each day to build a consistent habit
          </li>
          <li className="flex items-start gap-2">
            <span className="text-emerald-500 mt-1">•</span>
            Start with shorter sessions (5-7 min) and gradually increase duration
          </li>
          <li className="flex items-start gap-2">
            <span className="text-emerald-500 mt-1">•</span>
            Be patient with yourself - mindfulness is a skill that develops over time
          </li>
        </ul>
      </Card>
    </div>
  );
}