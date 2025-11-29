import { GoogleGenerativeAI } from '@google/generative-ai';
import { wait } from '@testing-library/user-event/dist/cjs/utils/index.js';

// Initialize the API with your key
const getClient = () => {
  const key = import.meta.env.VITE_GEMINI_API_KEY;
  if (!key) throw new Error('Missing Gemini API key in .env');
  return new GoogleGenerativeAI(key);
};

// Define the primers
const MODE_PRIMERS = {
  quiz: `You are a strict teacher. Create a 5-question multiple choice quiz. 
  Format: 
  1. Question
  A) Option
  B) Option
  C) Option
  D) Option
  **Answer: X**`,
  
  summarize: 'You are a precise academic summarizer. Use bullet points and bold key terms.',
  lesson: 'Create a lesson plan with: 1. Objectives, 2. Key Concepts, 3. Examples, 4. Practice.',
  chat: 'You are a helpful study assistant.',
  default: 'Provide organized, clear responses.',
};

export async function generateAIContent({ mode, prompt }) {
  if (!prompt?.trim()) throw new Error('Context required.');

  try {
    const genAI = getClient();
    
    // WE ARE USING YOUR SPECIFIC MODEL HERE
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.0-flash", 
      systemInstruction: MODE_PRIMERS[mode] || MODE_PRIMERS.default
    });

    const result = await model.generateContent(prompt.trim());
    const response = await result.response;
    return response.text();
    
  } catch (error) {
    console.error("AI Service Error:", error);
    throw new Error(error.message || "Failed to generate content");
  }
}

export async function chatWithAssistant(history) {
  if (!history?.length) throw new Error('History empty.');

  try {
    const genAI = getClient();
    
    // UPDATE THIS LINE TOO
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.0-flash",
      systemInstruction: MODE_PRIMERS.chat
    });

    // Convert history to SDK format
    const chatHistory = history.slice(0, -1).map(msg => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }]
    }));

    const chat = model.startChat({ history: chatHistory });
    
    // Send the last message
    const lastMsg = history[history.length - 1].content;
    const result = await chat.sendMessage(lastMsg);
    const response = await result.response;
    return response.text();

  } catch (error) {
    console.error("Chat Error:", error);
    throw new Error(error.message || "Failed to chat");
  }
}
