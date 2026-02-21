import { useState } from "react";
import { Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import DiscountCodeInput from "./DiscountCodeInput";
import { base44 } from "@/api/base44Client";

export default function PremiumUpsell({ onClose, feature = "this feature" }) {
  const [discount, setDiscount] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleUpgrade = async (tier) => {
    if (window.self !== window.top) {
      alert('Checkout must be completed in the published app. Please open the app in a new tab to subscribe.');
      return;
    }

    setLoading(true);
    try {
      const response = await base44.functions.invoke('createCheckoutSession', { tier });
      
      if (response.data.url) {
        window.location.href = response.data.url;
      }
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Unable to start checkout. Please try again.');
      setLoading(false);
    }
  };
  return (
    <div 
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div 
        className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 sm:p-8 relative my-8 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="sticky top-0 float-right p-2 rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 z-10 bg-white dark:bg-slate-900"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center mb-6 mx-auto">
          <Sparkles className="w-10 h-10 text-white" />
        </div>

        <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3 text-center">
          Upgrade to Premium
        </h3>
        <p className="text-slate-600 dark:text-slate-400 text-center leading-relaxed mb-6">
          Unlock unlimited access to {feature} and more with IboAftercare Premium.
        </p>

        <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-5 mb-6 space-y-3">
          <PremiumFeature text="Unlimited AI coach conversations" />
          <PremiumFeature text="Advanced progress analytics" />
          <PremiumFeature text="Premium wellness content" />
          <PremiumFeature text="Ad-free experience" />
          <PremiumFeature text="Priority support" />
        </div>

        <div className="mb-4">
          <DiscountCodeInput onSuccess={(code) => setDiscount(code)} />
        </div>

        <div className="space-y-3">
          <div className="text-center">
            <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">Premium Plan</p>
            {discount ? (
              <>
                <div className="flex items-center justify-center gap-2 mb-1">
                  <p className="text-xl font-bold text-slate-400 dark:text-slate-500 line-through">$29.99</p>
                  <p className="text-3xl font-bold text-teal-600 dark:text-teal-400">
                    ${(29.99 * (1 - discount.discount_percent / 100)).toFixed(2)}
                  </p>
                </div>
                <p className="text-sm text-teal-700 dark:text-teal-400 font-medium">
                  {discount.discount_percent}% off applied!
                </p>
              </>
            ) : (
              <p className="text-3xl font-bold text-slate-900 dark:text-white">
                $29.99<span className="text-lg font-normal text-slate-500 dark:text-slate-400">/month</span>
              </p>
            )}
          </div>

          <Button 
            onClick={() => handleUpgrade('premium')}
            disabled={loading}
            className="w-full rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white font-semibold py-6"
          >
            {loading ? 'Opening Checkout...' : 'Upgrade to Premium'}
          </Button>

          <div className="text-center">
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">or</p>
            <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">Standard Plan</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white mb-3">
              $9.99<span className="text-base font-normal text-slate-500 dark:text-slate-400">/month</span>
            </p>
          </div>

          <Button 
            onClick={() => handleUpgrade('standard')}
            disabled={loading}
            variant="outline"
            className="w-full rounded-xl font-semibold py-4"
          >
            {loading ? 'Opening Checkout...' : 'Upgrade to Standard'}
          </Button>
        </div>

        <p className="text-xs text-center text-slate-500 dark:text-slate-400 mt-4">
          Cancel anytime • Secure payment via Stripe
        </p>
      </div>
    </div>
  );
}

function PremiumFeature({ text }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-5 h-5 rounded-full bg-gradient-to-br from-teal-400 to-emerald-600 flex items-center justify-center shrink-0">
        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <p className="text-sm text-slate-700 dark:text-slate-300">{text}</p>
    </div>
  );
}