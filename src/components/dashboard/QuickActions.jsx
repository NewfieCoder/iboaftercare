import { Link } from "react-router-dom";
import { createPageUrl } from "../../utils";
import { MessageCircle, BookOpen, PenLine, Target } from "lucide-react";

const actions = [
  { icon: MessageCircle, label: "Chat with IboGuide", page: "CoachChat", color: "from-teal-500 to-emerald-600" },
  { icon: PenLine, label: "Journal Entry", page: "Progress?tab=journal", color: "from-violet-500 to-purple-600" },
  { icon: Target, label: "Set a Goal", page: "Progress?tab=goals", color: "from-blue-500 to-indigo-600" },
  { icon: BookOpen, label: "Browse Resources", page: "Resources", color: "from-amber-500 to-orange-600" },
];

export default function QuickActions() {
  return (
    <div className="grid grid-cols-2 gap-3">
      {actions.map(({ icon: Icon, label, page }) => (
        <Link
          key={label}
          to={createPageUrl(page)}
          className="glass group relative overflow-hidden rounded-2xl p-5 border border-white/30 dark:border-white/10 hover:shadow-xl transition-all duration-300"
        >
          <div className="flex flex-col items-center gap-2">
            <Icon className="w-6 h-6 text-slate-700 dark:text-slate-300 group-hover:scale-110 transition-transform" />
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300 text-center">{label}</p>
          </div>
        </Link>
      ))}
    </div>
  );
}