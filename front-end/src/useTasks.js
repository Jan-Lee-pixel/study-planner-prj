import { useState, useEffect, useCallback } from 'react'
import { supabase } from './supabase'

const TASK_TYPES = ['assignment', 'exam', 'project']
const PRIORITY_LEVELS = ['high', 'medium', 'low']

const validateTaskInput = (taskData) => {
  const errors = []
  
  if (!taskData.title?.trim()) {
    errors.push('Title is required')
  } else if (taskData.title.length > 200) {
    errors.push('Title must be less than 200 characters')
  }
  
  if (!TASK_TYPES.includes(taskData.type)) {
    errors.push('Invalid task type')
  }
  
  if (!PRIORITY_LEVELS.includes(taskData.priority)) {
    errors.push('Invalid priority level')
  }
  
  if (!taskData.dueDate) {
    errors.push('Due date is required')
  } else {
    const dueDate = new Date(taskData.dueDate)
    if (isNaN(dueDate.getTime())) {
      errors.push('Invalid due date format')
    }
  }
  
  if (taskData.description && taskData.description.length > 1000) {
    errors.push('Description must be less than 1000 characters')
  }
  
  return errors
}

export function useTasks(user) {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchTasks = useCallback(async () => {
    if (!user?.id) {
      setTasks([])
      setLoading(false)
      return
    }

    try {
      setError(null)
      
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        throw new Error('Session expired. Please log in again.')
      }

      const { data, error: fetchError } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id)
        .order('due_date', { ascending: true })

      if (fetchError) throw fetchError
      
      setTasks(data || [])
    } catch (err) {
      setError(err.message)
      console.error('Error fetching tasks:', err)
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    fetchTasks()

    if (!user?.id) return

    const subscription = supabase
      .channel('tasks_channel')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'tasks',
        filter: `user_id=eq.${user.id}`
      }, () => {
        fetchTasks()
      })
      .subscribe()

    return () => subscription.unsubscribe()
  }, [user, fetchTasks])

  const addTask = async (taskData) => {
    if (!user?.id) {
      return { success: false, error: 'User not authenticated' }
    }

    const validationErrors = validateTaskInput(taskData)
    if (validationErrors.length > 0) {
      return { success: false, error: validationErrors.join(', ') }
    }

    try {
      setError(null)
      
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        return { success: false, error: 'Session expired. Please log in again.' }
      }

      const sanitizedData = {
        title: taskData.title.trim().substring(0, 200),
        description: (taskData.description || '').trim().substring(0, 1000),
        type: taskData.type,
        priority: taskData.priority,
        due_date: taskData.dueDate,
        user_id: user.id,
        completed: false
      }

      const { data, error: insertError } = await supabase
        .from('tasks')
        .insert(sanitizedData)
        .select()
        .single()

      if (insertError) throw insertError
      return { success: true, data }
    } catch (err) {
      const errorMessage = err.message || 'Failed to create task'
      setError(errorMessage)
      console.error('Error adding task:', err)
      return { success: false, error: errorMessage }
    }
  }

  const toggleTask = async (id) => {
    if (!user?.id || !id) {
      return { success: false, error: 'Invalid request' }
    }

    const task = tasks.find(t => t.id === id)
    if (!task) {
      return { success: false, error: 'Task not found' }
    }

    try {
      setError(null)
      
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        return { success: false, error: 'Session expired. Please log in again.' }
      }

      const { data, error: updateError } = await supabase
        .from('tasks')
        .update({ completed: !task.completed })
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single()

      if (updateError) throw updateError
      return { success: true, data }
    } catch (err) {
      const errorMessage = err.message || 'Failed to update task'
      setError(errorMessage)
      console.error('Error toggling task:', err)
      return { success: false, error: errorMessage }
    }
  }

  const updateTask = async (id, updates) => {
    if (!user?.id || !id) {
      return { success: false, error: 'Invalid request' }
    }

    try {
      setError(null)
      
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        return { success: false, error: 'Session expired. Please log in again.' }
      }

      const updateData = {
        ...(updates.title && { title: updates.title.trim().substring(0, 200) }),
        ...(updates.description !== undefined && { description: updates.description.trim().substring(0, 1000) }),
        ...(updates.type && { type: updates.type }),
        ...(updates.priority && { priority: updates.priority }),
        ...(updates.dueDate && { due_date: updates.dueDate }),
        ...(updates.completed !== undefined && { completed: updates.completed })
      }

      const { data, error: updateError } = await supabase
        .from('tasks')
        .update(updateData)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single()

      if (updateError) throw updateError
      return { success: true, data }
    } catch (err) {
      const errorMessage = err.message || 'Failed to update task'
      setError(errorMessage)
      console.error('Error updating task:', err)
      return { success: false, error: errorMessage }
    }
  }

  const deleteTask = async (id) => {
    if (!user?.id || !id) {
      return { success: false, error: 'Invalid request' }
    }

    try {
      setError(null)
      
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        return { success: false, error: 'Session expired. Please log in again.' }
      }

      const { error: deleteError } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)

      if (deleteError) throw deleteError
      return { success: true }
    } catch (err) {
      const errorMessage = err.message || 'Failed to delete task'
      setError(errorMessage)
      console.error('Error deleting task:', err)
      return { success: false, error: errorMessage }
    }
  }

  return {
    tasks,
    loading,
    error,
    addTask,
    toggleTask,
    updateTask,
    deleteTask,
    refetch: fetchTasks
  }
}