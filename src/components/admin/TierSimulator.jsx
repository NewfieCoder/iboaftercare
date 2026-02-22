import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Crown, Eye, EyeOff, AlertCircle, Unlock } from "lucide-react";
import { toast } from "sonner";
import { base44 } from "@/api/base44Client";

export default function TierSimulator() {
  const [simulating, setSimulating] = useState(false);
  const [simulatedTier, setSimulatedTier] = useState(null);
  const [fullUnlock, setFullUnlock] = useState(false);

  useEffect(() => {
    // Load from localStorage on mount
    const saved = localStorage.getItem("adminTierSimulation");
    if (saved) {
      setSimulating(true);
      setSimulatedTier(saved);
    }
    
    const unlocked = localStorage.getItem("adminFullUnlock") === "true";
    setFullUnlock(unlocked);
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

  const toggleFullUnlock = async () => {
    const newState = !fullUnlock;
    localStorage.setItem("adminFullUnlock", newState.toString());
    setFullUnlock(newState);
    
    // Log activity
    try {
      const user = await base44.auth.me();
      await base44.entities.AdminActivityLog.create({
        admin_email: user?.email || "unknown",
        action_type: "settings_changed",
        details: `Admin Full Unlock ${newState ? "enabled" : "disabled"} for testing`
      });
    } catch (e) {
      console.error("Failed to log activity", e);
    }
    
    toast.success(newState ? "Full Unlock enabled - All premium features unlocked for testing" : "Full Unlock disabled");
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
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Eye className="w-5 h-5 text-violet-600" />
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Testing Tools</h3>
        </div>
      </div>
      <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
        Test premium features and different subscription tiers without payment.
      </p>

      {/* Full Unlock Toggle */}
      <div className="mb-6 p-4 rounded-xl bg-gradient-to-r from-violet-50 to-purple-50 dark:from-violet-950/20 dark:to-purple-950/20 border border-violet-200 dark:border-violet-800">
        <div className="flex items-start gap-3 mb-3">
          <Unlock className="w-5 h-5 text-violet-600 dark:text-violet-400 mt-0.5" />
          <div className="flex-1">
            <h4 className="text-sm font-semibold text-violet-900 dark:text-violet-100 mb-1">
              Full Unlock Mode
            </h4>
            <p className="text-xs text-violet-700 dark:text-violet-300 leading-relaxed">
              Instantly unlock all Standard & Premium features for free testing (unlimited chats, exclusive content, ad-free, priority AI). No payment required.
            </p>
          </div>
        </div>
        <Button
          onClick={toggleFullUnlock}
          className={`w-full rounded-xl gap-2 transition-all ${
            fullUnlock
              ? "bg-violet-600 hover:bg-violet-700"
              : "bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-900 dark:text-white"
          }`}
        >
          <Unlock className="w-4 h-4" />
          {fullUnlock ? "Full Unlock Active" : "Enable Full Unlock"}
        </Button>
      </div>

      {/* Tier Simulation */}
      <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
        <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-2">Tier Simulation</h4>
        <p className="text-xs text-slate-600 dark:text-slate-400 mb-3">
          Test specific tier restrictions (overrides Full Unlock while active).
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
                className="w-full justify-start gap-2 rounded-xl text-sm"
              >
                <div className="w-2 h-2 rounded-full bg-slate-400" />
                Simulate Free Tier
              </Button>
              <Button
                onClick={() => startSimulation("Standard")}
                variant="outline"
                className="w-full justify-start gap-2 rounded-xl text-sm"
              >
                <div className="w-2 h-2 rounded-full bg-blue-500" />
                Simulate Standard Tier
              </Button>
              <Button
                onClick={() => startSimulation("Premium")}
                variant="outline"
                className="w-full justify-start gap-2 rounded-xl text-sm"
              >
                <Crown className="w-4 h-4 text-amber-500" />
                Simulate Premium Tier
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
    </div>
  );
}