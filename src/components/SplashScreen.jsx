import { useEffect, useState } from "react";
import Logo from "@/components/Logo";
import { AlertTriangle } from "lucide-react";

export default function SplashScreen({ onComplete }) {
  const [show, setShow] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShow(false);
      onComplete?.();
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-gradient-to-br from-teal-50 via-emerald-50 to-cyan-50 dark:from-slate-950 dark:via-teal-950 dark:to-emerald-950">
      <div className="text-center px-6 animate-fadeIn">
        <div className="mb-6 flex justify-center">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-teal-400 to-emerald-600 rounded-3xl blur-2xl opacity-30 animate-pulse" />
            <div className="relative bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl p-6 shadow-2xl">
              <Logo variant="icon" className="w-20 h-20" />
            </div>
          </div>
        </div>
        
        <h1 className="text-3xl font-bold bg-gradient-to-r from-teal-600 to-emerald-600 bg-clip-text text-transparent mb-2">
          IboAftercare Coach
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-8">
          Your AI companion for Ibogaine integration
        </p>

        {/* Disclaimer overlay */}
        <div className="max-w-md mx-auto bg-white/60 dark:bg-slate-900/60 backdrop-blur-md rounded-2xl border border-amber-200 dark:border-amber-900/50 p-4">
          <div className="flex items-start gap-3 text-left">
            <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-medium text-amber-900 dark:text-amber-200 mb-1">
                Important Notice
              </p>
              <p className="text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
                This app provides supportive information only. Not a substitute for professional medical care. 
                Always consult qualified healthcare providers.
              </p>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.8s ease-out forwards;
        }
      `}</style>
    </div>
  );
}