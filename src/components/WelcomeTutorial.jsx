import { useState } from "react";
import { Button } from "@/components/ui/button";
import { MessageCircle, TrendingUp, BookOpen, X, ChevronRight } from "lucide-react";

const steps = [
  {
    icon: MessageCircle,
    title: "Chat with IboGuide",
    description: "Your AI coach is available 24/7 for support, guidance, and evidence-based recovery strategies.",
    color: "from-teal-500 to-emerald-600"
  },
  {
    icon: TrendingUp,
    title: "Track Your Progress",
    description: "Log moods, habits, and journal entries to visualize your recovery journey over time.",
    color: "from-blue-500 to-violet-600"
  },
  {
    icon: BookOpen,
    title: "Access Resources",
    description: "Curated content from SAMHSA, research studies, and integration best practices.",
    color: "from-amber-500 to-orange-600"
  }
];

export default function WelcomeTutorial({ onComplete }) {
  const [currentStep, setCurrentStep] = useState(0);

  const next = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const step = steps[currentStep];
  const Icon = step.icon;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-8 relative">
        <button onClick={onComplete} className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800">
          <X className="w-5 h-5" />
        </button>

        <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center mb-6 mx-auto`}>
          <Icon className="w-10 h-10 text-white" />
        </div>

        <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3 text-center">
          {step.title}
        </h3>
        <p className="text-slate-600 dark:text-slate-400 text-center leading-relaxed mb-8">
          {step.description}
        </p>

        <div className="flex gap-1 justify-center mb-6">
          {steps.map((_, i) => (
            <div key={i} className={`h-1.5 rounded-full transition-all ${
              i === currentStep ? "w-8 bg-teal-500" : "w-1.5 bg-slate-200 dark:bg-slate-700"
            }`} />
          ))}
        </div>

        <Button onClick={next} className="w-full rounded-xl bg-teal-600 hover:bg-teal-700 text-white gap-2">
          {currentStep < steps.length - 1 ? (
            <>Next <ChevronRight className="w-4 h-4" /></>
          ) : (
            "Get Started"
          )}
        </Button>
      </div>
    </div>
  );
}