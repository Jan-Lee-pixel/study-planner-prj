import React, { useState } from 'react';
import { CheckCircle, XCircle, RefreshCw, Trophy } from 'lucide-react';

export default function QuizGame({ quizData, onReset }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);

  // Parse JSON if it's a string
  const questions = typeof quizData === 'string' ? JSON.parse(quizData) : quizData;
  const currentQuestion = questions[currentIndex];

  const handleAnswer = (index) => {
    if (isAnswered) return;
    
    setSelectedOption(index);
    setIsAnswered(true);

    if (index === currentQuestion.correctIndex) {
      setScore(s => s + 1);
    }

    // Auto advance after 2 seconds
    setTimeout(() => {
      if (currentIndex < questions.length - 1) {
        setCurrentIndex(c => c + 1);
        setSelectedOption(null);
        setIsAnswered(false);
      } else {
        setShowResult(true);
      }
    }, 2000);
  };

  if (showResult) {
    return (
      <div className="text-center p-8 animate-in fade-in zoom-in duration-300">
        <div className="w-20 h-20 bg-yellow-500/20 text-yellow-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <Trophy size={40} />
        </div>
        <h2 className="text-2xl font-bold text-[var(--text-color)] mb-2">Quiz Completed!</h2>
        <p className="text-[var(--muted-text)] mb-6">You scored {score} out of {questions.length}</p>
        
        <div className="w-full bg-gray-200 rounded-full h-4 mb-8 dark:bg-gray-700">
          <div 
            className="bg-indigo-600 h-4 rounded-full transition-all duration-1000" 
            style={{ width: `${(score / questions.length) * 100}%` }}
          ></div>
        </div>

        <button 
          onClick={onReset}
          className="flex items-center gap-2 mx-auto px-6 py-3 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition-colors"
        >
          <RefreshCw size={20} /> Generate New Quiz
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto">
      <div className="flex justify-between items-center mb-6 text-sm text-[var(--muted-text)]">
        <span>Question {currentIndex + 1}/{questions.length}</span>
        <span>Score: {score}</span>
      </div>

      <div className="mb-8">
        <h3 className="text-xl font-medium text-[var(--text-color)] mb-6 leading-relaxed">
          {currentQuestion.question}
        </h3>

        <div className="space-y-3">
          {currentQuestion.options.map((option, idx) => {
            let btnClass = "w-full p-4 text-left rounded-xl border border-white/10 transition-all ";
            
            if (isAnswered) {
              if (idx === currentQuestion.correctIndex) {
                btnClass += "bg-green-500/20 border-green-500 text-green-500";
              } else if (idx === selectedOption) {
                btnClass += "bg-red-500/20 border-red-500 text-red-500";
              } else {
                btnClass += "opacity-50";
              }
            } else {
              btnClass += "hover:bg-white/5 hover:border-indigo-500/50";
            }

            return (
              <button
                key={idx}
                onClick={() => handleAnswer(idx)}
                disabled={isAnswered}
                className={btnClass}
              >
                <div className="flex items-center justify-between">
                  <span>{option}</span>
                  {isAnswered && idx === currentQuestion.correctIndex && <CheckCircle size={20} />}
                  {isAnswered && idx === selectedOption && idx !== currentQuestion.correctIndex && <XCircle size={20} />}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {isAnswered && (
        <div className="p-4 bg-indigo-500/10 rounded-xl text-sm text-indigo-400 animate-in fade-in slide-in-from-bottom-2">
          <strong>Explanation:</strong> {currentQuestion.explanation}
        </div>
      )}
    </div>
  );
}
