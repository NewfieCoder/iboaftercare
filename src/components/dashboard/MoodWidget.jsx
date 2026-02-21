import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { SmilePlus, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { motion } from "framer-motion";

const moodEmojis = ["", "😞", "😟", "😕", "😐", "🙂", "😊", "😃", "😄", "🤩", "✨"];

export default function MoodWidget() {
  const [todayMood, setTodayMood] = useState(null);
  const [recentMoods, setRecentMoods] = useState([]);
  const [selectedMood, setSelectedMood] = useState(5);
  const [logging, setLogging] = useState(false);
  const [showPicker, setShowPicker] = useState(false);

  useEffect(() => {
    loadMoods();
  }, []);

  async function loadMoods() {
    const logs = await base44.entities.MoodLog.list("-log_date", 7);
    setRecentMoods(logs);
    const today = new Date().toISOString().split("T")[0];
    const todayLog = logs.find(l => l.log_date === today);
    if (todayLog) setTodayMood(todayLog);
  }

  async function logMood() {
    setLogging(true);
    const today = new Date().toISOString().split("T")[0];
    await base44.entities.MoodLog.create({
      mood_score: selectedMood,
      log_date: today,
    });
    await loadMoods();
    setShowPicker(false);
    setLogging(false);
  }

  const avgMood = recentMoods.length > 0
    ? (recentMoods.reduce((s, m) => s + m.mood_score, 0) / recentMoods.length).toFixed(1)
    : null;

  const trend = recentMoods.length >= 2
    ? recentMoods[0].mood_score - recentMoods[recentMoods.length - 1].mood_score
    : 0;

  if (showPicker) {
    return (
      <motion.div 
        className="glass rounded-2xl p-5 border border-white/30 dark:border-white/10 shadow-lg"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
      >
        <h3 className="font-semibold text-slate-900 dark:text-white mb-4">How are you feeling?</h3>
        <div className="flex items-center justify-center gap-1 mb-4">
          {[1,2,3,4,5,6,7,8,9,10].map(n => (
            <button
              key={n}
              onClick={() => setSelectedMood(n)}
              className={`w-9 h-9 rounded-full text-lg transition-all duration-200 ${
                selectedMood === n
                  ? "bg-gradient-to-br from-emerald-500 to-teal-500 scale-125"
                  : "glass hover:scale-110"
              }`}
              style={{
                boxShadow: selectedMood === n ? '0 0 20px rgba(16, 185, 129, 0.4)' : undefined
              }}
            >
              {n <= 3 ? "😟" : n <= 5 ? "😐" : n <= 7 ? "🙂" : "😄"}
            </button>
          ))}
        </div>
        <p className="text-center text-2xl mb-3">{moodEmojis[selectedMood]}</p>
        <div className="flex gap-2">
          <button onClick={() => setShowPicker(false)} className="flex-1 py-2.5 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-400 glass border border-white/30 dark:border-white/10">Cancel</button>
          <button onClick={logMood} disabled={logging} className="flex-1 py-2.5 rounded-xl text-sm font-medium text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:shadow-lg transition-all">{logging ? "..." : "Log Mood"}</button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      className="glass border border-white/30 dark:border-white/10 rounded-2xl p-5 shadow-lg hover:shadow-xl transition-all duration-300 texture-overlay"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-slate-900 dark:text-white">Today's Mood</h3>
        {!todayMood && (
          <button 
            onClick={() => setShowPicker(true)} 
            className="p-2 rounded-xl glass border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 hover:shadow-md transition-all duration-200"
            style={{ boxShadow: '0 0 10px rgba(16, 185, 129, 0.15)' }}
          >
            <SmilePlus className="w-5 h-5" />
          </button>
        )}
      </div>
      {todayMood ? (
        <div className="flex items-center gap-4">
          <span className="text-4xl">{moodEmojis[todayMood.mood_score]}</span>
          <div>
            <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">{todayMood.mood_score}/10</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Logged today</p>
          </div>
        </div>
      ) : (
        <p className="text-sm text-slate-500 dark:text-slate-400">Tap + to log how you're feeling</p>
      )}
      {avgMood && (
        <div className="mt-4 pt-4 border-t border-white/20 dark:border-white/10 flex items-center justify-between">
          <span className="text-xs text-slate-500 dark:text-slate-400">7-day average</span>
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-semibold text-slate-900 dark:text-white">{avgMood}</span>
            {trend > 0 ? <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> : trend < 0 ? <TrendingDown className="w-4 h-4 text-rose-500" /> : <Minus className="w-4 h-4 text-slate-400" />}
          </div>
        </div>
      )}
    </motion.div>
  );
}