import React, { useState } from 'react';
import { X } from 'lucide-react';

export default function TaskModal({ isOpen, onClose, onSubmit, task = null }) {
  const [formData, setFormData] = useState({
    title: task?.title || "",
    type: task?.type || "assignment",
    priority: task?.priority || "medium",
    dueDate: task?.dueDate || "",
    description: task?.description || "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.dueDate) return;

    setIsSubmitting(true);
    setSubmitError('');

    try {
      const result = await onSubmit(formData);
      if (result?.success) {
        setFormData({
          title: "",
          type: "assignment",
          priority: "medium",
          dueDate: "",
          description: "",
        });
        onClose();
      } else {
        setSubmitError(result?.error || 'Failed to save task');
      }
    } catch (error) {
      setSubmitError('An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-stone-200 flex items-center justify-between">
          <h2 className="text-xl font-semibold">
            {task ? 'Edit Task' : 'Create New Task'}
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded hover:bg-stone-100 flex items-center justify-center text-stone-500 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {submitError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-md text-sm">
              {submitError}
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">
              Task Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Enter task title..."
              className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">
              Task Type
            </label>
            <div className="grid grid-cols-3 gap-2">
              {['assignment', 'exam', 'project'].map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setFormData({ ...formData, type })}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    formData.type === type
                      ? `${type === 'assignment' ? 'bg-blue-100 text-blue-700 border-2 border-blue-500' :
                          type === 'exam' ? 'bg-pink-100 text-pink-700 border-2 border-pink-500' :
                          'bg-purple-100 text-purple-700 border-2 border-purple-500'}`
                      : "bg-stone-50 text-stone-700 border border-stone-200 hover:bg-stone-100"
                  }`}
                >
                  {type === 'assignment' ? '📖' : type === 'exam' ? '📋' : '💼'} {type.charAt(0).toUpperCase() + type.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">
              Priority Level
            </label>
            <div className="grid grid-cols-3 gap-2">
              {['high', 'medium', 'low'].map((priority) => (
                <button
                  key={priority}
                  type="button"
                  onClick={() => setFormData({ ...formData, priority })}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    formData.priority === priority
                      ? `${priority === 'high' ? 'bg-red-100 text-red-700 border-2 border-red-500' :
                          priority === 'medium' ? 'bg-orange-100 text-orange-700 border-2 border-orange-500' :
                          'bg-green-100 text-green-700 border-2 border-green-500'}`
                      : "bg-stone-50 text-stone-700 border border-stone-200 hover:bg-stone-100"
                  }`}
                >
                  {priority === 'high' ? '🔴' : priority === 'medium' ? '🟡' : '🟢'} {priority.charAt(0).toUpperCase() + priority.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">
              Due Date *
            </label>
            <input
              type="date"
              value={formData.dueDate}
              onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">
              Description (Optional)
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Add any additional details..."
              rows={3}
              className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-stone-300 rounded-md text-sm font-medium text-stone-700 hover:bg-stone-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !formData.title.trim() || !formData.dueDate}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? 'Saving...' : (task ? 'Update Task' : 'Create Task')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}