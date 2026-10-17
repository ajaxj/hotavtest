import type { TempMovie, TempMoviePage } from "@/types"
import { API_ENDPOINTS, apiFetch, handleApiResponse } from "@/lib/api.ts"
import { useCallback, useEffect, useState } from "react"
import { toast } from "@/components/ui/toast.tsx"

/**
 * 创建 Tv TempMovie请求体
 */
export interface CreateTempMoviePayload {
  title: string
  // img: string
  fetch_url: string
  src: number
  status: number
  // total: number
  // created: string
  // updated: string
}

const fetchTempCategories = async (
  page: number = 0,
  pageSize: number = 10,
  src: number =0
): Promise<TempMoviePage> => {
  // 构造请求 URL，后端页码从 1 开始，所以 page + 1
  const url = `${API_ENDPOINTS.TEMP_MOVIES}?page=${page + 1}&size=${pageSize}&src=${src}`
  const response = await apiFetch(url, { method: "GET" })
  if (!response.ok) {
    throw new Error(`获取 Temp 影片列表失败，状态码：${response.status}`)
  }

  return response.json()
}

export const useTempMovies = (pageIndex: number, pageSize: number,src: number) => {
  // 任务分页数据状态
  const [data, setData] = useState<TempMoviePage | null>(null)
  // 加载中状态
  const [loading, setLoading] = useState(false)
  // 错误信息状态
  const [error, setError] = useState<Error | null>(null)

  // 使用 useCallback 缓存 fetch 函数，避免不必要的重复创建
  const fetch = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await fetchTempCategories(pageIndex, pageSize,src)
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

export const useCreateTempMovie = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  /**
   * 创建 Temp 影片
   * @param payload - 影片数据
   * @param onSuccess - 创建成功后的回调函数（可选）
   */
  const createTempMovie = useCallback(
    async (payload: CreateTempMoviePayload, onSuccess?: () => void) => {
      setLoading(true)
      setError(null)
      try {
        // 构造请求体：设置默认值，展开用户数据，最后对标题去空格

        const moviePayload = {
          title: payload.title.trim(),
          fetch_url: payload.fetch_url.trim(),
          src: payload.src,
          status: payload.status,
        }

        const res = await apiFetch(API_ENDPOINTS.TEMP_MOVIES, {
          method: "POST",
          body: JSON.stringify(moviePayload),
        })
        await handleApiResponse(res, "create Temp movie movie")
        onSuccess?.()
      } catch (err) {
        setError(err as Error)
        console.error("[useCreateLeague] error:", err)
        // 显示用户友好的错误提示
        toast.add({
          type: "warning",
          description: "添加影片失败，请重试",
        })
      } finally {
        setLoading(false)
      }
    },
    []
  )

  return { createTempMovie, loading, error }
}

export const useUpdateTempMovie = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const updateTempMovie = useCallback(
    async (
      {
        id,
        updates,
      }: {
        id: number
        updates: Partial<TempMovie>
      },
      onSuccess?: () => void
    ) => {
      setLoading(true)
      setError(null)
      try {
        // 发送 PUT 请求更新指定影片
        const res = await apiFetch(`${API_ENDPOINTS.TEMP_MOVIES}/${id}`, {
          method: "PUT",
          body: JSON.stringify(updates),
        })
        await handleApiResponse(res, "update Temp movie movie")
        onSuccess?.()
      } catch (err) {
        setError(err as Error)
        console.error("[useUpdateTempMovie] error:", err)
        toast.add({
          type: "warning",
          description: "更新影片失败，请重试",
        })
      } finally {
        setLoading(false)
      }
    },
    []
  )

  return { updateTempMovie, loading, error }
}

const fetchTempMovieDetail = async (id: number): Promise<TempMovie> => {
  const url = `${API_ENDPOINTS.TEMP_MOVIES}/${id}`
  const response = await apiFetch(url, { method: "GET" })
  if (!response.ok) {
    throw new Error(`获取 Temp 影片详情失败，状态码：${response.status}`)
  }
  return response.json()
}

export const useTempMovieDetail = (id?: number) => {
  const [data, setData] = useState<TempMovie | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const fetch = useCallback(async () => {
    if (id === undefined || id === null) return
    setLoading(true)
    setError(null)
    try {
      const result = await fetchTempMovieDetail(id)
      setData(result)
    } catch (err) {
      setError(err as Error)
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    fetch()
  }, [fetch])

  return { data, loading, error, refetch: fetch }
}

export const useDeleteTempMovie = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const deleteTempMovie = useCallback(
    async (id: number, onSuccess?: () => void) => {
      setLoading(true)
      setError(null)
      try {
        // 发送 DELETE 请求删除指定影片
        const res = await apiFetch(`${API_ENDPOINTS.TEMP_MOVIES}/${id}`, {
          method: "DELETE",
        })
        await handleApiResponse(res, "delete Temp movie")
        onSuccess?.()
      } catch (err) {
        setError(err as Error)
        console.error("[useDeleteTempMovie] error:", err)
        // 显示用户友好的错误提示
        toast.add({
          type: "warning",
          description: "删除 Temp 影片影片失败，请重试",
        })
      } finally {
        setLoading(false)
      }
    },
    []
  )

  return { deleteTempMovie, loading, error }
}