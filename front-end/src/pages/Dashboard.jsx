import React, { useState } from 'react';
import { Plus, Sparkles, FileText, BookOpen, CheckSquare, Calendar, BarChart3 } from 'lucide-react';
import StatCard from '../components/StatCard';
import TaskItem from '../components/TaskItem';
import TaskModal from '../components/TaskModal';
import AICard from '../components/AICard';

export default function Dashboard({ tasks, onToggleTask, onAddTask }) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const stats = {
    total: tasks.length,
    completed: tasks.filter((t) => t.completed).length,
    inProgress: tasks.filter(
      (t) => !t.completed && new Date(t.dueDate) >= new Date()
    ).length,
    overdue: tasks.filter(
      (t) => !t.completed && new Date(t.dueDate) < new Date()
    ).length,
  };

  const handleCreateTask = async (taskData) => {
    const result = await onAddTask(taskData);
    if (result?.success) {
      setIsModalOpen(false);
    }
  };

  const recentTasks = tasks.slice(0, 5);

  return (
    <div className="max-w-4xl mx-auto px-24 py-15">
      <h1 className="text-[40px] font-bold leading-tight mb-2">
        Welcome back, John 👋
      </h1>
      <p className="text-sm text-stone-500 mb-8">
        Here's what's happening with your studies today.
      </p>

      {/* Stats Grid */}
      <div className="grid grid-cols-4 gap-3 mb-8">
        <StatCard
          label="Total Tasks"
          value={stats.total}
          change="+3 this week"
          icon={<CheckSquare size={16} />}
        />
        <StatCard
          label="Completed"
          value={stats.completed}
          change="75% completion rate"
          icon={<CheckSquare size={16} />}
        />
        <StatCard
          label="In Progress"
          value={stats.inProgress}
          change="Due this week"
          icon={<Calendar size={16} />}
        />
        <StatCard
          label="Overdue"
          value={stats.overdue}
          change="Needs attention"
          danger
          icon={<BarChart3 size={16} />}
        />
      </div>

      {/* Upcoming Tasks */}
      <div className="flex items-center justify-between mt-10 mb-4">
        <h2 className="text-lg font-semibold">Upcoming Tasks</h2>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-white border border-stone-200 px-3 py-1.5 rounded text-sm flex items-center gap-1.5 hover:bg-stone-100 transition-colors"
        >
          <Plus size={16} />
          <span>New Task</span>
        </button>
      </div>

      <div className="bg-white border border-stone-200 rounded-md overflow-hidden">
        {recentTasks.map((task, index) => (
          <TaskItem
            key={task.id}
            task={task}
            onToggle={() => onToggleTask(task.id)}
            isLast={index === recentTasks.length - 1}
          />
        ))}
      </div>

      {/* AI Assistant Section */}
      <div className="mt-10 mb-4">
        <h2 className="text-lg font-semibold">AI Study Assistant</h2>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-8">
        <AICard
          icon={<Sparkles size={20} />}
          title="Generate Quiz"
          description="Create practice quizzes from your study materials to test your knowledge."
          color="blue"
          onClick={() => console.log('Generate Quiz clicked')}
        />
        <AICard
          icon={<FileText size={20} />}
          title="Summarize Notes"
          description="Get concise summaries of your lengthy notes and reading materials."
          color="purple"
          onClick={() => console.log('Summarize Notes clicked')}
        />
        <AICard
          icon={<BookOpen size={20} />}
          title="Structure Lesson"
          description="Organize topics into structured lessons with clear learning objectives."
          color="green"
          onClick={() => console.log('Structure Lesson clicked')}
        />
      </div>

      {/* Recent Activity */}
      <div className="mt-10 mb-4">
        <h2 className="text-lg font-semibold">Recent Activity</h2>
      </div>

      <div className="bg-white border border-stone-200 rounded-md overflow-hidden">
        <ActivityItem
          icon="✓"
          title="Completed Chemistry Lab Report"
          time="2 hours ago"
        />
        <ActivityItem
          icon="✨"
          title="Generated quiz for Biology Chapter 3"
          time="5 hours ago"
        />
        <ActivityItem
          icon="📝"
          title="Added new task: Literature Essay Draft"
          time="Yesterday"
          isLast
        />
      </div>

      <TaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateTask}
      />
    </div>
  );
}

function ActivityItem({ icon, title, time, isLast = false }) {
  return (
    <div
      className={`flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-stone-50 transition-colors ${
        !isLast ? "border-b border-stone-200" : ""
      }`}
    >
      <span className="text-base w-5 text-center">{icon}</span>
      <div className="flex-1">
        <div className="text-sm">{title}</div>
        <div className="text-xs text-stone-500">{time}</div>
      </div>
    </div>
  );
}