import React, { useMemo, useState } from 'react';
import { Plus, Sparkles, FileText, BookOpen, CheckSquare, Calendar, BarChart3 } from 'lucide-react';
import StatCard from '../components/StatCard';
import TaskItem from '../components/TaskItem';
import TaskModal from '../components/TaskModal';
import AICard from '../components/AICard';

export default function Dashboard({ tasks, onToggleTask, onAddTask, onNavigateAI }) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const stats = {
    total: tasks.length,
    completed: tasks.filter((t) => t.completed).length,
    inProgress: tasks.filter(
      (t) => !t.completed && new Date(t.dueDate) >= new Date()
    ).length,
    overdue: tasks.filter(
      (t) => !t.completed && new Date(t.dueDate) < new Date()
    ).length,
  };

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

  const recentTasks = tasks.slice(0, 5);

  const heroSubtitle = stats.total
    ? "Here's what's on deck for you today."
    : 'Start by creating your first task to stay on track.';

  return (
    <div className="page-shell">
      <section className="glass-panel p-8 grid gap-6 lg:grid-cols-[2fr,1fr]">
        <div>
          <p className="text-sm text-[var(--muted-text)] mb-2">Welcome back 👋</p>
          <h1 className="text-3xl font-semibold text-[var(--text-color)]">
            Ready to plan your study flow?
          </h1>
          <p className="text-sm text-[var(--muted-text)] mt-2">
            {heroSubtitle}
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 rounded-full text-sm font-medium text-white bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center gap-2"
            >
              <Plus size={16} />
              Create task
            </button>
          </div>
        </div>
        <div className="glass-panel rounded-2xl p-5">
          <p className="text-xs uppercase tracking-[0.3em] text-[var(--muted-text)]">
            Next focus
          </p>
          {upcomingTasks[0] ? (
            <>
              <h3 className="mt-3 text-lg font-semibold text-[var(--text-color)]">
                {upcomingTasks[0].title}
              </h3>
              <p className="text-sm text-[var(--muted-text)]">
                Due {new Date(upcomingTasks[0].dueDate).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                })}
              </p>
              {upcomingTasks.length > 1 && (
                <div className="mt-6 text-xs text-[var(--muted-text)]">
                  +{upcomingTasks.length - 1} more tasks in queue
                </div>
              )}
            </>
          ) : (
            <p className="mt-3 text-sm text-[var(--muted-text)]">
              No upcoming work. Create a task to get started!
            </p>
          )}
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-4">
        {statCards.map((card) => (
          <StatCard key={card.label} {...card} />
        ))}
      </section>

      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-[var(--text-color)]">
            Upcoming Tasks
          </h2>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-3 py-1.5 rounded-full border border-white/10 text-sm"
          >
            New task
          </button>
        </div>
        <div className="glass-panel overflow-hidden">
          {recentTasks.map((task, index) => (
            <TaskItem
              key={task.id}
              task={task}
              onToggle={() => onToggleTask(task.id)}
              isLast={index === recentTasks.length - 1}
            />
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-[var(--text-color)] mb-4">
          AI Study Assistant
        </h2>
        <div className="grid gap-4 md:grid-cols-3">
          <AICard
            icon={<Sparkles size={20} />}
            title="Generate Quiz"
            description="Create practice quizzes from your study materials."
            color="blue"
            onClick={() => onNavigateAI?.('quiz')}
          />
          <AICard
            icon={<FileText size={20} />}
            title="Summarize Notes"
            description="Get concise explanations for long-form notes."
            color="purple"
            onClick={() => onNavigateAI?.('summarize')}
          />
          <AICard
            icon={<BookOpen size={20} />}
            title="Structure Lesson"
            description="Organize topics into lightweight lesson plans."
            color="green"
            onClick={() => onNavigateAI?.('lesson')}
          />
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-[var(--text-color)] mb-4">
          Recent Activity
        </h2>
        <div className="glass-panel overflow-hidden">
          <ActivityItem
            icon="✓"
            title="Completed Chemistry Lab Report"
            time="2 hours ago"
          />
          <ActivityItem
            icon="✨"
            title="Generated quiz for Biology Chapter 3"
            time="5 hours ago"
          />
          <ActivityItem
            icon="📝"
            title="Added new task: Literature Essay Draft"
            time="Yesterday"
            isLast
          />
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

function ActivityItem({ icon, title, time, isLast = false }) {
  return (
    <div
      className={`flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-black/5 transition-colors ${
        !isLast ? "border-b border-white/10" : ""
      }`}
    >
      <span className="text-base w-5 text-center">{icon}</span>
      <div className="flex-1">
        <div className="text-sm">{title}</div>
        <div className="text-xs text-[var(--muted-text)]">{time}</div>
      </div>
    </div>
  );
}
