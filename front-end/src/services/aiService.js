const GEMINI_MODELS = {
  quiz: 'models/gemini-1.5-flash',
  summarize: 'models/gemini-1.5-flash',
  lesson: 'models/gemini-1.5-flash',
  chat: 'models/gemini-1.5-flash',
};

const MODE_PRIMERS = {
  quiz:
    'You are a helpful study partner that creates concise, well-structured quizzes with answers and explanations.',
  summarize:
    'You are a precise academic summarizer. Produce outline-style notes that retain key details and emphasis.',
  lesson:
    'You design lesson plans that include objectives, pacing, and actionable practice ideas.',
  default:
    'You assist students with study planning. Provide organized, clear responses.',
};

const API_BASE = 'https://generativelanguage.googleapis.com/v1beta';

const getApiKey = () => {
  const key = import.meta.env.VITE_GEMINI_API_KEY;
  if (!key) {
    throw new Error(
      'Missing Gemini API key. Set VITE_GEMINI_API_KEY in your .env file.',
    );
  }
  return key;
};

const extractText = (data) => {
  const parts =
    data?.candidates?.[0]?.content?.parts ??
    data?.candidates?.[0]?.output ??
    [];
  return parts
    .map((part) => {
      if (typeof part === 'string') return part;
      return part?.text || '';
    })
    .join('\n')
    .trim();
};

const buildContent = (role, text) => ({
  role,
  parts: [{ text }],
});

const requestGemini = async ({ model, body }) => {
  const apiKey = getApiKey();
  const response = await fetch(`${API_BASE}/${model}:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(
      error?.error?.message || 'Gemini request failed. Please try again.',
    );
  }

  const data = await response.json();
  const text = extractText(data);

  if (!text) {
    throw new Error('Gemini returned an empty response. Refine your prompt.');
  }

  return text;
};

export async function generateAIContent({ mode, prompt }) {
  if (!prompt?.trim()) {
    throw new Error('Please provide some context for the AI.');
  }

  const model = GEMINI_MODELS[mode] || GEMINI_MODELS.quiz;
  const primer = MODE_PRIMERS[mode] || MODE_PRIMERS.default;
  const content = [
    buildContent(
      'user',
      `${primer}\n\nTopic or input:\n${prompt.trim()}`,
    ),
  ];

  return requestGemini({
    model,
    body: {
      contents: content,
    },
  });
}

export async function chatWithAssistant(history) {
  if (!history?.length) {
    throw new Error('Conversation history is empty.');
  }

  const normalizedHistory = history.map(({ role, content }) =>
    buildContent(role === 'assistant' ? 'model' : 'user', content),
  );

  return requestGemini({
    model: GEMINI_MODELS.chat,
    body: {
      contents: normalizedHistory,
    },
  });
}
