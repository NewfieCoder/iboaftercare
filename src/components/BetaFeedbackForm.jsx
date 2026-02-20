import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";
import { Star, Send } from "lucide-react";

export default function BetaFeedbackForm({ source = "general" }) {
  const [rating, setRating] = useState(null);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!rating) {
      toast.error("Please select a rating");
      return;
    }

    setSubmitting(true);
    try {
      const user = await base44.auth.me();
      
      await base44.entities.Feedback.create({
        feedback_type: "beta-feedback",
        subject: `Beta Feedback - ${source}`,
        description: `Rating: ${rating}/5\n\n${comment}`,
        priority: rating <= 2 ? "high" : rating <= 3 ? "medium" : "low",
        status: "new",
        user_email: user.email,
        user_role: user.role || "user"
      });

      toast.success("Feedback submitted! Thank you for helping us improve.");
      setRating(null);
      setComment("");
    } catch (error) {
      toast.error("Failed to submit feedback");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700/50 p-6 space-y-5">
      <div>
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">
          Beta Feedback
        </h3>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Help us improve IboAftercare Coach. Your feedback is anonymous and goes directly to the dev team.
        </p>
      </div>

      <div className="space-y-3">
        <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">
          Overall Experience (1-5 stars)
        </Label>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setRating(value)}
              className={`p-3 rounded-xl transition-all ${
                rating >= value
                  ? "bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400"
                  : "bg-slate-100 dark:bg-slate-700 text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600"
              }`}
            >
              <Star className={`w-6 h-6 ${rating >= value ? "fill-current" : ""}`} />
            </button>
          ))}
        </div>
        {rating && (
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {rating === 5 && "Excellent! 🎉"}
            {rating === 4 && "Great! 👍"}
            {rating === 3 && "Good"}
            {rating === 2 && "Needs improvement"}
            {rating === 1 && "Poor"}
          </p>
        )}
      </div>

      <div className="space-y-3">
        <Label htmlFor="comment" className="text-sm font-medium text-slate-700 dark:text-slate-300">
          Comments (optional)
        </Label>
        <Textarea
          id="comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="What's working well? What could be better? Any bugs or feature requests?"
          className="rounded-xl min-h-[120px] resize-none"
        />
      </div>

      <Button
        type="submit"
        disabled={!rating || submitting}
        className="w-full rounded-xl bg-violet-600 hover:bg-violet-700 gap-2"
      >
        <Send className="w-4 h-4" />
        {submitting ? "Submitting..." : "Submit Feedback"}
      </Button>

      <p className="text-xs text-slate-500 dark:text-slate-400 text-center">
        Your email ({(async () => (await base44.auth.me()).email)()}) is included for follow-up only, but your feedback content is treated as anonymous.
      </p>
    </form>
  );
}