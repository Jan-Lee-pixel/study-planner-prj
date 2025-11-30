import React, { useMemo, useState } from 'react';
import {
  Plus,
  Sparkles,
  FileText,
  BookOpen,
  CheckSquare,
  Calendar as CalendarIcon,
  BarChart3,
  ArrowRight,
  Clock,
  Target,
  MoreHorizontal
} from 'lucide-react';
import TaskItem from '../components/TaskItem';
import TaskModal from '../components/TaskModal';

// --- HELPER FUNCTIONS ---
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
  if (!value) return 'No date';
  const date = new Date(value);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
};

// --- MINI COMPONENTS ---

const StatWidget = ({ label, value, change, icon, colorClass, delay }) => (
  <div 
    className="glass-panel p-5 rounded-2xl flex flex-col justify-between hover:bg-white/5 transition-all duration-300 animate-in fade-in slide-in-from-bottom-4" 
    style={{ animationDelay: `${delay}ms` }}
  >
    <div className="flex items-start justify-between">
      <div className={`p-2.5 rounded-xl ${colorClass} bg-opacity-20 text-white shadow-sm`}>
        {icon}
      </div>
      {change && (
        <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted-text)] bg-white/5 px-2 py-1 rounded-lg border border-white/5">
          {change}
        </span>
      )}
    </div>
    <div className="mt-4">
      <h3 className="text-3xl font-bold text-[var(--text-color)] tracking-tight">{value}</h3>
      <p className="text-xs font-semibold uppercase tracking-widest text-[var(--muted-text)] mt-1">{label}</p>
    </div>
  </div>
);

// UPDATED: Now accepts separate 'textColor' and 'bgColor' for cleaner look
const QuickAction = ({ icon, title, desc, onClick, textColor, bgColor }) => (
  <button 
    onClick={onClick}
    className="group relative overflow-hidden rounded-2xl bg-black/20 border border-white/5 p-5 text-left hover:border-white/10 transition-all duration-300 hover:-translate-y-1"
  >
    {/* Watermark Icon (Cleaner now) */}
    <div className={`absolute -right-4 -top-4 opacity-[0.07] group-hover:opacity-[0.15] transition-all duration-500 transform group-hover:scale-110 group-hover:rotate-6 ${textColor}`}>
      {React.cloneElement(icon, { size: 100, strokeWidth: 1.5 })}
    </div>

    {/* Small Icon Box */}
    <div className={`mb-4 w-12 h-12 rounded-2xl flex items-center justify-center ${bgColor} bg-opacity-20 ${textColor} shadow-lg shadow-black/20`}>
      {React.cloneElement(icon, { size: 22 })}
    </div>
    
    <h4 className="font-bold text-lg text-[var(--text-color)] relative z-10">{title}</h4>
    <p className="text-xs text-[var(--muted-text)] mt-1 relative z-10 font-medium leading-relaxed">{desc}</p>
  </button>
);

// --- MAIN COMPONENT ---

export default function Dashboard({
  tasks,
  onToggleTask,
  onAddTask,
  onNavigateAI,
  onOpenTask,
  focusTaskId,
  onFocusChange,
  onNavigateTasks,
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // --- LOGIC CALCULATIONS ---
  const stats = {
    total: tasks.length,
    completed: tasks.filter((t) => t.completed).length,
    inProgress: tasks.filter((t) => !t.completed && new Date(t.dueDate) >= new Date()).length,
    overdue: tasks.filter((t) => !t.completed && new Date(t.dueDate) < new Date()).length,
  };

  const completionRate = stats.total ? Math.round((stats.completed / stats.total) * 100) : 0;

  const upcomingTasks = useMemo(() => {
    return [...tasks]
      .filter((task) => !task.completed)
      .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
      .slice(0, 4);
  }, [tasks]);

  const focusTask = useMemo(() => {
    return tasks.find((task) => String(task.id) === String(focusTaskId)) || upcomingTasks[0];
  }, [tasks, focusTaskId, upcomingTasks]);

  const recentActivity = useMemo(() => {
    return tasks
      .filter(t => t.updatedAt || t.createdAt)
      .sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt))
      .slice(0, 4);
  }, [tasks]);

  const handleCreateTask = async (taskData) => {
    const result = await onAddTask(taskData);
    if (result?.success) setIsModalOpen(false);
  };

  return (
    <div className="page-shell space-y-8 pb-10">
      
      {/* 1. HERO SECTION */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2">
        <div className="space-y-2">
          <p className="text-xs font-bold text-indigo-400 uppercase tracking-[0.2em] mb-1">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
          <h1 className="text-4xl md:text-5xl font-bold text-[var(--text-color)] tracking-tight">
            {getGreeting()}, <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Student</span>.
          </h1>
          <p className="text-[var(--muted-text)] max-w-md text-base">
            You have <span className="text-white font-semibold">{upcomingTasks.length} tasks</span> on deck. {stats.overdue > 0 ? `Needs attention: ${stats.overdue} overdue.` : "You're all caught up!"}
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => onNavigateAI?.()}
            className="h-11 px-5 rounded-full bg-white/5 border border-white/10 text-[var(--text-color)] text-sm font-semibold hover:bg-white/10 hover:border-indigo-500/50 transition-all flex items-center gap-2"
          >
            <Sparkles size={16} className="text-purple-400" />
            <span>AI Workspace</span>
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="h-11 px-6 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold shadow-lg shadow-indigo-500/20 transition-all flex items-center gap-2 hover:translate-y-[-1px]"
          >
            <Plus size={18} />
            <span>Create Task</span>
          </button>
        </div>
      </div>

      {/* 2. STATS GRID */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatWidget 
          label="Total Tasks" 
          value={stats.total} 
          icon={<CheckSquare size={20} />} 
          colorClass="bg-blue-500" 
          delay={0}
        />
        <StatWidget 
          label="In Progress" 
          value={stats.inProgress} 
          icon={<Clock size={20} />} 
          colorClass="bg-amber-500" 
          change="Active"
          delay={100}
        />
        <StatWidget 
          label="Completed" 
          value={stats.completed} 
          icon={<Target size={20} />} 
          colorClass="bg-emerald-500" 
          change={`${completionRate}% Rate`}
          delay={200}
        />
        <StatWidget 
          label="Overdue" 
          value={stats.overdue} 
          icon={<AlertTriangleIcon size={20} />} 
          colorClass="bg-rose-500" 
          delay={300}
        />
      </div>

      {/* 3. BENTO GRID LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT COLUMN (2/3 width) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* FOCUS CARD */}
          <div className="glass-panel rounded-3xl p-1 relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
            <div className="p-6 md:p-8 bg-black/20 backdrop-blur-xl rounded-[20px]">
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-indigo-500/20 rounded-xl text-indigo-400 ring-1 ring-indigo-500/20">
                    <Target size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">Current Focus</h3>
                    <p className="text-xs text-[var(--muted-text)] uppercase tracking-widest font-semibold">Prioritize this</p>
                  </div>
                </div>
                {focusTask && (
                  <button 
                    onClick={() => onOpenTask?.(focusTask.id)}
                    className="p-2 rounded-full hover:bg-white/10 text-[var(--muted-text)] hover:text-white transition-colors"
                  >
                    <MoreHorizontal size={20} />
                  </button>
                )}
              </div>

              {focusTask ? (
                <div>
                  <div className="flex items-start justify-between gap-4">
                    <h2 className="text-3xl md:text-4xl font-bold text-white leading-tight mb-2 line-clamp-2">
                      {focusTask.title}
                    </h2>
                  </div>
                  <div className="flex items-center gap-3 mt-4 text-sm">
                    <span className="px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 font-medium">
                      {focusTask.type}
                    </span>
                    <span className={`px-3 py-1 rounded-full border bg-opacity-5 font-medium ${
                      focusTask.priority === 'high' ? 'border-red-500/30 bg-red-500 text-red-400' : 
                      focusTask.priority === 'medium' ? 'border-amber-500/30 bg-amber-500 text-amber-400' : 
                      'border-emerald-500/30 bg-emerald-500 text-emerald-400'
                    }`}>
                      {focusTask.priority}
                    </span>
                    <span className="text-[var(--muted-text)] flex items-center gap-1.5 ml-2 font-medium">
                      <Clock size={14} /> Due {formatShortDate(focusTask.dueDate)}
                    </span>
                  </div>
                  <div className="mt-8 pt-6 border-t border-white/10 flex gap-3">
                    <button 
                      onClick={() => onToggleTask(focusTask.id)}
                      className="flex-1 bg-white text-black font-bold py-3.5 rounded-xl hover:bg-gray-200 transition-colors flex items-center justify-center gap-2 shadow-lg"
                    >
                      <CheckSquare size={18} /> Mark Complete
                    </button>
                    <button 
                      onClick={() => onOpenTask?.(focusTask.id)}
                      className="px-6 py-3.5 rounded-xl border border-white/10 font-semibold hover:bg-white/5 transition-colors text-[var(--text-color)]"
                    >
                      Details
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-10 text-[var(--muted-text)]">
                  <p>No tasks remaining. Enjoy your free time!</p>
                  <button onClick={() => setIsModalOpen(true)} className="text-indigo-400 hover:text-indigo-300 font-semibold hover:underline mt-2">Create a task</button>
                </div>
              )}
            </div>
          </div>

          {/* AI TOOLS ROW (Updated Colors) */}
          <div>
            <h3 className="text-sm font-bold text-[var(--text-color)] mb-4 flex items-center gap-2 uppercase tracking-widest">
              <Sparkles size={16} className="text-purple-400" /> 
              AI Workspace
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <QuickAction 
                icon={<Sparkles />} 
                title="Generate Quiz" 
                desc="Practice drills from notes" 
                textColor="text-purple-400"
                bgColor="bg-purple-500"
                onClick={() => onNavigateAI?.('quiz')}
              />
              <QuickAction 
                icon={<FileText />} 
                title="Summarize" 
                desc="Condense long texts" 
                textColor="text-blue-400"
                bgColor="bg-blue-500"
                onClick={() => onNavigateAI?.('summarize')}
              />
              <QuickAction 
                icon={<BookOpen />} 
                title="Lesson Plan" 
                desc="Structure your learning" 
                textColor="text-pink-400"
                bgColor="bg-pink-500"
                onClick={() => onNavigateAI?.('lesson')}
              />
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN (1/3 width) */}
        <div className="space-y-6">
          
          {/* UPCOMING LIST */}
          <div className="glass-panel p-5 rounded-3xl h-full flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-[var(--text-color)]">Next Up</h3>
              <button 
                onClick={onNavigateTasks} 
                className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 uppercase tracking-wide"
              >
                View all <ArrowRight size={12} />
              </button>
            </div>
            
            <div className="space-y-3 flex-1">
              {upcomingTasks.length === 0 ? (
                <div className="text-center py-8 text-[var(--muted-text)] text-sm">
                  No upcoming tasks.
                </div>
              ) : (
                upcomingTasks.map((task) => (
                  <div 
                    key={task.id}
                    onClick={() => onOpenTask?.(task.id)}
                    className="group p-3.5 rounded-2xl bg-black/20 hover:bg-black/40 border border-transparent hover:border-white/10 transition-all cursor-pointer"
                  >
                    <div className="flex items-start gap-3">
                      <div className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${
                        task.priority === 'high' ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]' : 
                        task.priority === 'medium' ? 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.6)]' : 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]'
                      }`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-[var(--text-color)] truncate group-hover:text-white transition-colors">
                          {task.title}
                        </p>
                        <p className="text-xs text-[var(--muted-text)] mt-1 font-medium">
                          {formatShortDate(task.dueDate)} • <span className="capitalize">{task.type}</span>
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* RECENT ACTIVITY MINI */}
          <div className="glass-panel p-5 rounded-3xl">
            <h3 className="font-bold text-[var(--text-color)] mb-4 text-xs uppercase tracking-widest">Activity</h3>
            <div className="space-y-4">
              {recentActivity.map(task => (
                <div key={task.id} className="flex gap-3 items-center group">
                  <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-[var(--muted-text)] group-hover:bg-indigo-500/20 group-hover:text-indigo-400 transition-colors">
                    {task.completed ? <CheckSquare size={14} /> : <FileText size={14} />}
                  </div>
                  <div>
                    <p className="text-xs font-medium text-[var(--text-color)] line-clamp-1 group-hover:text-indigo-200 transition-colors">{task.title}</p>
                    <p className="text-[10px] text-[var(--muted-text)]">{formatTimeAgo(task.updatedAt || task.createdAt)}</p>
                  </div>
                </div>
              ))}
              {recentActivity.length === 0 && <p className="text-xs text-[var(--muted-text)]">No recent activity.</p>}
            </div>
          </div>

        </div>
      </div>

      <TaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateTask}
      />
    </div>
  );
}

// Helper component for the StatWidget
function AlertTriangleIcon({ size }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>
      <line x1="12" y1="9" x2="12" y2="13"/>
      <line x1="12" y1="17" x2="12.01" y2="17"/>
    </svg>
  );
}
