import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Mic, Volume2, Type, X } from "lucide-react";

export default function AccessibilityControls({ onVoiceInput, showVoiceInput = true }) {
  const [fontSize, setFontSize] = useState("normal");
  const [isListening, setIsListening] = useState(false);
  const [showControls, setShowControls] = useState(false);

  useEffect(() => {
    // Apply font size to document
    const sizes = { small: "14px", normal: "16px", large: "18px", xlarge: "20px" };
    document.documentElement.style.fontSize = sizes[fontSize];
  }, [fontSize]);

  const startVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert("Voice input not supported in your browser. Try Chrome or Safari.");
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.continuous = false;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      if (onVoiceInput) onVoiceInput(transcript);
    };

    recognition.start();
  };

  return (
    <>
      {/* Floating Accessibility Button */}
      <button
        onClick={() => setShowControls(!showControls)}
        className="fixed bottom-24 right-4 md:bottom-6 md:right-6 z-40 w-12 h-12 rounded-full bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 shadow-lg flex items-center justify-center hover:scale-110 transition-transform"
        aria-label="Accessibility Controls"
      >
        <Type className="w-5 h-5" />
      </button>

      {/* Controls Panel */}
      {showControls && (
        <div className="fixed bottom-40 right-4 md:bottom-20 md:right-6 z-50 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-4 w-64">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-sm text-slate-900 dark:text-white">Accessibility</h3>
            <button
              onClick={() => setShowControls(false)}
              className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-4">
            {/* Font Size */}
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">Text Size</p>
              <div className="grid grid-cols-4 gap-2">
                {['small', 'normal', 'large', 'xlarge'].map(size => (
                  <button
                    key={size}
                    onClick={() => setFontSize(size)}
                    className={`py-2 px-1 rounded-lg text-xs font-medium transition-colors ${
                      fontSize === size
                        ? "bg-teal-600 text-white"
                        : "bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300"
                    }`}
                  >
                    {size === 'xlarge' ? 'XL' : size[0].toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            {/* Voice Input */}
            {showVoiceInput && (
              <Button
                onClick={startVoiceInput}
                disabled={isListening}
                className="w-full rounded-xl bg-violet-600 hover:bg-violet-700 gap-2"
              >
                <Mic className={`w-4 h-4 ${isListening ? 'animate-pulse' : ''}`} />
                {isListening ? "Listening..." : "Voice Input"}
              </Button>
            )}

            {/* Screen Reader Note */}
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Screen reader optimized. Use keyboard navigation: Tab to move, Enter to activate.
            </p>
          </div>
        </div>
      )}
    </>
  );
}