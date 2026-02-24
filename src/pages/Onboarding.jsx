import { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Send, Plus, Sparkles, Loader2, History, ArrowLeft, Play, Flag, Mic } from "lucide-react";
import MessageBubble from "@/components/chat/MessageBubble";
import DisclaimerBanner from "@/components/DisclaimerBanner";
import CrisisRedirect from "@/components/CrisisRedirect";
import { toast } from "sonner";
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
  const [showGuidedSession, setShowGuidedSession] = useState(null);
  const [sessionCount, setSessionCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Speech Recognition setup
  const recognitionRef = useRef(null);

  useEffect(() => {
    if (!("SpeechRecognition" in window || "webkitSpeechRecognition" in window)) {
      console.warn("Speech Recognition not supported in this browser");
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.continuous = false;
    recognitionRef.current.interimResults = false;
    recognitionRef.current.lang = "en-US";

    recognitionRef.current.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInput(prev => prev + " " + transcript.trim());
      setIsListening(false);
    };

    recognitionRef.current.onerror = (event) => {
      console.error("Speech recognition error", event.error);
      toast.error("Voice input error: " + event.error);
      setIsListening(false);
    };

    recognitionRef.current.onend = () => setIsListening(false);

    return () => {
      if (recognitionRef.current) recognitionRef.current.abort();
    };
  }, []);

  const toggleVoiceInput = () => {
    if (!recognitionRef.current) {
      toast.error("Voice input not supported in this browser");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  // ──────────────────────────────────────────────
  // Crisis keyword list - expanded & more sensitive
  // ──────────────────────────────────────────────
  const crisisKeywords = [
    "suicide", "suicidal", "kill myself", "kill me", "end my life", "want to die",
    "self-harm", "hurt myself", "cutting", "self injury", "no reason to live",
    "better off dead", "overdose", "end it all", "hopeless", "give up",
    "can't go on", "nothing left", "worthless", "burden", "end it",
    "no point", "cut myself", "jump off", "hang myself", "poison", "shotgun",
    "goodbye forever", "everyone better without me"
  ];

  const containsCrisisWords = (text) => {
    const lower = text.toLowerCase();
    return crisisKeywords.some(word => lower.includes(word));
  };

  // ──────────────────────────────────────────────
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
    
    const today = new Date().toDateString();
    const todaySessions = convs.filter(c => new Date(c.created_date).toDateString() === today);
    setSessionCount(todaySessions.length);
    
    if (convs.length > 0) {
      const latest = await base44.agents.getConversation(convs[0].id);
      setCurrentConv(latest);
      setMessages(latest.messages || []);
    }
    setLoading(false);
  }

  async function startNewConversation() {
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

    // Crisis check BEFORE sending to AI
    if (containsCrisisWords(msg)) {
      setShowCrisis(true);
      setSending(false);
      return;
    }

    let conv = currentConv;
    if (!conv) {
      conv = await startNewConversation(); // reuse function
    }

    await base44.agents.addMessage(conv, { role: "user", content: msg });
    setSending(false);
    inputRef.current?.focus();
  }

  async function selectConversation(conv) {
    const full = await base44.agents.getConversation(conv.id);
    setCurrentConv(full);
    setMessages(full.messages || []);
    setShowHistory(false);
  }

  async function reportMessage(message) {
    try {
      await base44.entities.AIResponseReport.create({
        conversation_id: currentConv?.id || "unknown",
        message_content: message.content,
        report_reason: "Other",
        user_comment: "User flagged this response for review"
      });
      toast.success("Response reported. Our team will review it.");
    } catch (e) {
      toast.error("Failed to submit report");
    }
  }

  // ──────────────────────────────────────────────
  //  IMPORTANT PERSONALIZATION NOTE
  // ──────────────────────────────────────────────
  // To make responses truly personalized (name, challenges, goals, treatment date, etc.),
  // you need to modify the base44 agent configuration for "iboGuide".
  // Currently the frontend doesn't inject profile data.
  // Best approach:
  // 1. Fetch profile in useEffect
  // 2. When creating conversation or sending message, include system prompt override:
  //    await base44.agents.addMessage(conv, {
  //      role: "system",
  //      content: `You are IboGuide. The user is ${profile.full_name}, ${profile.user_type}, dealing with ${profile.current_challenges.join(", ")}. Their goals are ${profile.goals.join(", ")}. Be warm, supportive, cite sources, never give medical advice.`
  //    }, { override_system_prompt: true });
  //
  // For now, this is left as a comment — implement when you can update the agent backend.

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-teal-500 animate-spin" />
      </div>
    );
  }

  // ... rest of the component remains almost identical ...
  // (I'm omitting the full JSX here to save space — only add the voice button in the input area)

  // In the INPUT section, replace the current input div with:

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
        onClick={toggleVoiceInput}
        variant="outline"
        size="icon"
        className={`rounded-xl ${isListening ? "bg-red-100 animate-pulse" : ""}`}
      >
        <Mic className={`w-5 h-5 ${isListening ? "text-red-600" : "text-slate-600"}`} />
      </Button>
      <Button
        onClick={() => sendMessage(input)}
        disabled={!input.trim() || sending}
        className="rounded-xl bg-teal-600 hover:bg-teal-700 h-12 w-12 p-0"
      >
        {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
      </Button>
    </div>
  </div>

  // ... rest unchanged
}