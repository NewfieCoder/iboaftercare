import { Phone, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CrisisRedirect({ onClose }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-2xl">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <Phone className="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
            You're Not Alone
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            If you're in crisis, please reach out to one of these professional resources right now.
          </p>
        </div>

        <div className="space-y-3 mb-6">
          <a href="tel:988" className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl hover:bg-red-100 dark:hover:bg-red-950/50 transition-colors">
            <div className="p-2 bg-red-100 dark:bg-red-900/50 rounded-lg">
              <Phone className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="font-semibold text-red-900 dark:text-red-200">988 Suicide & Crisis Lifeline</p>
              <p className="text-xs text-red-700 dark:text-red-400">Call or text 988 — 24/7 support</p>
            </div>
          </a>

          <a href="tel:18006624357" className="flex items-center gap-3 p-4 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-950/50 transition-colors">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
              <Phone className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="font-semibold text-blue-900 dark:text-blue-200">SAMHSA Helpline</p>
              <p className="text-xs text-blue-700 dark:text-blue-400">1-800-662-4357 — Free, 24/7</p>
            </div>
          </a>

          <a href="https://www.crisistextline.org" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-4 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-xl hover:bg-emerald-100 dark:hover:bg-emerald-950/50 transition-colors">
            <div className="p-2 bg-emerald-100 dark:bg-emerald-900/50 rounded-lg">
              <ExternalLink className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="font-semibold text-emerald-900 dark:text-emerald-200">Crisis Text Line</p>
              <p className="text-xs text-emerald-700 dark:text-emerald-400">Text HOME to 741741</p>
            </div>
          </a>
        </div>

        <Button onClick={onClose} variant="outline" className="w-full">
          Close
        </Button>
      </div>
    </div>
  );
}