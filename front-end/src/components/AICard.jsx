import React from 'react';

export default function AICard({ icon, title, description, color, onClick }) {
  const getColorStyles = (color) => {
    const styles = {
      blue: "bg-blue-50 text-blue-700",
      purple: "bg-purple-50 text-purple-700",
      green: "bg-green-50 text-green-700",
    };
    return styles[color] || "bg-gray-50 text-gray-700";
  };

  return (
    <div 
      onClick={onClick}
      className="bg-white border border-stone-200 rounded-md p-6 cursor-pointer hover:shadow-lg hover:-translate-y-0.5 transition-all"
    >
      <div
        className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${getColorStyles(color)}`}
      >
        {icon}
      </div>
      <div className="text-base font-semibold mb-1.5">{title}</div>
      <div className="text-[13px] text-stone-500 leading-snug">
        {description}
      </div>
    </div>
  );
}