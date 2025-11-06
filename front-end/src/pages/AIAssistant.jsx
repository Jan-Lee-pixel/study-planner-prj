import React, { useState } from 'react';
import { Sparkles, FileText, BookOpen, Send, Copy, Download } from 'lucide-react';

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    setIsLoading(true);
    
    // Simulate AI processing
    setTimeout(() => {
      let result = '';
      
      if (activeTab === 'quiz') {
        result = `# Quiz: ${input}

## Question 1
What is the main concept discussed in "${input}"?
A) Option A
B) Option B
C) Option C
D) Option D

**Answer: C) Option C**

## Question 2
Which of the following best describes...?
A) Option A
B) Option B
C) Option C
D) Option D

**Answer: B) Option B**

## Question 3
True or False: The key principle of "${input}" is...

**Answer: True**

---
*Generated quiz based on your input. Review and modify as needed.*`;
      } else if (activeTab === 'summarize') {
        result = `# Summary: ${input}

## Key Points
- Main concept 1: Brief explanation of the first key point
- Main concept 2: Brief explanation of the second key point
- Main concept 3: Brief explanation of the third key point

## Important Details
- Detail 1: Specific information that supports the main concepts
- Detail 2: Additional context and examples
- Detail 3: Practical applications or implications

## Conclusion
The material covers essential concepts that are fundamental to understanding the subject matter. The key takeaways provide a solid foundation for further study.

---
*AI-generated summary. Please review for accuracy.*`;
      } else if (activeTab === 'lesson') {
        result = `# Lesson Plan: ${input}

## Learning Objectives
By the end of this lesson, students will be able to:
1. Understand the fundamental concepts of ${input}
2. Apply key principles in practical scenarios
3. Analyze and evaluate related problems

## Lesson Structure

### Introduction (10 minutes)
- Overview of the topic
- Connection to previous learning
- Preview of key concepts

### Main Content (30 minutes)
#### Section 1: Core Concepts
- Definition and explanation
- Examples and illustrations
- Interactive discussion

#### Section 2: Practical Applications
- Real-world examples
- Hands-on activities
- Problem-solving exercises

### Conclusion (10 minutes)
- Summary of key points
- Q&A session
- Preview of next lesson

## Assessment
- Formative: Quick check questions throughout
- Summative: End-of-lesson quiz or assignment

## Resources
- Textbook chapters
- Online materials
- Practice exercises

---
*Structured lesson plan ready for implementation.*`;
      }
      
      setOutput(result);
      setIsLoading(false);
    }, 2000);
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
    <div className="max-w-6xl mx-auto px-24 py-15">
      <h1 className="text-2xl font-bold mb-6">AI Study Assistant</h1>

      {/* Tabs */}
      <div className="flex border-b border-stone-200 mb-6">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 border-b-2 transition-colors ${
              activeTab === tab.id
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-stone-600 hover:text-stone-900'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Input Section */}
        <div className="bg-white border border-stone-200 rounded-md">
          <div className="p-4 border-b border-stone-200">
            <h2 className="font-semibold">Input</h2>
            <p className="text-sm text-stone-500 mt-1">
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
              className="w-full h-64 p-3 border border-stone-300 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="mt-4 w-full bg-blue-600 text-white px-4 py-2 rounded-md flex items-center justify-center gap-2 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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

        {/* Output Section */}
        <div className="bg-white border border-stone-200 rounded-md">
          <div className="p-4 border-b border-stone-200 flex items-center justify-between">
            <h2 className="font-semibold">Output</h2>
            {output && (
              <div className="flex gap-2">
                <button
                  onClick={copyToClipboard}
                  className="p-2 text-stone-500 hover:text-stone-700 hover:bg-stone-100 rounded transition-colors"
                  title="Copy to clipboard"
                >
                  <Copy size={16} />
                </button>
                <button
                  onClick={downloadAsText}
                  className="p-2 text-stone-500 hover:text-stone-700 hover:bg-stone-100 rounded transition-colors"
                  title="Download as text file"
                >
                  <Download size={16} />
                </button>
              </div>
            )}
          </div>
          <div className="p-4">
            {output ? (
              <div className="prose prose-sm max-w-none">
                <pre className="whitespace-pre-wrap text-sm leading-relaxed">{output}</pre>
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center text-stone-400">
                <div className="text-center">
                  <div className="text-4xl mb-2">🤖</div>
                  <div>AI-generated content will appear here</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tips Section */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-md p-4">
        <h3 className="font-semibold text-blue-900 mb-2">💡 Tips for better results</h3>
        <ul className="text-sm text-blue-800 space-y-1">
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