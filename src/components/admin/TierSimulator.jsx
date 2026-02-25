import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Crown, Eye, EyeOff, AlertCircle } from "lucide-react";
import { toast } from "sonner";

export default function TierSimulator() {
  const [simulating, setSimulating] = useState(false);
  const [simulatedTier, setSimulatedTier] = useState(null);

  useEffect(() => {
    // Load from localStorage on mount
    const saved = localStorage.getItem("adminTierSimulation");
    if (saved) {
      setSimulating(true);
      setSimulatedTier(saved);
    }
  }, []);

  const startSimulation = (tier) => {
    localStorage.setItem("adminTierSimulation", tier);
    setSimulating(true);
    setSimulatedTier(tier);
    toast.success(`Simulating ${tier} tier - Your actual Admin access unchanged`);
    // Reload to apply changes
    window.location.reload();
  };

  const stopSimulation = () => {
    localStorage.removeItem("adminTierSimulation");
    setSimulating(false);
    setSimulatedTier(null);
    toast.info("Back to Admin access");
    window.location.reload();
  };

  // Auto-clear on logout
  useEffect(() => {
    const handleBeforeUnload = () => {
      // Clear simulation on navigation away
      const saved = localStorage.getItem("adminTierSimulation");
      if (saved) {
        console.log("Tier simulation persisted across page refresh");
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

  return (
    <div className="bg-white dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700/50 p-6">
      <div className="flex items-center gap-2 mb-4">
        <Eye className="w-5 h-5 text-violet-600" />
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Tier Simulator</h3>
      </div>
      <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
        Test user experience at different subscription tiers. Your actual access remains unchanged.
      </p>

      {simulating && (
        <div className="mb-4 p-3 rounded-xl bg-violet-50 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-800">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-violet-600 dark:text-violet-400 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-violet-900 dark:text-violet-100">
                Currently simulating: {simulatedTier} tier
              </p>
              <p className="text-xs text-violet-700 dark:text-violet-300 mt-1">
                This only affects your view. Click "Stop Simulation" to return to normal.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {!simulating ? (
          <>
            <Button
              onClick={() => startSimulation("Free")}
              variant="outline"
              className="w-full justify-start gap-2 rounded-xl"
            >
              <div className="w-2 h-2 rounded-full bg-slate-400" />
              Simulate Free Tier (3-5 daily chat limit)
            </Button>
            <Button
              onClick={() => startSimulation("Standard")}
              variant="outline"
              className="w-full justify-start gap-2 rounded-xl"
            >
              <div className="w-2 h-2 rounded-full bg-blue-500" />
              Simulate Standard Tier ($9.99/mo)
            </Button>
            <Button
              onClick={() => startSimulation("Premium")}
              variant="outline"
              className="w-full justify-start gap-2 rounded-xl"
            >
              <Crown className="w-4 h-4 text-amber-500" />
              Simulate Premium Tier ($29.99/mo)
            </Button>
          </>
        ) : (
          <Button
            onClick={stopSimulation}
            className="w-full rounded-xl bg-violet-600 hover:bg-violet-700 gap-2"
          >
            <EyeOff className="w-4 h-4" />
            Stop Simulation
          </Button>
        )}
      </div>
    </div>
  );
}