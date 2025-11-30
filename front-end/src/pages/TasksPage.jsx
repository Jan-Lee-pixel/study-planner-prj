import React, { useMemo, useState } from 'react';
import { 
  Plus, 
  Search, 
  LayoutGrid, 
  List, 
  CheckCircle2, 
  Circle, 
  Clock, 
  CalendarDays,
  ArrowUpDown,
  Filter
} from 'lucide-react';
import TaskItem from '../components/TaskItem';
import TaskModal from '../components/TaskModal';
import ConfirmDialog from '../components/ConfirmDialog';

export default function TasksPage({
  title = 'All Tasks',
  typeFilter,
  tasks,
  onToggleTask,
  onAddTask,
  onDeleteTask,
  onOpenTask,
  onFocusChange,
  focusTaskId,
  pendingIds = new Set(),
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState('list'); // 'list' | 'board'
  const [filterStatus, setFilterStatus] = useState('all'); // 'all' | 'pending' | 'completed'
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('dueDate');
  const [taskToDelete, setTaskToDelete] = useState(null);

  // --- LOGIC ---

  const scopedTasks = useMemo(() => {
    if (!typeFilter) return tasks;
    return tasks.filter((task) => task.type === typeFilter);
  }, [tasks, typeFilter]);

  const filteredTasks = useMemo(() => {
    return scopedTasks
      .filter(task => {
        if (filterStatus === 'completed') return task.completed;
        if (filterStatus === 'pending') return !task.completed;
        return true;
      })
      .filter(task => {
        const query = searchTerm.toLowerCase();
        return (
          (task.title || '').toLowerCase().includes(query) || 
          (task.description || '').toLowerCase().includes(query)
        );
      })
      .sort((a, b) => {
        if (sortBy === 'dueDate') {
          const dateA = a.dueDate ? new Date(a.dueDate) : new Date(8640000000000000);
          const dateB = b.dueDate ? new Date(b.dueDate) : new Date(8640000000000000);
          return dateA - dateB;
        }
        if (sortBy === 'priority') {
          const weight = { high: 0, medium: 1, low: 2 };
          return (weight[a.priority] ?? 3) - (weight[b.priority] ?? 3);
        }
        return a.title.localeCompare(b.title);
      });
  }, [scopedTasks, filterStatus, searchTerm, sortBy]);

  // Grouping for Kanban Board
  const boardGroups = useMemo(() => {
    return {
      high: filteredTasks.filter(t => t.priority === 'high' && !t.completed),
      medium: filteredTasks.filter(t => t.priority === 'medium' && !t.completed),
      low: filteredTasks.filter(t => t.priority === 'low' && !t.completed),
      completed: filteredTasks.filter(t => t.completed)
    };
  }, [filteredTasks]);

  // --- HANDLERS ---

  const handleCreateTask = async (taskData) => {
    const result = await onAddTask(taskData);
    if (result?.success) setIsModalOpen(false);
  };

  const confirmDelete = async () => {
    if (taskToDelete) {
      await onDeleteTask(taskToDelete);
      setTaskToDelete(null);
    }
  };

  // --- RENDER HELPERS ---

  const KanbanColumn = ({ title, tasks, colorClass, icon }) => (
    <div className="flex flex-col h-full min-w-[280px] bg-white/5 rounded-2xl p-4 border border-white/5">
      <div className="flex items-center gap-2 mb-4 px-1">
        <div className={`p-1.5 rounded-lg ${colorClass} bg-opacity-20 text-white`}>
          {icon}
        </div>
        <span className="font-semibold text-[var(--text-color)]">{title}</span>
        <span className="ml-auto text-xs font-medium bg-black/20 text-[var(--muted-text)] px-2 py-1 rounded-full">
          {tasks.length}
        </span>
      </div>
      <div className="flex-1 space-y-3 overflow-y-auto custom-scrollbar pr-1">
        {tasks.map(task => (
          <TaskItem
            key={task.id}
            task={task}
            onToggle={() => onToggleTask(task.id)}
            onOpen={onOpenTask}
            isPending={pendingIds?.has?.(String(task.id))}
          />
        ))}
        {tasks.length === 0 && (
          <div className="h-24 flex items-center justify-center text-[var(--muted-text)] text-sm border-2 border-dashed border-white/5 rounded-xl">
            Empty
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="page-shell h-full flex flex-col">
      
      {/* 1. HEADER & CONTROLS */}
      <div className="glass-panel p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <p className="text-xs font-bold text-indigo-400 uppercase tracking-[0.2em] mb-1">
              Workspace
            </p>
            <h1 className="text-3xl font-bold text-[var(--text-color)]">{title}</h1>
            <p className="text-[var(--muted-text)] mt-1">
              You have {filteredTasks.length} tasks visible.
            </p>
          </div>
          <div className="flex gap-3">
            <div className="bg-black/20 p-1 rounded-full border border-white/10 flex">
              <button
                onClick={() => setViewMode('list')}
                className={`p-2.5 rounded-full transition-all ${
                  viewMode === 'list' 
                    ? 'bg-white/10 text-white shadow-sm' 
                    : 'text-[var(--muted-text)] hover:text-white'
                }`}
                title="List View"
              >
                <List size={18} />
              </button>
              <button
                onClick={() => setViewMode('board')}
                className={`p-2.5 rounded-full transition-all ${
                  viewMode === 'board' 
                    ? 'bg-white/10 text-white shadow-sm' 
                    : 'text-[var(--muted-text)] hover:text-white'
                }`}
                title="Board View"
              >
                <LayoutGrid size={18} />
              </button>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full font-semibold shadow-lg shadow-indigo-500/20 transition-all flex items-center gap-2"
            >
              <Plus size={18} />
              <span className="hidden sm:inline">New Task</span>
            </button>
          </div>
        </div>

        {/* Filters Bar */}
        <div className="mt-8 flex flex-col lg:flex-row gap-4 items-center justify-between">
          <div className="relative w-full lg:w-96 group">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted-text)] group-focus-within:text-indigo-400 transition-colors" />
            <input
              type="text"
              placeholder="Search by keyword..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-2.5 bg-black/5 border border-white/10 rounded-2xl text-sm focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all"
            />
          </div>

          <div className="flex gap-2 w-full lg:w-auto overflow-x-auto pb-2 lg:pb-0 no-scrollbar">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2.5 bg-black/5 border border-white/10 rounded-2xl text-sm font-medium focus:outline-none focus:border-indigo-500/50 appearance-none cursor-pointer hover:bg-black/10 transition-colors"
            >
              <option value="all">Show All</option>
              <option value="pending">Pending Only</option>
              <option value="completed">Completed Only</option>
            </select>

            <button
              onClick={() => setSortBy(sortBy === 'dueDate' ? 'priority' : 'dueDate')}
              className="px-4 py-2.5 bg-black/5 border border-white/10 rounded-2xl text-sm font-medium hover:bg-black/10 transition-colors flex items-center gap-2 whitespace-nowrap"
            >
              <ArrowUpDown size={16} className="text-[var(--muted-text)]" />
              Sort: {sortBy === 'dueDate' ? 'Due Date' : 'Priority'}
            </button>
          </div>
        </div>
      </div>

      {/* 2. CONTENT AREA */}
      <div className="flex-1 min-h-0">
        
        {/* LIST VIEW */}
        {viewMode === 'list' && (
          <div className="glass-panel rounded-3xl overflow-hidden">
            {filteredTasks.length === 0 ? (
              <div className="p-12 text-center flex flex-col items-center justify-center text-[var(--muted-text)]">
                <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4">
                  <Search size={32} className="opacity-50" />
                </div>
                <h3 className="text-lg font-medium text-[var(--text-color)]">No tasks found</h3>
                <p className="text-sm mt-1">Try adjusting your filters or create a new task.</p>
              </div>
            ) : (
              <div className="divide-y divide-white/5">
                {filteredTasks.map((task) => (
                  <div key={task.id} className="p-2 hover:bg-black/5 transition-colors">
                    <TaskItem
                      task={task}
                      onToggle={() => onToggleTask(task.id)}
                      onDelete={() => setTaskToDelete(task.id)}
                      onOpen={onOpenTask}
                      onFocus={onFocusChange ? () => onFocusChange(task.id) : undefined}
                      isFocused={String(task.id) === String(focusTaskId)}
                      isPending={pendingIds?.has?.(String(task.id))}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* BOARD VIEW (KANBAN) */}
        {viewMode === 'board' && (
          <div className="h-full overflow-x-auto pb-4">
            <div className="flex gap-4 h-[500px] min-w-max">
              <KanbanColumn 
                title="High Priority" 
                tasks={boardGroups.high} 
                icon={<Clock size={18} />}
                colorClass="bg-red-500"
              />
              <KanbanColumn 
                title="Medium Priority" 
                tasks={boardGroups.medium} 
                icon={<CalendarDays size={18} />}
                colorClass="bg-amber-500"
              />
              <KanbanColumn 
                title="Low Priority" 
                tasks={boardGroups.low} 
                icon={<Circle size={18} />}
                colorClass="bg-emerald-500"
              />
              <KanbanColumn 
                title="Completed" 
                tasks={boardGroups.completed} 
                icon={<CheckCircle2 size={18} />}
                colorClass="bg-indigo-500"
              />
            </div>
          </div>
        )}
      </div>

      <TaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateTask}
      />
      <ConfirmDialog
        isOpen={Boolean(taskToDelete)}
        title="Delete task"
        description="Are you sure? This action cannot be undone."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onConfirm={confirmDelete}
        onCancel={() => setTaskToDelete(null)}
      />
    </div>
  );
}
