import { useNavigate } from "react-router-dom";
import { createPageUrl } from "../utils";
import { Button } from "@/components/ui/button";
import { Crown, Sparkles, Zap } from "lucide-react";
import { motion } from "framer-motion";

export default function PremiumPrompt({ feature, requiredTier = "standard" }) {
  const navigate = useNavigate();

  const tierInfo = {
    standard: {
      name: "Standard",
      price: "$9.99/mo",
      icon: Zap,
      color: "from-blue-500 to-indigo-600",
    },
    premium: {
      name: "Premium",
      price: "$19.99/mo",
      icon: Crown,
      color: "from-violet-500 to-purple-600",
    }
  };

  const tier = tierInfo[requiredTier];
  const Icon = tier.icon;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="glass rounded-3xl p-8 border border-white/30 dark:border-white/10 shadow-2xl max-w-md mx-auto text-center"
      style={{ boxShadow: '0 0 40px rgba(16, 185, 129, 0.15)' }}
    >
      <div className={`w-20 h-20 rounded-3xl bg-gradient-to-br ${tier.color} flex items-center justify-center mx-auto mb-5`}>
        <Icon className="w-10 h-10 text-white" />
      </div>
      
      <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
        Unlock {feature}
      </h3>
      
      <p className="text-slate-600 dark:text-slate-400 mb-6">
        This feature is available on the <span className="font-semibold text-emerald-600 dark:text-emerald-400">{tier.name}</span> plan
      </p>

      <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20 rounded-2xl p-4 mb-6 border border-emerald-200 dark:border-emerald-800">
        <div className="flex items-baseline justify-center gap-1 mb-2">
          <span className="text-4xl font-bold text-emerald-600 dark:text-emerald-400">{tier.price}</span>
        </div>
        <p className="text-xs text-slate-600 dark:text-slate-400">Billed monthly • Cancel anytime</p>
      </div>

      <Button
        onClick={() => navigate(createPageUrl("ProfileSettings"))}
        className="w-full rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg hover:shadow-xl mb-3"
      >
        <Sparkles className="w-4 h-4 mr-2" />
        View Subscription Plans
      </Button>

      <button
        onClick={() => window.history.back()}
        className="text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
      >
        Go Back
      </button>
    </motion.div>
  );
}