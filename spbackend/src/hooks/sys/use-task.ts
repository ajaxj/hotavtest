import { useState, useEffect, useCallback } from "react"
import { API_ENDPOINTS, apiFetch } from "@/lib/api"
import type { Task, TaskPage } from "@/types"

import { toast } from "@/components/ui/toast"

export interface CreateTaskPayload {
  title: string
  description?: string
  status?: 0 | 1 | 2
  completed?: boolean
}

const handleResponse = async (res: Response, label: string) => {
  if (!res.ok) {
    const text = await res.text().catch(() => "")
    throw new Error(`Failed to ${label}: HTTP ${res.status} ${text}`)
  }
  const contentType = res.headers.get("content-type") ?? ""
  return contentType.includes("application/json") ? res.json() : undefined
}

const fetchTasks = async (
  page: number = 0,
  pageSize: number = 10
): Promise<TaskPage> => {
  const url = `${API_ENDPOINTS.TASKS}?page=${page + 1}&size=${pageSize}`
  const res = await apiFetch(url)
  if (!res.ok) {
    throw new Error(`Failed to fetch tasks: HTTP ${res.status}`)
  }
  return res.json()
}

export const useTasks = (pageIndex: number, pageSize: number) => {
  const [data, setData] = useState<TaskPage | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const fetch = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await fetchTasks(pageIndex, pageSize)
      setData(result)
    } catch (err) {
      setError(err as Error)
    } finally {
      setLoading(false)
    }
  }, [pageIndex, pageSize])

  useEffect(() => {
    const loadData = async () => {
      await fetch()
    }
    loadData()
  }, [fetch])

  return { data, loading, error, refetch: fetch }
}

export const useCreateTask = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const createTask = useCallback(async (payload: CreateTaskPayload, onSuccess?: () => void) => {
    setLoading(true)
    setError(null)
    try {
      const taskPayload = {
        status: 0,
        completed: false,
        description: "",
        ...payload,
        title: payload.title.trim(),
      }
      const res = await apiFetch(API_ENDPOINTS.TASKS, {
        method: "POST",
        body: JSON.stringify(taskPayload),
      })
      await handleResponse(res, "create task")
      onSuccess?.()
    } catch (err) {
      setError(err as Error)
      console.error("[useCreateTask] error:", err)
      toast.add({
        type: "warning",
        description: "添加任务失败，请重试",
      })
    } finally {
      setLoading(false)
    }
  }, [])

  return { createTask, loading, error }
}

export const useUpdateTask = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const updateTask = useCallback(async ({
    id,
    updates,
  }: {
    id: number
    updates: Partial<Task>
  }, onSuccess?: () => void) => {
    setLoading(true)
    setError(null)
    try {
      const res = await apiFetch(`${API_ENDPOINTS.TASKS}/${id}`, {
        method: "PUT",
        body: JSON.stringify(updates),
      })
      await handleResponse(res, "update task")
      onSuccess?.()
    } catch (err) {
      setError(err as Error)
      console.error("[useUpdateTask] error:", err)
      toast.add({
        type: "warning",
        description: "更新任务失败，请重试",
      })
    } finally {
      setLoading(false)
    }
  }, [])

  return { updateTask, loading, error }
}

export const useDeleteTask = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const deleteTask = useCallback(async (id: number, onSuccess?: () => void) => {
    setLoading(true)
    setError(null)
    try {
      const res = await apiFetch(`${API_ENDPOINTS.TASKS}/${id}`, {
        method: "DELETE",
      })
      await handleResponse(res, "delete task")
      onSuccess?.()
    } catch (err) {
      setError(err as Error)
      console.error("[useDeleteTask] error:", err)
      toast.add({
        type: "warning",
        description: "删除任务失败，请重试",
      })
    } finally {
      setLoading(false)
    }
  }, [])

  return { deleteTask, loading, error }
}
