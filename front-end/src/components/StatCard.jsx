import React from 'react';

export default function StatCard({ label, value, change, danger = false, icon }) {
  return (
    <div className="bg-white border border-stone-200 rounded-md p-5 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-2">
        <div className="text-xs text-stone-500 uppercase font-semibold tracking-wide">
          {label}
        </div>
        {icon && <div className="text-stone-400">{icon}</div>}
      </div>
      <div className="text-[32px] font-bold mb-1">{value}</div>
      <div
        className={`text-[13px] ${
          danger ? "text-red-600" : "text-green-600"
        }`}
      >
        {change}
      </div>
    </div>
  );
}