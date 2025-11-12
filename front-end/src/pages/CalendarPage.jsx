import React, { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Plus, X } from 'lucide-react';

export default function CalendarPage({ tasks }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(() =>
    new Date().toISOString().split('T')[0]
  );
  const [isModalOpen, setModalOpen] = useState(false);

  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const getTasksForDate = (date) => {
    const dateString = date.toISOString().split('T')[0];
    return tasks.filter(task => task.dueDate === dateString);
  };

  const navigateMonth = (direction) => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + direction, 1));
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const daysInMonth = getDaysInMonth(currentDate);
  const firstDay = getFirstDayOfMonth(currentDate);
  const today = new Date();
  const selectedTasks = useMemo(() => {
    return tasks.filter((task) => task.dueDate === selectedDate);
  }, [tasks, selectedDate]);

  const formatSelectedDate = () => {
    if (!selectedDate) return '';
    const date = new Date(selectedDate);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="page-shell">
      <div className="glass-panel p-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-[var(--muted-text)]">
            Plan ahead
          </p>
          <h1 className="text-2xl font-semibold text-[var(--text-color)]">Calendar</h1>
        </div>
        <button className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-4 py-2 rounded-full text-sm flex items-center gap-2 shadow-lg shadow-indigo-500/20">
          <Plus size={16} />
          Add Event
        </button>
      </div>

      <div className="glass-panel overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <button
            onClick={() => navigateMonth(-1)}
            className="p-2 hover:bg-black/5 rounded-full transition-colors"
          >
            <ChevronLeft size={20} />
          </button>
          <h2 className="text-xl font-semibold text-[var(--text-color)]">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h2>
          <button
            onClick={() => navigateMonth(1)}
            className="p-2 hover:bg-black/5 rounded-full transition-colors"
          >
            <ChevronRight size={20} />
          </button>
        </div>

        <div className="grid grid-cols-7 border-b border-white/10">
          {dayNames.map(day => (
            <div key={day} className="p-3 text-center text-sm font-medium text-[var(--muted-text)] border-r border-white/10 last:border-r-0">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7">
          {Array.from({ length: firstDay }, (_, i) => (
            <div key={`empty-${i}`} className="h-24 border-r border-b border-white/10 last:border-r-0" />
          ))}

          {Array.from({ length: daysInMonth }, (_, i) => {
            const day = i + 1;
            const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
            const dayTasks = getTasksForDate(date);
            const isToday = date.toDateString() === today.toDateString();

            const dateKey = date.toISOString().split('T')[0];
            const isSelected = dateKey === selectedDate;

            return (
              <div
                key={day}
                onClick={() => {
                  setSelectedDate(dateKey);
                  setModalOpen(true);
                }}
                className={`h-24 border-r border-b border-white/10 last:border-r-0 p-2 hover:bg-black/5 transition-colors cursor-pointer ${
                  isSelected ? 'bg-black/5 ring-1 ring-indigo-400' : ''
                }`}
              >
                <div
                  className={`text-sm font-medium mb-1 ${
                    isToday ? 'text-indigo-500' : 'text-[var(--text-color)]'
                  }`}
                >
                  {day}
                </div>
                <div className="space-y-1">
                  {dayTasks.slice(0, 2).map(task => (
                    <div
                      key={task.id}
                      className={`text-xs px-1 py-0.5 rounded truncate ${
                        task.type === 'assignment' ? 'bg-blue-100 text-blue-700' :
                        task.type === 'exam' ? 'bg-pink-100 text-pink-700' :
                        'bg-purple-100 text-purple-700'
                      }`}
                      title={task.title}
                    >
                      {task.title}
                    </div>
                  ))}
                  {dayTasks.length > 2 && (
                    <div className="text-xs text-[var(--muted-text)]">
                      +{dayTasks.length - 2} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center px-4">
          <div className="glass-panel w-full max-w-xl rounded-3xl shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-[var(--muted-text)]">
                  Tasks on
                </p>
                <h3 className="text-lg font-semibold text-[var(--text-color)]">
                  {formatSelectedDate()}
                </h3>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="w-10 h-10 rounded-full bg-black/5 text-[var(--muted-text)] flex items-center justify-center hover:bg-black/10 transition-colors"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>
            <div className="max-h-[60vh] overflow-y-auto px-6 py-5 space-y-4">
              {selectedTasks.length === 0 ? (
                <div className="text-sm text-[var(--muted-text)]">
                  No tasks scheduled for this date.
                </div>
              ) : (
                selectedTasks.map((task) => (
                  <div
                    key={task.id}
                    className="p-4 rounded-2xl bg-black/5 flex items-center justify-between"
                  >
                    <div>
                      <p className="text-sm font-medium text-[var(--text-color)]">
                        {task.title}
                      </p>
                      <p className="text-xs text-[var(--muted-text)]">
                        {task.type} • {task.priority} priority
                      </p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        task.type === 'assignment'
                          ? 'bg-blue-100 text-blue-700'
                          : task.type === 'exam'
                          ? 'bg-pink-100 text-pink-700'
                          : 'bg-purple-100 text-purple-700'
                      }`}
                    >
                      {task.type}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-[var(--text-color)]">Upcoming Deadlines</h3>
        <div className="glass-panel overflow-hidden">
          {tasks
            .filter(task => !task.completed && new Date(task.dueDate) >= new Date())
            .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
            .slice(0, 5)
            .map((task, index, array) => (
              <div
                key={task.id}
                className={`p-4 ${index !== array.length - 1 ? 'border-b border-white/10' : ''}`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-sm text-[var(--text-color)]">{task.title}</div>
                    <div className="text-xs text-[var(--muted-text)] mt-1">
                      Due: {new Date(task.dueDate).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </div>
                  </div>
                  <div className={`px-2 py-1 rounded text-xs font-medium ${
                    task.priority === 'high' ? 'bg-red-500/20 text-red-600' :
                    task.priority === 'medium' ? 'bg-orange-500/20 text-orange-600' :
                    'bg-emerald-500/20 text-emerald-600'
                  }`}>
                    {task.priority}
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
