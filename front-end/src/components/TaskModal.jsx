import React, { useEffect, useRef, useState } from 'react';
import { Calendar, Flag, Layers3, PenLine, Pencil, X } from 'lucide-react';

export default function TaskModal({ isOpen, onClose, onSubmit, task = null, initialValues = {} }) {
  const dialogRef = useRef(null);
  const titleId = 'task-modal-title';

  const deriveState = () => ({
    title: task?.title || initialValues.title || "",
    type: task?.type || initialValues.type || "assignment",
    priority: task?.priority || initialValues.priority || "medium",
    dueDate: task?.dueDate || task?.due_date || initialValues.dueDate || "",
    description: task?.description || initialValues.description || "",
  });

  const [formData, setFormData] = useState(deriveState);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setFormData(deriveState());
      setSubmitError('');
      const firstField = dialogRef.current?.querySelector('input, textarea');
      firstField?.focus();
    }
  }, [task, isOpen]);

  useEffect(() => {
    if (!isOpen || !dialogRef.current) return;
    const node = dialogRef.current;
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.dueDate) return;

    setIsSubmitting(true);
    setSubmitError('');

    try {
      const result = await onSubmit(formData);
      if (result?.success) {
        setFormData(deriveState());
        onClose();
      } else {
        setSubmitError(result?.error || 'Failed to save task');
      }
    } catch (error) {
      setSubmitError('An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-start justify-center px-4 py-10">
      <div
        ref={dialogRef}
        className="glass-panel w-full max-w-3xl rounded-3xl overflow-hidden shadow-2xl max-h-[85vh] flex flex-col"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <div>
            <div className="text-xs uppercase tracking-[0.3em] text-[var(--muted-text)]">
              {task ? 'Update task' : 'Create task'}
            </div>
            <div className="flex items-center gap-2 mt-1 text-[var(--text-color)]">
              <PenLine size={16} className="text-indigo-500" />
              <h2 id={titleId} className="text-2xl font-semibold">
                {task ? 'Edit task details' : 'Add a new task'}
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-black/5 text-[var(--muted-text)] flex items-center justify-center hover:bg-black/10 transition-colors"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 px-6 py-5 grid gap-6 lg:grid-cols-[2fr,1fr] overflow-y-auto">
          <div className="space-y-5">
            {submitError && (
              <div className="bg-red-500/10 border border-red-400/50 text-red-500 px-4 py-2 rounded-lg text-sm">
                {submitError}
              </div>
            )}
            <div>
              <label className="flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-[var(--muted-text)] mb-2">
                <Pencil size={14} />
                Task title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., Biology Chapter 5 summary"
                className="w-full px-4 py-3 rounded-2xl bg-black/5 border border-white/10 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                required
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-[var(--muted-text)] mb-2">
                <Layers3 size={14} />
                Task type
              </label>
              <div className="flex gap-2 flex-wrap">
                {['assignment', 'exam', 'project'].map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setFormData({ ...formData, type })}
                    className={`flex-1 min-w-[120px] px-4 py-2 rounded-2xl text-sm font-medium transition-all ${
                      formData.type === type
                        ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg shadow-indigo-500/30'
                        : 'bg-black/5 text-[var(--muted-text)] border border-white/10 hover:bg-black/10'
                    }`}
                  >
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-[var(--muted-text)] mb-2">
                <Flag size={14} />
                Priority
              </label>
              <div className="flex gap-2 flex-wrap">
                {['high', 'medium', 'low'].map((priority) => (
                  <button
                    key={priority}
                    type="button"
                    onClick={() => setFormData({ ...formData, priority })}
                    className={`flex-1 min-w-[120px] px-4 py-2 rounded-2xl text-sm font-medium transition-all ${
                      formData.priority === priority
                        ? priority === 'high'
                          ? 'bg-red-500/20 text-red-500 border border-red-500/40'
                          : priority === 'medium'
                          ? 'bg-amber-500/20 text-amber-500 border border-amber-500/40'
                          : 'bg-emerald-500/20 text-emerald-500 border border-emerald-500/40'
                        : 'bg-black/5 text-[var(--muted-text)] border border-white/10 hover:bg-black/10'
                    }`}
                  >
                    {priority.charAt(0).toUpperCase() + priority.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-5">
            <div>
              <label className="flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-[var(--muted-text)] mb-2">
                <Calendar size={14} />
                Due date *
              </label>
              <input
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                className="w-full px-4 py-3 rounded-2xl bg-black/5 border border-white/10 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                required
              />
            </div>

            <div>
              <label className="text-xs uppercase tracking-[0.3em] text-[var(--muted-text)] mb-2 block">
                Details (optional)
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Add context, resources, or instructions..."
                rows={5}
                className="w-full px-4 py-3 rounded-2xl bg-black/5 border border-white/10 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-3 rounded-2xl border border-white/10 text-sm font-medium text-[var(--text-color)] hover:bg-black/5 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !formData.title.trim() || !formData.dueDate}
                className="flex-1 px-4 py-3 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-sm font-semibold shadow-lg shadow-indigo-500/30 hover:translate-y-[-1px] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {isSubmitting ? 'Saving...' : (task ? 'Update Task' : 'Create Task')}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
