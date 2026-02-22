import ReactMarkdown from "react-markdown";
import { TreePine, User, Zap, CheckCircle2, Loader2, ChevronRight, Clock, Flag } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";

function FunctionDisplay({ toolCall }) {
  const [expanded, setExpanded] = useState(false);
  const name = toolCall?.name || "Function";
  const status = toolCall?.status || "pending";
  const isRunning = status === "running" || status === "in_progress";

  const formattedName = name.split(".").pop().replace(/([A-Z])/g, " $1").trim().toLowerCase();

  return (
    <button
      onClick={() => setExpanded(!expanded)}
      className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors mt-1"
    >
      {isRunning ? (
        <Loader2 className="w-3 h-3 animate-spin text-teal-500" />
      ) : status === "completed" || status === "success" ? (
        <CheckCircle2 className="w-3 h-3 text-emerald-500" />
      ) : (
        <Clock className="w-3 h-3 text-slate-400" />
      )}
      <span>{formattedName}</span>
      {!isRunning && <ChevronRight className={cn("w-3 h-3 transition-transform", expanded && "rotate-90")} />}
    </button>
  );
}

export default function MessageBubble({ message }) {
  const isUser = message.role === "user";
  const [reporting, setReporting] = useState(false);

  const handleReport = async () => {
    if (reporting) return;
    setReporting(true);
    
    try {
      await base44.entities.Feedback.create({
        feedback_type: "bug",
        subject: "AI Response Issue",
        description: `User reported AI response:\n\n${message.content}\n\nTimestamp: ${new Date().toISOString()}`,
        priority: "medium",
        status: "new",
        user_email: (await base44.auth.me())?.email || "unknown",
        user_role: (await base44.auth.me())?.role || "user"
      });
      
      toast.success("Response reported. Thank you for helping us improve!");
    } catch (error) {
      toast.error("Failed to submit report. Please try again.");
    } finally {
      setReporting(false);
    }
  };

  return (
    <div className={cn("flex gap-3", isUser ? "justify-end" : "justify-start")}>
      {!isUser && (
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
          <TreePine className="w-4 h-4 text-white" />
        </div>
      )}
      <div className={cn("max-w-[85%]", isUser && "flex flex-col items-end")}>
        {message.content && (
          <div className="relative group">
            <div className={cn(
              "rounded-2xl px-4 py-3",
              isUser
                ? "bg-teal-600 text-white rounded-br-md"
                : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-bl-md"
            )}>
              {isUser ? (
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
              ) : (
                <ReactMarkdown className="text-sm prose prose-sm prose-slate dark:prose-invert max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
                  {message.content}
                </ReactMarkdown>
              )}
            </div>
            {!isUser && message.content && (
              <button
                onClick={handleReport}
                disabled={reporting}
                className="absolute top-2 right-2 p-1 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-400 hover:text-amber-500 dark:hover:text-amber-400 opacity-0 group-hover:opacity-100 transition-opacity"
                title="Report inappropriate response"
              >
                <Flag className="w-3 h-3" />
              </button>
            )}
          </div>
        )}
        {message.tool_calls?.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1">
            {message.tool_calls.map((tc, i) => (
              <FunctionDisplay key={i} toolCall={tc} />
            ))}
          </div>
        )}
      </div>
      {isUser && (
        <div className="w-8 h-8 rounded-xl bg-slate-200 dark:bg-slate-700 flex items-center justify-center shrink-0 mt-0.5">
          <User className="w-4 h-4 text-slate-600 dark:text-slate-300" />
        </div>
      )}
    </div>
  );
}