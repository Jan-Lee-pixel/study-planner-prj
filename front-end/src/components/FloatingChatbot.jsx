import React, { useEffect, useRef, useState } from "react";
import {
  MessageCircle,
  Send,
  Sparkles,
  X,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";
import { useAIConversation } from "../hooks/useAI";
import { useTasks } from "../useTasks";
import { useAuth } from "../useAuth";

const SUGGESTIONS = [
  "Remind me to study Biology tomorrow",
  "Add a high priority task for Calculus",
  "Summarize my notes",
];

const CHAT_PRIMER = {
  role: "user",
  text: `You are Study Buddy, an upbeat study coach.
  
  MODE 1: TASK CREATION
  If the user asks to add a task/reminder, YOU MUST RETURN STRICT JSON ONLY.
  Format:
  {
    "action": "create_task",
    "task": {
      "title": "Short title",
      "priority": "High" | "Medium" | "Low",
      "dueDate": "YYYY-MM-DD",
      "type": "study" | "assignment" | "exam" | "project",
      "description": "Optional details"
    }
  }
  (Today is ${new Date().toLocaleDateString()})

  MODE 2: CONVERSATION
  For anything else, answer in short, organized paragraphs.`,
};

const INITIAL_MESSAGES = [
  {
    id: "welcome",
    role: "assistant",
    text: "Hi! I'm your Study Buddy. Ask me to plan, summarize, or add tasks for you.",
  },
];

const ErrorModal = ({ error, onClose }) => {
  if (!error) return null;
  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 rounded-2xl animate-in fade-in">
      <div className="glass-panel border border-red-500/30 rounded-2xl p-6 shadow-2xl max-w-xs text-center bg-[#1f2937]/90">
        <div className="w-12 h-12 bg-red-500/20 text-red-500 rounded-full flex items-center justify-center mx-auto mb-3">
          <AlertTriangle size={24} />
        </div>
        <h3 className="text-white font-semibold mb-2">Action Failed</h3>
        <p className="text-gray-400 text-sm mb-4">{error}</p>
        <button 
          onClick={onClose}
          className="w-full py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl text-sm font-medium transition-colors"
        >
          Okay
        </button>
      </div>
    </div>
  );
};

export default function FloatingChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [dbError, setDbError] = useState(null); 
  const endRef = useRef(null);
  const textareaRef = useRef(null);

  const { user } = useAuth();
  const { addTask } = useTasks(user);

  const { messages, isTyping, sendMessage } = useAIConversation({
    primer: CHAT_PRIMER,
    initialMessages: INITIAL_MESSAGES,
  });

  const scrollToEnd = () => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) scrollToEnd();
  }, [isOpen, messages, isTyping]);

  // --- AUTO-GROW LOGIC ---
  const handleInput = (e) => {
    setInput(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'; 
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`; // Max height 120px
    }
  };

  const handleSend = async (event) => {
    if (event) event.preventDefault();
    const text = input.trim();
    if (!text) return;

    setInput("");
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'; // Reset height
    }

    try {
      const responseMsg = await sendMessage(text);
      const cleanText = responseMsg.text.trim();
      
      if (cleanText.startsWith("{") && cleanText.includes("create_task")) {
        try {
          const actionData = JSON.parse(cleanText);
          if (actionData.action === "create_task") {
            const cleanTask = {
              ...actionData.task,
              type: actionData.task.type?.toLowerCase() || 'study',
              priority: actionData.task.priority?.toLowerCase() || 'medium',
            };

            const result = await addTask(cleanTask);

            if (result.success) {
              console.log("Task saved:", result.data);
            } else {
              setDbError(result.error); 
            }
          }
        } catch (e) {
          console.error("JSON Parse Error", e);
        }
      }
    } catch (err) {
      console.error("AI Error:", err);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSuggestion = (suggestion) => {
    setInput(suggestion);
    setTimeout(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
        }
    }, 0);
  };

  const isTaskMessage = (text) => text.trim().startsWith("{") && text.includes("create_task");

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {isOpen && (
        <div className="
          glass-panel 
          w-80 sm:w-96 
          h-[600px] max-h-[80vh] /* Fixed Dimensions */
          p-4 mb-4 
          flex flex-col 
          overflow-hidden 
          animate-in slide-in-from-bottom-5 duration-200 
          relative
        ">
          
          <ErrorModal error={dbError} onClose={() => setDbError(null)} />

          {/* HEADER (Original Glass Design) */}
          <div className="flex items-start justify-between gap-3 pb-4 border-b border-white/10 shrink-0">
            <div>
              <p className="text-xs uppercase tracking-wide text-[var(--muted-text)]">
                Study Buddy
              </p>
              <p className="text-base font-semibold text-[var(--text-color)]">
                How can I help you today?
              </p>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="w-8 h-8 rounded-full bg-black/5 text-[var(--muted-text)] flex items-center justify-center hover:text-[var(--text-color)] transition-colors"
            >
              <X size={16} />
            </button>
          </div>

          {/* MESSAGES AREA (Scrollable) */}
          <div className="flex-1 overflow-y-auto soft-scrollbar py-4 space-y-3 pr-1 min-h-0">
            {messages.map((message, idx) => {
              const isTask = isTaskMessage(message.text);
              let displayContent = message.text;

              if (isTask) {
                try {
                  const data = JSON.parse(message.text);
                  displayContent = (
                    <div className="flex items-center gap-2">
                      <CheckCircle size={16} className="text-green-400 shrink-0" />
                      <span>
                        Added <strong>{data.task.title}</strong> to your list.
                      </span>
                    </div>
                  );
                } catch {
                  displayContent = "Task added!";
                }
              }

              return (
                <div
                  key={idx}
                  className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`rounded-2xl px-3 py-2 text-sm leading-snug max-w-[85%] whitespace-pre-wrap ${
                      message.role === "user"
                        ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white"
                        : isTask 
                          ? "bg-green-500/10 text-green-300 border border-green-500/20"
                          : "bg-white/10 text-[var(--text-color)]"
                    }`}
                  >
                    {displayContent}
                  </div>
                </div>
              );
            })}

            {isTyping && (
              <div className="text-xs text-[var(--muted-text)] flex items-center gap-2 ml-1">
                <Sparkles size={14} className="text-purple-500 animate-pulse" />
                Drafting a response...
              </div>
            )}
            <div ref={endRef} />
          </div>

          {/* FOOTER (Suggestions + Input) */}
          <div className="mt-2 space-y-2 shrink-0">
            <div className="flex flex-wrap gap-2">
              {SUGGESTIONS.map((suggestion, i) => (
                <button
                  key={i}
                  onClick={() => handleSuggestion(suggestion)}
                  className="px-3 py-1.5 rounded-full bg-black/5 text-xs text-[var(--muted-text)] hover:bg-black/10 transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>
            
            {/* INPUT FIELD (Auto-Growing) */}
            <form onSubmit={handleSend} className="flex items-end gap-2">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={handleInput}
                onKeyDown={handleKeyDown}
                placeholder="Ask me anything..."
                rows={1}
                className="flex-1 px-3 py-2.5 rounded-2xl border border-transparent bg-black/5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 text-[var(--text-color)] resize-none overflow-y-auto"
                style={{ 
                    minHeight: '40px',
                    maxHeight: '120px' // Stop growing after ~5 lines
                }}
              />
              <button
                type="submit"
                disabled={!input.trim() || isTyping}
                className="floating-chat-btn disabled:opacity-60 disabled:cursor-not-allowed p-2 bg-indigo-500 text-white rounded-full hover:bg-indigo-600 transition-colors mb-0.5"
              >
                <Send size={18} />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MAIN TOGGLE BUTTON */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="floating-chat-btn bg-indigo-600 text-white p-4 rounded-full shadow-lg hover:bg-indigo-700 transition-transform hover:scale-105 active:scale-95 flex items-center justify-center"
      >
        {isOpen ? <X size={24} /> : <MessageCircle size={24} />}
      </button>
    </div>
  );
}
