import React, { useCallback, useMemo, useState } from 'react';
import './App.css';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import TasksPage from './pages/TasksPage';
import CalendarPage from './pages/CalendarPage';
import ProgressPage from './pages/ProgressPage';
import AIAssistant from './pages/AIAssistant';
import Auth from './components/Auth';
import FloatingChatbot from './components/FloatingChatbot';
import { useTasks } from './useTasks';
import { useAuth } from './useAuth';
import { useTheme } from './useTheme';

export default function App() {
  const [activeView, setActiveView] = useState('dashboard');
  const { user, loading, signIn, signUp, signOut } = useAuth();
  const { tasks, loading: tasksLoading, addTask, toggleTask, updateTask, deleteTask } = useTasks(user);
  const { theme, toggleTheme } = useTheme();
  const handleNavigateAI = useCallback((view) => {
    setActiveView(view);
  }, []);

  const viewConfig = useMemo(() => {
    const shared = {
      tasks,
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
            tasks={tasks}
            onToggleTask={toggleTask}
            onAddTask={addTask}
            onNavigateAI={handleNavigateAI}
          />
        )
      },
      tasks: {
        title: 'All Tasks',
        render: () => (
          <TasksPage
            {...shared}
            title="All Tasks"
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
          />
        )
      },
      calendar: {
        title: 'Calendar',
        render: () => (
          <CalendarPage
            tasks={tasks}
          />
        )
      },
      progress: {
        title: 'Progress',
        render: () => <ProgressPage tasks={tasks} />
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
      }
    };
  }, [tasks, addTask, toggleTask, updateTask, deleteTask, handleNavigateAI]);

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
      <FloatingChatbot />
    </>
  );
}
