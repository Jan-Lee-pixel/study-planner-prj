import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { supabase } from './supabase'
import { normalizeTask, taskInputSchema, taskUpdateSchema } from './models/taskSchema'

const emptyAction = { type: null, status: 'idle', message: null }

const createTempId = () => `temp-${Math.random().toString(36).slice(2)}`

const parseWithSchema = (payload, schema) => {
  const result = schema.safeParse(payload)
  if (result.success) return { success: true, value: result.data }
  const message = result.error.issues.map(issue => issue.message).join('. ')
  return { success: false, error: message }
}

export function useTasks(user) {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [actionState, setActionState] = useState(emptyAction)
  const [pendingIds, setPendingIds] = useState(new Set())
  const subscriptionRef = useRef(null)

  const normalizedTasks = useMemo(() => tasks.map(normalizeTask).filter(Boolean), [tasks])

  const setPending = useCallback((id, shouldAdd) => {
    setPendingIds(prev => {
      const next = new Set(prev)
      const key = String(id)
      if (shouldAdd) {
        next.add(key)
      } else {
        next.delete(key)
      }
      return next
    })
  }, [])

  const fetchTasks = useCallback(async () => {
    if (!user?.id) {
      setTasks([])
      setLoading(false)
      return
    }

    try {
      setError(null)
      const { data, error: fetchError } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id)
        .order('due_date', { ascending: true })

      if (fetchError) throw fetchError
      setTasks((data || []).map(normalizeTask))
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

    subscriptionRef.current?.unsubscribe?.()
    const subscription = supabase
      .channel('tasks_channel')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tasks',
          filter: `user_id=eq.${user.id}`
        },
        payload => {
          if (payload.eventType === 'DELETE') {
            setTasks(prev => prev.filter(task => String(task.id) !== String(payload.old.id)))
            return
          }

          if (payload.new) {
            const nextTask = normalizeTask(payload.new)
            setTasks(prev => {
              const existingIndex = prev.findIndex(task => String(task.id) === String(nextTask.id))
              if (existingIndex >= 0) {
                const clone = [...prev]
                clone[existingIndex] = nextTask
                return clone
              }
              return [...prev, nextTask]
            })
          }
        }
      )
      .subscribe()

  subscriptionRef.current = subscription
    return () => subscription.unsubscribe()
  }, [user, fetchTasks])

  const addTask = async (taskData) => {
    if (!user?.id) {
      return { success: false, error: 'User not authenticated' }
    }

    const validation = parseWithSchema(taskData, taskInputSchema)
    if (!validation.success) {
      return { success: false, error: validation.error }
    }

    const tempId = createTempId()
    const optimisticTask = normalizeTask({
      id: tempId,
      ...validation.value,
      completed: validation.value.completed ?? false,
      user_id: user.id
    })

    setTasks(prev => [optimisticTask, ...prev])
    setActionState({ type: 'add', status: 'pending', message: null })

    try {
      const { data, error: insertError } = await supabase
        .from('tasks')
        .insert({
          title: optimisticTask.title,
          description: optimisticTask.description,
          type: optimisticTask.type,
          priority: optimisticTask.priority,
          due_date: optimisticTask.dueDate,
          completed: optimisticTask.completed,
          user_id: user.id
        })
        .select()
        .single()

      if (insertError) throw insertError

      setTasks(prev => prev.map(task => (task.id === tempId ? normalizeTask(data) : task)))
      setActionState({ type: 'add', status: 'success', message: 'Task created successfully' })
      return { success: true, data }
    } catch (err) {
      setTasks(prev => prev.filter(task => task.id !== tempId))
      const errorMessage = err.message || 'Failed to create task'
      setError(errorMessage)
      setActionState({ type: 'add', status: 'error', message: errorMessage })
      console.error('Error adding task:', err)
      return { success: false, error: errorMessage }
    }
  }

  const toggleTask = async (id) => {
    if (!user?.id || !id) {
      return { success: false, error: 'Invalid request' }
    }

    const task = normalizedTasks.find(item => String(item.id) === String(id))
    if (!task) {
      return { success: false, error: 'Task not found' }
    }

    const nextCompleted = !task.completed
    setPending(id, true)
    setTasks(prev =>
      prev.map(item => (String(item.id) === String(id) ? { ...item, completed: nextCompleted } : item))
    )

    try {
      const { data, error: updateError } = await supabase
        .from('tasks')
        .update({ completed: nextCompleted })
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single()

      if (updateError) throw updateError

      setTasks(prev =>
        prev.map(item => (String(item.id) === String(id) ? normalizeTask(data) : item))
      )
      setActionState({
        type: 'toggle',
        status: 'success',
        message: nextCompleted ? 'Task completed' : 'Task marked pending'
      })
      return { success: true, data }
    } catch (err) {
      setTasks(prev =>
        prev.map(item => (String(item.id) === String(id) ? { ...item, completed: task.completed } : item))
      )
      const errorMessage = err.message || 'Failed to update task'
      setError(errorMessage)
      setActionState({ type: 'toggle', status: 'error', message: errorMessage })
      console.error('Error toggling task:', err)
      return { success: false, error: errorMessage }
    } finally {
      setPending(id, false)
    }
  }

  const updateTask = async (id, updates) => {
    if (!user?.id || !id) {
      return { success: false, error: 'Invalid request' }
    }

    const validation = parseWithSchema(updates, taskUpdateSchema)
    if (!validation.success) {
      return { success: false, error: validation.error }
    }

    const currentTask = normalizedTasks.find(task => String(task.id) === String(id))
    if (!currentTask) {
      return { success: false, error: 'Task not found' }
    }

    const optimisticTask = { ...currentTask, ...validation.value }
    if (validation.value.dueDate) optimisticTask.dueDate = validation.value.dueDate

    setTasks(prev => prev.map(task => (String(task.id) === String(id) ? optimisticTask : task)))
    setPending(id, true)

    try {
      const { data, error: updateError } = await supabase
        .from('tasks')
        .update({
          ...(validation.value.title && { title: validation.value.title }),
          ...(validation.value.description !== undefined && { description: validation.value.description || '' }),
          ...(validation.value.type && { type: validation.value.type }),
          ...(validation.value.priority && { priority: validation.value.priority }),
          ...(validation.value.dueDate && { due_date: validation.value.dueDate }),
          ...(validation.value.completed !== undefined && { completed: validation.value.completed }),
        })
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single()

      if (updateError) throw updateError

      setTasks(prev =>
        prev.map(task => (String(task.id) === String(id) ? normalizeTask(data) : task))
      )
      setActionState({ type: 'update', status: 'success', message: 'Task updated' })
      return { success: true, data }
    } catch (err) {
      setTasks(prev => prev.map(task => (String(task.id) === String(id) ? currentTask : task)))
      const errorMessage = err.message || 'Failed to update task'
      setError(errorMessage)
      setActionState({ type: 'update', status: 'error', message: errorMessage })
      console.error('Error updating task:', err)
      return { success: false, error: errorMessage }
    } finally {
      setPending(id, false)
    }
  }

  const deleteTask = async (id) => {
    if (!user?.id || !id) {
      return { success: false, error: 'Invalid request' }
    }

    const existingTask = normalizedTasks.find(task => String(task.id) === String(id))
    if (!existingTask) {
      return { success: false, error: 'Task not found' }
    }

    setTasks(prev => prev.filter(task => String(task.id) !== String(id)))
    setPending(id, true)

    try {
      const { error: deleteError } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)

      if (deleteError) throw deleteError

      setActionState({ type: 'delete', status: 'success', message: 'Task deleted' })
      return { success: true }
    } catch (err) {
      setTasks(prev => [...prev, existingTask])
      const errorMessage = err.message || 'Failed to delete task'
      setError(errorMessage)
      setActionState({ type: 'delete', status: 'error', message: errorMessage })
      console.error('Error deleting task:', err)
      return { success: false, error: errorMessage }
    } finally {
      setPending(id, false)
    }
  }

  return {
    tasks: normalizedTasks,
    loading,
    error,
    actionState,
    pendingIds,
    addTask,
    toggleTask,
    updateTask,
    deleteTask,
    refetch: fetchTasks
  }
}
