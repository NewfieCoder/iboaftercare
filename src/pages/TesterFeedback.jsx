import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { TestTube, Send, Shield, CheckCircle } from "lucide-react";
import { toast } from "sonner";

export default function TesterFeedback() {
  const [user, setUser] = useState(null);
  const [myFeedback, setMyFeedback] = useState([]);
  const [formData, setFormData] = useState({
    feedback_type: "beta-feedback",
    subject: "",
    description: "",
    priority: "medium"
  });

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const currentUser = await base44.auth.me();
    setUser(currentUser);

    if (!["admin", "tester"].includes(currentUser?.role)) {
      toast.error("Access denied");
      return;
    }

    const feedback = await base44.entities.Feedback.filter({ user_email: currentUser.email }, '-created_date');
    setMyFeedback(feedback);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    
    try {
      await base44.entities.Feedback.create({
        ...formData,
        user_email: user.email,
        user_role: user.role,
        status: "new"
      });
      
      toast.success("Feedback submitted! Admins will review it.");
      setFormData({
        feedback_type: "beta-feedback",
        subject: "",
        description: "",
        priority: "medium"
      });
      loadData();
    } catch (e) {
      toast.error("Failed to submit feedback");
    }
  }

  if (!user || !["admin", "tester"].includes(user.role)) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card className="p-8 text-center">
          <Shield className="w-12 h-12 mx-auto mb-4 text-slate-400" />
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Access Denied</h2>
          <p className="text-slate-600 dark:text-slate-400">Tester access required.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            Tester Feedback
          </h1>
          <Badge className="gap-1 bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400">
            <TestTube className="w-3 h-3" />
            Beta Tester
          </Badge>
        </div>
        <p className="text-slate-600 dark:text-slate-400">
          Report bugs, suggest features, and share your testing experience
        </p>
      </div>

      {/* Submit Form */}
      <Card className="p-6 mb-6">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">
          Submit Feedback
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Type</Label>
              <Select value={formData.feedback_type} onValueChange={v => setFormData({...formData, feedback_type: v})}>
                <SelectTrigger className="rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bug">Bug Report</SelectItem>
                  <SelectItem value="feature-request">Feature Request</SelectItem>
                  <SelectItem value="beta-feedback">Beta Feedback</SelectItem>
                  <SelectItem value="general">General</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Priority</Label>
              <Select value={formData.priority} onValueChange={v => setFormData({...formData, priority: v})}>
                <SelectTrigger className="rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label>Subject</Label>
            <Input
              value={formData.subject}
              onChange={e => setFormData({...formData, subject: e.target.value})}
              placeholder="Brief summary of the issue or suggestion"
              required
              className="rounded-xl"
            />
          </div>

          <div>
            <Label>Description</Label>
            <Textarea
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
              placeholder="Detailed description... Include steps to reproduce bugs, screenshots if possible, or detailed feature requests."
              required
              className="rounded-xl min-h-32"
            />
          </div>

          <Button type="submit" className="rounded-xl gap-2 w-full">
            <Send className="w-4 h-4" />
            Submit Feedback
          </Button>
        </form>
      </Card>

      {/* My Feedback History */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">
          My Feedback History ({myFeedback.length})
        </h2>
        <div className="space-y-3">
          {myFeedback.length === 0 ? (
            <p className="text-center text-slate-500 dark:text-slate-400 py-8">
              No feedback submitted yet
            </p>
          ) : (
            myFeedback.map(item => (
              <div
                key={item.id}
                className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h3 className="font-medium text-slate-900 dark:text-white mb-1">
                      {item.subject}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                      <Badge variant="outline" className="capitalize">{item.feedback_type}</Badge>
                      <Badge variant={
                        item.status === "resolved" ? "default" : 
                        item.status === "in-progress" ? "secondary" : 
                        "outline"
                      }>
                        {item.status}
                      </Badge>
                      <span>•</span>
                      <span>{new Date(item.created_date).toLocaleDateString()}</span>
                    </div>
                  </div>
                  {item.status === "resolved" && (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  )}
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                  {item.description}
                </p>
                {item.admin_notes && (
                  <div className="mt-3 p-3 bg-teal-50 dark:bg-teal-900/30 rounded-lg">
                    <p className="text-xs font-semibold text-teal-700 dark:text-teal-400 mb-1">
                      Admin Response:
                    </p>
                    <p className="text-sm text-slate-700 dark:text-slate-300">
                      {item.admin_notes}
                    </p>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
}