import React, { useCallback, useEffect, useMemo, useState } from 'react';
import './App.css';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import QuickSearch from './components/QuickSearch';
import Dashboard from './pages/Dashboard';
import TasksPage from './pages/TasksPage';
import CalendarPage from './pages/CalendarPage';
import ProgressPage from './pages/ProgressPage';
import AIAssistant from './pages/AIAssistant';
import TaskDetail from './pages/TaskDetail';
import Auth from './components/Auth';
import FloatingChatbot from './components/FloatingChatbot';
import { useTasks } from './useTasks';
import { useAuth } from './useAuth';
import { useTheme } from './useTheme';

export default function App() {
  const [activeView, setActiveView] = useState('dashboard');
  const [previousView, setPreviousView] = useState('dashboard');
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [isQuickSearchOpen, setQuickSearchOpen] = useState(false);
  const [focusTaskId, setFocusTaskId] = useState(() => {
    if (typeof window === 'undefined') return null;
    return window.localStorage.getItem('focus-task-id');
  });
  const { user, loading, signIn, signUp, signOut } = useAuth();
  const { tasks, loading: tasksLoading, addTask, toggleTask, updateTask, deleteTask } = useTasks(user);
  const { theme, toggleTheme } = useTheme();
  const handleNavigateAI = useCallback((view) => {
    setActiveView(view);
  }, []);

  const normalizedTasks = useMemo(() => {
    return tasks.map((task) => ({
      ...task,
      dueDate: task.dueDate || task.due_date,
      createdAt: task.created_at || task.createdAt,
      updatedAt: task.updated_at || task.updatedAt,
    }));
  }, [tasks]);

  const handleOpenTask = useCallback((taskId) => {
    if (!taskId) return;
    setPreviousView((prev) => (activeView === 'taskDetail' ? prev : activeView));
    setSelectedTaskId(taskId);
    setActiveView('taskDetail');
    setQuickSearchOpen(false);
  }, [activeView]);

  const handleBackFromDetail = useCallback(() => {
    setSelectedTaskId(null);
    setActiveView(previousView || 'dashboard');
  }, [previousView]);

  const handleFocusChange = useCallback((taskId) => {
    const normalizedId = taskId !== null && taskId !== undefined && taskId !== ''
      ? String(taskId)
      : null;
    setFocusTaskId(normalizedId);
  }, []);

  const selectedTask = useMemo(
    () => normalizedTasks.find((task) => task.id === selectedTaskId),
    [normalizedTasks, selectedTaskId],
  );

  useEffect(() => {
    if (activeView !== 'taskDetail' && selectedTaskId) {
      setSelectedTaskId(null);
    }
  }, [activeView, selectedTaskId]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (focusTaskId) {
      window.localStorage.setItem('focus-task-id', focusTaskId);
    } else {
      window.localStorage.removeItem('focus-task-id');
    }
  }, [focusTaskId]);

  useEffect(() => {
    if (!normalizedTasks.length) {
      if (focusTaskId) setFocusTaskId(null);
      return;
    }

    const currentFocus = normalizedTasks.find(
      (task) => String(task.id) === String(focusTaskId)
    );

    if (!currentFocus || currentFocus.completed) {
      const firstPending = normalizedTasks.find((task) => !task.completed);
      const fallbackId = firstPending?.id ?? normalizedTasks[0].id;
      setFocusTaskId(fallbackId ? String(fallbackId) : null);
    }
  }, [normalizedTasks, focusTaskId]);

  useEffect(() => {
    const handleShortcut = (event) => {
      const key = event.key?.toLowerCase();
      if ((event.metaKey || event.ctrlKey) && key === 'k') {
        event.preventDefault();
        setQuickSearchOpen(true);
      }
      if (key === 'escape') {
        setQuickSearchOpen(false);
      }
    };
    window.addEventListener('keydown', handleShortcut);
    return () => window.removeEventListener('keydown', handleShortcut);
  }, []);

  const viewConfig = useMemo(() => {
    const shared = {
      tasks: normalizedTasks,
      onToggleTask: toggleTask,
      onAddTask: addTask,
      onUpdateTask: updateTask,
      onDeleteTask: deleteTask
    };

    return {
      dashboard: {
        title: 'Dashboard',
        render: () => (
          <Dashboard
            tasks={normalizedTasks}
            onToggleTask={toggleTask}
            onAddTask={addTask}
            onNavigateAI={handleNavigateAI}
            onOpenTask={handleOpenTask}
            focusTaskId={focusTaskId}
            onFocusChange={handleFocusChange}
            onManageFocus={() => setActiveView('tasks')}
          />
        )
      },
      tasks: {
        title: 'All Tasks',
        render: () => (
          <TasksPage
            {...shared}
            title="All Tasks"
            onOpenTask={handleOpenTask}
            focusTaskId={focusTaskId}
            onFocusChange={handleFocusChange}
          />
        )
      },
      assignments: {
        title: 'Assignments',
        render: () => (
          <TasksPage
            {...shared}
            title="Assignments"
            typeFilter="assignment"
            onOpenTask={handleOpenTask}
            focusTaskId={focusTaskId}
            onFocusChange={handleFocusChange}
          />
        )
      },
      exams: {
        title: 'Exams',
        render: () => (
          <TasksPage
            {...shared}
            title="Exams"
            typeFilter="exam"
            onOpenTask={handleOpenTask}
            focusTaskId={focusTaskId}
            onFocusChange={handleFocusChange}
          />
        )
      },
      projects: {
        title: 'Projects',
        render: () => (
          <TasksPage
            {...shared}
            title="Projects"
            typeFilter="project"
            onOpenTask={handleOpenTask}
            focusTaskId={focusTaskId}
            onFocusChange={handleFocusChange}
          />
        )
      },
      calendar: {
        title: 'Calendar',
        render: () => (
          <CalendarPage
            tasks={normalizedTasks}
          />
        )
      },
      progress: {
        title: 'Progress',
        render: () => <ProgressPage tasks={normalizedTasks} />
      },
      quiz: {
        title: 'AI Assistant',
        render: () => <AIAssistant />
      },
      summarize: {
        title: 'AI Assistant',
        render: () => <AIAssistant />
      },
      lesson: {
        title: 'AI Assistant',
        render: () => <AIAssistant />
      },
      taskDetail: {
        title: selectedTask?.title || 'Task Detail',
        render: () => (
          <TaskDetail
            task={selectedTask}
            onBack={handleBackFromDetail}
            onToggleTask={toggleTask}
            onDeleteTask={deleteTask}
            onUpdateTask={(id, payload) => updateTask(id, payload)}
          />
        )
      }
    };
  }, [
    normalizedTasks,
    addTask,
    toggleTask,
    updateTask,
    deleteTask,
    handleNavigateAI,
    handleOpenTask,
    selectedTask,
    handleBackFromDetail,
    handleFocusChange,
    focusTaskId,
  ]);

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4 animate-pulse">
            S
          </div>
          <div className="text-stone-600">Loading...</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Auth onSignIn={signIn} onSignUp={signUp} />;
  }

  const activeConfig = viewConfig[activeView] || viewConfig.dashboard;

  return (
    <>
      <div className="flex min-h-screen bg-[var(--app-bg)] text-[var(--text-color)]">
        <Sidebar activeView={activeView} onViewChange={setActiveView} />
        <main className="flex-1 ml-64">
          <Header
            title={activeConfig.title}
            user={user}
            onSignOut={signOut}
            onToggleTheme={toggleTheme}
            theme={theme}
            onOpenQuickSearch={() => setQuickSearchOpen(true)}
            tasks={normalizedTasks}
            onSelectTask={handleOpenTask}
            onNavigateTasks={() => setActiveView('tasks')}
            onBack={activeView === 'taskDetail' ? handleBackFromDetail : undefined}
          />
          {tasksLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-stone-600">Loading tasks...</div>
            </div>
          ) : (
            activeConfig.render()
          )}
        </main>
      </div>
      <QuickSearch
        isOpen={isQuickSearchOpen}
        onClose={() => setQuickSearchOpen(false)}
        tasks={normalizedTasks}
        onSelectTask={handleOpenTask}
      />
      <FloatingChatbot />
    </>
  );
}
