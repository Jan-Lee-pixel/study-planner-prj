import React, { useState } from 'react';
import { Check, Trash2, MoreVertical, Target } from 'lucide-react';

function TaskItem({
  task,
  onToggle,
  onOpen,
  onDelete,
  onFocus,
  isFocused = false,
  isPending = false,
  isLast,
}) {
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

  const formattedDate = () => {
    if (!task.due_date && !task.dueDate) return 'No due date';
    return formatDate(task.due_date || task.dueDate);
  };

  const isHighPriority = !task.completed && task.priority === 'high';
  const containerClasses = [
    'flex items-center gap-3 px-4 py-3 transition-colors rounded-2xl',
    !isFocused && !isHighPriority ? 'hover:bg-black/5' : '',
    !isFocused && !isHighPriority && !isLast ? 'border-b border-white/10 rounded-none' : '',
    isFocused ? 'bg-[var(--focus-card-bg)] ring-1 ring-[var(--focus-card-accent)]/50 shadow-inner' : '',
    !isFocused && isHighPriority ? 'bg-[var(--task-highlight-high)] border border-[#fecdd3]' : '',
    !isFocused && !isHighPriority ? `bg-[var(--task-highlight-default)]` : '',
  ]
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim();

  const dueDateClass = `text-xs ${
    isFocused
      ? 'text-[var(--focus-card-accent)]'
      : isHighPriority
      ? 'text-[#fca5a5]'
      : 'text-[var(--muted-text)]'
  }`;

  return (
    <div className={containerClasses}>
      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          onToggle?.(task.id);
        }}
        disabled={isPending}
        aria-pressed={task.completed}
        aria-label={task.completed ? 'Mark task as pending' : 'Mark task as complete'}
        className={`w-4.5 h-4.5 border rounded flex-shrink-0 transition-all flex items-center justify-center ${
          task.completed
            ? 'bg-gradient-to-br from-indigo-500 to-purple-500 border-transparent text-white'
            : 'border-white/20 hover:bg-black/5 text-[var(--muted-text)]'
        } ${isPending ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
      >
        {task.completed && <Check size={12} />}
      </button>
      <div
        className={`flex-1 ${onOpen ? 'cursor-pointer' : ''}`}
        onClick={() => onOpen?.(task.id)}
        role={onOpen ? "button" : undefined}
        tabIndex={onOpen ? 0 : undefined}
        onKeyDown={(e) => {
          if (!onOpen) return;
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onOpen(task.id);
          }
        }}
      >
        <div
          className={`text-sm mb-1 ${
            task.completed ? "line-through opacity-60" : ""
          }`}
        >
          {task.title}
        </div>
        <div className="flex items-center gap-3 text-xs text-[var(--muted-text)]">
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
          <span className={dueDateClass}>
            {task.completed ? "Completed" : `Due: ${formattedDate()}`}
          </span>
        </div>
      </div>
      
      {onFocus && !task.completed && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onFocus(task.id);
          }}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1 transition-colors ${
            isFocused
              ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg shadow-indigo-500/30'
              : 'bg-black/5 text-[var(--muted-text)] border border-white/10 hover:bg-black/10'
          }`}
        >
          <Target size={12} />
          {isFocused ? 'Focused' : 'Focus'}
        </button>
      )}

      {onDelete && (
        <div className="relative">
          <button
            onClick={() => setShowActions(!showActions)}
            className="w-8 h-8 rounded-full hover:bg-black/5 flex items-center justify-center text-[var(--muted-text)] transition-colors"
          >
            <MoreVertical size={14} />
          </button>
          
          {showActions && (
            <div className="absolute right-0 top-8 glass-panel rounded-2xl z-10 min-w-[140px] p-2">
              <button
                onClick={() => {
                  onDelete()
                  setShowActions(false)
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-500 rounded-xl hover:bg-black/5 transition-colors"
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

export default TaskItem;
