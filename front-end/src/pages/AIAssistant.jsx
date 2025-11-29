import React, { useState, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { generateAIContent } from "../services/aiService";
import QuizGame from "../components/QuizGame";

// 1. FIXED: Consolidated all icons into a single import to prevent errors
import {
  Sparkles,
  FileText,
  BookOpen,
  Send,
  Paperclip,
  X,
  Check,
  Copy,
  Download,
  Maximize2,
  Minimize2,
  AlertCircle
} from "lucide-react";

export default function AIAssistant() {
  const tabs = [
    { id: "quiz", label: "Generate Quiz", icon: <Sparkles size={16} /> },
    { id: "summarize", label: "Summarize", icon: <FileText size={16} /> },
    { id: "lesson", label: "Lesson Plan", icon: <BookOpen size={16} /> },
  ];

  // State Management
  const [activeTab, setActiveTab] = useState(tabs[0].id);
  const [input, setInput] = useState("");
  const [file, setFile] = useState(null);
  const [output, setOutput] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);
  const [copied, setCopied] = useState(false);
  
  // Drag & Drop States
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  // --- HANDLERS ---

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!input.trim() && !file) return;

    setIsLoading(true);
    setError("");
    setOutput(null);

    try {
      const result = await generateAIContent({
        mode: activeTab,
        prompt: input,
        file: file,
      });
      setOutput(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files?.[0]) setFile(e.target.files[0]);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files?.[0]) setFile(e.dataTransfer.files[0]);
  };

  const handleCopy = async () => {
    if (!output) return;
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!output) return;

    const element = document.createElement("a");
    const fileBlob = new Blob([output], { type: "text/markdown" });
    element.href = URL.createObjectURL(fileBlob);
    element.download = `${activeTab}-${Date.now()}.md`;

    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  // --- RENDER ---

  return (
    <div className="page-shell max-w-6xl mx-auto">
      <h1 className="text-2xl font-semibold text-[var(--text-color)] mb-6">AI Study Assistant</h1>

      {/* TABS */}
      <div className="flex gap-2 mb-6 border-b border-white/10 pb-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id);
              setOutput(null);
              setIsExpanded(false);
              setError("");
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-t-lg transition-all ${
              activeTab === tab.id
                ? "bg-indigo-500/10 text-indigo-400 border-b-2 border-indigo-500"
                : "text-[var(--muted-text)] hover:text-[var(--text-color)]"
            }`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[600px]">
        
        {/* LEFT COLUMN: INPUT (Hidden when Expanded) */}
        <div className={`flex flex-col gap-4 ${isExpanded ? "hidden" : "flex"}`}>
          <div
            className={`glass-panel flex-1 rounded-2xl p-4 flex flex-col transition-all ${
              isDragging ? "border-2 border-dashed border-indigo-500 bg-indigo-500/5" : ""
            }`}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
          >
            <div className="flex-1">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={`Ask me to generate a ${activeTab}... (or drop a file here)`}
                className="w-full h-full bg-transparent resize-none focus:outline-none text-[var(--text-color)] placeholder-gray-500"
              />
            </div>

            {/* File Preview Pill */}
            {file && (
              <div className="flex items-center gap-2 bg-indigo-500/20 text-indigo-300 px-3 py-2 rounded-lg text-sm w-fit mb-4">
                <Paperclip size={14} />
                <span className="truncate max-w-[200px]">{file.name}</span>
                <button onClick={() => setFile(null)} className="hover:text-white">
                  <X size={14} />
                </button>
              </div>
            )}

            {/* Action Bar */}
            <div className="flex items-center justify-between border-t border-white/10 pt-4">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-full transition-colors"
                  title="Upload File"
                >
                  <Paperclip size={20} />
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  className="hidden"
                  accept="image/*,application/pdf,text/plain,.docx"
                />
              </div>

              <button
                onClick={handleGenerate}
                disabled={isLoading || (!input && !file)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-full flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {isLoading ? (
                  <div className="animate-spin w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />
                ) : (
                  <Send size={16} />
                )}
                Generate
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: OUTPUT (Full Width when Expanded) */}
        <div
          className={`glass-panel rounded-2xl overflow-hidden flex flex-col relative h-full transition-all duration-300 ${
            isExpanded ? "lg:col-span-2" : ""
          }`}
        >
          {/* Header Action Bar */}
          {output && !isLoading && (
            <div className="flex items-center justify-between px-6 py-3 border-b border-white/10 bg-black/20">
              <span className="text-xs font-medium text-indigo-300 uppercase tracking-wider">
                {activeTab === "quiz" ? "Interactive Quiz" : "Generated Content"}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopy}
                  className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                  title="Copy"
                >
                  {copied ? <Check size={16} className="text-green-400" /> : <Copy size={16} />}
                </button>
                <button
                  onClick={handleDownload}
                  className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                  title="Download"
                >
                  <Download size={16} />
                </button>

                {/* Maximize/Minimize Toggle */}
                <div className="w-px h-4 bg-white/10 mx-1"></div>
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className={`p-2 rounded-lg transition-colors ${
                    isExpanded
                      ? "text-indigo-400 bg-indigo-500/10"
                      : "text-gray-400 hover:text-white hover:bg-white/10"
                  }`}
                  title={isExpanded ? "Restore View" : "Full Screen"}
                >
                  {isExpanded ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                </button>
              </div>
            </div>
          )}

          {/* Empty State */}
          {!output && !isLoading && !error && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-[var(--muted-text)] opacity-30">
              <Sparkles size={48} className="mb-4" />
              <p>AI Output will appear here</p>
            </div>
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-sm z-10">
              <div className="animate-pulse text-indigo-400 font-medium">Thinking...</div>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="p-4 m-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl flex items-center gap-2">
              <AlertCircle size={20} />
              {error}
            </div>
          )}

          {/* Content Renderer */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
            {output && activeTab === "quiz" ? (
              <QuizGame quizData={output} onReset={() => setOutput(null)} />
            ) : (
              output && (
                <article className="prose prose-invert prose-indigo max-w-none prose-p:leading-relaxed prose-pre:bg-black/50 prose-pre:border prose-pre:border-white/10">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      ul: ({ node, ...props }) => (
                        <ul className="list-disc pl-6 space-y-2 my-4" {...props} />
                      ),
                      ol: ({ node, ...props }) => (
                        <ol className="list-decimal pl-6 space-y-2 my-4" {...props} />
                      ),
                      li: ({ node, ...props }) => <li className="pl-1" {...props} />,
                      strong: ({ node, ...props }) => (
                        <strong className="font-bold text-indigo-400" {...props} />
                      ),
                      h1: ({ node, ...props }) => (
                        <h1 className="text-3xl font-bold border-b border-white/10 pb-2 mt-6 mb-4" {...props} />
                      ),
                      h2: ({ node, ...props }) => (
                        <h2 className="text-2xl font-bold mt-8 mb-4 text-indigo-300" {...props} />
                      ),
                      h3: ({ node, ...props }) => (
                        <h3 className="text-xl font-bold mt-6 mb-3 text-indigo-200" {...props} />
                      ),
                      blockquote: ({ node, ...props }) => (
                        <blockquote className="border-l-4 border-indigo-500 pl-4 italic text-gray-400 my-4" {...props} />
                      ),
                    }}
                  >
                    {output}
                  </ReactMarkdown>
                </article>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
