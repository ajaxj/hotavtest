import type { Movie, MoviePage } from "@/types"
import { API_ENDPOINTS, apiFetch, handleApiResponse } from "@/lib/api.ts"
import { useCallback, useEffect, useState } from "react"
import { toast } from "@/components/ui/toast.tsx"

/**
 * 创建 Tv Movie请求体
 */
export interface CreateMoviePayload {
  title: string
  category_id: number
}

const fetchMovies = async (
  page: number = 0,
  pageSize: number = 10,
  src: number = 0
): Promise<MoviePage> => {
  // 构造请求 URL，后端页码从 1 开始，所以 page + 1
  const url = `${API_ENDPOINTS.MOVIES}?page=${page + 1}&size=${pageSize}&src=${src}`
  const response = await apiFetch(url, { method: "GET" })
  if (!response.ok) {
    throw new Error(`获取 Movie 影片列表失败，状态码：${response.status}`)
  }

  return response.json()
}

export const useMovies = (
  pageIndex: number,
  pageSize: number,
  src: number
) => {
  // 任务分页数据状态
  const [data, setData] = useState<MoviePage | null>(null)
  // 加载中状态
  const [loading, setLoading] = useState(false)
  // 错误信息状态
  const [error, setError] = useState<Error | null>(null)

  // 使用 useCallback 缓存 fetch 函数，避免不必要的重复创建
  const fetch = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await fetchMovies(pageIndex, pageSize, src)
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

export const useCreateMovie = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  /**
   * 创建 影片
   * @param payload - 影片数据
   * @param onSuccess - 创建成功后的回调函数（可选）
   */
  const createMovie = useCallback(
    async (payload: CreateMoviePayload, onSuccess?: () => void) => {
      setLoading(true)
      setError(null)
      try {
        // 构造请求体：设置默认值，展开用户数据，最后对标题去空格

        const moviePayload = {
          title: payload.title.trim(),
          category_id: payload.category_id,
        }

        const res = await apiFetch(API_ENDPOINTS.MOVIES, {
          method: "POST",
          body: JSON.stringify(moviePayload),
        })
        await handleApiResponse(res, "create movie")
        onSuccess?.()
      } catch (err) {
        setError(err as Error)
        console.error("[useCreateMovie] error:", err)
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

  return { createMovie, loading, error }
}

export const useUpdateMovie = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const updateMovie = useCallback(
    async (
      {
        id,
        updates,
      }: {
        id: number
        updates: Partial<Movie>
      },
      onSuccess?: () => void
    ) => {
      setLoading(true)
      setError(null)
      try {
        // 发送 PUT 请求更新指定影片
        const res = await apiFetch(`${API_ENDPOINTS.MOVIES}/${id}`, {
          method: "PUT",
          body: JSON.stringify(updates),
        })
        await handleApiResponse(res, "update movie")
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

  return { updateMovie, loading, error }
}

const fetchMovieDetail = async (id: number): Promise<Movie> => {
  const url = `${API_ENDPOINTS.MOVIES}/${id}`
  const response = await apiFetch(url, { method: "GET" })
  if (!response.ok) {
    throw new Error(`获取 Movie 影片详情失败，状态码：${response.status}`)
  }
  return response.json()
}

export const useMovieDetail = (id?: number) => {
  const [data, setData] = useState<Movie | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const fetch = useCallback(async () => {
    if (id === undefined || id === null) return
    setLoading(true)
    setError(null)
    try {
      const result = await fetchMovieDetail(id)
      setData(result)
    } catch (err) {
      setError(err as Error)
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    const loadData = async () => {
      await fetch()
    }
    loadData()
  }, [fetch])

  return { data, loading, error, refetch: fetch }
}

export const useDeleteMovie = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const deleteMovie = useCallback(
    async (id: number, onSuccess?: () => void) => {
      setLoading(true)
      setError(null)
      try {
        // 发送 DELETE 请求删除指定影片
        const res = await apiFetch(`${API_ENDPOINTS.MOVIES}/${id}`, {
          method: "DELETE",
        })
        await handleApiResponse(res, "delete movie")
        onSuccess?.()
      } catch (err) {
        setError(err as Error)
        console.error("[useDeleteMovie] error:", err)
        // 显示用户友好的错误提示
        toast.add({
          type: "warning",
          description: "删除影片失败，请重试",
        })
      } finally {
        setLoading(false)
      }
    },
    []
  )

  return { deleteMovie, loading, error }
}
