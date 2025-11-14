import { describe, expect, it, vi } from 'vitest';
import { normalizeTask, isOverdue } from './taskSchema';

describe('taskSchema helpers', () => {
  it('normalizes legacy task fields', () => {
    const result = normalizeTask({
      id: 42,
      title: 'Test task ',
      description: null,
      type: 'assignment',
      priority: 'high',
      due_date: '2025-01-05',
      completed: 0,
    });

    expect(result).toEqual({
      id: 42,
      title: 'Test task',
      description: '',
      type: 'assignment',
      priority: 'high',
      dueDate: '2025-01-05',
      completed: false,
      createdAt: null,
      updatedAt: null,
      user_id: undefined,
    });
  });

  it('identifies overdue tasks', () => {
    const now = new Date('2025-01-10T00:00:00Z');
    vi.setSystemTime(now);

    expect(
      isOverdue({
        completed: false,
        dueDate: '2025-01-01',
      })
    ).toBe(true);

    expect(
      isOverdue({
        completed: true,
        dueDate: '2025-01-01',
      })
    ).toBe(false);

    expect(
      isOverdue({
        completed: false,
        dueDate: '2025-01-12',
      })
    ).toBe(false);

    vi.useRealTimers();
  });
});
