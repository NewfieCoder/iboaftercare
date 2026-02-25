import { useState } from "react";
import { Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import DiscountCodeInput from "./DiscountCodeInput";

export default function PremiumUpsell({ onClose, feature = "this feature" }) {
  const [discount, setDiscount] = useState(null);
  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-8 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
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

        <div className="text-center mb-6">
          {discount ? (
            <>
              <div className="flex items-center justify-center gap-2 mb-1">
                <p className="text-xl font-bold text-slate-400 dark:text-slate-500 line-through">$9.99</p>
                <p className="text-3xl font-bold text-teal-600 dark:text-teal-400">
                  ${(9.99 * (1 - discount.discount_percent / 100)).toFixed(2)}
                </p>
              </div>
              <p className="text-sm text-teal-700 dark:text-teal-400 font-medium mb-1">
                {discount.discount_percent}% off applied!
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">per month • Cancel anytime</p>
            </>
          ) : (
            <>
              <p className="text-3xl font-bold text-slate-900 dark:text-white">
                $9.99<span className="text-lg font-normal text-slate-500 dark:text-slate-400">/month</span>
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Cancel anytime</p>
            </>
          )}
        </div>

        <div className="mb-4">
          <DiscountCodeInput onSuccess={(code) => setDiscount(code)} />
        </div>

        <Button className="w-full rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-semibold py-6">
          Upgrade Now
        </Button>
        <p className="text-xs text-center text-slate-500 dark:text-slate-400 mt-4">
          7-day free trial • No credit card required
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