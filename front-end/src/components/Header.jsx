import React, { useState } from 'react';
import { Bell, LogOut, Moon, Search, Sun } from 'lucide-react';

export default function Header({ title = "Dashboard", user, onSignOut, onToggleTheme, theme = 'light' }) {
  const [showDropdown, setShowDropdown] = useState(false);

  const getInitials = (email) => {
    return email ? email.substring(0, 2).toUpperCase() : 'U';
  };

  return (
    <div className="sticky top-0 z-30 px-8 py-5 flex items-center justify-between bg-[var(--app-bg)]/90 backdrop-blur-xl border-b border-white/10">
      <div>
        <p className="text-[11px] uppercase tracking-[0.3em] text-[var(--muted-text)]">
          Study Planner
        </p>
        <h1 className="text-2xl font-semibold text-[var(--text-color)] mt-1">
          {title}
        </h1>
      </div>
      <div className="flex items-center gap-3">
        <div className="hidden lg:flex items-center gap-2 px-3 py-2 rounded-full bg-black/5 text-sm text-[var(--muted-text)]">
          <Search size={16} />
          <span className="text-xs tracking-wide uppercase">Quick search</span>
        </div>
        <button
          onClick={onToggleTheme}
          className="w-10 h-10 rounded-full bg-black/5 text-[var(--muted-text)] flex items-center justify-center hover:bg-black/10 transition-colors"
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>
        <button className="w-10 h-10 rounded-full bg-black/5 text-[var(--muted-text)] flex items-center justify-center hover:bg-black/10 transition-colors">
          <Bell size={18} />
        </button>
        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-sm font-semibold cursor-pointer hover:shadow-lg transition-shadow"
          >
            {getInitials(user?.email)}
          </button>
          {showDropdown && (
            <div className="absolute right-0 mt-2 w-56 glass-panel rounded-2xl overflow-hidden z-50">
              <div className="p-4 border-b border-white/10">
                <div className="text-sm font-medium text-[var(--text-color)] truncate">
                  {user?.email}
                </div>
              </div>
              <button
                onClick={() => {
                  onSignOut();
                  setShowDropdown(false);
                }}
                className="w-full flex items-center gap-2 px-4 py-3 text-sm text-red-500 hover:bg-black/5 transition-colors"
              >
                <LogOut size={14} />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
