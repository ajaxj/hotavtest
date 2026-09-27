import { useState, useEffect, useCallback } from "react"
import { API_ENDPOINTS, apiFetch, handleApiResponse } from "@/lib/api"
import type { FetchSite, FetchSitePage } from "@/types"

import { toast } from "@/components/ui/toast"

/**
 * 创建FetchSite的请求参数接口
 */
export interface CreateFetchSitePayload {
  name: string // FetchSite名称（必填）
  fetch_url?: string // FetchSiteURL地址（可选）
  status?: 0 | 1 | 2 // FetchSite状态：0-待办，1-进行中，2-已完成（可选）
}

// /**
//  * 统一处理 API 响应的辅助函数
//  * @param res - Fetch 响应对象
//  * @param label - 操作标签，用于错误信息描述
//  * @returns 解析后的 JSON 数据或 undefined（当响应非 JSON 时）
//  * @throws 当响应状态码非 2xx 时抛出错误
//  */
// const handleResponse = async (res: Response, label: string) => {
//   // 检查响应是否成功
//   if (!res.ok) {
//     // 尝试读取响应体文本作为错误详情
//     const text = await res.text().catch(() => "")
//     throw new Error(`Failed to ${label}: HTTP ${res.status} ${text}`)
//   }
//   // 根据 Content-Type 判断是否需要解析 JSON
//   const contentType = res.headers.get("content-type") ?? ""
//   return contentType.includes("application/json") ? res.json() : undefined
// }

/**
 * 分页获取FetchSite列表
 * @param page - 页码索引（从 0 开始），默认 0
 * @param pageSize - 每页数量，默认 10
 * @returns FetchSite分页数据
 * @throws 当请求失败时抛出错误
 */
const fetchFetchSites = async (
  page: number = 0,
  pageSize: number = 10
): Promise<FetchSitePage> => {
  // 构造请求 URL，后端页码从 1 开始，所以 page + 1
  const url = `${API_ENDPOINTS.FETCH_SITES}?page=${page + 1}&size=${pageSize}`
  const res = await apiFetch(url)
  if (!res.ok) {
    throw new Error(`Failed to fetch fetch sites: HTTP ${res.status}`)
  }
  return res.json()
}

/**
 * FetchSite列表查询 Hook
 * 用于分页获取FetchSite数据，自动在依赖变化时重新加载
 * @param pageIndex - 当前页码索引（从 0 开始）
 * @param pageSize - 每页FetchSite数量
 * @returns { data, loading, error, refetch } FetchSite数据、加载状态、错误信息、手动刷新方法
 */
export const useFetchSites = (pageIndex: number, pageSize: number) => {
  // FetchSite分页数据状态
  const [data, setData] = useState<FetchSitePage | null>(null)
  // 加载中状态
  const [loading, setLoading] = useState(false)
  // 错误信息状态
  const [error, setError] = useState<Error | null>(null)

  // 使用 useCallback 缓存 fetch 函数，避免不必要的重复创建
  const fetch = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await fetchFetchSites(pageIndex, pageSize)
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
 * 创建FetchSite Hook
 * 提供创建新FetchSite的功能，包含加载状态和错误处理
 * @returns { createTask, loading, error } 创建方法、加载状态、错误信息
 */
export const useCreateFetchSite = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  /**
   * 创建FetchSite
   * @param payload - FetchSite数据
   * @param onSuccess - 创建成功后的回调函数（可选）
   */
  const createFetchSite = useCallback(
    async (payload: CreateFetchSitePayload, onSuccess?: () => void) => {
      setLoading(true)
      setError(null)
      try {
        // 构造请求体：设置默认值，展开用户数据，最后对标题去空格
        const fetchSitePayload = {
          status: 0,
          ...payload, // 展开用户传入的参数（会覆盖上面的默认值）
          name: payload.name.trim(), // 名称去除首尾空格（最后执行，确保不被覆盖）
          fetch_url: payload.fetch_url?.trim(), // URL去除首尾空格（最后执行，确保不被覆盖）
        }
        // 发送 POST 请求创建FetchSite
        const res = await apiFetch(API_ENDPOINTS.FETCH_SITES, {
          method: "POST",
          body: JSON.stringify(fetchSitePayload),
        })
        await handleApiResponse(res, "create fetch site")
        // 成功后调用回调（如果提供）
        onSuccess?.()
      } catch (err) {
        setError(err as Error)
        console.error("[useCreateFetchSite] error:", err)
        // 显示用户友好的错误提示
        toast.add({
          type: "warning",
          description: "添加FetchSite失败，请重试",
        })
      } finally {
        setLoading(false)
      }
    },
    []
  )

  return { createFetchSite, loading, error }
}

/**
 * 更新FetchSite Hook
 * 提供修改FetchSite的功能，包含加载状态和错误处理
 * @returns { updateFetchSite, loading, error } 更新方法、加载状态、错误信息
 */
export const useUpdateFetchSite = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  /**
   * 更新FetchSite
   * @param params - 参数对象，包含FetchSite id 和更新字段
   * @param params.id - FetchSite ID
   * @param params.updates - 需要更新的字段（部分更新）
   * @param onSuccess - 更新成功后的回调函数（可选）
   */
  const updateFetchSite = useCallback(
    async (
      {
        id,
        updates,
      }: {
        id: number
        updates: Partial<FetchSite>
      },
      onSuccess?: () => void
    ) => {
      setLoading(true)
      setError(null)
      try {
        // 发送 PUT 请求更新指定FetchSite
        const res = await apiFetch(`${API_ENDPOINTS.FETCH_SITES}/${id}`, {
          method: "PUT",
          body: JSON.stringify(updates),
        })
        await handleApiResponse(res, "update fetch site")
        onSuccess?.()
      } catch (err) {
        setError(err as Error)
        console.error("[useUpdateFetchSite] error:", err)
        toast.add({
          type: "warning",
          description: "更新FetchSite失败，请重试",
        })
      } finally {
        setLoading(false)
      }
    },
    []
  )

  return { updateFetchSite, loading, error }
}

/**
 * 删除FetchSite Hook
 * 提供删除FetchSite的功能，包含加载状态和错误处理
 * @returns { deleteFetchSite, loading, error } 删除方法、加载状态、错误信息
 */
export const useDeleteFetchSite = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  /**
   * 删除FetchSite
   * @param id - 要删除的FetchSite ID
   * @param onSuccess - 删除成功后的回调函数（可选）
   */
  const deleteFetchSite = useCallback(async (id: number, onSuccess?: () => void) => {
    setLoading(true)
    setError(null)
    try {
      // 发送 DELETE 请求删除指定FetchSite
      const res = await apiFetch(`${API_ENDPOINTS.FETCH_SITES}/${id}`, {
        method: "DELETE",
      })
      await handleApiResponse(res, "delete fetch site")
      onSuccess?.()
    } catch (err) {
      setError(err as Error)
      console.error("[useDeleteFetchSite] error:", err)
      toast.add({
        type: "warning",
        description: "删除FetchSite失败，请重试",
      })
    } finally {
      setLoading(false)
    }
  }, [])

  return { deleteFetchSite, loading, error }
}
