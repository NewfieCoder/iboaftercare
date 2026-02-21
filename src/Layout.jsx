import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "./utils";
import { Home, MessageCircle, TrendingUp, BookOpen, Settings, Users } from "lucide-react";
import { base44 } from "@/api/base44Client";
import CrisisFooter from "@/components/CrisisFooter";
import OfflineIndicator from "@/components/OfflineIndicator";
import NavigationMenu from "@/components/NavigationMenu";
import SimulationBanner from "@/components/SimulationBanner";
import Logo from "@/components/Logo";

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
    <div className={`min-h-screen transition-colors duration-300 relative overflow-hidden`}>
      {/* Nature-inspired background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-100 via-teal-50 to-cyan-100 dark:from-emerald-950 dark:via-teal-950 dark:to-cyan-950" />

        {/* Subtle plant silhouettes */}
        <div className="absolute bottom-0 left-0 w-64 h-96 opacity-20 dark:opacity-10">
          <svg viewBox="0 0 200 400" className="w-full h-full">
            <path d="M20,400 Q30,350 25,300 T20,200 Q25,150 20,100" stroke="#2F4F4F" strokeWidth="2" fill="none" opacity="0.3"/>
            <circle cx="15" cy="280" r="8" fill="#2F4F4F" opacity="0.2"/>
            <circle cx="25" cy="260" r="6" fill="#2F4F4F" opacity="0.2"/>
            <path d="M50,400 L60,350 Q65,320 60,290" stroke="#2F4F4F" strokeWidth="1.5" fill="none" opacity="0.25"/>
          </svg>
        </div>

        <div className="absolute bottom-0 right-0 w-64 h-96 opacity-20 dark:opacity-10">
          <svg viewBox="0 0 200 400" className="w-full h-full">
            <path d="M180,400 Q170,350 175,300 T180,200 Q175,150 180,100" stroke="#2F4F4F" strokeWidth="2" fill="none" opacity="0.3"/>
            <circle cx="185" cy="280" r="8" fill="#2F4F4F" opacity="0.2"/>
            <circle cx="175" cy="260" r="6" fill="#2F4F4F" opacity="0.2"/>
          </svg>
        </div>

        {/* Golden accent lines */}
        <svg className="absolute inset-0 w-full h-full opacity-30 dark:opacity-20" preserveAspectRatio="none">
          <path d="M-50,100 Q200,150 400,80 T900,120" stroke="#D4AF37" strokeWidth="2" fill="none" opacity="0.4"/>
          <path d="M-100,300 Q250,350 500,280 T1000,320" stroke="#D4AF37" strokeWidth="1.5" fill="none" opacity="0.3"/>
        </svg>
      </div>

      <OfflineIndicator />
      <SimulationBanner />
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant:wght@300;400;500;600;700&display=swap');

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

        /* Glassmorphism utility */
        .glass {
          background: rgba(255, 255, 255, 0.7);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.3);
        }
        .dark .glass {
          background: rgba(15, 23, 42, 0.6);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        /* Elegant serif for headings */
        h1, h2, h3, .serif-heading {
          font-family: 'Cormorant', serif;
        }
      `}</style>

      {!hideNav && (
        <header className="fixed top-0 left-0 right-0 z-40 glass border-b border-white/20 dark:border-white/10">
          <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
            <Link to={createPageUrl("Home")} className="flex items-center gap-2">
              <Logo variant="icon" className="w-8 h-8" />
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 dark:text-white tracking-tight">
                  IboAftercare Coach
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
          <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 glass border-t border-white/20 dark:border-white/10 safe-area-bottom">
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