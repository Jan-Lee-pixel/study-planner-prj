import React, { useMemo, useState } from 'react';
import { ArrowLeft, Calendar, CheckCircle2, Clock, Edit3, Flag, Trash2 } from 'lucide-react';
import TaskModal from '../components/TaskModal';

const formatDate = (value) => {
  if (!value) return 'No due date';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'No due date';
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
};

const formatRelative = (value) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const diff = date.getTime() - Date.now();
  const days = Math.round(diff / (1000 * 60 * 60 * 24));
  if (days === 0) return 'Due today';
  if (days > 0) return `Due in ${days} day${days === 1 ? '' : 's'}`;
  return `${Math.abs(days)} day${Math.abs(days) === 1 ? '' : 's'} overdue`;
};

export default function TaskDetail({
  task,
  onBack,
  onToggleTask,
  onDeleteTask,
  onUpdateTask,
}) {
  const [isEditing, setIsEditing] = useState(false);
  const dueDate = task?.dueDate || task?.due_date;

  const meta = useMemo(() => {
    if (!task) return [];
    const createdAt = task.created_at || task.createdAt;
    return [
      {
        label: 'Created',
        value: createdAt
          ? new Date(createdAt).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })
          : 'Unknown',
        icon: <Clock size={16} />,
      },
      {
        label: 'Priority',
        value: task.priority?.charAt(0).toUpperCase() + task.priority?.slice(1),
        icon: <Flag size={16} />,
      },
      {
        label: 'Type',
        value: task.type?.charAt(0).toUpperCase() + task.type?.slice(1),
        icon: <Calendar size={16} />,
      },
    ];
  }, [task]);

  if (!task) {
    return (
      <div className="page-shell">
        <div className="glass-panel p-8 text-center text-[var(--muted-text)]">
          Task not found. Please go back and select another task.
        </div>
      </div>
    );
  }

  const handleDelete = async () => {
    if (!window.confirm('Delete this task permanently?')) return;
    const result = await onDeleteTask?.(task.id);
    if (result?.success || result === undefined) {
      onBack?.();
    }
  };

  const handleUpdate = async (payload) => {
    const result = await onUpdateTask?.(task.id, payload);
    if (result?.success) {
      setIsEditing(false);
      return result;
    }
    return result;
  };

  return (
    <div className="page-shell">
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="w-10 h-10 rounded-full bg-black/5 text-[var(--muted-text)] flex items-center justify-center hover:bg-black/10 transition-colors"
          aria-label="Go back"
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-[var(--muted-text)]">
            Task Detail
          </p>
          <h1 className="text-3xl font-semibold text-[var(--text-color)] mt-1">
            {task.title}
          </h1>
          <p className="text-sm text-[var(--muted-text)]">{formatRelative(dueDate)}</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-[2fr,1fr]">
        <div className="glass-panel rounded-3xl p-6 space-y-6">
          <div className="flex flex-wrap gap-3">
            <span
              className={`px-3 py-1 rounded-full text-xs font-semibold ${
                task.completed
                  ? 'bg-emerald-500/20 text-emerald-500'
                  : 'bg-amber-500/20 text-amber-500'
              }`}
            >
              {task.completed ? 'Completed' : 'In progress'}
            </span>
            <span className="px-3 py-1 rounded-full text-xs bg-black/5 text-[var(--muted-text)]">
              Due {formatDate(dueDate)}
            </span>
          </div>
          <p className="text-sm leading-relaxed text-[var(--text-color)] whitespace-pre-line">
            {task.description || 'No additional description provided.'}
          </p>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => onToggleTask?.(task.id)}
              className="px-4 py-2 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-sm font-medium flex items-center gap-2"
            >
              <CheckCircle2 size={16} />
              {task.completed ? 'Mark as pending' : 'Mark complete'}
            </button>
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 rounded-full border border-white/10 text-sm flex items-center gap-2"
            >
              <Edit3 size={16} />
              Edit task
            </button>
            <button
              onClick={handleDelete}
              className="px-4 py-2 rounded-full border border-red-400/40 text-sm text-red-500 flex items-center gap-2"
            >
              <Trash2 size={16} />
              Delete
            </button>
          </div>
        </div>

        <div className="glass-panel rounded-3xl p-6 space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-[0.3em] text-[var(--muted-text)]">
            Snapshot
          </h2>
          <div className="space-y-3">
            {meta.map((item) => (
              <div key={item.label} className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-black/5 flex items-center justify-center text-indigo-500">
                  {item.icon}
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-[var(--muted-text)]">
                    {item.label}
                  </p>
                  <p className="text-sm text-[var(--text-color)]">{item.value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <TaskModal
        isOpen={isEditing}
        onClose={() => setIsEditing(false)}
        onSubmit={(formData) => handleUpdate(formData)}
        task={task}
      />
    </div>
  );
}
