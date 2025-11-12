import React, { useState } from 'react';
import { Sparkles, FileText, BookOpen, Send, Copy, Download, AlertCircle } from 'lucide-react';
import { generateAIContent } from '../services/aiService';

export default function AIAssistant() {
  const [activeTab, setActiveTab] = useState('quiz');
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const tabs = [
    { id: 'quiz', label: 'Generate Quiz', icon: <Sparkles size={16} /> },
    { id: 'summarize', label: 'Summarize Notes', icon: <FileText size={16} /> },
    { id: 'lesson', label: 'Create Lesson', icon: <BookOpen size={16} /> },
  ];

  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    setIsLoading(true);
    setError('');

    try {
      const result = await generateAIContent({ mode: activeTab, prompt: input });
      setOutput(result);
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
      setOutput('');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(output);
  };

  const downloadAsText = () => {
    const element = document.createElement('a');
    const file = new Blob([output], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `${activeTab}-${Date.now()}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="page-shell">
      <h1 className="text-2xl font-semibold text-[var(--text-color)]">AI Study Assistant</h1>

      <div className="flex flex-wrap gap-2 border-b border-white/10 mb-6">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full transition-colors ${
              activeTab === tab.id
                ? 'bg-black/10 text-indigo-600'
                : 'text-[var(--muted-text)] hover:text-[var(--text-color)]'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-panel rounded-2xl overflow-hidden">
          {error && (
            <div className="bg-red-500/10 text-red-500 text-sm flex items-center gap-2 px-4 py-3">
              <AlertCircle size={16} />
              {error}
            </div>
          )}
          <div className="p-4 border-b border-white/10">
            <h2 className="font-semibold text-[var(--text-color)]">Input</h2>
            <p className="text-sm text-[var(--muted-text)] mt-1">
              {activeTab === 'quiz' && 'Enter the topic or content you want to create a quiz for'}
              {activeTab === 'summarize' && 'Paste your notes or text that you want summarized'}
              {activeTab === 'lesson' && 'Enter the topic you want to create a lesson plan for'}
            </p>
          </div>
          <form onSubmit={handleSubmit} className="p-4">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={
                activeTab === 'quiz' ? 'e.g., Photosynthesis in plants' :
                activeTab === 'summarize' ? 'Paste your notes here...' :
                'e.g., Introduction to Calculus'
              }
              className="w-full h-64 p-3 rounded-2xl bg-black/5 border border-white/10 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-400"
              required
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="mt-4 w-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-4 py-2 rounded-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Processing...
                </>
              ) : (
                <>
                  <Send size={16} />
                  {activeTab === 'quiz' && 'Generate Quiz'}
                  {activeTab === 'summarize' && 'Summarize'}
                  {activeTab === 'lesson' && 'Create Lesson'}
                </>
              )}
            </button>
          </form>
        </div>

        <div className="glass-panel rounded-2xl overflow-hidden">
          <div className="p-4 border-b border-white/10 flex items-center justify-between">
            <h2 className="font-semibold text-[var(--text-color)]">Output</h2>
            {output && (
              <div className="flex gap-2">
                <button
                  onClick={copyToClipboard}
                  className="p-2 text-[var(--muted-text)] hover:text-[var(--text-color)] hover:bg-black/5 rounded-full transition-colors"
                  title="Copy to clipboard"
                >
                  <Copy size={16} />
                </button>
                <button
                  onClick={downloadAsText}
                  className="p-2 text-[var(--muted-text)] hover:text-[var(--text-color)] hover:bg-black/5 rounded-full transition-colors"
                  title="Download as text file"
                >
                  <Download size={16} />
                </button>
              </div>
            )}
          </div>
          <div className="p-4">
            {output ? (
              <div className="prose prose-sm max-w-none text-[var(--text-color)]">
                <pre className="whitespace-pre-wrap text-sm leading-relaxed">{output}</pre>
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center text-[var(--muted-text)]">
                <div className="text-center">
                  <div className="text-4xl mb-2">🤖</div>
                  <div>AI-generated content will appear here</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="glass-panel p-4 rounded-2xl">
        <h3 className="font-semibold text-[var(--text-color)] mb-2">💡 Tips for better results</h3>
        <ul className="text-sm text-[var(--muted-text)] space-y-1">
          {activeTab === 'quiz' && (
            <>
              <li>• Be specific about the topic and difficulty level</li>
              <li>• Include key concepts you want to focus on</li>
              <li>• Mention the type of questions you prefer (multiple choice, true/false, etc.)</li>
            </>
          )}
          {activeTab === 'summarize' && (
            <>
              <li>• Provide clear, well-structured text for better summaries</li>
              <li>• Include main headings and key points in your input</li>
              <li>• Specify if you want a particular summary length or focus</li>
            </>
          )}
          {activeTab === 'lesson' && (
            <>
              <li>• Specify the target audience and difficulty level</li>
              <li>• Include learning objectives you want to achieve</li>
              <li>• Mention any specific teaching methods or activities you prefer</li>
            </>
          )}
        </ul>
      </div>
    </div>
  );
}
