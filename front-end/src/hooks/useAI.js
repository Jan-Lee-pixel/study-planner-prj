import { useCallback, useEffect, useRef, useState } from 'react';
import { chatWithAssistant, generateAIContent } from '../services/aiService';

const createId = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).slice(2);
};

export function useAIConversation({ primer, initialMessages = [] }) {
  const [messages, setMessages] = useState(initialMessages);
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState('');
  const messagesRef = useRef(initialMessages);

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  const sendMessage = useCallback(
    async (rawText) => {
      const text = rawText.trim();
      if (!text) return null;

      const userMessage = { id: createId(), role: 'user', text };
      setMessages((prev) => [...prev, userMessage]);
      setIsTyping(true);
      setError('');

      try {
        const conversation = [
          ...(primer ? [primer] : []),
          ...messagesRef.current,
          userMessage,
        ].map((message) => ({
          role: message.role === 'assistant' ? 'model' : 'user',
          content: message.text,
        }));

        const reply = await chatWithAssistant(conversation);
        const assistantMessage = { id: createId(), role: 'assistant', text: reply };
        setMessages((prev) => [...prev, assistantMessage]);
        return assistantMessage;
      } catch (err) {
        setError(err.message || 'Unable to reach the AI assistant.');
        throw err;
      } finally {
        setIsTyping(false);
      }
    },
    [primer]
  );

  const resetConversation = useCallback(
    (nextMessages = initialMessages) => {
      setMessages(nextMessages);
      setError('');
    },
    [initialMessages]
  );

  return {
    messages,
    isTyping,
    error,
    sendMessage,
    resetConversation,
  };
}

export function useAIComposer() {
  const [output, setOutput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const generate = useCallback(
    async ({ mode = 'quiz', prompt }) => {
      const trimmed = prompt?.trim();
      if (!trimmed) {
        setError('Please provide some context for the AI.');
        return null;
      }
      setIsLoading(true);
      setError('');
      try {
        const result = await generateAIContent({ mode, prompt: trimmed });
        setOutput(result);
        return result;
      } catch (err) {
        const message = err.message || 'Something went wrong. Please try again.';
        setError(message);
        setOutput('');
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const clearOutput = useCallback(() => {
    setOutput('');
    setError('');
  }, []);

  return {
    output,
    isLoading,
    error,
    generate,
    clearOutput,
  };
}
