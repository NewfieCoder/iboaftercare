import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Users, MessageSquare, TrendingUp, DollarSign, Activity, Loader2 } from "lucide-react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function AnalyticsDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  async function loadStats() {
    try {
      const [users, profiles, moods, posts, habits, journals] = await Promise.all([
        base44.asServiceRole.entities.User.list(),
        base44.asServiceRole.entities.UserProfile.list(),
        base44.asServiceRole.entities.MoodLog.list('-created_date', 100),
        base44.asServiceRole.entities.ForumPost.list('-created_date', 100),
        base44.asServiceRole.entities.HabitTracker.list(),
        base44.asServiceRole.entities.JournalEntry.list('-created_date', 100)
      ]);

      const premiumUsers = profiles.filter(p => p.premium).length;
      const activeUsers = users.filter(u => {
        const lastActive = new Date(u.updated_date);
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return lastActive > weekAgo;
      }).length;

      // Engagement over time (last 7 days)
      const engagementData = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        
        const dayMoods = moods.filter(m => m.created_date?.startsWith(dateStr)).length;
        const dayPosts = posts.filter(p => p.created_date?.startsWith(dateStr)).length;
        const dayJournals = journals.filter(j => j.created_date?.startsWith(dateStr)).length;
        
        engagementData.push({
          date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          activity: dayMoods + dayPosts + dayJournals
        });
      }

      setStats({
        totalUsers: users.length,
        activeUsers,
        premiumUsers,
        forumPosts: posts.length,
        moodLogs: moods.length,
        habitTrackers: habits.length,
        journalEntries: journals.length,
        engagementData
      });
    } catch (e) {
      console.error("Failed to load stats:", e);
    }
    setLoading(false);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 text-teal-600 animate-spin" />
      </div>
    );
  }

  const statCards = [
    { label: "Total Users", value: stats.totalUsers, icon: Users, color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-950/20" },
    { label: "Active (7d)", value: stats.activeUsers, icon: Activity, color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-950/20" },
    { label: "Premium", value: stats.premiumUsers, icon: DollarSign, color: "text-amber-600", bg: "bg-amber-50 dark:bg-amber-950/20" },
    { label: "Forum Posts", value: stats.forumPosts, icon: MessageSquare, color: "text-violet-600", bg: "bg-violet-50 dark:bg-violet-950/20" },
    { label: "Mood Logs", value: stats.moodLogs, icon: TrendingUp, color: "text-teal-600", bg: "bg-teal-50 dark:bg-teal-950/20" },
    { label: "Journal Entries", value: stats.journalEntries, icon: MessageSquare, color: "text-rose-600", bg: "bg-rose-50 dark:bg-rose-950/20" },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {statCards.map((stat, idx) => (
          <div key={idx} className="bg-white dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700/50 p-5">
            <div className="flex items-center justify-between mb-3">
              <div className={`p-2 rounded-xl ${stat.bg}`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <span className="text-2xl font-bold text-slate-900 dark:text-white">{stat.value}</span>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Engagement Chart */}
      <div className="bg-white dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700/50 p-6">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
          User Activity (Last 7 Days)
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={stats.engagementData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="date" stroke="#64748b" fontSize={12} />
            <YAxis stroke="#64748b" fontSize={12} />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#fff', 
                border: '1px solid #e5e7eb',
                borderRadius: '8px'
              }}
            />
            <Line 
              type="monotone" 
              dataKey="activity" 
              stroke="#0d9488" 
              strokeWidth={2}
              dot={{ fill: '#0d9488', r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Quick Insights */}
      <div className="bg-white dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700/50 p-6">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Quick Insights</h3>
        <div className="space-y-3 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-slate-600 dark:text-slate-400">Premium Conversion Rate</span>
            <span className="font-semibold text-slate-900 dark:text-white">
              {stats.totalUsers > 0 ? ((stats.premiumUsers / stats.totalUsers) * 100).toFixed(1) : 0}%
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-600 dark:text-slate-400">Active User Rate (7d)</span>
            <span className="font-semibold text-slate-900 dark:text-white">
              {stats.totalUsers > 0 ? ((stats.activeUsers / stats.totalUsers) * 100).toFixed(1) : 0}%
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-600 dark:text-slate-400">Avg Posts per User</span>
            <span className="font-semibold text-slate-900 dark:text-white">
              {stats.totalUsers > 0 ? (stats.forumPosts / stats.totalUsers).toFixed(1) : 0}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}