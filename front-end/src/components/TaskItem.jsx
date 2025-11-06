import React, { useState } from 'react';
import { Check, Trash2, MoreVertical } from 'lucide-react';

export default function TaskItem({ task, onToggle, onEdit, onDelete, isLast }) {
  const [showActions, setShowActions] = useState(false);
  const getTypeStyles = (type) => {
    const styles = {
      assignment: "bg-blue-50 text-blue-700",
      exam: "bg-pink-50 text-pink-700",
      project: "bg-purple-50 text-purple-700",
    };
    return styles[type] || "bg-gray-50 text-gray-700";
  };

  const getPriorityStyles = (priority) => {
    const styles = {
      high: "bg-red-50 text-red-700",
      medium: "bg-orange-50 text-orange-700",
      low: "bg-green-50 text-green-700",
    };
    return styles[priority] || "bg-gray-50 text-gray-700";
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  return (
    <div
      className={`flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-stone-50 transition-colors ${
        !isLast ? "border-b border-stone-200" : ""
      }`}
    >
      <div
        onClick={onToggle}
        className={`w-4.5 h-4.5 border-1.5 rounded flex-shrink-0 cursor-pointer transition-all ${
          task.completed
            ? "bg-blue-600 border-blue-600 flex items-center justify-center"
            : "border-stone-300 hover:bg-stone-100"
        }`}
      >
        {task.completed && <Check size={12} className="text-white" />}
      </div>
      <div className="flex-1">
        <div
          className={`text-sm mb-1 ${
            task.completed ? "line-through opacity-60" : ""
          }`}
        >
          {task.title}
        </div>
        <div className="flex items-center gap-3 text-xs text-stone-500">
          <span
            className={`px-2 py-0.5 rounded text-[11px] font-medium ${getTypeStyles(task.type)}`}
          >
            {task.type.charAt(0).toUpperCase() + task.type.slice(1)}
          </span>
          {!task.completed && (
            <span
              className={`px-2 py-0.5 rounded text-[11px] font-medium ${getPriorityStyles(task.priority)}`}
            >
              {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)} Priority
            </span>
          )}
          <span>{task.completed ? "Completed" : `Due: ${formatDate(task.due_date || task.dueDate)}`}</span>
        </div>
      </div>
      
      {onDelete && (
        <div className="relative">
          <button
            onClick={() => setShowActions(!showActions)}
            className="w-8 h-8 rounded hover:bg-stone-100 flex items-center justify-center text-stone-400 hover:text-stone-600 transition-colors"
          >
            <MoreVertical size={14} />
          </button>
          
          {showActions && (
            <div className="absolute right-0 top-8 bg-white border border-stone-200 rounded-md shadow-lg z-10 min-w-[120px]">
              <button
                onClick={() => {
                  onDelete()
                  setShowActions(false)
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
              >
                <Trash2 size={14} />
                Delete
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}