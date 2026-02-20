import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Play, Pause, SkipForward, CheckCircle2, X } from "lucide-react";

const sessions = {
  mindfulness: {
    title: "5-Minute Mindfulness",
    duration: "5 min",
    steps: [
      "Find a comfortable seated position. Close your eyes or soften your gaze.",
      "Take 3 deep breaths. Inhale through your nose for 4 counts, hold for 4, exhale for 6.",
      "Notice your body. Scan from head to toe, releasing any tension you find.",
      "Bring awareness to your thoughts. Observe them without judgment, like clouds passing.",
      "If your mind wanders, gently return to your breath. This is normal and part of the practice.",
      "Take one final deep breath. Slowly open your eyes. Notice how you feel."
    ]
  },
  breathing: {
    title: "Box Breathing for Cravings",
    duration: "3 min",
    steps: [
      "Sit comfortably with your feet flat on the floor. Place one hand on your chest, one on your belly.",
      "Inhale slowly through your nose for 4 counts. Feel your belly expand.",
      "Hold your breath for 4 counts. Stay relaxed.",
      "Exhale slowly through your mouth for 4 counts. Release all tension.",
      "Hold empty for 4 counts. Feel grounded.",
      "Repeat this cycle 5 times. Notice the craving's intensity decrease with each round."
    ]
  },
  gratitude: {
    title: "Gratitude Practice",
    duration: "4 min",
    steps: [
      "Take a moment to settle in. Close your eyes and take 2 deep breaths.",
      "Reflect on one thing from today that brought you peace or joy, no matter how small.",
      "Think of someone who has supported your recovery journey. Hold gratitude for them.",
      "Consider one aspect of your body or mind that's healing. Thank it for its resilience.",
      "Recall a moment from your Ibogaine experience that felt meaningful. Honor that insight.",
      "Open your eyes. Carry this gratitude with you into the rest of your day."
    ]
  }
};

export default function GuidedSession({ sessionType, onClose }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const session = sessions[sessionType];

  if (!session) return null;

  const isComplete = currentStep >= session.steps.length;

  const next = () => {
    if (currentStep < session.steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-8 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center mx-auto mb-4">
            <Play className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
            {session.title}
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">{session.duration}</p>
        </div>

        {!isComplete ? (
          <>
            {/* Progress */}
            <div className="mb-6">
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-2">
                <span>Step {currentStep + 1} of {session.steps.length}</span>
                <span>{Math.round(((currentStep + 1) / session.steps.length) * 100)}%</span>
              </div>
              <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-teal-500 to-emerald-600 transition-all duration-300"
                  style={{ width: `${((currentStep + 1) / session.steps.length) * 100}%` }}
                />
              </div>
            </div>

            {/* Current Step */}
            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-6 mb-6 min-h-[150px] flex items-center justify-center">
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-center">
                {session.steps[currentStep]}
              </p>
            </div>

            {/* Controls */}
            <div className="flex gap-3">
              <Button
                onClick={next}
                className="flex-1 rounded-xl bg-teal-600 hover:bg-teal-700 gap-2 py-6"
              >
                {currentStep < session.steps.length - 1 ? (
                  <>Next <SkipForward className="w-4 h-4" /></>
                ) : (
                  <>Complete <CheckCircle2 className="w-4 h-4" /></>
                )}
              </Button>
            </div>
          </>
        ) : (
          <div className="text-center py-8">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-10 h-10 text-white" />
            </div>
            <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
              Session Complete
            </h4>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
              Great work! You've completed this guided practice.
            </p>
            <Button
              onClick={onClose}
              className="rounded-xl bg-teal-600 hover:bg-teal-700"
            >
              Return to Chat
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}