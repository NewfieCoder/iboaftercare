import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "../utils";
import { 
  Users, Settings, BarChart3, Shield, 
  MessageSquare, BookOpen, Loader2 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import UserManagement from "@/components/admin/UserManagement";
import ContentManagement from "@/components/admin/ContentManagement";
import AnalyticsDashboard from "@/components/admin/AnalyticsDashboard";
import ForumModeration from "@/components/admin/ForumModeration";

export default function AdminPanel() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("dashboard");
  const navigate = useNavigate();

  useEffect(() => {
    checkAdminAccess();
  }, []);

  async function checkAdminAccess() {
    try {
      const currentUser = await base44.auth.me();
      if (currentUser.role !== 'admin') {
        navigate(createPageUrl("Home"));
        return;
      }
      setUser(currentUser);
    } catch (e) {
      navigate(createPageUrl("Home"));
    }
    setLoading(false);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 text-teal-600 animate-spin" />
      </div>
    );
  }

  const tabs = [
    { id: "dashboard", label: "Dashboard", icon: BarChart3 },
    { id: "users", label: "Users", icon: Users },
    { id: "content", label: "Content", icon: BookOpen },
    { id: "forum", label: "Forum", icon: MessageSquare },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-xl">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Admin Panel</h1>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  IboAftercare Coach Management
                </p>
              </div>
            </div>
            <Button
              onClick={() => navigate(createPageUrl("Home"))}
              variant="outline"
              className="rounded-xl"
            >
              Back to App
            </Button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-1 overflow-x-auto">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? "border-teal-600 text-teal-600 dark:text-teal-400"
                    : "border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {activeTab === "dashboard" && <AnalyticsDashboard />}
        {activeTab === "users" && <UserManagement adminEmail={user.email} />}
        {activeTab === "content" && <ContentManagement adminEmail={user.email} />}
        {activeTab === "forum" && <ForumModeration adminEmail={user.email} />}
      </div>
    </div>
  );
}