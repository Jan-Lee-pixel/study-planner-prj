import React, { useMemo, useState } from 'react';
import {
  Plus,
  Sparkles,
  FileText,
  BookOpen,
  CheckSquare,
  Calendar,
  BarChart3,
} from 'lucide-react';
import StatCard from '../components/StatCard';
import TaskItem from '../components/TaskItem';
import TaskModal from '../components/TaskModal';
import AICard from '../components/AICard';

const formatTimeAgo = (timestamp) => {
  if (!timestamp) return 'Just now';
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) return 'Just now';
  const diffMs = Date.now() - date.getTime();
  const minutes = Math.round(diffMs / (1000 * 60));
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  return `${days}d ago`;
};

const formatShortDate = (value) => {
  if (!value) return 'No due date';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'No due date';
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
};

const formatDayLabel = (value) => {
  if (!value) return 'No date';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'No date';
  return date.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' });
};

const formatTimeLabel = (value) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric' });
};

const isWithinNextDays = (value, days = 7) => {
  if (!value) return false;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return false;
  const now = new Date();
  const limit = new Date();
  limit.setDate(limit.getDate() + days);
  return date >= now && date <= limit;
};

export default function Dashboard({
  tasks,
  onToggleTask,
  onAddTask,
  onNavigateAI,
  onOpenTask,
  focusTaskId,
  onFocusChange,
  onManageFocus,
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const stats = {
    total: tasks.length,
    completed: tasks.filter((t) => t.completed).length,
    inProgress: tasks.filter((t) => !t.completed && new Date(t.dueDate) >= new Date()).length,
    overdue: tasks.filter((t) => !t.completed && new Date(t.dueDate) < new Date()).length,
  };

  const completionRate = stats.total ? Math.round((stats.completed / stats.total) * 100) : 0;

  const handleCreateTask = async (taskData) => {
    const result = await onAddTask(taskData);
    if (result?.success) {
      setIsModalOpen(false);
    }
  };

  const statCards = [
    {
      label: 'Total Tasks',
      value: stats.total,
      change: stats.total ? '+3 this week' : 'Create your first task',
      icon: <CheckSquare size={16} />,
      accent: 'from-sky-500 to-indigo-500',
    },
    {
      label: 'Completed',
      value: stats.completed,
      change: `${stats.completed ? Math.round((stats.completed / (stats.total || 1)) * 100) : 0}% done`,
      icon: <CheckSquare size={16} />,
      accent: 'from-emerald-500 to-lime-500',
    },
    {
      label: 'In Progress',
      value: stats.inProgress,
      change: 'Due this week',
      icon: <Calendar size={16} />,
      accent: 'from-amber-500 to-orange-500',
    },
    {
      label: 'Overdue',
      value: stats.overdue,
      change: 'Needs attention',
      danger: stats.overdue > 0,
      icon: <BarChart3 size={16} />,
      accent: 'from-rose-500 to-red-500',
    },
  ];

  const upcomingTasks = useMemo(() => {
    return [...tasks]
      .filter((task) => !task.completed)
      .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
      .slice(0, 5);
  }, [tasks]);

  const focusTask = useMemo(() => {
    return tasks.find((task) => String(task.id) === String(focusTaskId)) || upcomingTasks[0] || tasks[0];
  }, [tasks, focusTaskId, upcomingTasks]);

  const priorityBreakdown = useMemo(() => {
    const base = { high: 0, medium: 0, low: 0 };
    tasks.forEach((task) => {
      if (task.priority && base[task.priority] !== undefined) {
        base[task.priority] += 1;
      }
    });
    const total = base.high + base.medium + base.low || 1;
    return {
      data: base,
      percent: {
        high: Math.round((base.high / total) * 100),
        medium: Math.round((base.medium / total) * 100),
        low: Math.round((base.low / total) * 100),
      },
    };
  }, [tasks]);

  const typeBreakdown = useMemo(() => {
    const base = { assignment: 0, exam: 0, project: 0 };
    tasks.forEach((task) => {
      if (task.type && base[task.type] !== undefined) {
        base[task.type] += 1;
      }
    });
    const total = base.assignment + base.exam + base.project || 1;
    return Object.entries(base).map(([type, count]) => ({
      type,
      count,
      percent: Math.round((count / total) * 100),
    }));
  }, [tasks]);

  const weekTimeline = useMemo(() => {
    return tasks
      .filter((task) => !task.completed && isWithinNextDays(task.dueDate, 7))
      .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
      .slice(0, 6);
  }, [tasks]);

  const recentTasks = useMemo(() => {
    return upcomingTasks.length > 0 ? upcomingTasks : tasks.slice(0, 5);
  }, [upcomingTasks, tasks]);

  const activityLog = useMemo(() => {
    return tasks
      .map((task) => {
        const stamp = task.updated_at || task.created_at || task.dueDate || task.due_date;
        return {
          id: task.id,
          icon: task.completed ? <CheckSquare size={14} /> : <Calendar size={14} />,
          title: task.completed ? `Completed ${task.title}` : task.title,
          description: task.completed
            ? 'Marked as done'
            : `Due ${formatShortDate(task.dueDate || task.due_date)}`,
          time: formatTimeAgo(stamp),
          raw: stamp ? new Date(stamp) : new Date(),
        };
      })
      .sort((a, b) => b.raw - a.raw)
      .slice(0, 5);
  }, [tasks]);

  const heroSubtitle = stats.total
    ? "Here's what's on deck for you today."
    : 'Start by creating your first task to stay on track.';

  const completionBackground = {
    background: `conic-gradient(rgba(255,255,255,0.6) ${completionRate * 3.6}deg, rgba(255,255,255,0.2) ${completionRate * 3.6}deg)`,
  };

  const quickShortcuts = [
    {
      id: 'quiz',
      icon: <Sparkles size={16} />,
      title: 'Generate Quiz',
      description: 'Turn your notes into practice drills.',
      action: () => onNavigateAI?.('quiz'),
    },
    {
      id: 'summarize',
      icon: <FileText size={16} />,
      title: 'Summarize Notes',
      description: 'Condense key ideas for revision.',
      action: () => onNavigateAI?.('summarize'),
    },
    {
      id: 'lesson',
      icon: <BookOpen size={16} />,
      title: 'Plan Lesson',
      description: 'Break down a topic into steps.',
      action: () => onNavigateAI?.('lesson'),
    },
  ];

  return (
    <div className="page-shell space-y-6">
      <section className="grid gap-4 xl:grid-cols-[1.4fr,1fr]">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-500 via-purple-500 to-fuchsia-600 text-white shadow-xl">
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.5),_transparent_65%)]" />
          <div className="relative z-10 p-8 flex flex-col gap-8 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-white/70">Study Planner</p>
              <h1 className="mt-2 text-3xl font-semibold">Ready to plan your flow?</h1>
              <p className="mt-2 text-sm text-white/80">{heroSubtitle}</p>
              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="px-4 py-2 rounded-full text-sm font-semibold bg-white text-indigo-600 flex items-center gap-2"
                >
                  <Plus size={16} />
                  Create task
                </button>
                <button
                  onClick={() => onNavigateAI?.()}
                  className="px-4 py-2 rounded-full text-sm font-semibold border border-white/30 text-white/90 flex items-center gap-2"
                >
                  <Sparkles size={16} />
                  Open AI workspace
                </button>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-center">
                <p className="text-sm text-white/70">Overdue</p>
                <p className="text-3xl font-semibold">{stats.overdue}</p>
                <p className="text-xs text-white/70 mt-1">Requires attention</p>
              </div>
              <div
                className="w-28 h-28 rounded-full p-2 shadow-inner shadow-black/40"
                style={completionBackground}
              >
                <div className="w-full h-full rounded-full bg-white/90 text-center flex flex-col items-center justify-center text-indigo-600">
                  <span className="text-2xl font-semibold">{completionRate}%</span>
                  <span className="text-xs uppercase tracking-[0.3em]">Complete</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="glass-panel rounded-3xl p-6 space-y-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-[var(--muted-text)]">Focus task</p>
              {focusTask ? (
                <>
                  <h3 className="mt-3 text-lg font-semibold text-[var(--text-color)]">
                    {focusTask.title}
                  </h3>
                  <p className="text-sm text-[var(--muted-text)]">
                    Due {formatShortDate(focusTask.dueDate)}
                  </p>
                </>
              ) : (
                <p className="mt-3 text-sm text-[var(--muted-text)]">No focus task selected.</p>
              )}
            </div>
            <div className="flex flex-col gap-2">
              {focusTask && (
                <button
                  onClick={() => onOpenTask?.(focusTask.id)}
                  className="px-3 py-1.5 rounded-full bg-black/5 text-xs font-semibold"
                >
                  Open
                </button>
              )}
              {onManageFocus && (
                <button
                  onClick={onManageFocus}
                  className="px-3 py-1.5 rounded-full border border-white/10 text-xs text-[var(--muted-text)] hover:bg-black/5"
                >
                  Manage focus
                </button>
              )}
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            {quickShortcuts.map((shortcut) => (
              <button
                key={shortcut.id}
                type="button"
                onClick={shortcut.action}
                className="rounded-2xl border border-white/10 bg-black/3 px-3 py-3 text-left hover:bg-black/5 transition-colors"
              >
                <div className="flex items-center gap-2 text-sm font-semibold text-[var(--text-color)]">
                  {shortcut.icon}
                  {shortcut.title}
                </div>
                <p className="mt-1 text-xs text-[var(--muted-text)]">{shortcut.description}</p>
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-4">
        {statCards.map((card) => (
          <StatCard key={card.label} {...card} />
        ))}
      </section>

      <section className="grid gap-4 xl:grid-cols-[2fr,1fr]">
        <div className="glass-panel rounded-3xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-[var(--text-color)]">Week timeline</h2>
              <p className="text-sm text-[var(--muted-text)]">Upcoming deadlines for the next 7 days</p>
            </div>
            <span className="text-xs font-semibold text-indigo-500 bg-indigo-500/10 px-3 py-1 rounded-full">
              {weekTimeline.length} tasks
            </span>
          </div>
          <div className="space-y-3">
            {weekTimeline.length === 0 ? (
              <div className="text-sm text-[var(--muted-text)] text-center py-8">
                No deadlines in the next week. Relax or add a new task.
              </div>
            ) : (
              weekTimeline.map((task) => (
                <button
                  key={task.id}
                  onClick={() => onOpenTask?.(task.id)}
                  className="w-full flex items-center gap-4 rounded-2xl border border-white/10 px-4 py-3 text-left hover:bg-black/5 transition-colors"
                >
                  <div className="text-sm font-semibold text-indigo-500 w-16">
                    {formatDayLabel(task.dueDate)}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-[var(--text-color)]">{task.title}</p>
                    <p className="text-xs text-[var(--muted-text)]">
                      {task.type?.charAt(0).toUpperCase() + task.type?.slice(1)} ·{' '}
                      {formatTimeLabel(task.dueDate) || 'All day'}
                    </p>
                  </div>
                  <div className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--muted-text)]">
                    {task.priority}
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="glass-panel rounded-3xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-[var(--muted-text)]">
                  Workload mix
                </p>
                <h3 className="text-lg font-semibold text-[var(--text-color)]">By task type</h3>
              </div>
            </div>
            <div className="space-y-3">
              {typeBreakdown.map((item) => (
                <div key={item.type}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="capitalize text-[var(--text-color)]">{item.type}s</span>
                    <span className="text-[var(--muted-text)]">
                      {item.count} · {item.percent}%
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-white/10">
                    <div
                      className={`h-full rounded-full ${
                        item.type === 'assignment'
                          ? 'bg-indigo-400'
                          : item.type === 'exam'
                          ? 'bg-pink-400'
                          : 'bg-purple-400'
                      }`}
                      style={{ width: `${item.percent}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-panel rounded-3xl p-6 space-y-3">
            <p className="text-xs uppercase tracking-[0.3em] text-[var(--muted-text)]">
              Priority load
            </p>
            {['high', 'medium', 'low'].map((level) => (
              <div key={level}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="capitalize text-[var(--text-color)]">{level}</span>
                  <span className="text-[var(--muted-text)]">
                    {priorityBreakdown.data[level]} · {priorityBreakdown.percent[level]}%
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-white/10">
                  <div
                    className={`h-full rounded-full ${
                      level === 'high'
                        ? 'bg-rose-400'
                        : level === 'medium'
                        ? 'bg-amber-400'
                        : 'bg-emerald-400'
                    }`}
                    style={{ width: `${priorityBreakdown.percent[level]}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[2fr,1fr]">
        <div className="glass-panel rounded-3xl overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
            <div>
              <h2 className="text-lg font-semibold text-[var(--text-color)]">Upcoming tasks</h2>
              <p className="text-sm text-[var(--muted-text)]">Stay on top of what’s next</p>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-3 py-1.5 rounded-full border border-white/10 text-sm"
            >
              New task
            </button>
          </div>
          {recentTasks.length === 0 ? (
            <div className="p-6 text-center text-[var(--muted-text)] text-sm">
              No upcoming tasks. Create one to get started.
            </div>
          ) : (
            recentTasks.map((task, index) => (
              <TaskItem
                key={task.id}
                task={task}
                onToggle={() => onToggleTask(task.id)}
                onOpen={onOpenTask}
                onFocus={onFocusChange ? () => onFocusChange(task.id) : undefined}
                isFocused={String(task.id) === String(focusTaskId)}
                isLast={index === recentTasks.length - 1}
              />
            ))
          )}
        </div>

        <div className="glass-panel rounded-3xl overflow-hidden">
          <div className="px-6 py-4 border-b border-white/10">
            <h2 className="text-lg font-semibold text-[var(--text-color)]">Recent activity</h2>
            <p className="text-sm text-[var(--muted-text)]">Latest updates across your board</p>
          </div>
          {activityLog.length === 0 ? (
            <div className="p-6 text-center text-[var(--muted-text)] text-sm">
              No activity yet. Work on tasks to see updates here.
            </div>
          ) : (
            activityLog.map((event, index) => (
              <div
                key={event.id}
                className={`flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-black/5 transition-colors ${
                  index !== activityLog.length - 1 ? 'border-b border-white/10' : ''
                }`}
              >
                <span className="text-base w-8 h-8 rounded-xl bg-black/5 flex items-center justify-center text-indigo-500">
                  {event.icon}
                </span>
                <div className="flex-1">
                  <div className="text-sm">{event.title}</div>
                  <div className="text-xs text-[var(--muted-text)]">{event.description || event.time}</div>
                </div>
                <div className="text-[11px] uppercase tracking-[0.2em] text-[var(--muted-text)]">
                  {event.time}
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      <TaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateTask}
      />
    </div>
  );
}
