import { Award, Calendar } from "lucide-react";
import { motion } from "framer-motion";

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
    <motion.div 
      className="glass rounded-3xl p-6 text-slate-800 dark:text-white border border-white/30 dark:border-white/10 shadow-xl hover:shadow-2xl texture-overlay overflow-hidden group"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      whileHover={{ scale: 1.02 }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-teal-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      <div className="relative">
        <div className="flex items-center gap-2 mb-3 opacity-70">
          <Calendar className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span className="text-xs font-medium">Recovery Journey</span>
        </div>
        <div className="flex items-end justify-between">
          <div>
            <p className="text-4xl font-bold text-emerald-700 dark:text-emerald-300">{days}</p>
            <p className="text-sm opacity-70">
              {isPreTreatment ? "days until treatment" : "days since treatment"}
            </p>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-1.5 bg-emerald-100/50 dark:bg-emerald-900/30 rounded-full px-3 py-1.5 shadow-sm">
              <Award className="w-4 h-4 text-emerald-700 dark:text-emerald-300" />
              <span className="text-sm font-medium text-emerald-700 dark:text-emerald-300">{milestone}</span>
            </div>
            {nextMilestone && (
              <p className="text-xs opacity-60 mt-2">{daysToNext}d to {nextMilestone}</p>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}