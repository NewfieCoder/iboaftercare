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
    <div className="bg-gradient-to-br from-teal-500 to-emerald-600 rounded-2xl p-5 text-white">
      <div className="flex items-center gap-2 mb-3 opacity-80">
        <Calendar className="w-4 h-4" />
        <span className="text-xs font-medium">Recovery Journey</span>
      </div>
      <div className="flex items-end justify-between">
        <div>
          <p className="text-4xl font-bold">{days}</p>
          <p className="text-sm opacity-80">
            {isPreTreatment ? "days until treatment" : "days since treatment"}
          </p>
        </div>
        <div className="text-right">
          <div className="flex items-center gap-1.5 bg-white/20 rounded-full px-3 py-1.5">
            <Award className="w-4 h-4" />
            <span className="text-sm font-medium">{milestone}</span>
          </div>
          {nextMilestone && (
            <p className="text-xs opacity-70 mt-2">{daysToNext}d to {nextMilestone}</p>
          )}
        </div>
      </div>
    </div>
  );
}