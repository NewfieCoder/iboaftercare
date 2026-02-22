import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import Logo from "@/components/Logo";

const rootPages = ["Home", "CoachChat", "Progress", "Resources", "Community", "ProfileSettings"];

export default function MobileHeader({ currentPageName }) {
  const navigate = useNavigate();
  const isRootPage = rootPages.includes(currentPageName);

  if (currentPageName === "Onboarding") return null;

  return (
    <div className="md:hidden fixed top-0 left-0 right-0 z-50 glass border-b border-white/20 dark:border-white/10 no-select" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
      <div className="flex items-center justify-between px-4 h-14">
        {isRootPage ? (
          <Logo variant="icon" className="w-8 h-8" />
        ) : (
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-slate-700 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors active:scale-95"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm font-medium">Back</span>
          </button>
        )}
        <h1 className="text-base font-semibold text-slate-900 dark:text-white absolute left-1/2 -translate-x-1/2">
          {currentPageName === "Home" ? "" : currentPageName.replace(/([A-Z])/g, ' $1').trim()}
        </h1>
      </div>
    </div>
  );
}