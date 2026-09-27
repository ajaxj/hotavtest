import { useState, useEffect, useCallback } from "react"
import { API_ENDPOINTS, apiFetch } from "@/lib/api"
import type { Task, TaskPage } from "@/types"

import { toast } from "@/components/ui/toast"

/**
 * 创建任务的请求参数接口
 */
export interface CreateTaskPayload {
  title: string          // 任务标题（必填）
  description?: string   // 任务描述（可选）
  status?: 0 | 1 | 2     // 任务状态：0-待办，1-进行中，2-已完成（可选）
  completed?: boolean    // 是否已完成（可选）
}

/**
 * 统一处理 API 响应的辅助函数
 * @param res - Fetch 响应对象
 * @param label - 操作标签，用于错误信息描述
 * @returns 解析后的 JSON 数据或 undefined（当响应非 JSON 时）
 * @throws 当响应状态码非 2xx 时抛出错误
 */
const handleResponse = async (res: Response, label: string) => {
  // 检查响应是否成功
  if (!res.ok) {
    // 尝试读取响应体文本作为错误详情
    const text = await res.text().catch(() => "")
    throw new Error(`Failed to ${label}: HTTP ${res.status} ${text}`)
  }
  // 根据 Content-Type 判断是否需要解析 JSON
  const contentType = res.headers.get("content-type") ?? ""
  return contentType.includes("application/json") ? res.json() : undefined
}

/**
 * 分页获取任务列表
 * @param page - 页码索引（从 0 开始），默认 0
 * @param pageSize - 每页数量，默认 10
 * @returns 任务分页数据
 * @throws 当请求失败时抛出错误
 */
const fetchTasks = async (
  page: number = 0,
  pageSize: number = 10
): Promise<TaskPage> => {
  // 构造请求 URL，后端页码从 1 开始，所以 page + 1
  const url = `${API_ENDPOINTS.TASKS}?page=${page + 1}&size=${pageSize}`
  const res = await apiFetch(url)
  if (!res.ok) {
    throw new Error(`Failed to fetch tasks: HTTP ${res.status}`)
  }
  return res.json()
}

/**
 * 任务列表查询 Hook
 * 用于分页获取任务数据，自动在依赖变化时重新加载
 * @param pageIndex - 当前页码索引（从 0 开始）
 * @param pageSize - 每页任务数量
 * @returns { data, loading, error, refetch } 任务数据、加载状态、错误信息、手动刷新方法
 */
export const useTasks = (pageIndex: number, pageSize: number) => {
  // 任务分页数据状态
  const [data, setData] = useState<TaskPage | null>(null)
  // 加载中状态
  const [loading, setLoading] = useState(false)
  // 错误信息状态
  const [error, setError] = useState<Error | null>(null)

  // 使用 useCallback 缓存 fetch 函数，避免不必要的重复创建
  const fetch = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await fetchTasks(pageIndex, pageSize)
      setData(result)
    } catch (err) {
      setError(err as Error)
    } finally {
      // 无论成功失败，最终都关闭加载状态
      setLoading(false)
    }
  }, [pageIndex, pageSize])

  // 副作用：在 fetch 函数变化时自动加载数据
  useEffect(() => {
    const loadData = async () => {
      await fetch()
    }
    loadData()
  }, [fetch])

  return { data, loading, error, refetch: fetch }
}

/**
 * 创建任务 Hook
 * 提供创建新任务的功能，包含加载状态和错误处理
 * @returns { createTask, loading, error } 创建方法、加载状态、错误信息
 */
export const useCreateTask = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  /**
   * 创建任务
   * @param payload - 任务数据
   * @param onSuccess - 创建成功后的回调函数（可选）
   */
  const createTask = useCallback(async (payload: CreateTaskPayload, onSuccess?: () => void) => {
    setLoading(true)
    setError(null)
    try {
      // 构造请求体：设置默认值，展开用户数据，最后对标题去空格
      const taskPayload = {
        status: 0,                    // 默认状态：待办
        completed: false,             // 默认未完成
        description: "",              // 默认空描述
        ...payload,                   // 展开用户传入的参数（会覆盖上面的默认值）
        title: payload.title.trim(),  // 标题去除首尾空格（最后执行，确保不被覆盖）
      }
      // 发送 POST 请求创建任务
      const res = await apiFetch(API_ENDPOINTS.TASKS, {
        method: "POST",
        body: JSON.stringify(taskPayload),
      })
      await handleResponse(res, "create task")
      // 成功后调用回调（如果提供）
      onSuccess?.()
    } catch (err) {
      setError(err as Error)
      console.error("[useCreateTask] error:", err)
      // 显示用户友好的错误提示
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

/**
 * 更新任务 Hook
 * 提供修改任务的功能，包含加载状态和错误处理
 * @returns { updateTask, loading, error } 更新方法、加载状态、错误信息
 */
export const useUpdateTask = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  /**
   * 更新任务
   * @param params - 参数对象，包含任务 id 和更新字段
   * @param params.id - 任务 ID
   * @param params.updates - 需要更新的字段（部分更新）
   * @param onSuccess - 更新成功后的回调函数（可选）
   */
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
      // 发送 PUT 请求更新指定任务
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

/**
 * 删除任务 Hook
 * 提供删除任务的功能，包含加载状态和错误处理
 * @returns { deleteTask, loading, error } 删除方法、加载状态、错误信息
 */
export const useDeleteTask = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  /**
   * 删除任务
   * @param id - 要删除的任务 ID
   * @param onSuccess - 删除成功后的回调函数（可选）
   */
  const deleteTask = useCallback(async (id: number, onSuccess?: () => void) => {
    setLoading(true)
    setError(null)
    try {
      // 发送 DELETE 请求删除指定任务
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