import React, { useMemo, useRef, useState, useEffect } from 'react';
import { ArrowLeft, Bell, Calendar, LogOut, Moon, Search, Sun, Menu } from 'lucide-react';

const formatRelativeTime = (dateString) => {
  if (!dateString) return 'No due date';
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return 'No due date';

  const diff = date.getTime() - Date.now();
  const days = Math.round(diff / (1000 * 60 * 60 * 24));

  if (days === 0) return 'Due today';
  if (days > 0) return `Due in ${days} day${days === 1 ? '' : 's'}`;
  return `${Math.abs(days)} day${Math.abs(days) === 1 ? '' : 's'} overdue`;
};

export default function Header({
  title = "Dashboard",
  user,
  onSignOut,
  onToggleTheme,
  theme = 'light',
  onOpenQuickSearch,
  tasks = [],
  onSelectTask,
  onNavigateTasks,
  onBack,
  onToggleSidebar,
}) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationsRef = useRef(null);

  const getInitials = (email) => {
    return email ? email.substring(0, 2).toUpperCase() : 'U';
  };

  const notifications = useMemo(() => {
    const now = new Date();
    const soon = new Date();
    soon.setDate(soon.getDate() + 3);

    return tasks
      .filter((task) => {
        if (task.completed) return false;
        const dueDate = task.dueDate || task.due_date;
        if (!dueDate) return false;
        const date = new Date(dueDate);
        if (Number.isNaN(date.getTime())) return false;
        return date <= soon;
      })
      .sort((a, b) => {
        const dateA = new Date(a.dueDate || a.due_date);
        const dateB = new Date(b.dueDate || b.due_date);
        return dateA - dateB;
      })
      .slice(0, 5);
  }, [tasks]);

  useEffect(() => {
    if (!showNotifications) return;
    const handleClick = (event) => {
      if (!notificationsRef.current) return;
      if (!notificationsRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [showNotifications]);

  return (
    <div className="sticky top-0 z-30 px-4 lg:px-8 py-5 flex items-center justify-between bg-[var(--app-bg)]/90 backdrop-blur-xl border-b border-white/10">
      <div className="flex items-center gap-3">
        {onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            className="lg:hidden w-10 h-10 rounded-full bg-black/5 text-[var(--muted-text)] flex items-center justify-center hover:bg-black/10 transition-colors"
            aria-label="Open menu"
          >
            <Menu size={18} />
          </button>
        )}
        {onBack && (
          <button
            onClick={onBack}
            className="w-10 h-10 rounded-full bg-black/5 text-[var(--muted-text)] flex items-center justify-center hover:bg-black/10 transition-colors"
            aria-label="Go back"
          >
            <ArrowLeft size={18} />
          </button>
        )}
        <p className="text-[11px] uppercase tracking-[0.3em] text-[var(--muted-text)]">
          Study Planner
        </p>
        <h1 className="text-2xl font-semibold text-[var(--text-color)] mt-1">
          {title}
        </h1>
      </div>
      <div className="flex items-center gap-3 relative">
        <button
          onClick={onOpenQuickSearch}
          className="hidden lg:flex items-center gap-2 px-3 py-2 rounded-full bg-black/5 text-sm text-[var(--muted-text)] hover:bg-black/10 transition-colors"
        >
          <Search size={16} />
          <span className="text-xs tracking-wide uppercase">Quick search</span>
        </button>
        <button
          onClick={onOpenQuickSearch}
          className="lg:hidden w-10 h-10 rounded-full bg-black/5 text-[var(--muted-text)] flex items-center justify-center hover:bg-black/10 transition-colors"
          aria-label="Quick search"
        >
          <Search size={16} />
        </button>
        <button
          onClick={onToggleTheme}
          className="w-10 h-10 rounded-full bg-black/5 text-[var(--muted-text)] flex items-center justify-center hover:bg-black/10 transition-colors"
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="w-10 h-10 rounded-full bg-black/5 text-[var(--muted-text)] flex items-center justify-center hover:bg-black/10 transition-colors relative"
            aria-label="Notifications"
          >
            <Bell size={18} />
            {notifications.length > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-gradient-to-r from-rose-500 to-orange-500" />
            )}
          </button>
          {showNotifications && (
            <div
              ref={notificationsRef}
              className="absolute right-0 mt-3 w-80 glass-panel rounded-2xl shadow-lg overflow-hidden z-50"
            >
              <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-[var(--text-color)]">Notifications</p>
                  <p className="text-xs text-[var(--muted-text)]">
                    Upcoming deadlines and reminders
                  </p>
                </div>
              </div>
              <div className="max-h-80 overflow-y-auto soft-scrollbar">
                {notifications.length === 0 ? (
                  <div className="p-4 text-sm text-[var(--muted-text)] text-center">
                    You're all caught up
                  </div>
                ) : (
                  notifications.map((task) => (
                    <button
                      key={task.id}
                      onClick={() => {
                        onSelectTask?.(task.id);
                        setShowNotifications(false);
                      }}
                      className="w-full text-left px-4 py-3 hover:bg-black/5 transition-colors flex items-start gap-3"
                    >
                      <div className="w-8 h-8 rounded-xl bg-black/5 flex items-center justify-center text-indigo-500">
                        <Calendar size={16} />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-[var(--text-color)]">
                          {task.title}
                        </p>
                        <p className="text-xs text-[var(--muted-text)] mt-0.5">
                          {formatRelativeTime(task.dueDate || task.due_date)}
                        </p>
                      </div>
                    </button>
                  ))
                )}
              </div>
              <button
                onClick={() => {
                  onNavigateTasks?.();
                  setShowNotifications(false);
                }}
                className="w-full text-center text-xs uppercase tracking-[0.3em] text-indigo-500 py-3 border-t border-white/10 hover:bg-black/5"
              >
                View all tasks
              </button>
            </div>
          )}
        </div>
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
