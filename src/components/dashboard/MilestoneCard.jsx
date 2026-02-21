import { Award, Calendar } from "lucide-react";

export default function MilestoneCard({ treatmentDate, userType }) {
  if (!treatmentDate) return null;

  const start = new Date(treatmentDate);
  const now = new Date();
  const isPreTreatment = userType === "pre-treatment";
  const days = Math.abs(Math.floor((now - start) / (1000 * 60 * 60 * 24)));
  const weeks = Math.floor(days / 7);
  const months = Math.floor(days / 30);

  let milestone = "";
  let nextMilestone = "";
  let daysToNext = 0;

  if (days < 7) {
    milestone = "First Week";
    nextMilestone = "1 Week";
    daysToNext = 7 - days;
  } else if (days < 30) {
    milestone = `${weeks} Week${weeks > 1 ? "s" : ""}`;
    nextMilestone = "1 Month";
    daysToNext = 30 - days;
  } else if (days < 90) {
    milestone = `${months} Month${months > 1 ? "s" : ""}`;
    nextMilestone = "3 Months";
    daysToNext = 90 - days;
  } else if (days < 180) {
    milestone = `${months} Months`;
    nextMilestone = "6 Months";
    daysToNext = 180 - days;
  } else if (days < 365) {
    milestone = `${months} Months`;
    nextMilestone = "1 Year";
    daysToNext = 365 - days;
  } else {
    milestone = `${Math.floor(days / 365)} Year${days >= 730 ? "s" : ""}+`;
  }

  return (
    <div className="glass rounded-3xl p-6 text-slate-800 dark:text-white border border-white/30 dark:border-white/10 shadow-xl">
      <div className="flex items-center gap-2 mb-3 opacity-70">
        <Calendar className="w-4 h-4" />
        <span className="text-xs font-medium">Recovery Journey</span>
      </div>
      <div className="flex items-end justify-between">
        <div>
          <p className="text-4xl font-bold text-teal-700 dark:text-teal-300">{days}</p>
          <p className="text-sm opacity-70">
            {isPreTreatment ? "days until treatment" : "days since treatment"}
          </p>
        </div>
        <div className="text-right">
          <div className="flex items-center gap-1.5 bg-teal-100/50 dark:bg-teal-900/30 rounded-full px-3 py-1.5">
            <Award className="w-4 h-4 text-teal-700 dark:text-teal-300" />
            <span className="text-sm font-medium text-teal-700 dark:text-teal-300">{milestone}</span>
          </div>
          {nextMilestone && (
            <p className="text-xs opacity-60 mt-2">{daysToNext}d to {nextMilestone}</p>
          )}
        </div>
      </div>
    </div>
  );
}