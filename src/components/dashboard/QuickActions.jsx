import { Link } from "react-router-dom";
import { createPageUrl } from "../../utils";
import { MessageCircle, BookOpen, PenLine, Target } from "lucide-react";
import { motion } from "framer-motion";

const actions = [
  { icon: MessageCircle, label: "Chat with IboGuide", page: "CoachChat", color: "from-teal-500 to-emerald-600" },
  { icon: PenLine, label: "Journal Entry", page: "Progress?tab=journal", color: "from-violet-500 to-purple-600" },
  { icon: Target, label: "Set a Goal", page: "Progress?tab=goals", color: "from-blue-500 to-indigo-600" },
  { icon: BookOpen, label: "Browse Resources", page: "Resources", color: "from-amber-500 to-orange-600" },
];

export default function QuickActions() {
  return (
    <div className="grid grid-cols-2 gap-3">
      {actions.map(({ icon: Icon, label, page }, idx) => (
        <motion.div
          key={label}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: idx * 0.1 }}
        >
          <Link
            to={createPageUrl(page)}
            className="glass group relative overflow-hidden rounded-2xl p-5 border border-white/30 dark:border-white/10 hover:shadow-2xl transition-all duration-300 block texture-overlay"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/0 to-teal-500/0 group-hover:from-emerald-500/10 group-hover:to-teal-500/10 transition-all duration-300" />
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" 
                 style={{ boxShadow: 'inset 0 0 40px rgba(16, 185, 129, 0.15)' }} />
            <div className="relative flex flex-col items-center gap-2">
              <Icon className="w-6 h-6 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform duration-200" />
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300 text-center">{label}</p>
            </div>
          </Link>
        </motion.div>
      ))}
    </div>
  );
}