import { useState, useEffect, useCallback } from "react"
import { API_ENDPOINTS, apiFetch, handleApiResponse } from "@/lib/api"
import type { LogInfo, LogInfoPage } from "@/types"

import { toast } from "@/components/ui/toast"

/**
 * 创建LogInfo的请求参数接口
 */
export interface CreateLogInfoPayload {
  title: string // LogInfo标题（必填）
  description?: string // LogInfo描述（可选）
  type: 0 | 1 | 2 // LogInfo类型：0-info，1-warning，2-error
}


/**
 * 分页获取LogInfo列表
 * @param page - 页码索引（从 0 开始），默认 0
 * @param pageSize - 每页数量，默认 10
 * @returns LogInfo分页数据
 * @throws 当请求失败时抛出错误
 */
const fetchLogInfos = async (
  page: number = 0,
  pageSize: number = 10
): Promise<LogInfoPage> => {
  // 构造请求 URL，后端页码从 1 开始，所以 page + 1
  const url = `${API_ENDPOINTS.LOG_INFOS}?page=${page + 1}&size=${pageSize}`
  const res = await apiFetch(url)
  if (!res.ok) {
    throw new Error(`Failed to fetch log infos: HTTP ${res.status}`)
  }
  return res.json()
}

/**
 * LogInfo列表查询 Hook
 * 用于分页获取LogInfo数据，自动在依赖变化时重新加载
 * @param pageIndex - 当前页码索引（从 0 开始）
 * @param pageSize - 每页LogInfo数量
 * @returns { data, loading, error, refetch } LogInfo数据、加载状态、错误信息、手动刷新方法
 */
export const useLogInfos = (pageIndex: number, pageSize: number) => {
  // LogInfo分页数据状态
  const [data, setData] = useState<LogInfoPage | null>(null)
  // 加载中状态
  const [loading, setLoading] = useState(false)
  // 错误信息状态
  const [error, setError] = useState<Error | null>(null)

  // 使用 useCallback 缓存 fetch 函数，避免不必要的重复创建
  const fetch = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await fetchLogInfos(pageIndex, pageSize)
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
 * 创建LogInfo Hook
 * 提供创建新LogInfo的功能，包含加载状态和错误处理
 * @returns { createLogInfo, loading, error } 创建方法、加载状态、错误信息
 */
export const useCreateLogInfo = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  /**
   * 创建LogInfo
   * @param payload - LogInfo数据
   * @param onSuccess - 创建成功后的回调函数（可选）
   */
  const createLogInfo = useCallback(
    async (payload: CreateLogInfoPayload, onSuccess?: () => void) => {
      setLoading(true)
      setError(null)
      try {
        // 构造请求体：设置默认值，展开用户数据，最后对标题去空格
        const logInfoPayload = {
          title: payload.title.trim(), // 标题去除首尾空格（最后执行，确保不被覆盖）
          description: payload.description?.trim(),
          type: payload.type, // 默认类型：info
        }
        // 发送 POST 请求创建LogInfo
        const res = await apiFetch(API_ENDPOINTS.LOG_INFOS, {
          method: "POST",
          body: JSON.stringify(logInfoPayload),
        })
        await handleApiResponse(res, "create log info")
        // 成功后调用回调（如果提供）
        onSuccess?.()
      } catch (err) {
        setError(err as Error)
        console.error("[useCreateLogInfo] error:", err)
        // 显示用户友好的错误提示
        toast.add({
          type: "warning",
          description: "添加LogInfo失败，请重试",
        })
      } finally {
        setLoading(false)
      }
    },
    []
  )

  return { createLogInfo, loading, error }
}

/**
 * 更新LogInfo Hook
 * 提供修改LogInfo的功能，包含加载状态和错误处理
 * @returns { updateLogInfo, loading, error } 更新方法、加载状态、错误信息
 */
export const useUpdateLogInfo = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  /**
   * 更新LogInfo
   * @param params - 参数对象，包含LogInfo id 和更新字段
   * @param params.id - LogInfo ID
   * @param params.updates - 需要更新的字段（部分更新）
   * @param onSuccess - 更新成功后的回调函数（可选）
   */
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
        // 发送 PUT 请求更新指定LogInfo
        const res = await apiFetch(`${API_ENDPOINTS.LOG_INFOS}/${id}`, {
          method: "PUT",
          body: JSON.stringify(updates),
        })
        await handleApiResponse(res, "update log info")
        onSuccess?.()
      } catch (err) {
        setError(err as Error)
        console.error("[useUpdateLogInfo] error:", err)
        toast.add({
          type: "warning",
          description: "更新LogInfo失败，请重试",
        })
      } finally {
        setLoading(false)
      }
    },
    []
  )

  return { updateLogInfo, loading, error }
}

/**
 * 删除LogInfo Hook
 * 提供删除LogInfo的功能，包含加载状态和错误处理
 * @returns { deleteLogInfo, loading, error } 删除方法、加载状态、错误信息
 */
export const useDeleteLogInfo = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  /**
   * 删除LogInfo
   * @param id - 要删除的LogInfo ID
   * @param onSuccess - 删除成功后的回调函数（可选）
   */
  const deleteLogInfo = useCallback(async (id: number, onSuccess?: () => void) => {
    setLoading(true)
    setError(null)
    try {
      // 发送 DELETE 请求删除指定LogInfo
      const res = await apiFetch(`${API_ENDPOINTS.LOG_INFOS}/${id}`, {
        method: "DELETE",
      })
      await handleApiResponse(res, "delete log info")
      onSuccess?.()
    } catch (err) {
      setError(err as Error)
      console.error("[useDeleteLogInfo] error:", err)
      toast.add({
        type: "warning",
        description: "删除LogInfo失败，请重试",
      })
    } finally {
      setLoading(false)
    }
  }, [])

  return { deleteLogInfo, loading, error }
}
