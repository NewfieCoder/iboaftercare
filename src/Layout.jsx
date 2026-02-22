import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "./utils";
import { Home, MessageCircle, TrendingUp, BookOpen, Settings, Users } from "lucide-react";
import { base44 } from "@/api/base44Client";
import CrisisFooter from "@/components/CrisisFooter";
import OfflineIndicator from "@/components/OfflineIndicator";
import NavigationMenu from "@/components/NavigationMenu";
import SimulationBanner from "@/components/SimulationBanner";
import Logo from "@/components/Logo";
import MobileHeader from "@/components/MobileHeader";
import { AnimatePresence, motion } from "framer-motion";

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
  const location = useLocation();

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
      <MobileHeader currentPageName={currentPageName} />
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant:wght@300;400;500;600;700&display=swap');

        :root {
          --color-primary: #0D9488;
          --color-primary-light: #5EEAD4;
          --color-primary-dark: #0F766E;
          --color-accent: #3B82F6;
          --color-warm: #F59E0B;
        }
        html, body {
          overscroll-behavior: none;
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
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
        }
        .dark .glass {
          background: rgba(15, 23, 42, 0.6);
          border: 1px solid rgba(255, 255, 255, 0.1);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
        }

        /* Subtle texture overlay */
        .texture-overlay {
          position: relative;
        }
        .texture-overlay::before {
          content: '';
          position: absolute;
          inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h60v60H0z' fill='none'/%3E%3Cpath d='M30 0v60M0 30h60' stroke='%23000' stroke-width='0.5' opacity='0.03'/%3E%3C/svg%3E");
          pointer-events: none;
          opacity: 0.4;
        }

        /* Smooth transitions */
        * {
          transition: background-color 0.3s ease, border-color 0.3s ease, color 0.3s ease, transform 0.2s ease;
        }

        /* User select: none for UI controls */
        button, a, nav, .no-select, [role="button"], [role="tab"], [role="menuitem"] {
          user-select: none;
          -webkit-user-select: none;
        }

        /* Keep user-select enabled for readable content */
        p, article, .prose, .markdown, [role="article"], textarea, input[type="text"], 
        .journal-content, .forum-content, .resource-content {
          user-select: text;
          -webkit-user-select: text;
        }

        /* Elegant serif for headings */
        h1, h2, h3, .serif-heading {
          font-family: 'Cormorant', serif;
        }
      `}</style>

      {!hideNav && (
        <header className="hidden md:block fixed top-0 left-0 right-0 z-40 glass border-b border-white/20 dark:border-white/10 no-select" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
          <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
            <Link to={createPageUrl("Home")} className="flex items-center gap-2">
              <Logo variant="icon" className="w-8 h-8" />
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 dark:text-white tracking-tight">
                  IboAftercare Coach
                </span>
                {userRole && userRole !== 'user' && (
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
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
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                        isActive
                          ? "bg-gradient-to-r from-teal-50 to-emerald-50 dark:from-teal-900/30 dark:to-emerald-900/30 text-teal-700 dark:text-teal-300 shadow-sm"
                          : "text-slate-600 dark:text-slate-400 hover:bg-white/50 dark:hover:bg-slate-800/50 hover:shadow-md"
                      }`}
                      style={{
                        boxShadow: isActive ? '0 0 20px rgba(20, 184, 166, 0.15)' : undefined
                      }}
                    >
                      <item.icon className={`w-4 h-4 ${isActive ? 'text-emerald-600 dark:text-emerald-400' : ''}`} />
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

      <main className={`${!hideNav ? "pt-16 md:pt-20 pb-32 md:pb-40" : ""}`}>
        {children}
      </main>

      {!hideNav && (
        <>
          <div className="md:hidden fixed bottom-20 left-0 right-0 z-30">
            <DisclaimerBanner compact />
          </div>
          <div className="md:hidden fixed bottom-0 left-0 right-0 z-30">
            <CrisisFooter />
          </div>
          <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 glass border-t border-white/20 dark:border-white/10 no-select" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
            <div className="flex items-center justify-around px-2 py-2">
              {navItems.map((item) => {
                const isActive = currentPageName === item.page;
                return (
                  <Link
                    key={item.page}
                    to={createPageUrl(item.page)}
                    onClick={(e) => {
                      if (isActive) {
                        e.preventDefault();
                        window.location.href = createPageUrl(item.page);
                      }
                    }}
                    className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all duration-200 ${
                      isActive
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-slate-400 dark:text-slate-500 active:scale-95"
                    }`}
                    style={{
                      filter: isActive ? 'drop-shadow(0 0 8px rgba(16, 185, 129, 0.3))' : undefined
                    }}
                  >
                    <item.icon className={`w-5 h-5 ${isActive ? "scale-110" : ""} transition-transform duration-200`} />
                    <span className="text-xs font-medium">{item.name}</span>
                  </Link>
                );
              })}
            </div>
          </nav>
          <div className="hidden md:block fixed bottom-16 left-0 right-0 z-30">
            <DisclaimerBanner compact />
          </div>
          <div className="hidden md:block fixed bottom-0 left-0 right-0 z-30">
            <CrisisFooter />
          </div>
        </>
      )}
    </div>
  );
}