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
      {actions.map(({ icon: Icon, label, page, color }) => (
        <Link
          key={label}
          to={createPageUrl(page)}
          className="group relative overflow-hidden rounded-2xl p-4 bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 hover:shadow-lg transition-all duration-300"
        >
          <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
            <Icon className="w-5 h-5 text-white" />
          </div>
          <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{label}</p>
        </Link>
      ))}
    </div>
  );
}