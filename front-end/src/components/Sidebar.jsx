import React from 'react';
import {
  Home,
  Calendar,
  CheckSquare,
  BarChart3,
  BookOpen,
  Briefcase,
  ClipboardList,
} from 'lucide-react';

const PRIMARY_LINKS = [
  { id: 'dashboard', label: 'Dashboard', icon: Home },
  { id: 'calendar', label: 'Calendar', icon: Calendar },
  { id: 'tasks', label: 'All Tasks', icon: CheckSquare },
  { id: 'progress', label: 'Progress', icon: BarChart3 },
];

const QUICK_LINKS = [
  { id: 'assignments', label: 'Assignments', icon: BookOpen },
  { id: 'exams', label: 'Exams', icon: ClipboardList },
  { id: 'projects', label: 'Projects', icon: Briefcase },
];

function NavItem({ icon: Icon, label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center justify-between px-3 py-2 rounded-2xl text-sm transition-all ${
        active
          ? 'bg-black/5 text-indigo-600 font-semibold'
          : 'text-stone-500 hover:bg-black/5'
      }`}
    >
      <span className="flex items-center gap-2">
        <Icon size={16} />
        {label}
      </span>
      <span
        className={`w-1.5 h-1.5 rounded-full ${
          active ? 'bg-indigo-500' : 'bg-transparent'
        }`}
      />
    </button>
  );
}

function NavSection({ title, links, activeView, onViewChange }) {
  return (
    <div className="mb-5">
      <p className="text-[11px] uppercase tracking-[0.2em] text-stone-400 mb-3">
        {title}
      </p>
      <div className="space-y-1.5">
        {links.map((link) => (
          <NavItem
            key={link.id}
            icon={link.icon}
            label={link.label}
            active={activeView === link.id}
            onClick={() => onViewChange(link.id)}
          />
        ))}
      </div>
    </div>
  );
}

export default function Sidebar({ activeView, onViewChange }) {
  return (
    <aside
      className="w-64 fixed inset-y-0 px-5 py-8 overflow-y-auto soft-scrollbar"
      style={{
        background: 'var(--panel-bg)',
        backdropFilter: 'blur(26px)',
        borderRight: '1px solid var(--panel-border)',
      }}
    >
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 text-white font-semibold flex items-center justify-center">
          S
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-stone-400">
            Study Planner
          </p>
          <p className="text-sm font-semibold text-[var(--text-color)]">
            Plan. Focus. Flow.
          </p>
        </div>
      </div>

      <NavSection
        title="Overview"
        links={PRIMARY_LINKS}
        activeView={activeView}
        onViewChange={onViewChange}
      />
      <NavSection
        title="Quick Access"
        links={QUICK_LINKS}
        activeView={activeView}
        onViewChange={onViewChange}
      />

      <div className="glass-panel mt-6 p-4 rounded-2xl text-[var(--muted-text)]">
        <p className="font-semibold text-[var(--text-color)] mb-1.5">
          Need study ideas?
        </p>
        <p className="text-xs mb-3">
          Jump into the AI assistant for instant quizzes, summaries, or lessons.
        </p>
        <button
          onClick={() => onViewChange('quiz')}
          className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-xs font-semibold py-2 rounded-xl shadow-md shadow-indigo-500/30 hover:translate-y-[-1px] transition-transform"
        >
          Open AI Assistant
        </button>
        <p className="text-[11px] text-center mt-2">
          Tip: you can also use the floating chat bubble anywhere.
        </p>
      </div>
    </aside>
  );
}
