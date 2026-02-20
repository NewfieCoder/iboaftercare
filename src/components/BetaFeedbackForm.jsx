import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MessageSquare, Star, Send, CheckCircle } from "lucide-react";
import { toast } from "sonner";

export default function BetaFeedbackForm({ user }) {
  const [feedbackType, setFeedbackType] = useState("general");
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [rating, setRating] = useState(3);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!description.trim()) {
      toast.error("Please provide feedback details");
      return;
    }

    setSubmitting(true);
    try {
      await base44.entities.Feedback.create({
        feedback_type: feedbackType,
        subject: subject || `${feedbackType} feedback`,
        description: description,
        priority: "medium",
        status: "new",
        user_email: user?.email || "anonymous",
        user_role: user?.role || "user",
        admin_notes: `Rating: ${rating}/5`
      });
      setSubmitted(true);
      toast.success("Thank you for your feedback!");
      // Reset form after 2 seconds
      setTimeout(() => {
        setSubmitted(false);
        setSubject("");
        setDescription("");
        setRating(3);
        setFeedbackType("general");
      }, 2000);
    } catch (e) {
      toast.error("Failed to submit feedback");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="bg-white dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700/50 p-8 text-center">
        <div className="w-16 h-16 bg-teal-100 dark:bg-teal-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-teal-600 dark:text-teal-400" />
        </div>
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Feedback Submitted!</h3>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Your input helps us improve IboAftercare Coach for everyone. Thank you! 🌿
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700/50 p-6">
      <div className="flex items-center gap-2 mb-4">
        <MessageSquare className="w-5 h-5 text-teal-600" />
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Beta Feedback</h3>
      </div>
      <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
        Help us improve by sharing your thoughts, bugs, or feature requests.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">
            Feedback Type
          </label>
          <Select value={feedbackType} onValueChange={setFeedbackType}>
            <SelectTrigger className="rounded-xl">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="bug">🐛 Bug Report</SelectItem>
              <SelectItem value="feature-request">💡 Feature Request</SelectItem>
              <SelectItem value="beta-feedback">🧪 Beta Testing Feedback</SelectItem>
              <SelectItem value="general">💬 General Feedback</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">
            Overall Rating
          </label>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRating(r)}
                className="transition-transform hover:scale-110"
              >
                <Star
                  className={`w-8 h-8 ${
                    r <= rating
                      ? "fill-amber-400 text-amber-400"
                      : "text-slate-300 dark:text-slate-600"
                  }`}
                />
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">
            Subject (optional)
          </label>
          <Input
            placeholder="Brief summary..."
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="rounded-xl"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">
            Details
          </label>
          <Textarea
            placeholder="Share your thoughts, describe the issue, or suggest improvements..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="rounded-xl min-h-32"
            required
          />
        </div>

        <Button
          type="submit"
          disabled={submitting}
          className="w-full rounded-xl bg-teal-600 hover:bg-teal-700 gap-2"
        >
          {submitting ? (
            "Submitting..."
          ) : (
            <>
              <Send className="w-4 h-4" /> Submit Feedback
            </>
          )}
        </Button>

        <p className="text-xs text-slate-500 dark:text-slate-400 text-center">
          Feedback is reviewed by administrators. Your email: {user?.email || "anonymous"}
        </p>
      </form>
    </div>
  );
}