import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, Loader2, DollarSign, Percent, Calendar } from "lucide-react";
import { toast } from "sonner";

export default function MonetizationControls({ adminEmail }) {
  const [discounts, setDiscounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    code: "",
    discount_percent: "",
    expires_at: "",
    usage_limit: "",
    description: ""
  });

  useEffect(() => {
    loadDiscounts();
  }, []);

  async function loadDiscounts() {
    try {
      const { data } = await base44.functions.invoke('adminGetDiscounts');
      setDiscounts(data || []);
      setLoading(false);
    } catch (e) {
      toast.error("Failed to load discount codes");
      setLoading(false);
    }
  }

  async function createDiscount(e) {
    e.preventDefault();
    try {
      await base44.functions.invoke('adminManageDiscount', {
        action: 'create',
        discountData: {
          code: formData.code.toUpperCase(),
          discount_percent: parseFloat(formData.discount_percent),
          expires_at: formData.expires_at || null,
          usage_limit: parseInt(formData.usage_limit) || 0,
          description: formData.description,
          active: true,
          usage_count: 0
        }
      });

      toast.success("Discount code created");
      setShowForm(false);
      setFormData({ code: "", discount_percent: "", expires_at: "", usage_limit: "", description: "" });
      loadDiscounts();
    } catch (e) {
      toast.error("Failed to create discount code");
    }
  }

  async function deleteDiscount(id, code) {
    if (!confirm(`Delete discount code "${code}"?`)) return;
    try {
      await base44.functions.invoke('adminManageDiscount', {
        action: 'delete',
        discountId: id
      });
      toast.success("Discount code deleted");
      loadDiscounts();
    } catch (e) {
      toast.error("Failed to delete discount code");
    }
  }

  async function toggleActive(id, currentStatus) {
    try {
      await base44.functions.invoke('adminManageDiscount', {
        action: 'update',
        discountId: id,
        discountData: { active: !currentStatus }
      });
      toast.success(currentStatus ? "Code deactivated" : "Code activated");
      loadDiscounts();
    } catch (e) {
      toast.error("Failed to update code");
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 text-teal-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Monetization</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manage pricing, discount codes, and promotions
          </p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} className="rounded-xl gap-2">
          <Plus className="w-4 h-4" />
          New Discount Code
        </Button>
      </div>

      {/* Create Form */}
      {showForm && (
        <form onSubmit={createDiscount} className="bg-white dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700/50 p-6">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
            Create Discount Code
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="code">Code</Label>
              <Input
                id="code"
                placeholder="IBO2026"
                value={formData.code}
                onChange={(e) => setFormData({...formData, code: e.target.value})}
                required
                className="rounded-xl"
              />
            </div>
            <div>
              <Label htmlFor="discount">Discount %</Label>
              <Input
                id="discount"
                type="number"
                min="0"
                max="100"
                placeholder="20"
                value={formData.discount_percent}
                onChange={(e) => setFormData({...formData, discount_percent: e.target.value})}
                required
                className="rounded-xl"
              />
            </div>
            <div>
              <Label htmlFor="expires">Expires At (optional)</Label>
              <Input
                id="expires"
                type="datetime-local"
                value={formData.expires_at}
                onChange={(e) => setFormData({...formData, expires_at: e.target.value})}
                className="rounded-xl"
              />
            </div>
            <div>
              <Label htmlFor="limit">Usage Limit (0 = unlimited)</Label>
              <Input
                id="limit"
                type="number"
                min="0"
                placeholder="0"
                value={formData.usage_limit}
                onChange={(e) => setFormData({...formData, usage_limit: e.target.value})}
                className="rounded-xl"
              />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="description">Internal Note</Label>
              <Input
                id="description"
                placeholder="Holiday promo 2026"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="rounded-xl"
              />
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <Button type="submit" className="rounded-xl">Create Code</Button>
            <Button type="button" variant="outline" onClick={() => setShowForm(false)} className="rounded-xl">
              Cancel
            </Button>
          </div>
        </form>
      )}

      {/* Discount Codes List */}
      <div className="bg-white dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700/50 overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-slate-700">
          <h3 className="font-semibold text-slate-900 dark:text-white">Active Discount Codes</h3>
        </div>
        <div className="divide-y divide-slate-200 dark:divide-slate-700">
          {discounts.length === 0 ? (
            <div className="p-8 text-center text-slate-500 dark:text-slate-400">
              No discount codes yet. Create one to get started.
            </div>
          ) : (
            discounts.map(code => (
              <div key={code.id} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-900/30">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-mono text-lg font-bold text-teal-600 dark:text-teal-400">
                        {code.code}
                      </span>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400">
                        <Percent className="w-3 h-3" />
                        {code.discount_percent}% OFF
                      </span>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        code.active
                          ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400"
                          : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400"
                      }`}>
                        {code.active ? "Active" : "Inactive"}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                      {code.description && <span>{code.description}</span>}
                      {code.expires_at && (
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          Expires: {new Date(code.expires_at).toLocaleDateString()}
                        </span>
                      )}
                      <span>Used: {code.usage_count}/{code.usage_limit === 0 ? '∞' : code.usage_limit}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => toggleActive(code.id, code.active)}
                      className="rounded-lg"
                    >
                      {code.active ? "Deactivate" : "Activate"}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => deleteDiscount(code.id, code.code)}
                      className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Pricing Info */}
      <div className="bg-gradient-to-br from-teal-50 to-emerald-50 dark:from-teal-950/20 dark:to-emerald-950/20 rounded-2xl border border-teal-200 dark:border-teal-800 p-6">
        <div className="flex items-center gap-3 mb-4">
          <DollarSign className="w-6 h-6 text-teal-600 dark:text-teal-400" />
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Premium Pricing</h3>
        </div>
        <p className="text-sm text-slate-700 dark:text-slate-300 mb-4">
          Current premium tier: <strong>$9.99/month</strong>
        </p>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Note: Pricing changes require code updates. Use discount codes for promotions.
        </p>
      </div>
    </div>
  );
}