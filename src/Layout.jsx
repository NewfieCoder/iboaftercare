import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "./utils";
import { Home, MessageCircle, TrendingUp, BookOpen, Settings, TreePine, Users } from "lucide-react";
import { base44 } from "@/api/base44Client";
import CrisisFooter from "@/components/CrisisFooter";
import OfflineIndicator from "@/components/OfflineIndicator";
import NavigationMenu from "@/components/NavigationMenu";

const navItems = [
  { name: "Home", icon: Home, page: "Home" },
  { name: "Coach", icon: MessageCircle, page: "CoachChat" },
  { name: "Progress", icon: TrendingUp, page: "Progress" },
  { name: "Resources", icon: BookOpen, page: "Resources" },
  { name: "Community", icon: Users, page: "Community" },
  { name: "Settings", icon: Settings, page: "ProfileSettings" },
];

export default function Layout({ children, currentPageName }) {
  const [darkMode, setDarkMode] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const hideNav = currentPageName === "Onboarding";

  useEffect(() => {
    async function loadTheme() {
      try {
        const user = await base44.auth.me();
        setUserRole(user?.role);
        
        const profiles = await base44.entities.UserProfile.list();
        if (profiles.length > 0 && profiles[0].dark_mode) {
          setDarkMode(true);
        }
      } catch (e) { /* ignore */ }
    }
    loadTheme();

    const handler = (e) => {
      if (e.detail !== undefined) setDarkMode(e.detail);
    };
    window.addEventListener("darkModeToggle", handler);
    return () => window.removeEventListener("darkModeToggle", handler);
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  return (
    <div className={`min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300`}>
      <OfflineIndicator />
      <style>{`
        :root {
          --color-primary: #0D9488;
          --color-primary-light: #5EEAD4;
          --color-primary-dark: #0F766E;
          --color-accent: #3B82F6;
          --color-warm: #F59E0B;
        }
        .dark {
          color-scheme: dark;
        }
        * {
          -webkit-tap-highlight-color: transparent;
        }
        .scrollbar-thin::-webkit-scrollbar {
          width: 4px;
        }
        .scrollbar-thin::-webkit-scrollbar-track {
          background: transparent;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 9999px;
        }
        .dark .scrollbar-thin::-webkit-scrollbar-thumb {
          background: #475569;
        }
      `}</style>

      {!hideNav && (
        <header className="fixed top-0 left-0 right-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-800/50">
          <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
            <Link to={createPageUrl("Home")} className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-lg flex items-center justify-center">
                <TreePine className="w-5 h-5 text-white" />
              </div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 dark:text-white tracking-tight">
                  IboGuide
                </span>
                {userRole && userRole !== 'user' && (
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                    userRole === 'admin' ? 'bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-400' :
                    userRole === 'tester' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400' :
                    userRole === 'editor' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400' :
                    userRole === 'moderator' ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400' :
                    ''
                  }`}>
                    {userRole}
                  </span>
                )}
              </div>
            </Link>
            <div className="flex items-center gap-4">
              <nav className="hidden lg:flex items-center gap-1">
                {navItems.map((item) => {
                  const isActive = currentPageName === item.page;
                  return (
                    <Link
                      key={item.page}
                      to={createPageUrl(item.page)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                        isActive
                          ? "bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300"
                          : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                      }`}
                    >
                      <item.icon className="w-4 h-4" />
                      {item.name}
                    </Link>
                  );
                })}
              </nav>
              <NavigationMenu currentPageName={currentPageName} />
            </div>
          </div>
        </header>
      )}

      <main className={`${!hideNav ? "pt-14 pb-32 md:pb-6" : ""}`}>
        {children}
      </main>

      {!hideNav && (
        <>
          <div className="md:hidden fixed bottom-16 left-0 right-0 z-30">
            <CrisisFooter />
          </div>
          <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-t border-slate-200/50 dark:border-slate-800/50 safe-area-bottom">
            <div className="flex items-center justify-around px-2 py-2">
              {navItems.map((item) => {
                const isActive = currentPageName === item.page;
                return (
                  <Link
                    key={item.page}
                    to={createPageUrl(item.page)}
                    className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all ${
                      isActive
                        ? "text-teal-600 dark:text-teal-400"
                        : "text-slate-400 dark:text-slate-500"
                    }`}
                  >
                    <item.icon className={`w-5 h-5 ${isActive ? "scale-110" : ""} transition-transform`} />
                    <span className="text-[10px] font-medium">{item.name}</span>
                  </Link>
                );
              })}
            </div>
          </nav>
          <div className="hidden md:block fixed bottom-0 left-0 right-0 z-30">
            <CrisisFooter />
          </div>
        </>
      )}
    </div>
  );
}