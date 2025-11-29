import { GoogleGenerativeAI } from '@google/generative-ai';
import mammoth from 'mammoth';

const getClient = () => {
  const key = import.meta.env.VITE_GEMINI_API_KEY;
  if (!key) throw new Error('Missing Gemini API key');
  return new GoogleGenerativeAI(key);
};

// Helper: Convert File objects to Gemini-compatible Base64 (For Images/PDFs)
async function fileToGenerativePart(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64Data = reader.result.split(',')[1];
      resolve({
        inlineData: {
          data: base64Data,
          mimeType: file.type,
        },
      });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// Helper: Extract raw text from Word Docs (.docx)
async function extractTextFromDocx(file) {
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer });
  return result.value;
}

// Helper: Read plain text files
async function readTextFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = reject;
    reader.readAsText(file);
  });
}

const MODE_PRIMERS = {
  quiz: `You are a Quiz Engine.
  Analyze the user's input (text or file) and generate a 10-question multiple choice quiz.
  
  CRITICAL: Return ONLY valid JSON. No Markdown. No code blocks.
  Structure:
  [
    {
      "question": "Question text?",
      "options": ["A", "B", "C", "D"],
      "correctIndex": 0,
      "explanation": "Why this answer is right."
    }
  ]
  (Make sure correctIndex corresponds to the options array: 0=A, 1=B etc.)`,
  
  summarize: 'You are a precise academic summarizer. Analyze the text or file. Use bullet points.',
  lesson: 'Create a lesson plan: 1. Objectives, 2. Concepts, 3. Examples.',
  chat: 'You are a helpful study assistant.',
};

export async function generateAIContent({ mode, prompt, file }) {
  try {
    const genAI = getClient();
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.0-flash",
      systemInstruction: MODE_PRIMERS[mode] || MODE_PRIMERS.default
    });

    const contentParts = [];
    
    // 1. Handle User Text Prompt
    if (prompt?.trim()) {
      contentParts.push(prompt.trim());
    }

    // 2. Handle File Uploads (Smart Detection)
    if (file) {
      if (file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
        // It's a DOCX -> Extract text and send as text
        console.log("Converting DOCX to text...");
        const extractedText = await extractTextFromDocx(file);
        contentParts.push("Here is the content of the document:\n" + extractedText);
      } 
      else if (file.type === "text/plain") {
        // It's a .txt -> Read as text
        const textContent = await readTextFile(file);
        contentParts.push("Here is the content of the text file:\n" + textContent);
      }
      else {
        // It's a PDF or Image -> Send as Base64 inlineData
        const filePart = await fileToGenerativePart(file);
        contentParts.push(filePart);
      }
    }

    if (contentParts.length === 0) throw new Error("Provide text or a file.");

    const result = await model.generateContent(contentParts);
    const response = await result.response;
    let text = response.text();

    // Cleanup JSON formatting if needed
    if (mode === 'quiz') {
      text = text.replace(/```json/g, '').replace(/```/g, '').trim();
    }

    return text;
    
  } catch (error) {
    console.error("AI Service Error:", error);
    throw new Error(error.message || "Failed to generate content");
  }
}

// Chat function remains the same...
export async function chatWithAssistant(history) {
    // ... (Your existing chat code) ...
    // Just ensure this function also calls getClient() properly
    if (!history?.length) throw new Error('History empty.');

    try {
        const genAI = getClient();
        const model = genAI.getGenerativeModel({ 
        model: "gemini-2.0-flash",
        systemInstruction: MODE_PRIMERS.chat
        });

        const chatHistory = history.slice(0, -1).map(msg => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }]
        }));

        const chat = model.startChat({ history: chatHistory });
        const lastMsg = history[history.length - 1].content;
        const result = await chat.sendMessage(lastMsg);
        const response = await result.response;
        return response.text();

    } catch (error) {
        console.error("Chat Error:", error);
        throw new Error(error.message || "Failed to chat");
    }
}
