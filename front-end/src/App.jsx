import React, {
  Suspense,
  lazy,
  useCallback,
  useEffect,
  useMemo,
  useState
} from 'react';
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
  useParams
} from 'react-router-dom';
import './App.css';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import QuickSearch from './components/QuickSearch';
import Auth from './components/Auth';
import FloatingChatbot from './components/FloatingChatbot';
import { useTasks } from './useTasks';
import { useAuth } from './useAuth';
import { useTheme } from './useTheme';

const Dashboard = lazy(() => import('./pages/Dashboard'));
const TasksPage = lazy(() => import('./pages/TasksPage'));
const CalendarPage = lazy(() => import('./pages/CalendarPage'));
const ProgressPage = lazy(() => import('./pages/ProgressPage'));
const AIAssistant = lazy(() => import('./pages/AIAssistant'));
const TaskDetail = lazy(() => import('./pages/TaskDetail'));

const FOCUS_STORAGE_KEY = 'focus-task-id';

const SuspenseFallback = () => (
  <div className="flex items-center justify-center h-64 text-[var(--muted-text)]">
    Loading view...
  </div>
);

function mapScopeToFilter(scope) {
  if (scope === 'assignments') return { title: 'Assignments', filter: 'assignment' };
  if (scope === 'exams') return { title: 'Exams', filter: 'exam' };
  if (scope === 'projects') return { title: 'Projects', filter: 'project' };
  return null;
}

function TasksRoute({ pageProps }) {
  const { scope } = useParams();
  const scoped = mapScopeToFilter(scope);
  return (
    <TasksPage
      {...pageProps}
      title={scoped?.title || pageProps.title}
      typeFilter={scoped?.filter}
    />
  );
}

function useRouteMeta(pathname, selectedTask) {
  return useMemo(() => {
    if (pathname === '/') return { title: 'Dashboard', id: 'dashboard' };
    if (pathname === '/tasks') return { title: 'All Tasks', id: 'tasks' };
    if (pathname.startsWith('/tasks/assignments')) return { title: 'Assignments', id: 'assignments' };
    if (pathname.startsWith('/tasks/exams')) return { title: 'Exams', id: 'exams' };
    if (pathname.startsWith('/tasks/projects')) return { title: 'Projects', id: 'projects' };
    if (pathname.startsWith('/calendar')) return { title: 'Calendar', id: 'calendar' };
    if (pathname.startsWith('/progress')) return { title: 'Progress', id: 'progress' };
    if (pathname.startsWith('/ai')) return { title: 'AI Assistant', id: 'ai' };
    if (pathname.startsWith('/task/')) {
      return {
        title: selectedTask?.title || 'Task Detail',
        id: 'taskDetail',
        showBack: true,
      };
    }
    return { title: 'Dashboard', id: 'dashboard' };
  }, [pathname, selectedTask]);
}

function AuthenticatedApp({ user, onSignOut, theme, toggleTheme }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [isQuickSearchOpen, setQuickSearchOpen] = useState(false);
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [focusTaskId, setFocusTaskId] = useState(() => {
    if (typeof window === 'undefined') return null;
    return window.localStorage.getItem(FOCUS_STORAGE_KEY);
  });

  const {
    tasks,
    loading: tasksLoading,
    error: tasksError,
    actionState,
    pendingIds,
    addTask,
    toggleTask,
    updateTask,
    deleteTask,
  } = useTasks(user);

  const selectedTaskId = useMemo(() => {
    if (!location.pathname.startsWith('/task/')) return null;
    return location.pathname.replace('/task/', '');
  }, [location.pathname]);

  const selectedTask = useMemo(
    () => tasks.find(task => String(task.id) === String(selectedTaskId)),
    [tasks, selectedTaskId]
  );

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (focusTaskId) {
      window.localStorage.setItem(FOCUS_STORAGE_KEY, focusTaskId);
    } else {
      window.localStorage.removeItem(FOCUS_STORAGE_KEY);
    }
  }, [focusTaskId]);

  useEffect(() => {
    if (!tasks.length) {
      if (focusTaskId) setFocusTaskId(null);
      return;
    }

    const stillExists = tasks.some(task => String(task.id) === String(focusTaskId));
    if (!stillExists) {
      const firstPending = tasks.find(task => !task.completed);
      const fallbackId = firstPending?.id ?? tasks[0].id;
      setFocusTaskId(fallbackId ? String(fallbackId) : null);
    }
  }, [tasks, focusTaskId]);

  useEffect(() => {
    const handleShortcut = (event) => {
      const key = event.key?.toLowerCase();
      if ((event.metaKey || event.ctrlKey) && key === 'k') {
        event.preventDefault();
        setQuickSearchOpen(true);
      }
      if (key === 'escape') {
        setQuickSearchOpen(false);
        setSidebarOpen(false);
      }
    };
    window.addEventListener('keydown', handleShortcut);
    return () => window.removeEventListener('keydown', handleShortcut);
  }, []);

  const handleOpenTask = useCallback((taskId) => {
    if (!taskId) return;
    navigate(`/task/${taskId}`, { state: { from: location.pathname } });
    setQuickSearchOpen(false);
    setSidebarOpen(false);
  }, [navigate, location.pathname]);

  const handleBackFromDetail = useCallback(() => {
    const fallback = location.state?.from || '/tasks';
    navigate(fallback, { replace: true });
  }, [navigate, location.state]);

  const handleFocusChange = useCallback((taskId) => {
    const normalizedId = taskId ? String(taskId) : null;
    setFocusTaskId(normalizedId);
  }, []);

  const routeMeta = useRouteMeta(location.pathname, selectedTask);

  const handleNavigateAI = useCallback((mode) => {
    if (mode) {
      navigate(`/ai/${mode}`);
    } else {
      navigate('/ai');
    }
  }, [navigate]);

  const tasksPageProps = useMemo(() => ({
    title: 'All Tasks',
    tasks,
    onToggleTask: toggleTask,
    onAddTask: addTask,
    onDeleteTask: deleteTask,
    onOpenTask: handleOpenTask,
    onFocusChange: handleFocusChange,
    focusTaskId,
    pendingIds,
  }), [
    tasks,
    toggleTask,
    addTask,
    deleteTask,
    handleOpenTask,
    handleFocusChange,
    focusTaskId,
    pendingIds,
  ]);

  const showBackButton = routeMeta.showBack && location.pathname.startsWith('/task/');

  return (
    <>
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <div className="flex min-h-screen bg-[var(--app-bg)] text-[var(--text-color)]">
        <main className="flex-1 lg:ml-64">
          <Header
            title={routeMeta.title}
            user={user}
            onSignOut={onSignOut}
            onToggleTheme={toggleTheme}
            theme={theme}
            onOpenQuickSearch={() => setQuickSearchOpen(true)}
            tasks={tasks}
            onSelectTask={handleOpenTask}
            onNavigateTasks={() => navigate('/tasks')}
            onBack={showBackButton ? handleBackFromDetail : undefined}
            onToggleSidebar={() => setSidebarOpen(true)}
          />
          {actionState.status === 'error' && actionState.message && (
            <div className="mx-8 my-4 rounded-2xl border border-red-400/40 bg-red-500/10 px-4 py-3 text-sm text-red-500">
              {actionState.message}
            </div>
          )}
          {tasksError && (
            <div className="mx-8 my-4 rounded-2xl border border-amber-400/40 bg-amber-100/40 px-4 py-3 text-sm text-amber-700">
              {tasksError}
            </div>
          )}
          <Suspense fallback={<SuspenseFallback />}>
            <Routes>
              <Route
                path="/"
                element={(
                  <Dashboard
                    tasks={tasks}
                    onToggleTask={toggleTask}
                    onAddTask={addTask}
                    onNavigateAI={handleNavigateAI}
                    onOpenTask={handleOpenTask}
                    focusTaskId={focusTaskId}
                    onFocusChange={handleFocusChange}
                    onManageFocus={() => navigate('/tasks')}
                    onNavigateTasks={() => navigate('/tasks')}
                  />
                )}
              />
              <Route
                path="/calendar"
                element={(
                  <CalendarPage
                    tasks={tasks}
                    onAddTask={addTask}
                    onOpenTask={handleOpenTask}
                  />
                )}
              />
              <Route
                path="/tasks"
                element={<TasksPage {...tasksPageProps} />}
              />
              <Route
                path="/tasks/:scope"
                element={<TasksRoute pageProps={tasksPageProps} />}
              />
              <Route
                path="/progress"
                element={<ProgressPage tasks={tasks} />}
              />
              <Route
                path="/ai"
                element={<AIAssistant />}
              />
              <Route
                path="/ai/:mode"
                element={<AIAssistant />}
              />
              <Route
                path="/task/:taskId"
                element={(
                  <TaskDetail
                    task={selectedTask}
                    onBack={handleBackFromDetail}
                    onToggleTask={toggleTask}
                    onDeleteTask={deleteTask}
                    onUpdateTask={updateTask}
                  />
                )}
              />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </main>
      </div>
      <QuickSearch
        isOpen={isQuickSearchOpen}
        onClose={() => setQuickSearchOpen(false)}
        tasks={tasks}
        onSelectTask={handleOpenTask}
      />
      <FloatingChatbot />
    </>
  );
}

export default function App() {
  const { user, loading, signIn, signUp, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();

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

  return (
    <BrowserRouter>
      <AuthenticatedApp
        user={user}
        onSignOut={signOut}
        theme={theme}
        toggleTheme={toggleTheme}
      />
    </BrowserRouter>
  );
}
