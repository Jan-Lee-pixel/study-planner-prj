import React, { useState } from 'react';
import './App.css';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import TasksPage from './pages/TasksPage';
import CalendarPage from './pages/CalendarPage';
import ProgressPage from './pages/ProgressPage';
import AIAssistant from './pages/AIAssistant';
import Auth from './components/Auth';
import { useTasks } from './useTasks';
import { useAuth } from './useAuth';

export default function App() {
  const [activeView, setActiveView] = useState('dashboard');
  const { user, loading, signIn, signUp, signOut } = useAuth();
  const { tasks, loading: tasksLoading, addTask, toggleTask, updateTask, deleteTask } = useTasks(user);

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

  const getPageTitle = () => {
    const titles = {
      dashboard: 'Dashboard',
      tasks: 'All Tasks',
      calendar: 'Calendar',
      progress: 'Progress',
      quiz: 'AI Assistant',
      summarize: 'AI Assistant',
      lesson: 'AI Assistant',
      assignments: 'Assignments',
      exams: 'Exams',
      projects: 'Projects'
    };
    return titles[activeView] || 'Dashboard';
  };

  const renderPage = () => {
    switch (activeView) {
      case 'tasks':
      case 'assignments':
      case 'exams':
      case 'projects':
        return (
          <TasksPage
            tasks={tasks}
            onToggleTask={toggleTask}
            onAddTask={addTask}
            onUpdateTask={updateTask}
            onDeleteTask={deleteTask}
          />
        );
      case 'calendar':
        return <CalendarPage tasks={tasks} onAddTask={addTask} />;
      case 'progress':
        return <ProgressPage tasks={tasks} />;
      case 'quiz':
      case 'summarize':
      case 'lesson':
        return <AIAssistant />;
      default:
        return (
          <Dashboard
            tasks={tasks}
            onToggleTask={toggleTask}
            onAddTask={addTask}
          />
        );
    }
  };

  return (
    <div className="flex min-h-screen bg-stone-50">
      <Sidebar activeView={activeView} onViewChange={setActiveView} />
      <main className="flex-1 ml-60">
        <Header title={getPageTitle()} user={user} onSignOut={signOut} />
        {tasksLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-stone-600">Loading tasks...</div>
          </div>
        ) : (
          renderPage()
        )}
      </main>
    </div>
  );
}


