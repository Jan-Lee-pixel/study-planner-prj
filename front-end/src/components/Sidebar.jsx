import React from 'react';
import { Home, Calendar, CheckSquare, BarChart3, Sparkles, FileText, BookOpen, Briefcase, ClipboardList } from 'lucide-react';

function NavItem({ icon, label, active = false, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded text-sm transition-colors ${
        active
          ? "bg-stone-100 font-medium text-stone-900"
          : "text-stone-700 hover:bg-stone-100"
      }`}
    >
      <span className="w-5 flex justify-center">{icon}</span>
      <span>{label}</span>
    </button>
  );
}

export default function Sidebar({ activeView, onViewChange }) {
  return (
    <aside className="w-60 bg-white border-r border-stone-200 p-3 fixed h-screen overflow-y-auto">
      <div className="flex items-center gap-2 px-2.5 py-2 mb-2 rounded hover:bg-stone-100 cursor-pointer transition-colors">
        <div className="w-5.5 h-5.5 bg-gradient-to-br from-indigo-500 to-purple-600 rounded flex items-center justify-center text-white text-sm font-semibold">
          S
        </div>
        <span className="text-sm font-medium">Study Planner</span>
      </div>

      <nav className="space-y-0.5 mb-5">
        <NavItem 
          icon={<Home size={16} />} 
          label="Dashboard" 
          active={activeView === 'dashboard'}
          onClick={() => onViewChange('dashboard')}
        />
        <NavItem 
          icon={<Calendar size={16} />} 
          label="Calendar" 
          active={activeView === 'calendar'}
          onClick={() => onViewChange('calendar')}
        />
        <NavItem 
          icon={<CheckSquare size={16} />} 
          label="All Tasks" 
          active={activeView === 'tasks'}
          onClick={() => onViewChange('tasks')}
        />
        <NavItem 
          icon={<BarChart3 size={16} />} 
          label="Progress" 
          active={activeView === 'progress'}
          onClick={() => onViewChange('progress')}
        />
      </nav>

      <div className="h-px bg-stone-200 my-3" />

      <div className="px-2.5 py-1.5 text-[11px] uppercase text-stone-500 font-semibold tracking-wide">
        AI Assistant
      </div>
      <nav className="space-y-0.5 mb-5">
        <NavItem 
          icon={<Sparkles size={16} />} 
          label="Generate Quiz" 
          active={activeView === 'quiz'}
          onClick={() => onViewChange('quiz')}
        />
        <NavItem 
          icon={<FileText size={16} />} 
          label="Summarize Notes" 
          active={activeView === 'summarize'}
          onClick={() => onViewChange('summarize')}
        />
        <NavItem 
          icon={<BookOpen size={16} />} 
          label="Create Lesson" 
          active={activeView === 'lesson'}
          onClick={() => onViewChange('lesson')}
        />
      </nav>

      <div className="h-px bg-stone-200 my-3" />

      <div className="px-2.5 py-1.5 text-[11px] uppercase text-stone-500 font-semibold tracking-wide">
        Quick Access
      </div>
      <nav className="space-y-0.5">
        <NavItem 
          icon={<BookOpen size={16} />} 
          label="Assignments" 
          active={activeView === 'assignments'}
          onClick={() => onViewChange('assignments')}
        />
        <NavItem 
          icon={<ClipboardList size={16} />} 
          label="Exams" 
          active={activeView === 'exams'}
          onClick={() => onViewChange('exams')}
        />
        <NavItem 
          icon={<Briefcase size={16} />} 
          label="Projects" 
          active={activeView === 'projects'}
          onClick={() => onViewChange('projects')}
        />
      </nav>
    </aside>
  );
}