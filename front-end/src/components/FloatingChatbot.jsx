import React, { useMemo, useRef, useState } from 'react';
import { MessageCircle, Send, Sparkles, X, AlertCircle } from 'lucide-react';
import { chatWithAssistant } from '../services/aiService';

const createId = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).slice(2);
};

const SUGGESTIONS = [
  'Create a quiz for biology chapter 3',
  'Summarize my world history notes',
  'Plan a study sprint for calculus',
];

const CHAT_PRIMER = {
  role: 'user',
  content:
    'You are Study Buddy, an upbeat study coach. Answer in short, organized paragraphs or bullet points with clear next steps.',
};

export default function FloatingChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      role: 'assistant',
      text: 'Hi! I’m your Study Buddy. Ask me to plan, summarize, or quiz you anytime.',
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState('');
  const endRef = useRef(null);

  const scrollToEnd = () => {
    if (typeof requestAnimationFrame !== 'undefined') {
      requestAnimationFrame(() => {
        endRef.current?.scrollIntoView({ behavior: 'smooth' });
      });
    } else {
      endRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSend = (event) => {
    event.preventDefault();
    sendMessage(input);
  };

  const sendMessage = async (rawText) => {
    const text = rawText.trim();
    if (!text) return;

    const userMessage = {
      id: createId(),
      role: 'user',
      text,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);
    setError('');
    scrollToEnd();

    try {
      const conversation = [
        CHAT_PRIMER,
        ...messages,
        userMessage,
      ].map((message) => ({
        role: message.role,
        content: message.text,
      }));
      const reply = await chatWithAssistant(conversation);
      setMessages((prev) => [
        ...prev,
        { id: createId(), role: 'assistant', text: reply },
      ]);
    } catch (err) {
      setError(err.message || 'Unable to reach the AI assistant.');
    } finally {
      setIsTyping(false);
      scrollToEnd();
    }
  };

  const handleSuggestion = (suggestion) => {
    setInput(suggestion);
  };

  const chatButtonLabel = useMemo(
    () => (isOpen ? 'Close assistant' : 'Open assistant'),
    [isOpen],
  );

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {isOpen && (
        <div className="glass-panel w-80 sm:w-96 p-4 mb-4 flex flex-col overflow-hidden">
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
              aria-label="Close assistant"
            >
              <X size={16} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto soft-scrollbar py-4 space-y-3 pr-1">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`rounded-2xl px-3 py-2 text-sm leading-snug max-w-[85%] ${
                    message.role === 'user'
                      ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white'
                      : 'bg-white/10 text-[var(--text-color)]'
                  }`}
                >
                  {message.text}
                </div>
              </div>
            ))}
            {error && (
              <div className="flex items-center gap-2 text-xs text-red-500">
                <AlertCircle size={14} />
                {error}
              </div>
            )}
            {isTyping && (
              <div className="text-xs text-[var(--muted-text)] flex items-center gap-2">
                <Sparkles size={14} className="text-purple-500 animate-pulse" />
                Drafting a response...
              </div>
            )}
            <span ref={endRef} />
          </div>

          <div className="mt-2 space-y-2">
            <div className="flex flex-wrap gap-2">
              {SUGGESTIONS.map((suggestion) => (
                <button
                  type="button"
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
                className="flex-1 px-3 py-2 rounded-2xl border border-transparent bg-black/5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
              <button
                type="submit"
                className="floating-chat-btn disabled:opacity-60 disabled:cursor-not-allowed"
                disabled={!input.trim() || isTyping}
                aria-label="Send message"
              >
                <Send size={18} />
              </button>
            </form>
          </div>
        </div>
      )}

      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="floating-chat-btn"
        aria-label={chatButtonLabel}
      >
        <MessageCircle size={22} />
      </button>
    </div>
  );
}
