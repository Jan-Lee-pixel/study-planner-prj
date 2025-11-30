import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  MessageCircle,
  Send,
  Sparkles,
  X,
  AlertCircle,
  CheckCircle,
  AlertTriangle
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
  
  You have two modes:

  MODE 1: TASK CREATION
  If the user asks to add a task/reminder, YOU MUST RETURN STRICT JSON ONLY (no markdown).
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
  For anything else, answer in short, organized paragraphs or bullet points.`,
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
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-[#1f2937] border border-red-500/30 rounded-2xl p-6 shadow-2xl max-w-xs text-center">
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

  const { user } = useAuth();
  const { addTask } = useTasks(user);

  const { messages, isTyping, error, sendMessage } = useAIConversation({
    primer: CHAT_PRIMER,
    initialMessages: INITIAL_MESSAGES,
  });

  const scrollToEnd = () => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) scrollToEnd();
  }, [isOpen, messages, isTyping]);

  const handleSend = async (event) => {
    event.preventDefault();
    const text = input.trim();
    if (!text) return;

    setInput("");

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
              console.error("DB Error:", result.error);
              setDbError(result.error); 
            }
          }
        } catch (e) {
          console.error("JSON Parse Error", e);
        }
      }
    } catch (err) {
      console.error("Transmission Error:", err);
    }
  };

  const handleSuggestion = (suggestion) => {
    setInput(suggestion);
  };

  const isTaskMessage = (text) =>
    text.trim().startsWith("{") && text.includes("create_task");

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {isOpen && (
        <div className="glass-panel w-80 sm:w-96 p-4 mb-4 flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 duration-200 relative">
          
          <ErrorModal error={dbError} onClose={() => setDbError(null)} />

          <div className="flex items-start justify-between gap-3 pb-4 border-b border-white/10">
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

          <div className="flex-1 overflow-y-auto soft-scrollbar py-4 space-y-3 pr-1 h-80">
            {messages.map((message) => {
              const isTask = isTaskMessage(message.text);
              let displayContent = message.text;

              if (isTask) {
                try {
                  const data = JSON.parse(message.text);
                  displayContent = (
                    <div className="flex items-center gap-2">
                      <CheckCircle
                        size={16}
                        className="text-green-400 shrink-0"
                      />
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
                  key={message.id}
                  className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`rounded-2xl px-3 py-2 text-sm leading-snug max-w-[85%] ${message.role === "user"
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

            {error && (
              <div className="flex items-center gap-2 text-xs text-red-500">
                <AlertCircle size={14} /> {error}
              </div>
            )}

            {isTyping && (
              <div className="text-xs text-[var(--muted-text)] flex items-center gap-2 ml-1">
                <Sparkles size={14} className="text-purple-500 animate-pulse" />
                Drafting a response...
              </div>
            )}
            <div ref={endRef} />
          </div>

          <div className="mt-2 space-y-2">
            <div className="flex flex-wrap gap-2">
              {SUGGESTIONS.map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => handleSuggestion(suggestion)}
                  className="px-3 py-1.5 rounded-full bg-black/5 text-xs text-[var(--muted-text)] hover:bg-black/10 transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>
            <form onSubmit={handleSend} className="flex items-center gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask me anything..."
                className="flex-1 px-3 py-2 rounded-2xl border border-transparent bg-black/5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 text-[var(--text-color)]"
              />
              <button
                type="submit"
                className="floating-chat-btn disabled:opacity-60 disabled:cursor-not-allowed p-2 bg-indigo-500 text-white rounded-full hover:bg-indigo-600 transition-colors"
                disabled={!input.trim() || isTyping}
              >
                <Send size={18} />
              </button>
            </form>
          </div>
        </div>
      )}

      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="floating-chat-btn bg-indigo-600 text-white p-4 rounded-full shadow-lg hover:bg-indigo-700 transition-transform hover:scale-105 active:scale-95"
      >
        <MessageCircle size={24} />
      </button>
    </div>
  );
}
