import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import moment from "moment";
import { Loader2 } from "lucide-react";

export default function MoodChart() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const logs = await base44.entities.MoodLog.list("log_date", 30);
      const chartData = logs.map(l => ({
        date: moment(l.log_date).format("MMM D"),
        mood: l.mood_score,
        energy: l.energy_level || 0,
        cravings: l.cravings_level || 0,
      }));
      setData(chartData);
      setLoading(false);
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <Loader2 className="w-6 h-6 text-teal-500 animate-spin" />
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-sm text-slate-500 dark:text-slate-400">
        Start logging your mood to see trends here
      </div>
    );
  }

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="moodGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#14b8a6" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="cravGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="#94a3b8" />
          <YAxis domain={[0, 10]} tick={{ fontSize: 11 }} stroke="#94a3b8" />
          <Tooltip
            contentStyle={{
              backgroundColor: "rgba(255,255,255,0.95)",
              border: "none",
              borderRadius: "12px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              fontSize: "12px",
            }}
          />
          <Area type="monotone" dataKey="mood" stroke="#14b8a6" fill="url(#moodGrad)" strokeWidth={2} name="Mood" />
          <Area type="monotone" dataKey="cravings" stroke="#f43f5e" fill="url(#cravGrad)" strokeWidth={2} name="Cravings" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}