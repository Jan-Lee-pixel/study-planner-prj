import React, { useState } from "react";
import {
  Check,
  Plus,
  Search,
  Bell,
  Home,
  Calendar,
  CheckSquare,
  BarChart3,
  Sparkles,
  FileText,
  BookOpen,
  Briefcase,
  ClipboardList,
} from "lucide-react";

export default function SmartStudyPlanner() {
  const [tasks, setTasks] = useState([
    {
      id: 1,
      title: "Complete Math Assignment Chapter 5",
      type: "assignment",
      priority: "high",
      dueDate: "Oct 28, 2025",
      completed: false,
    },
    {
      id: 2,
      title: "Physics Midterm Exam Review",
      type: "exam",
      priority: "high",
      dueDate: "Oct 30, 2025",
      completed: false,
    },
    {
      id: 3,
      title: "Literature Essay Draft",
      type: "assignment",
      priority: "medium",
      dueDate: "Nov 2, 2025",
      completed: false,
    },
    {
      id: 4,
      title: "Chemistry Lab Report",
      type: "assignment",
      priority: "low",
      dueDate: "Oct 25, 2025",
      completed: true,
    },
    {
      id: 5,
      title: "Web Development Project - Final Submission",
      type: "project",
      priority: "medium",
      dueDate: "Nov 5, 2025",
      completed: false,
    },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTask, setNewTask] = useState({
    title: "",
    type: "assignment",
    priority: "medium",
    dueDate: "",
    description: "",
  });

  const toggleTask = (id) => {
    setTasks(
      tasks.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task,
      ),
    );
  };

  const handleCreateTask = (e) => {
    e.preventDefault();
    if (newTask.title.trim() && newTask.dueDate) {
      const task = {
        id: tasks.length + 1,
        ...newTask,
        completed: false,
      };
      setTasks([...tasks, task]);
      setNewTask({
        title: "",
        type: "assignment",
        priority: "medium",
        dueDate: "",
        description: "",
      });
      setIsModalOpen(false);
    }
  };

  const stats = {
    total: tasks.length,
    completed: tasks.filter((t) => t.completed).length,
    inProgress: tasks.filter(
      (t) => !t.completed && new Date(t.dueDate) >= new Date(),
    ).length,
    overdue: tasks.filter(
      (t) => !t.completed && new Date(t.dueDate) < new Date(),
    ).length,
  };

  return (
    <div className="flex min-h-screen bg-stone-50">
      {/* Sidebar */}
      <aside className="w-60 bg-white border-r border-stone-200 p-3 fixed h-screen overflow-y-auto">
        <div className="flex items-center gap-2 px-2.5 py-2 mb-2 rounded hover:bg-stone-100 cursor-pointer transition-colors">
          <div className="w-5.5 h-5.5 bg-gradient-to-br from-indigo-500 to-purple-600 rounded flex items-center justify-center text-white text-sm font-semibold">
            S
          </div>
          <span className="text-sm font-medium">My Workspace</span>
        </div>

        <nav className="space-y-0.5 mb-5">
          <NavItem icon={<Home size={16} />} label="Dashboard" active />
          <NavItem icon={<Calendar size={16} />} label="Calendar" />
          <NavItem icon={<CheckSquare size={16} />} label="All Tasks" />
          <NavItem icon={<BarChart3 size={16} />} label="Progress" />
        </nav>

        <div className="h-px bg-stone-200 my-3" />

        <div className="px-2.5 py-1.5 text-[11px] uppercase text-stone-500 font-semibold tracking-wide">
          AI Assistant
        </div>
        <nav className="space-y-0.5 mb-5">
          <NavItem icon={<Sparkles size={16} />} label="Generate Quiz" />
          <NavItem icon={<FileText size={16} />} label="Summarize Notes" />
          <NavItem icon={<BookOpen size={16} />} label="Create Lesson" />
        </nav>

        <div className="h-px bg-stone-200 my-3" />

        <div className="px-2.5 py-1.5 text-[11px] uppercase text-stone-500 font-semibold tracking-wide">
          Quick Access
        </div>
        <nav className="space-y-0.5">
          <NavItem icon={<BookOpen size={16} />} label="Assignments" />
          <NavItem icon={<ClipboardList size={16} />} label="Exams" />
          <NavItem icon={<Briefcase size={16} />} label="Projects" />
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-60">
        {/* Top Bar */}
        <div className="bg-white border-b border-stone-200 px-15 py-3 sticky top-0 z-10 flex items-center justify-between">
          <div className="text-sm text-stone-500">
            <span className="text-stone-900">Dashboard</span>
          </div>
          <div className="flex items-center gap-3">
            <button className="w-8 h-8 rounded hover:bg-stone-100 flex items-center justify-center text-stone-500 transition-colors">
              <Search size={16} />
            </button>
            <button className="w-8 h-8 rounded hover:bg-stone-100 flex items-center justify-center text-stone-500 transition-colors">
              <Bell size={16} />
            </button>
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-semibold cursor-pointer">
              JD
            </div>
          </div>
        </div>

        {/* Page Content */}
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
            />
            <StatCard
              label="Completed"
              value={stats.completed}
              change="75% completion rate"
            />
            <StatCard
              label="In Progress"
              value={stats.inProgress}
              change="Due this week"
            />
            <StatCard
              label="Overdue"
              value={stats.overdue}
              change="Needs attention"
              danger
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
            {tasks.map((task, index) => (
              <TaskItem
                key={task.id}
                task={task}
                onToggle={() => toggleTask(task.id)}
                isLast={index === tasks.length - 1}
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
            />
            <AICard
              icon={<FileText size={20} />}
              title="Summarize Notes"
              description="Get concise summaries of your lengthy notes and reading materials."
              color="purple"
            />
            <AICard
              icon={<BookOpen size={20} />}
              title="Structure Lesson"
              description="Organize topics into structured lessons with clear learning objectives."
              color="green"
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
        </div>
      </main>

      {/* New Task Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-stone-200">
              <h2 className="text-xl font-semibold">Create New Task</h2>
            </div>

            <form onSubmit={handleCreateTask} className="p-6 space-y-5">
              {/* Task Title */}
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">
                  Task Title *
                </label>
                <input
                  type="text"
                  value={newTask.title}
                  onChange={(e) =>
                    setNewTask({ ...newTask, title: e.target.value })
                  }
                  placeholder="Enter task title..."
                  className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              {/* Task Type */}
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">
                  Task Type
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setNewTask({ ...newTask, type: "assignment" })
                    }
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${newTask.type === "assignment"
                        ? "bg-blue-100 text-blue-700 border-2 border-blue-500"
                        : "bg-stone-50 text-stone-700 border border-stone-200 hover:bg-stone-100"
                      }`}
                  >
                    📖 Assignment
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewTask({ ...newTask, type: "exam" })}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${newTask.type === "exam"
                        ? "bg-pink-100 text-pink-700 border-2 border-pink-500"
                        : "bg-stone-50 text-stone-700 border border-stone-200 hover:bg-stone-100"
                      }`}
                  >
                    📋 Exam
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewTask({ ...newTask, type: "project" })}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${newTask.type === "project"
                        ? "bg-purple-100 text-purple-700 border-2 border-purple-500"
                        : "bg-stone-50 text-stone-700 border border-stone-200 hover:bg-stone-100"
                      }`}
                  >
                    💼 Project
                  </button>
                </div>
              </div>

              {/* Priority */}
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">
                  Priority Level
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setNewTask({ ...newTask, priority: "high" })}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${newTask.priority === "high"
                        ? "bg-red-100 text-red-700 border-2 border-red-500"
                        : "bg-stone-50 text-stone-700 border border-stone-200 hover:bg-stone-100"
                      }`}
                  >
                    🔴 High
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setNewTask({ ...newTask, priority: "medium" })
                    }
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${newTask.priority === "medium"
                        ? "bg-orange-100 text-orange-700 border-2 border-orange-500"
                        : "bg-stone-50 text-stone-700 border border-stone-200 hover:bg-stone-100"
                      }`}
                  >
                    🟡 Medium
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewTask({ ...newTask, priority: "low" })}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${newTask.priority === "low"
                        ? "bg-green-100 text-green-700 border-2 border-green-500"
                        : "bg-stone-50 text-stone-700 border border-stone-200 hover:bg-stone-100"
                      }`}
                  >
                    🟢 Low
                  </button>
                </div>
              </div>

              {/* Due Date */}
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">
                  Due Date *
                </label>
                <input
                  type="date"
                  value={newTask.dueDate}
                  onChange={(e) =>
                    setNewTask({ ...newTask, dueDate: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">
                  Description (Optional)
                </label>
                <textarea
                  value={newTask.description}
                  onChange={(e) =>
                    setNewTask({ ...newTask, description: e.target.value })
                  }
                  placeholder="Add any additional details..."
                  rows={3}
                  className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-2 border border-stone-300 rounded-md text-sm font-medium text-stone-700 hover:bg-stone-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
                >
                  Create Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function NavItem({ icon, label, active = false }) {
  return (
    <a
      href="#"
      className={`flex items-center gap-2 px-2.5 py-1.5 rounded text-sm transition-colors ${active
          ? "bg-stone-100 font-medium text-stone-900"
          : "text-stone-700 hover:bg-stone-100"
        }`}
    >
      <span className="w-5 flex justify-center">{icon}</span>
      <span>{label}</span>
    </a>
  );
}

function StatCard({ label, value, change, danger = false }) {
  return (
    <div className="bg-white border border-stone-200 rounded-md p-5 hover:shadow-md transition-shadow">
      <div className="text-xs text-stone-500 uppercase font-semibold tracking-wide mb-2">
        {label}
      </div>
      <div className="text-[32px] font-bold mb-1">{value}</div>
      <div
        className={`text-[13px] ${danger ? "text-red-600" : "text-green-600"}`}
      >
        {change}
      </div>
    </div>
  );
}

function TaskItem({ task, onToggle, isLast }) {
  const getTypeStyles = (type) => {
    const styles = {
      assignment: "bg-blue-50 text-blue-700",
      exam: "bg-pink-50 text-pink-700",
      project: "bg-purple-50 text-purple-700",
    };
    return styles[type] || "bg-gray-50 text-gray-700";
  };

  const getPriorityStyles = (priority) => {
    const styles = {
      high: "bg-red-50 text-red-700",
      medium: "bg-orange-50 text-orange-700",
      low: "bg-green-50 text-green-700",
    };
    return styles[priority] || "bg-gray-50 text-gray-700";
  };

  return (
    <div
      className={`flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-stone-50 transition-colors ${!isLast ? "border-b border-stone-200" : ""
        }`}
    >
      <div
        onClick={onToggle}
        className={`w-4.5 h-4.5 border-1.5 rounded flex-shrink-0 cursor-pointer transition-all ${task.completed
            ? "bg-blue-600 border-blue-600 flex items-center justify-center"
            : "border-stone-300 hover:bg-stone-100"
          }`}
      >
        {task.completed && <Check size={12} className="text-white" />}
      </div>
      <div className="flex-1">
        <div
          className={`text-sm mb-1 ${task.completed ? "line-through opacity-60" : ""
            }`}
        >
          {task.title}
        </div>
        <div className="flex items-center gap-3 text-xs text-stone-500">
          <span
            className={`px-2 py-0.5 rounded text-[11px] font-medium ${getTypeStyles(task.type)}`}
          >
            {task.type.charAt(0).toUpperCase() + task.type.slice(1)}
          </span>
          {!task.completed && (
            <span
              className={`px-2 py-0.5 rounded text-[11px] font-medium ${getPriorityStyles(task.priority)}`}
            >
              {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}{" "}
              Priority
            </span>
          )}
          <span>{task.completed ? "Completed" : `Due: ${task.dueDate}`}</span>
        </div>
      </div>
    </div>
  );
}

function AICard({ icon, title, description, color }) {
  const getColorStyles = (color) => {
    const styles = {
      blue: "bg-blue-50 text-blue-700",
      purple: "bg-purple-50 text-purple-700",
      green: "bg-green-50 text-green-700",
    };
    return styles[color] || "bg-gray-50 text-gray-700";
  };

  return (
    <div className="bg-white border border-stone-200 rounded-md p-6 cursor-pointer hover:shadow-lg hover:-translate-y-0.5 transition-all">
      <div
        className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${getColorStyles(color)}`}
      >
        {icon}
      </div>
      <div className="text-base font-semibold mb-1.5">{title}</div>
      <div className="text-[13px] text-stone-500 leading-snug">
        {description}
      </div>
    </div>
  );
}

function ActivityItem({ icon, title, time, isLast = false }) {
  return (
    <div
      className={`flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-stone-50 transition-colors ${!isLast ? "border-b border-stone-200" : ""
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
