import { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Send, Plus, Sparkles, Loader2, History, ArrowLeft, Crown, Play } from "lucide-react";
import MessageBubble from "@/components/chat/MessageBubble";
import DisclaimerBanner from "@/components/DisclaimerBanner";
import CrisisRedirect from "@/components/CrisisRedirect";
import PremiumUpsell from "@/components/PremiumUpsell";
import GuidedSession from "@/components/chat/GuidedSession";
import AccessibilityControls from "@/components/AccessibilityControls";

const SUGGESTED_PROMPTS = [
  "How am I doing this week?",
  "Help me with a mindfulness exercise",
  "I'm having cravings right now",
  "Let's do a daily check-in",
  "Help me process an insight from my experience",
  "What's a good evening routine?",
];

const GUIDED_SESSIONS = [
  { id: "mindfulness", label: "5-Min Mindfulness", icon: "🧘" },
  { id: "breathing", label: "Box Breathing", icon: "🌬️" },
  { id: "gratitude", label: "Gratitude Practice", icon: "🙏" }
];

export default function CoachChat() {
  const [conversations, setConversations] = useState([]);
  const [currentConv, setCurrentConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showCrisis, setShowCrisis] = useState(false);
  const [showPremium, setShowPremium] = useState(false);
  const [showGuidedSession, setShowGuidedSession] = useState(null);
  const [sessionCount, setSessionCount] = useState(0);
  const [isPremium, setIsPremium] = useState(false);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    loadConversations();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (!currentConv) return;
    const unsub = base44.agents.subscribeToConversation(currentConv.id, (data) => {
      setMessages(data.messages || []);
    });
    return () => unsub();
  }, [currentConv?.id]);

  async function loadConversations() {
    const convs = await base44.agents.listConversations({ agent_name: "iboGuide" });
    setConversations(convs);
    
    // Check premium status
    const profiles = await base44.entities.UserProfile.list();
    if (profiles.length > 0) {
      setIsPremium(profiles[0].premium || false);
    }
    
    // Count today's sessions for free tier limit
    const today = new Date().toDateString();
    const todaySessions = convs.filter(c => 
      new Date(c.created_date).toDateString() === today
    );
    setSessionCount(todaySessions.length);
    
    if (convs.length > 0) {
      const latest = await base44.agents.getConversation(convs[0].id);
      setCurrentConv(latest);
      setMessages(latest.messages || []);
    }
    setLoading(false);
  }

  async function startNewConversation() {
    // Check free tier limit (5 sessions per day)
    if (!isPremium && sessionCount >= 5) {
      setShowPremium(true);
      return;
    }
    
    const conv = await base44.agents.createConversation({
      agent_name: "iboGuide",
      metadata: { name: `Session - ${new Date().toLocaleDateString()}` },
    });
    setCurrentConv(conv);
    setMessages([]);
    setShowHistory(false);
    setConversations(prev => [conv, ...prev]);
    setSessionCount(prev => prev + 1);
  }

  async function sendMessage(text) {
    if (!text.trim() || sending) return;
    const msg = text.trim();
    setInput("");
    setSending(true);

    // Enhanced crisis detection
    const crisisWords = [
      "suicide", "suicidal", "kill myself", "end my life", "want to die", 
      "self-harm", "hurt myself", "no reason to live", "better off dead",
      "overdose", "end it all"
    ];
    if (crisisWords.some(w => msg.toLowerCase().includes(w))) {
      setShowCrisis(true);
      setSending(false);
      return; // Don't process message, prioritize crisis response
    }

    let conv = currentConv;
    if (!conv) {
      conv = await base44.agents.createConversation({
        agent_name: "iboGuide",
        metadata: { name: `Session - ${new Date().toLocaleDateString()}` },
      });
      setCurrentConv(conv);
      setConversations(prev => [conv, ...prev]);
    }

    await base44.agents.addMessage(conv, { role: "user", content: msg });
    setSending(false);
    inputRef.current?.focus();
  }

  const handleVoiceInput = (transcript) => {
    setInput(transcript);
  };

  async function selectConversation(conv) {
    const full = await base44.agents.getConversation(conv.id);
    setCurrentConv(full);
    setMessages(full.messages || []);
    setShowHistory(false);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-teal-500 animate-spin" />
      </div>
    );
  }

  // History view
  if (showHistory) {
    return (
      <div className="max-w-lg mx-auto px-4 py-6">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => setShowHistory(false)} className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Session History</h2>
        </div>
        <div className="space-y-2">
          {conversations.map(c => (
            <button
              key={c.id}
              onClick={() => selectConversation(c)}
              className={`w-full text-left p-4 rounded-2xl border transition-all ${
                currentConv?.id === c.id
                  ? "bg-teal-50 dark:bg-teal-900/20 border-teal-200 dark:border-teal-800"
                  : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-teal-200"
              }`}
            >
              <p className="font-medium text-sm text-slate-900 dark:text-white">
                {c.metadata?.name || "Untitled Session"}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {new Date(c.created_date).toLocaleDateString()}
              </p>
            </button>
          ))}
          {conversations.length === 0 && (
            <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-8">No sessions yet</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto flex flex-col h-[calc(100vh-8rem)] md:h-[calc(100vh-5rem)]">
      {showCrisis && <CrisisRedirect onClose={() => setShowCrisis(false)} />}
      {showPremium && <PremiumUpsell onClose={() => setShowPremium(false)} feature="unlimited AI coach sessions" />}
      {showGuidedSession && <GuidedSession sessionType={showGuidedSession} onClose={() => setShowGuidedSession(null)} />}
      <AccessibilityControls onVoiceInput={handleVoiceInput} showVoiceInput={messages.length > 0} />

      {/* Header */}
      <div className="px-4 py-3 flex items-center justify-between border-b border-slate-200/50 dark:border-slate-800/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="font-semibold text-slate-900 dark:text-white text-sm">IboGuide</h2>
            <p className="text-xs text-emerald-600 dark:text-emerald-400">
              {isPremium ? "Premium" : `${sessionCount}/5 daily sessions`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {!isPremium && (
            <button
              onClick={() => setShowPremium(true)}
              className="p-2 rounded-xl text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20"
            >
              <Crown className="w-5 h-5" />
            </button>
          )}
          <button onClick={() => setShowHistory(true)} className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800">
            <History className="w-5 h-5" />
          </button>
          <button onClick={startNewConversation} className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800">
            <Plus className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 scrollbar-thin">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center mb-4">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white mb-2">Hi, I'm IboGuide</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 max-w-xs">
              Your AI aftercare coach. I'm here to support your recovery journey with evidence-based guidance and encouragement.
            </p>
            
            {/* Guided Sessions */}
            <div className="w-full mb-4">
              <p className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-2">Guided Practices</p>
              <div className="grid grid-cols-3 gap-2">
                {GUIDED_SESSIONS.map(session => (
                  <button
                    key={session.id}
                    onClick={() => setShowGuidedSession(session.id)}
                    className="flex flex-col items-center gap-2 p-3 rounded-xl bg-gradient-to-br from-teal-50 to-emerald-50 dark:from-teal-950/20 dark:to-emerald-950/20 border border-teal-200 dark:border-teal-800 hover:scale-105 transition-transform"
                  >
                    <span className="text-2xl">{session.icon}</span>
                    <span className="text-xs text-slate-700 dark:text-slate-300 text-center font-medium">
                      {session.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="w-full space-y-2">
              {SUGGESTED_PROMPTS.slice(0, 4).map(prompt => (
                <button
                  key={prompt}
                  onClick={() => sendMessage(prompt)}
                  className="w-full text-left p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-700 dark:text-slate-300 hover:border-teal-300 dark:hover:border-teal-700 transition-colors"
                >
                  {prompt}
                </button>
              ))}
            </div>
            <div className="mt-6">
              <DisclaimerBanner compact />
            </div>
          </div>
        )}
        {messages.map((msg, i) => (
          <MessageBubble key={i} message={msg} />
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="px-4 py-3 border-t border-slate-200/50 dark:border-slate-800/50 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && !e.shiftKey && sendMessage(input)}
            placeholder="Message IboGuide..."
            className="flex-1 px-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 border-0 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/30"
          />
          <Button
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || sending}
            className="rounded-xl bg-teal-600 hover:bg-teal-700 h-12 w-12 p-0"
          >
            {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
          </Button>
        </div>
      </div>
    </div>
  );
}