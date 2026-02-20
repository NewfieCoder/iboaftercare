import { AlertTriangle } from "lucide-react";

export default function DisclaimerBanner({ compact = false }) {
  if (compact) {
    return (
      <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl px-4 py-2.5 flex items-start gap-2">
        <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
        <p className="text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
          For informational support only. Not a substitute for professional medical or therapeutic advice.{" "}
          <span className="font-medium">Consult a licensed provider for health concerns.</span>
        </p>
      </div>
    );
  }

  return (
    <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
      <div className="flex items-start gap-3">
        <div className="p-2 bg-amber-100 dark:bg-amber-900/50 rounded-lg">
          <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
        </div>
        <div>
          <p className="text-sm text-amber-900 dark:text-amber-200 font-medium mb-1">Important Disclaimer</p>
          <p className="text-xs text-amber-700 dark:text-amber-400 leading-relaxed">
            This app is for informational and supportive purposes only. It is not a substitute for professional medical, therapeutic, or coaching advice. Consult a licensed healthcare provider for any health concerns. Ibogaine recovery should involve ongoing professional support.
          </p>
        </div>
      </div>
    </div>
  );
}