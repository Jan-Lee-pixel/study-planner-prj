import React from 'react';

const colorTokens = {
  blue: 'from-sky-500 to-indigo-500',
  purple: 'from-fuchsia-500 to-purple-500',
  green: 'from-emerald-500 to-lime-500',
};

export default function AICard({ icon, title, description, color = 'blue', onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="glass-panel rounded-2xl p-5 text-left hover:-translate-y-0.5 transition-all"
    >
      <div
        className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${colorTokens[color] || colorTokens.blue} text-white flex items-center justify-center mb-4`}
      >
        {icon}
      </div>
      <div className="text-base font-semibold text-[var(--text-color)] mb-1">
        {title}
      </div>
      <p className="text-sm text-[var(--muted-text)] leading-snug">
        {description}
      </p>
    </button>
  );
}
