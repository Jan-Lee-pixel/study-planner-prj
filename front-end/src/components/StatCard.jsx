import React from 'react';

export default function StatCard({ label, value, change, danger = false, icon, accent = 'from-indigo-500 to-purple-500' }) {
  return (
    <div className="glass-panel rounded-2xl p-5 hover:-translate-y-0.5 transition-transform">
      <div className="flex items-center justify-between mb-4">
        <div className="text-[11px] uppercase tracking-[0.3em] text-[var(--muted-text)]">
          {label}
        </div>
        {icon && (
          <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${accent} text-white flex items-center justify-center`}>
            {icon}
          </div>
        )}
      </div>
      <div className="text-3xl font-semibold text-[var(--text-color)]">{value}</div>
      <div
        className={`text-sm mt-1 ${
          danger ? "text-red-500" : "text-[var(--muted-text)]"
        }`}
      >
        {change}
      </div>
    </div>
  );
}
