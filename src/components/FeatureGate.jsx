import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Crown, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "../utils";

/**
 * FeatureGate: Unified premium feature checker
 * Handles: paid subscriptions, Tester role, Admin role, Full Unlock mode
 */
export default function FeatureGate({ 
  requiredTier = "standard", // "standard" or "premium"
  children, 
  showUpgrade = true,
  fallback = null 
}) {
  const [hasAccess, setHasAccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userTier, setUserTier] = useState("free");
  const navigate = useNavigate();

  useEffect(() => {
    checkAccess();
  }, []);

  async function checkAccess() {
    try {
      const user = await base44.auth.me();
      
      // ADMIN & TESTER = ALWAYS FULL ACCESS
      if (user?.role === 'admin' || user?.role === 'tester') {
        setHasAccess(true);
        setUserTier('premium');
        setLoading(false);
        return;
      }

      // ADMIN FULL UNLOCK MODE
      const fullUnlock = localStorage.getItem("adminFullUnlock") === "true";
      if (fullUnlock) {
        setHasAccess(true);
        setUserTier('premium');
        setLoading(false);
        return;
      }

      // TIER SIMULATION (for testing)
      const simulated = localStorage.getItem("adminTierSimulation");
      if (simulated) {
        const tier = simulated.toLowerCase();
        setUserTier(tier);
        setHasAccess(
          tier === 'premium' || 
          (tier === 'standard' && requiredTier !== 'premium')
        );
        setLoading(false);
        return;
      }

      // CHECK PAID SUBSCRIPTION
      const profiles = await base44.entities.UserProfile.list();
      if (profiles.length > 0) {
        const profile = profiles[0];
        const isPremium = profile.premium && profile.subscription_status === 'active';
        const tier = profile.premium_tier || 'free';
        
        setUserTier(tier);
        setHasAccess(
          isPremium && (
            tier === 'premium' || 
            (tier === 'standard' && requiredTier !== 'premium')
          )
        );
      }
      
      setLoading(false);
    } catch (e) {
      console.error('Feature gate error:', e);
      setLoading(false);
    }
  }

  if (loading) {
    return <div className="animate-pulse bg-slate-200 dark:bg-slate-700 rounded-xl h-32" />;
  }

  if (hasAccess) {
    return <>{children}</>;
  }

  // LOCKED - SHOW UPGRADE PROMPT
  if (showUpgrade) {
    return (
      <div className="bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-950/20 dark:to-purple-950/20 rounded-2xl border border-violet-200 dark:border-violet-800 p-6 text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-violet-100 dark:bg-violet-900/50 mb-3">
          <Crown className="w-6 h-6 text-violet-600 dark:text-violet-400" />
        </div>
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
          {requiredTier === 'premium' ? 'Premium' : 'Standard'} Feature
        </h3>
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
          Unlock this feature with {requiredTier === 'premium' ? 'Premium' : 'Standard or Premium'} access.
        </p>
        <Button 
          onClick={() => navigate(createPageUrl("ProfileSettings"))}
          className="rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700"
        >
          <Crown className="w-4 h-4 mr-2" />
          Upgrade Now
        </Button>
      </div>
    );
  }

  return fallback || null;
}