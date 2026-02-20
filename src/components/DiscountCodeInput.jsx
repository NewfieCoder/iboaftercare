import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tag, Loader2, CheckCircle, XCircle } from "lucide-react";
import { toast } from "sonner";

export default function DiscountCodeInput({ onSuccess }) {
  const [code, setCode] = useState("");
  const [checking, setChecking] = useState(false);
  const [result, setResult] = useState(null);

  async function applyCode() {
    if (!code.trim()) return;
    setChecking(true);
    setResult(null);

    try {
      // Find discount code
      const codes = await base44.entities.DiscountCode.filter({ 
        code: code.toUpperCase(),
        active: true
      });

      if (codes.length === 0) {
        setResult({ success: false, message: "Invalid code" });
        toast.error("Invalid discount code");
        setChecking(false);
        return;
      }

      const discount = codes[0];

      // Check expiration
      if (discount.expires_at && new Date(discount.expires_at) < new Date()) {
        setResult({ success: false, message: "Code expired" });
        toast.error("This code has expired");
        setChecking(false);
        return;
      }

      // Check usage limit
      if (discount.usage_limit > 0 && discount.usage_count >= discount.usage_limit) {
        setResult({ success: false, message: "Code fully used" });
        toast.error("This code has reached its usage limit");
        setChecking(false);
        return;
      }

      // Success!
      setResult({ 
        success: true, 
        message: `${discount.discount_percent}% off applied!`,
        discount: discount.discount_percent
      });
      toast.success(`${discount.discount_percent}% discount applied!`);

      // Increment usage count
      await base44.entities.DiscountCode.update(discount.id, {
        usage_count: discount.usage_count + 1
      });

      if (onSuccess) onSuccess(discount);
    } catch (e) {
      toast.error("Error checking code");
      setResult({ success: false, message: "Error" });
    }
    setChecking(false);
  }

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Enter discount code"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            onKeyDown={(e) => e.key === "Enter" && applyCode()}
            className="pl-9 rounded-xl"
            disabled={checking}
          />
        </div>
        <Button 
          onClick={applyCode} 
          disabled={!code.trim() || checking}
          className="rounded-xl"
        >
          {checking ? <Loader2 className="w-4 h-4 animate-spin" /> : "Apply"}
        </Button>
      </div>

      {result && (
        <div className={`flex items-center gap-2 p-3 rounded-xl text-sm ${
          result.success 
            ? "bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800"
            : "bg-rose-50 dark:bg-rose-950/20 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800"
        }`}>
          {result.success ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
          {result.message}
        </div>
      )}
    </div>
  );
}