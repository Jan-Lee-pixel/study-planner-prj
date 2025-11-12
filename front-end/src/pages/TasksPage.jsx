import React, { useMemo, useState } from 'react';
import { Plus, Filter, Search } from 'lucide-react';
import TaskItem from '../components/TaskItem';
import TaskModal from '../components/TaskModal';

export default function TasksPage({
  title = 'All Tasks',
  typeFilter,
  tasks,
  onToggleTask,
  onAddTask,
  onDeleteTask
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('dueDate');

  const scopedTasks = useMemo(() => {
    if (!typeFilter) return tasks;
    return tasks.filter((task) => task.type === typeFilter);
  }, [tasks, typeFilter]);

  const filteredTasks = scopedTasks
    .filter(task => {
      if (filter === 'completed') return task.completed;
      if (filter === 'pending') return !task.completed;
      if (filter === 'overdue') return !task.completed && new Date(task.dueDate) < new Date();
      return true;
    })
    .filter(task =>
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.description.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === 'dueDate') return new Date(a.dueDate) - new Date(b.dueDate);
      if (sortBy === 'priority') {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      }
      if (sortBy === 'title') return a.title.localeCompare(b.title);
      return 0;
    });

  const handleCreateTask = async (taskData) => {
    const result = await onAddTask(taskData);
    if (result?.success) {
      setIsModalOpen(false);
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      await onDeleteTask(taskId);
    }
  };

  const hasScopedFilter = Boolean(typeFilter);

  return (
    <div className="page-shell">
      <div className="glass-panel p-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-[var(--muted-text)]">
            Task board
          </p>
          <h1 className="text-2xl font-semibold text-[var(--text-color)]">
            {title}
          </h1>
          {hasScopedFilter && (
            <span className="inline-flex items-center gap-1 text-xs px-3 py-1 rounded-full bg-black/5 mt-2 capitalize">
              Focused on {typeFilter}s
            </span>
          )}
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-4 py-2 rounded-full text-sm flex items-center gap-2 shadow-lg shadow-indigo-500/20"
        >
          <Plus size={16} />
          New Task
        </button>
      </div>

      <div className="glass-panel p-5 space-y-4">
        <div className="flex flex-col md:flex-row items-stretch gap-4">
          <div className="flex-1 relative">
            <Search size={16} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[var(--muted-text)]" />
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-3 py-2 rounded-2xl bg-black/5 border border-white/10 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center gap-4">
          <div className="flex items-center gap-2 w-full md:w-auto">
            <Filter size={16} className="text-[var(--muted-text)]" />
            <span className="text-sm font-medium text-[var(--text-color)]">Filter:</span>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-3 py-1 rounded-full bg-black/5 border border-white/10 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
            >
              <option value="all">All Tasks</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
              <option value="overdue">Overdue</option>
            </select>
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <span className="text-sm font-medium text-[var(--text-color)]">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-1 rounded-full bg-black/5 border border-white/10 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
            >
              <option value="dueDate">Due Date</option>
              <option value="priority">Priority</option>
              <option value="title">Title</option>
            </select>
          </div>
        </div>
      </div>

      <div className="glass-panel overflow-hidden">
        {filteredTasks.length === 0 ? (
          <div className="p-8 text-center text-[var(--muted-text)]">
            <div className="text-4xl mb-2">📝</div>
            <div className="text-lg font-medium mb-1">No tasks found</div>
            <div className="text-sm">
              {searchTerm
                ? 'Try adjusting your search or filters'
                : hasScopedFilter
                  ? `No ${typeFilter} tasks yet. Add one to get started.`
                  : 'Create your first task to get started'}
            </div>
          </div>
        ) : (
          filteredTasks.map((task, index) => (
            <TaskItem
              key={task.id}
              task={task}
              onToggle={() => onToggleTask(task.id)}
              onDelete={() => handleDeleteTask(task.id)}
              isLast={index === filteredTasks.length - 1}
            />
          ))
        )}
      </div>

      <TaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateTask}
      />
    </div>
  );
}
