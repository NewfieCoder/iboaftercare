import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Check, Sparkles, Zap, Crown, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

const plans = [
  {
    id: "free",
    name: "Free",
    price: "$0",
    icon: Sparkles,
    color: "from-slate-400 to-slate-600",
    features: [
      "Basic mood & habit tracking",
      "Daily wellness tips",
      "Community forum access",
      "Integration calendar",
      "Crisis resources"
    ]
  },
  {
    id: "standard",
    name: "Standard",
    price: "$9.99",
    icon: Zap,
    color: "from-blue-500 to-indigo-600",
    priceId: "price_1T34haI3sJmiH8svL93agDRB",
    popular: true,
    features: [
      "Everything in Free",
      "AI IboGuide coach (50 msgs/mo)",
      "Advanced progress analytics",
      "Wellness planner",
      "Export your data",
      "Priority support"
    ]
  },
  {
    id: "premium",
    name: "Premium",
    price: "$19.99",
    icon: Crown,
    color: "from-violet-500 to-purple-600",
    priceId: "price_1T34hbI3sJmiH8svbD40XbzN",
    features: [
      "Everything in Standard",
      "Unlimited AI coach messages",
      "Full study library access",
      "Personalized wellness plans",
      "1-on-1 integration support",
      "Beta feature access"
    ]
  }
];

export default function SubscriptionPlans({ currentTier, onSuccess }) {
  const [loading, setLoading] = useState(null);

  async function handleSubscribe(tier) {
    // Check if running in iframe
    if (window.self !== window.top) {
      alert('Checkout must be completed in the published app. Please open the app in a new tab to subscribe.');
      return;
    }

    setLoading(tier);
    try {
      const response = await base44.functions.invoke('createCheckoutSession', { tier });
      
      if (response.data.url) {
        window.location.href = response.data.url;
      }
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Unable to start checkout. Please try again.');
      setLoading(null);
    }
  }

  return (
    <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
      {plans.map((plan, idx) => {
        const Icon = plan.icon;
        const isCurrent = currentTier === plan.id;
        const canUpgrade = plan.id !== 'free' && !isCurrent;

        return (
          <motion.div
            key={plan.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className={`glass rounded-3xl p-6 border relative overflow-hidden ${
              plan.popular 
                ? 'border-emerald-300 dark:border-emerald-700 shadow-xl' 
                : 'border-white/30 dark:border-white/10'
            }`}
            style={{
              boxShadow: plan.popular ? '0 0 30px rgba(16, 185, 129, 0.2)' : undefined
            }}
          >
            {plan.popular && (
              <div className="absolute top-0 right-0 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
                POPULAR
              </div>
            )}

            <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${plan.color} flex items-center justify-center mb-4`}>
              <Icon className="w-7 h-7 text-white" />
            </div>

            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
              {plan.name}
            </h3>
            <div className="flex items-baseline gap-1 mb-6">
              <span className="text-4xl font-bold text-emerald-600 dark:text-emerald-400">
                {plan.price}
              </span>
              {plan.price !== "$0" && (
                <span className="text-slate-500 dark:text-slate-400 text-sm">/month</span>
              )}
            </div>

            <ul className="space-y-3 mb-6">
              {plan.features.map((feature, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300">
                  <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  {feature}
                </li>
              ))}
            </ul>

            {isCurrent ? (
              <Button disabled className="w-full rounded-xl" variant="outline">
                Current Plan
              </Button>
            ) : canUpgrade ? (
              <Button
                onClick={() => handleSubscribe(plan.id)}
                disabled={loading !== null}
                className={`w-full rounded-xl bg-gradient-to-r ${plan.color} text-white shadow-lg hover:shadow-xl transition-all`}
              >
                {loading === plan.id ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  'Subscribe Now'
                )}
              </Button>
            ) : (
              <Button disabled className="w-full rounded-xl" variant="ghost">
                Free Forever
              </Button>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}