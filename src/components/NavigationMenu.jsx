import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "../utils";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Menu, Home, MessageCircle, TrendingUp, BookOpen, Users, Settings, 
  Crown, ClipboardList, Sparkles, Shield, Flag, Edit, TestTube, LogOut,
  Brain, Trophy, Search, Lock
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const menuSections = {
  main: [
    { name: "Dashboard", icon: Home, page: "Home" },
    { name: "AI Coach", icon: MessageCircle, page: "CoachChat" },
    { name: "Progress Tracker", icon: TrendingUp, page: "Progress" },
    { name: "Resources", icon: BookOpen, page: "Resources" },
    { name: "Community", icon: Users, page: "Community" }
  ],
  wellness: [
    { name: "Prep Toolkit", icon: ClipboardList, page: "PrepToolkit", premium: true },
    { name: "Wellness Planner", icon: Sparkles, page: "WellnessPlanner", premium: true },
    { name: "Mindfulness Studio", icon: Brain, page: "MindfulnessStudio", premium: true },
    { name: "Milestone Challenges", icon: Trophy, page: "MilestoneChallenges", premium: true },
    { name: "Recovery Connector", icon: Users, page: "RecoveryConnector" },
    { name: "Study Library", icon: BookOpen, page: "StudyLibrary" }
  ],
  roleSpecific: [
    { name: "Admin Panel", icon: Shield, page: "Admin", roles: ["admin"] },
    { name: "Moderator Dashboard", icon: Flag, page: "ModeratorDashboard", roles: ["admin", "moderator"] },
    { name: "Editor Dashboard", icon: Edit, page: "EditorDashboard", roles: ["admin", "editor"] },
    { name: "Tester Feedback", icon: TestTube, page: "TesterFeedback", roles: ["admin", "tester"] }
  ],
  settings: [
    { name: "Profile & Settings", icon: Settings, page: "ProfileSettings" }
  ]
};

export default function NavigationMenu({ currentPageName }) {
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    loadUser();
  }, []);

  async function loadUser() {
    try {
      const currentUser = await base44.auth.me();
      const profiles = await base44.entities.UserProfile.list();
      setUser(currentUser);
      if (profiles.length > 0) setProfile(profiles[0]);
    } catch (e) {
      console.error("Failed to load user", e);
    }
  }

  const hasRole = (requiredRoles) => {
    if (!requiredRoles || requiredRoles.length === 0) return true;
    return requiredRoles.includes(user?.role);
  };

  const isPremiumUnlocked = () => {
    // Check admin full unlock mode (highest priority for testing)
    const adminUnlocked = localStorage.getItem("adminFullUnlock") === "true" && user?.role === "admin";
    if (adminUnlocked) return true;
    
    // Check tier simulation (admin testing specific tier restrictions)
    const simulatedTier = localStorage.getItem("adminTierSimulation");
    if (simulatedTier && user?.role === "admin") {
      return simulatedTier === "Premium" || simulatedTier === "Standard";
    }
    
    // Regular premium subscription or tester free access
    return profile?.premium || user?.role === "tester";
  };

  const filterMenuItems = (items) => {
    if (!searchQuery.trim()) return items;
    return items.filter(item => 
      item.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const handleLogout = async () => {
    await base44.auth.logout();
  };

  const MenuContent = () => (
    <div className="py-4">
      {/* Admin Full Unlock Banner */}
      <AnimatePresence>
        {localStorage.getItem("adminFullUnlock") === "true" && user?.role === "admin" && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mx-4 mb-4 p-3 bg-violet-50 dark:bg-violet-950/30 border border-violet-200 dark:border-violet-800 rounded-xl"
          >
            <p className="text-xs font-semibold text-violet-700 dark:text-violet-300 flex items-center gap-2">
              <Crown className="w-3 h-3" />
              Full Unlock Active – Testing Mode
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* User Info */}
      <div className="px-4 mb-6 pb-6 border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center text-white font-bold">
            {user?.full_name?.[0]?.toUpperCase() || "U"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-slate-900 dark:text-white truncate">
              {user?.full_name || "User"}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
              {user?.email}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="secondary" className="capitalize text-xs">
            {user?.role || "user"}
          </Badge>
          {profile?.premium && (
            <Badge className="gap-1 bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
              <Crown className="w-3 h-3" />
              {profile.premium_tier === "premium" ? "Premium" : "Standard"}
            </Badge>
          )}
          {profile?.user_type && (
            <Badge variant="outline" className="text-xs">
              {profile.user_type === "pre-treatment" ? "Pre-Prep" : "Post-Care"}
            </Badge>
          )}
        </div>
      </div>

      {/* Search Bar */}
      <div className="px-4 mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            type="text"
            placeholder="Search menu..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 rounded-xl text-sm"
          />
        </div>
      </div>

      {/* Main Navigation */}
      {filterMenuItems(menuSections.main).length > 0 && (
        <div className="space-y-1 px-2 mb-4">
          <p className="px-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
            Main
          </p>
          <AnimatePresence mode="popLayout">
            {filterMenuItems(menuSections.main).map((item) => (
              <motion.div
                key={item.page}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
              >
                <Link
                  to={createPageUrl(item.page)}
                  onClick={() => setOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 ${
                    currentPageName === item.page
                      ? "bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300"
                      : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  <span className="text-sm font-medium">{item.name}</span>
                </Link>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Wellness Tools */}
      {filterMenuItems(menuSections.wellness).length > 0 && (
        <div className="space-y-1 px-2 mb-4">
          <p className="px-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
            Wellness Tools
          </p>
          <AnimatePresence mode="popLayout">
            {filterMenuItems(menuSections.wellness).map((item) => {
              const isLocked = item.premium && !isPremiumUnlocked();
              return (
                <motion.div
                  key={item.page}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                  className="relative group"
                >
                  <Link
                    to={isLocked ? "#" : createPageUrl(item.page)}
                    onClick={(e) => {
                      if (isLocked) {
                        e.preventDefault();
                      } else {
                        setOpen(false);
                      }
                    }}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 ${
                      isLocked
                        ? "opacity-60 cursor-not-allowed"
                        : currentPageName === item.page
                        ? "bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300"
                        : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                    }`}
                  >
                    <item.icon className="w-4 h-4" />
                    <span className="text-sm font-medium">{item.name}</span>
                    {item.premium && (
                      <Crown className={`w-3 h-3 ml-auto ${isLocked ? "text-amber-400" : "text-amber-500"}`} />
                    )}
                  </Link>
                  {isLocked && (
                    <div className="absolute inset-0 flex items-center justify-end pr-3 pointer-events-none">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 dark:bg-slate-700 text-white text-xs px-2 py-1 rounded-lg whitespace-nowrap -translate-x-12">
                        Upgrade to access
                      </div>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Role-Specific */}
      {filterMenuItems(menuSections.roleSpecific.filter(item => hasRole(item.roles))).length > 0 && (
        <div className="space-y-1 px-2 mb-4">
          <p className="px-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
            Admin & Tools
          </p>
          <AnimatePresence mode="popLayout">
            {filterMenuItems(menuSections.roleSpecific.filter(item => hasRole(item.roles))).map((item) => (
              <motion.div
                key={item.page}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
              >
                <Link
                  to={createPageUrl(item.page)}
                  onClick={() => setOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 ${
                    currentPageName === item.page
                      ? "bg-violet-50 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300"
                      : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  <span className="text-sm font-medium">{item.name}</span>
                </Link>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Upgrade Prompt */}
      {!isPremiumUnlocked() && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="px-4 mb-4"
        >
          <Link
            to={createPageUrl("ProfileSettings")}
            onClick={() => setOpen(false)}
            className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-950/20 dark:to-yellow-950/20 border border-amber-200 dark:border-amber-800 hover:shadow-md transition-all duration-200"
          >
            <Crown className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-amber-900 dark:text-amber-200">Upgrade to Premium</p>
              <p className="text-xs text-amber-700 dark:text-amber-400">Unlock AI coach & more</p>
            </div>
          </Link>
        </motion.div>
      )}

      {/* Settings & Logout */}
      <div className="space-y-1 px-2 border-t border-slate-200 dark:border-slate-700 pt-4">
        {menuSections.settings.map((item) => (
          <Link
            key={item.page}
            to={createPageUrl(item.page)}
            onClick={() => setOpen(false)}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${
              currentPageName === item.page
                ? "bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300"
                : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            <item.icon className="w-4 h-4" />
            <span className="text-sm font-medium">{item.name}</span>
          </Link>
        ))}
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span className="text-sm font-medium">Logout</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Menu */}
      <div className="md:hidden">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-xl">
              <Menu className="w-5 h-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-80 p-0 overflow-y-auto">
            <MenuContent />
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop/Tablet Dropdown */}
      <div className="hidden md:block">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button 
              variant="ghost" 
              className="rounded-xl gap-2 hover:bg-white/50 dark:hover:bg-slate-800/50 transition-all duration-200"
              aria-label="Open navigation menu"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center text-white text-sm font-bold shadow-md">
                {user?.full_name?.[0]?.toUpperCase() || "U"}
              </div>
              <span className="text-sm font-medium hidden lg:inline">{user?.full_name?.split(" ")[0] || "Menu"}</span>
              <Menu className="w-4 h-4 text-slate-400" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-80 p-0 overflow-y-auto">
            <MenuContent />
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}