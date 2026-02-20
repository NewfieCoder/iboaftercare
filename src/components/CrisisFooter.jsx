import { Phone, MessageSquare } from "lucide-react";

export default function CrisisFooter() {
  return (
    <div className="bg-rose-50 dark:bg-rose-950/30 border-t border-rose-200 dark:border-rose-800 py-3 px-4">
      <p className="text-xs text-rose-800 dark:text-rose-300 text-center mb-2 font-medium">
        In Crisis? Help is Available 24/7
      </p>
      <div className="flex items-center justify-center gap-4 flex-wrap">
        <a
          href="tel:988"
          className="flex items-center gap-1.5 text-xs text-rose-700 dark:text-rose-400 hover:text-rose-900 dark:hover:text-rose-200 font-medium"
        >
          <Phone className="w-3.5 h-3.5" />
          Call/Text 988
        </a>
        <span className="text-rose-300 dark:text-rose-700">•</span>
        <a
          href="tel:1-800-662-4357"
          className="flex items-center gap-1.5 text-xs text-rose-700 dark:text-rose-400 hover:text-rose-900 dark:hover:text-rose-200 font-medium"
        >
          <Phone className="w-3.5 h-3.5" />
          SAMHSA: 1-800-662-4357
        </a>
        <span className="text-rose-300 dark:text-rose-700">•</span>
        <a
          href="sms:741741"
          className="flex items-center gap-1.5 text-xs text-rose-700 dark:text-rose-400 hover:text-rose-900 dark:hover:text-rose-200 font-medium"
        >
          <MessageSquare className="w-3.5 h-3.5" />
          Crisis Text: 741741
        </a>
      </div>
    </div>
  );
}