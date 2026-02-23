import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Check, Sparkles, Zap, Crown, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

const plans = [
  {
    id: "free",
    name: "Free",
    monthlyPrice: "$0",
    annualPrice: "$0",
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
    monthlyPrice: "$9.99",
    annualPrice: "$109.89",
    annualSavings: "$9.99",
    icon: Zap,
    color: "from-blue-500 to-indigo-600",
    monthlyPriceId: "price_1T35QJIca4bvjpuWlT5QG642",
    annualPriceId: "price_1T36kfIca4bvjpuWRlXZBE6f",
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
    monthlyPrice: "$29.99", // FIXED: Correct price
    annualPrice: "$329.89", // Adjust if your annual is different
    annualSavings: "$29.99",
    icon: Crown,
    color: "from-violet-500 to-purple-600",
    monthlyPriceId: "price_1T35QLIca4bvjpuWqNKqfMcK", // VERIFY this ID is $29.99 in Stripe
    annualPriceId: "price_1T36kfIca4bvjpuWJIwv695y",
    features: [
      "Everything in Standard",
      "Unlimited AI coach messages",
      "Full study library access",
      "Personalized wellness plans",
      "Milestone challenges & badges",
      "VR/AR mindfulness guides",
      "12-step recovery connector",
      "Priority AI responses"
    ]
  }
];

export default function SubscriptionPlans({ currentTier, onSuccess }) {
  const [loading, setLoading] = useState(null);
  const [billingCycle, setBillingCycle] = useState('monthly');

  // Handle Stripe redirect and force refresh
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('success') === 'true') {
      const isPass = params.get('pass') === 'true'; // Optional: add ?pass=true in createCheckoutSession if needed
      alert(isPass 
        ? '🎉 7-day Premium access unlocked! All tools active — enjoy!' 
        : '🎉 Subscription activated! Your premium features are unlocked.');
      
      // Force parent refresh if onSuccess prop passed
      if (onSuccess) onSuccess();
      
      // Fallback: full reload to ensure UI syncs
      window.location.reload();
      
      window.history.replaceState({}, '', window.location.pathname);
    } else if (params.get('canceled') === 'true') {
      alert('Payment canceled. No charges made.');
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, [onSuccess]);

  async function handleSubscribe(tier, isAccessPass = false) {
    if (window.self !== window.top) {
      alert('Checkout must be completed in the published app. Open in new tab.');
      return;
    }

    const loadingKey = isAccessPass ? (tier === 'premium' ? 'premium-pass' : 'standard-pass') : tier;
    setLoading(loadingKey);

    try {
      const response = await base44.functions.invoke('createCheckoutSession', { 
        tier, 
        billing: billingCycle,
        accessPass: isAccessPass
      });
      
      if (response.data.url) {
        window.location.href = response.data.url;
      }
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Unable to start checkout. Please try again.');
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="max-w-5xl mx-auto">
      {/* Billing Toggle */}
      <div className="flex justify-center mb-8">
        <div className="inline-flex gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
          <button
            onClick={() => setBillingCycle('monthly')}
            className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${
              billingCycle === 'monthly'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setBillingCycle('annual')}
            className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${
              billingCycle === 'annual'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Annual <span className="text-emerald-600 dark:text-emerald-400 text-xs ml-1">Save 8%</span>
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
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
              <div className="mb-6">
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-emerald-600 dark:text-emerald-400">
                    {billingCycle === 'monthly' ? plan.monthlyPrice : plan.annualPrice}
                  </span>
                  {plan.monthlyPrice !== "$0" && (
                    <span className="text-slate-500 dark:text-slate-400 text-sm">
                      /{billingCycle === 'monthly' ? 'month' : 'year'}
                    </span>
                  )}
                </div>
                {billingCycle === 'annual' && plan.annualSavings && (
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">
                    Save {plan.annualSavings}/year
                  </p>
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

      {/* Access Passes */}
      <div className="mt-8 grid md:grid-cols-2 gap-6">
        {/* 7-Day Standard Pass */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass rounded-3xl p-6 border border-amber-300 dark:border-amber-700 relative overflow-hidden"
          style={{ boxShadow: '0 0 30px rgba(251, 191, 36, 0.2)' }}
        >
          <div className="absolute top-0 right-0 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
            TRY IT OUT
          </div>
          
          <div className="flex flex-col gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shrink-0">
              <Zap className="w-7 h-7 text-white" />
            </div>
            
            <div className="flex-1">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1">
                7-Day Standard Pass
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                Try Standard features for 7 days
              </p>
              <ul className="space-y-1 text-xs text-slate-700 dark:text-slate-300">
                <li className="flex items-start gap-1">
                  <Check className="w-3 h-3 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                  AI coach (50 msgs)
                </li>
                <li className="flex items-start gap-1">
                  <Check className="w-3 h-3 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                  Progress analytics
                </li>
                <li className="flex items-start gap-1">
                  <Check className="w-3 h-3 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                  Wellness planner
                </li>
              </ul>
            </div>
            
            <div className="flex items-end justify-between">
              <div>
                <div className="text-3xl font-bold text-amber-600 dark:text-amber-400">
                  $5
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  One-time
                </p>
              </div>
              <Button
                onClick={() => handleSubscribe('standard', true)}
                disabled={loading !== null}
                className="rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-lg hover:shadow-xl transition-all"
              >
                {loading === 'standard-pass' ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  'Get Pass'
                )}
              </Button>
            </div>
          </div>
        </motion.div>

        {/* 7-Day Premium Pass */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="glass rounded-3xl p-6 border border-purple-300 dark:border-purple-700 relative overflow-hidden"
          style={{ boxShadow: '0 0 30px rgba(168, 85, 247, 0.2)' }}
        >
          <div className="absolute top-0 right-0 bg-gradient-to-r from-purple-500 to-violet-600 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
            PREMIUM TRIAL
          </div>
          
          <div className="flex flex-col gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center shrink-0">
              <Crown className="w-7 h-7 text-white" />
            </div>
            
            <div className="flex-1">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1">
                7-Day Premium Pass
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                Full Premium access for 7 days
              </p>
              <ul className="space-y-1 text-xs text-slate-700 dark:text-slate-300">
                <li className="flex items-start gap-1">
                  <Check className="w-3 h-3 text-purple-600 dark:text-purple-400 shrink-0 mt-0.5" />
                  Unlimited AI coach
                </li>
                <li className="flex items-start gap-1">
                  <Check className="w-3 h-3 text-purple-600 dark:text-purple-400 shrink-0 mt-0.5" />
                  Full study library
                </li>
                <li className="flex items-start gap-1">
                  <Check className="w-3 h-3 text-purple-600 dark:text-purple-400 shrink-0 mt-0.5" />
                  All premium tools
                </li>
              </ul>
            </div>
            
            <div className="flex items-end justify-between">
              <div>
                <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                  $10
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  One-time
                </p>
              </div>
              <Button
                onClick={() => handleSubscribe('premium', true)}
                disabled={loading !== null}
                className="rounded-xl bg-gradient-to-r from-purple-500 to-violet-600 text-white shadow-lg hover:shadow-xl transition-all"
              >
                {loading === 'premium-pass' ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  'Get Pass'
                )}
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}