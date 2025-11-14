import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Search, ArrowRight, Calendar, X } from 'lucide-react';

const normalizeText = (value) => value?.toLowerCase() || '';

const formatDate = (dateString) => {
  if (!dateString) return 'No due date';
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return 'No due date';
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

export default function QuickSearch({ isOpen, onClose, tasks = [], onSelectTask }) {
  const [query, setQuery] = useState('');
  const inputRef = useRef(null);
  const containerRef = useRef(null);
  const titleId = 'quick-search-title';

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      const id = requestAnimationFrame(() => {
        inputRef.current?.focus();
      });
      return () => cancelAnimationFrame(id);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (event) => {
      if (event.key === 'Escape') {
        onClose?.();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  const filtered = useMemo(() => {
    if (!isOpen) return [];
    if (!query.trim()) return tasks.slice(0, 8);
    const text = normalizeText(query);
    return tasks
      .filter((task) => {
        const title = normalizeText(task.title);
        const description = normalizeText(task.description);
        return title.includes(text) || description.includes(text);
      })
      .slice(0, 10);
  }, [isOpen, query, tasks]);

  useEffect(() => {
    if (!isOpen || !containerRef.current) return;
    const node = containerRef.current;
    const handleKeyDown = (event) => {
      if (event.key !== 'Tab') return;
      const focusable = node.querySelectorAll(
        'button, [href], input, textarea, select, [tabindex]:not([tabindex="-1"])'
      );
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey) {
        if (document.activeElement === first) {
          event.preventDefault();
          last.focus();
        }
      } else if (document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    node.addEventListener('keydown', handleKeyDown);
    return () => node.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSelect = (task) => {
    onSelectTask?.(task.id);
    onClose?.();
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-start justify-center pt-24 px-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose?.();
        }
      }}
    >
      <div
        ref={containerRef}
        className="glass-panel w-full max-w-2xl rounded-3xl overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <h2 id={titleId} className="sr-only">
          Quick search
        </h2>
        <div className="flex items-center gap-2 px-4 py-3 border-b border-white/10">
          <Search size={18} className="text-[var(--muted-text)]" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search tasks by name or description..."
            className="flex-1 bg-transparent text-[var(--text-color)] text-sm focus:outline-none"
            aria-labelledby={titleId}
          />
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-black/5 text-[var(--muted-text)] flex items-center justify-center hover:bg-black/10 transition-colors"
            aria-label="Close search"
          >
            <X size={16} />
          </button>
        </div>
        <div className="max-h-96 overflow-y-auto soft-scrollbar">
          {filtered.length === 0 ? (
            <div className="p-6 text-center text-[var(--muted-text)] text-sm">
              No tasks found for "{query}"
            </div>
          ) : (
            filtered.map((task) => (
              <button
                key={task.id}
                onClick={() => handleSelect(task)}
                className="w-full text-left px-5 py-4 flex items-center justify-between gap-4 hover:bg-black/5 transition-colors"
              >
                <div>
                  <p className="text-[var(--text-color)] font-medium">{task.title}</p>
                  <p className="text-xs text-[var(--muted-text)] mt-1 overflow-hidden text-ellipsis">
                    {task.description || 'No description'}
                  </p>
                  <div className="flex items-center gap-2 text-[11px] mt-2 text-[var(--muted-text)] uppercase tracking-wide">
                    <span className="inline-flex items-center gap-1">
                      <Calendar size={12} />
                      {formatDate(task.dueDate || task.due_date)}
                    </span>
                    <span>{task.type}</span>
                    <span>{task.priority} priority</span>
                  </div>
                </div>
                <ArrowRight size={16} className="text-[var(--muted-text)]" />
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
