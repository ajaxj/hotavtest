import type { TempTvRes, TempTvResPage } from "@/types"
import { API_ENDPOINTS, apiFetch, handleApiResponse } from "@/lib/api.ts"
import { useCallback, useEffect, useState } from "react"
import { toast } from "@/components/ui/toast.tsx"

/**
 * 创建 Tv TempRes请求体
 */
export interface CreateTempTvResPayload {
  title: string
  fetch_url: string
  src: number
  status: number
}

const fetchTempTvRes = async (
  page: number = 0,
  pageSize: number = 10
): Promise<TempTvResPage> => {
  // 构造请求 URL，后端页码从 1 开始，所以 page + 1
  const url = `${API_ENDPOINTS.TEMP_TV_RES}?page=${page + 1}&size=${pageSize}`
  const response = await apiFetch(url, { method: "GET" })
  if (!response.ok) {
    throw new Error(`获取 Temp TvRes列表失败，状态码：${response.status}`)
  }

  return response.json()
}

export const useTempTvResPage = (pageIndex: number, pageSize: number) => {
  // 任务分页数据状态
  const [data, setData] = useState<TempTvResPage | null>(null)
  // 加载中状态
  const [loading, setLoading] = useState(false)
  // 错误信息状态
  const [error, setError] = useState<Error | null>(null)

  // 使用 useCallback 缓存 fetch 函数，避免不必要的重复创建
  const fetch = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await fetchTempTvRes(pageIndex, pageSize)
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

export const useCreateTempTvRes = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  /**
   * 创建 Temp TvRes
   * @param payload - TvRes数据
   * @param onSuccess - 创建成功后的回调函数（可选）
   */
  const createTempTvRes = useCallback(
    async (payload: CreateTempTvResPayload, onSuccess?: () => void) => {
      setLoading(true)
      setError(null)
      try {
        // 构造请求体：设置默认值，展开用户数据，最后对标题去空格

        const categoryPayload = {
          title: payload.title.trim(),
          fetch_url: payload.fetch_url.trim(),
          src: payload.src,
        }

        const res = await apiFetch(API_ENDPOINTS.TEMP_TV_RES, {
          method: "POST",
          body: JSON.stringify(categoryPayload),
        })
        await handleApiResponse(res, "create Temp TvRes")
        onSuccess?.()
      } catch (err) {
        setError(err as Error)
        console.error("[useCreateTempTvRes] error:", err)
        // 显示用户友好的错误提示
        toast.add({
          type: "warning",
          description: "添加TvRes失败，请重试",
        })
      } finally {
        setLoading(false)
      }
    },
    []
  )

  return { createTempTvRes, loading, error }
}

export const useUpdateTempTvRes = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const updateTempTvRes = useCallback(
    async (
      {
        id,
        updates,
      }: {
        id: number
        updates: Partial<TempTvRes>
      },
      onSuccess?: () => void
    ) => {
      setLoading(true)
      setError(null)
      try {
        // 发送 PUT 请求更新指定Tag
        const res = await apiFetch(`${API_ENDPOINTS.TEMP_TV_RES}/${id}`, {
          method: "PUT",
          body: JSON.stringify(updates),
        })
        await handleApiResponse(res, "update Temp TvRes")
        onSuccess?.()
      } catch (err) {
        setError(err as Error)
        console.error("[useUpdateTempTvRes] error:", err)
        toast.add({
          type: "warning",
          description: "更新TvRes失败，请重试",
        })
      } finally {
        setLoading(false)
      }
    },
    []
  )

  return { updateTempTvRes, loading, error }
}

export const useDeleteTempTvRes = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const deleteTempTvRes = useCallback(
    async (id: number, onSuccess?: () => void) => {
      setLoading(true)
      setError(null)
      try {
        // 发送 DELETE 请求删除指定Tag
        const res = await apiFetch(`${API_ENDPOINTS.TEMP_TV_RES}/${id}`, {
          method: "DELETE",
        })
        await handleApiResponse(res, "delete Temp TvRes")
        onSuccess?.()
      } catch (err) {
        setError(err as Error)
        console.error("[useDeleteTempTvRes] error:", err)
        // 显示用户友好的错误提示
        toast.add({
          type: "warning",
          description: "删除 Temp TvRes失败，请重试",
        })
      } finally {
        setLoading(false)
      }
    },
    []
  )

  return { deleteTempTvRes, loading, error }
}
