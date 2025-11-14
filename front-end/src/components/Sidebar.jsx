import React from 'react';
import {
  Home,
  Calendar,
  CheckSquare,
  BarChart3,
  BookOpen,
  Briefcase,
  ClipboardList,
  Sparkles,
  X,
} from 'lucide-react';
import { NavLink } from 'react-router-dom';

const PRIMARY_LINKS = [
  { id: 'dashboard', label: 'Dashboard', icon: Home, to: '/' },
  { id: 'calendar', label: 'Calendar', icon: Calendar, to: '/calendar' },
  { id: 'tasks', label: 'All Tasks', icon: CheckSquare, to: '/tasks' },
  { id: 'progress', label: 'Progress', icon: BarChart3, to: '/progress' },
];

const QUICK_LINKS = [
  { id: 'assignments', label: 'Assignments', icon: BookOpen, to: '/tasks/assignments' },
  { id: 'exams', label: 'Exams', icon: ClipboardList, to: '/tasks/exams' },
  { id: 'projects', label: 'Projects', icon: Briefcase, to: '/tasks/projects' },
];

function NavItem({ icon: Icon, label, to, onNavigate }) {
  return (
    <NavLink
      to={to}
      onClick={onNavigate}
      className="w-full"
    >
      {({ isActive }) => (
        <span
          className={`w-full flex items-center justify-between px-3 py-2 rounded-2xl text-sm transition-all ${
            isActive
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
              isActive ? 'bg-indigo-500' : 'bg-transparent'
            }`}
          />
        </span>
      )}
    </NavLink>
  );
}

function NavSection({ title, links, onNavigate }) {
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
            to={link.to}
            onNavigate={onNavigate}
          />
        ))}
      </div>
    </div>
  );
}

function SidebarContent({ onNavigate }) {
  return (
    <>
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

      <NavSection title="Overview" links={PRIMARY_LINKS} onNavigate={onNavigate} />
      <NavSection title="Quick Access" links={QUICK_LINKS} onNavigate={onNavigate} />

      <div className="glass-panel mt-6 p-4 rounded-2xl text-[var(--muted-text)]">
        <p className="font-semibold text-[var(--text-color)] mb-1.5">
          Need study ideas?
        </p>
        <p className="text-xs mb-3">
          Jump into the AI assistant for instant quizzes, summaries, or lessons.
        </p>
        <NavLink
          to="/ai"
          onClick={onNavigate}
          className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-xs font-semibold py-2 rounded-xl shadow-md shadow-indigo-500/30 hover:translate-y-[-1px] transition-transform flex items-center justify-center gap-2"
        >
          <Sparkles size={14} />
          Open AI Assistant
        </NavLink>
        <p className="text-[11px] text-center mt-2">
          Tip: you can also use the floating chat bubble anywhere.
        </p>
      </div>
    </>
  );
}

export default function Sidebar({ isOpen, onClose }) {
  return (
    <>
      <aside
        className="hidden lg:block w-64 fixed inset-y-0 px-5 py-8 overflow-y-auto soft-scrollbar"
        style={{
          background: 'var(--panel-bg)',
          backdropFilter: 'blur(26px)',
          borderRight: '1px solid var(--panel-border)',
        }}
      >
        <SidebarContent />
      </aside>
      <div
        className={`lg:hidden fixed inset-0 z-40 transition-opacity ${
          isOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
      >
        <div
          className="absolute inset-0 bg-black/50"
          onClick={onClose}
        />
        <div
          className={`absolute left-0 inset-y-0 w-64 px-5 py-8 overflow-y-auto soft-scrollbar transition-transform duration-200 ${
            isOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
          style={{
            background: 'var(--panel-bg)',
            backdropFilter: 'blur(26px)',
            borderRight: '1px solid var(--panel-border)',
          }}
        >
          <div className="flex items-center justify-between mb-6">
            <p className="text-sm font-semibold text-[var(--text-color)]">Navigation</p>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-black/5 text-[var(--muted-text)] flex items-center justify-center hover:bg-black/10"
              aria-label="Close menu"
            >
              <X size={16} />
            </button>
          </div>
          <SidebarContent onNavigate={onClose} />
        </div>
      </div>
    </>
  );
}
