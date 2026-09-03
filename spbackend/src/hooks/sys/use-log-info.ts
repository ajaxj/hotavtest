import { useState, useEffect, useCallback } from "react"
import { API_ENDPOINTS, apiFetch } from "@/lib/api"
import type { LogInfo, LogInfoPage } from "@/types"

import { toast } from "@/components/ui/toast"

export interface CreateLogInfoPayload {
  title: string
  description?: string
  type?: 0 | 1 | 2
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
): Promise<LogInfoPage> => {
  const url = `${API_ENDPOINTS.LOG_INFOS}?page=${page + 1}&size=${pageSize}`
  const res = await apiFetch(url)
  if (!res.ok) {
    throw new Error(`Failed to fetch log infos: HTTP ${res.status}`)
  }
  return res.json()
}

export const useLogInfosPage = (pageIndex: number, pageSize: number) => {
  const [data, setData] = useState<LogInfoPage | null>(null)
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

export const useCreateLogInfo = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const createLogInfo = useCallback(
    async (payload: CreateLogInfoPayload, onSuccess?: () => void) => {
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
    },
    []
  )

  return { createLogInfo, loading, error }
}

export const useUpdateLogInfo = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const updateLogInfo = useCallback(
    async (
      {
        id,
        updates,
      }: {
        id: number
        updates: Partial<LogInfo>
      },
      onSuccess?: () => void
    ) => {
      setLoading(true)
      setError(null)
      try {
        const res = await apiFetch(`${API_ENDPOINTS.LOG_INFOS}/${id}`, {
          method: "PUT",
          body: JSON.stringify(updates),
        })
        await handleResponse(res, "update log info")
        onSuccess?.()
      } catch (err) {
        setError(err as Error)
        console.error("[useUpdateLogInfo] error:", err)
        toast.add({
          type: "warning",
          description: "更新日志信息失败，请重试",
        })
      } finally {
        setLoading(false)
      }
    },
    []
  )

  return { updateLogInfo, loading, error }
}

export const useDeleteLogInfo = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const deleteLogInfo = useCallback(async (id: number, onSuccess?: () => void) => {
    setLoading(true)
    setError(null)
    try {
      const res = await apiFetch(`${API_ENDPOINTS.LOG_INFOS}/${id}`, {
        method: "DELETE",
      })
      await handleResponse(res, "delete log info")
      onSuccess?.()
    } catch (err) {
      setError(err as Error)
      console.error("[useDeleteLogInfo] error:", err)
      toast.add({
        type: "warning",
        description: "删除日志信息失败，请重试",
      })
    } finally {
      setLoading(false)
    }
  }, [])

  return { deleteLogInfo, loading, error }
}
