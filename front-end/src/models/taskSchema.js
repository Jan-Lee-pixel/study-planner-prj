import { z } from 'zod';

export const TaskTypeEnum = z.enum(['assignment', 'exam', 'project']);
export const PriorityEnum = z.enum(['high', 'medium', 'low']);

const descriptionField = z
  .string()
  .max(1000, 'Description must be under 1000 characters')
  .nullable()
  .optional();

export const baseTaskFields = {
  id: z.union([z.string(), z.number()]),
  title: z.string().min(1, 'Title is required').max(200, 'Title is limited to 200 characters'),
  description: descriptionField,
  type: TaskTypeEnum,
  priority: PriorityEnum,
  dueDate: z.string().min(1, 'Due date is required'),
  completed: z.boolean().default(false),
  createdAt: z.string().nullable().optional(),
  updatedAt: z.string().nullable().optional(),
};

export const taskSchema = z.object(baseTaskFields);

export const taskInputSchema = z.object({
  title: baseTaskFields.title,
  description: descriptionField,
  type: TaskTypeEnum.default('assignment'),
  priority: PriorityEnum.default('medium'),
  dueDate: baseTaskFields.dueDate,
  completed: z.boolean().optional(),
});

export const taskUpdateSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(1000).nullable().optional(),
  type: TaskTypeEnum.optional(),
  priority: PriorityEnum.optional(),
  dueDate: z.string().optional(),
  completed: z.boolean().optional(),
});

export const normalizeTask = (task) => {
  if (!task) return null;
  return {
    id: task.id,
    title: (task.title || '').trim(),
    description: task.description || '',
    type: task.type || 'assignment',
    priority: task.priority || 'medium',
    dueDate: task.dueDate || task.due_date || '',
    completed: Boolean(task.completed),
    createdAt: task.created_at || task.createdAt || null,
    updatedAt: task.updated_at || task.updatedAt || null,
    user_id: task.user_id,
  };
};

export const isOverdue = (task) => {
  if (!task?.dueDate) return false;
  const due = new Date(task.dueDate);
  if (Number.isNaN(due.getTime())) return false;
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return !task.completed && due < now;
};

export const isDueSoon = (task, days = 3) => {
  if (!task?.dueDate) return false;
  const due = new Date(task.dueDate);
  if (Number.isNaN(due.getTime())) return false;
  const now = new Date();
  const soon = new Date();
  soon.setDate(now.getDate() + days);
  return !task.completed && due <= soon;
};

export const formatDueDate = (value, options = {}) => {
  if (!value) return 'No due date';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'No due date';
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: options.includeYear ? 'numeric' : undefined,
    weekday: options.includeWeekday ? 'long' : undefined,
  });
};
