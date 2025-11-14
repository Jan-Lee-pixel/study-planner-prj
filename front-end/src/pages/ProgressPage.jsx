import React from 'react';
import { TrendingUp, Target, Clock, CheckCircle, BookOpen, ClipboardList, Briefcase, Circle } from 'lucide-react';
import StatCard from '../components/StatCard';

export default function ProgressPage({ tasks }) {
  const stats = {
    total: tasks.length,
    completed: tasks.filter(t => t.completed).length,
    inProgress: tasks.filter(t => !t.completed && new Date(t.dueDate) >= new Date()).length,
    overdue: tasks.filter(t => !t.completed && new Date(t.dueDate) < new Date()).length,
  };

  const completionRate = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;

  const tasksByType = {
    assignment: tasks.filter(t => t.type === 'assignment'),
    exam: tasks.filter(t => t.type === 'exam'),
    project: tasks.filter(t => t.type === 'project'),
  };

  const tasksByPriority = {
    high: tasks.filter(t => t.priority === 'high'),
    medium: tasks.filter(t => t.priority === 'medium'),
    low: tasks.filter(t => t.priority === 'low'),
  };

  const getCompletionRateByCategory = (categoryTasks) => {
    if (categoryTasks.length === 0) return 0;
    const completed = categoryTasks.filter(t => t.completed).length;
    return Math.round((completed / categoryTasks.length) * 100);
  };

  return (
    <div className="page-shell">
      <h1 className="text-2xl font-semibold text-[var(--text-color)]">Progress Overview</h1>

      {/* Overall Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Completion Rate"
          value={`${completionRate}%`}
          change={`${stats.completed}/${stats.total} tasks`}
          icon={<TrendingUp size={16} />}
        />
        <StatCard
          label="In Progress"
          value={stats.inProgress}
          change="Active tasks"
          icon={<Clock size={16} />}
        />
        <StatCard
          label="Completed"
          value={stats.completed}
          change="Finished tasks"
          icon={<CheckCircle size={16} />}
        />
        <StatCard
          label="Overdue"
          value={stats.overdue}
          change="Need attention"
          danger={stats.overdue > 0}
          icon={<Target size={16} />}
        />
      </div>

      {/* Progress by Type */}
      <div>
        <h2 className="text-lg font-semibold text-[var(--text-color)] mb-4">Progress by Task Type</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Object.entries(tasksByType).map(([type, typeTasks]) => (
            <div key={type} className="glass-panel p-6 rounded-2xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium capitalize text-[var(--text-color)]">{type}s</h3>
                <span className="text-2xl">
                  {type === 'assignment' ? <BookOpen size={18} /> : type === 'exam' ? <ClipboardList size={18} /> : <Briefcase size={18} />}
                </span>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>Total</span>
                  <span className="font-medium">{typeTasks.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Completed</span>
                  <span className="font-medium text-green-600">
                    {typeTasks.filter(t => t.completed).length}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Completion Rate</span>
                  <span className="font-medium">
                    {getCompletionRateByCategory(typeTasks)}%
                  </span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      type === 'assignment' ? 'bg-blue-500' :
                      type === 'exam' ? 'bg-pink-500' : 'bg-purple-500'
                    }`}
                    style={{ width: `${getCompletionRateByCategory(typeTasks)}%` }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Progress by Priority */}
      <div>
        <h2 className="text-lg font-semibold text-[var(--text-color)] mb-4">Progress by Priority</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Object.entries(tasksByPriority).map(([priority, priorityTasks]) => (
            <div key={priority} className="glass-panel p-6 rounded-2xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium capitalize text-[var(--text-color)]">{priority} Priority</h3>
                <span className="text-xl text-[var(--text-color)]">
                  <Circle
                    size={18}
                    className={
                      priority === 'high'
                        ? 'text-red-500'
                        : priority === 'medium'
                        ? 'text-amber-500'
                        : 'text-emerald-500'
                    }
                  />
                </span>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>Total</span>
                  <span className="font-medium">{priorityTasks.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Completed</span>
                  <span className="font-medium text-green-600">
                    {priorityTasks.filter(t => t.completed).length}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Completion Rate</span>
                  <span className="font-medium">
                    {getCompletionRateByCategory(priorityTasks)}%
                  </span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      priority === 'high' ? 'bg-red-500' :
                      priority === 'medium' ? 'bg-orange-500' : 'bg-green-500'
                    }`}
                    style={{ width: `${getCompletionRateByCategory(priorityTasks)}%` }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold text-[var(--text-color)] mb-4">Recent Achievements</h2>
        <div className="glass-panel overflow-hidden">
          {tasks
            .filter(task => task.completed)
            .slice(-5)
            .reverse()
            .map((task, index, array) => (
              <div
                key={task.id}
                className={`p-4 flex items-center gap-3 ${
                  index !== array.length - 1 ? 'border-b border-white/10' : ''
                }`}
              >
                <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center">
                  <CheckCircle size={16} className="text-green-500" />
                </div>
                <div className="flex-1">
                  <div className="font-medium text-sm text-[var(--text-color)]">{task.title}</div>
                  <div className="text-xs text-[var(--muted-text)]">
                    Completed - {task.type.charAt(0).toUpperCase() + task.type.slice(1)}
                  </div>
                </div>
                <div className={`px-2 py-1 rounded text-xs font-medium ${
                  task.priority === 'high' ? 'bg-red-500/20 text-red-600' :
                  task.priority === 'medium' ? 'bg-orange-500/20 text-orange-600' :
                  'bg-green-500/20 text-green-600'
                }`}>
                  {task.priority}
                </div>
              </div>
            ))}
          {tasks.filter(task => task.completed).length === 0 && (
            <div className="p-8 text-center text-[var(--muted-text)]">
              <CheckCircle size={48} className="mx-auto mb-2 text-white/30" />
              <div className="font-medium">No completed tasks yet</div>
              <div className="text-sm">Complete your first task to see achievements here</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
