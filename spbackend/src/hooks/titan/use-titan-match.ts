import type {
  TitanMatch,
  TitanMatchPage,
} from "@/types"
import { API_ENDPOINTS, apiFetch, handleApiResponse } from "@/lib/api.ts"
import { useCallback, useEffect, useState } from "react"
import { toast } from "@/components/ui/toast.tsx"

/**
 * 创建 Titan 比赛请求体
 */
export interface CreateTitanMatchPayload {
  mid: number
  match_time: string
  league_id: number
  home_id: number
  away_id: number
  // country_id: number
  status: number
  // home_score: number
  // away_score: number
  // home_score_half: number
  // away_score_half: number
  // home_red: number
  // away_red: number
  // home_yellow: number
  // away_yellow: number
  // home_corner: number
  // away_corner: number
}

const fetchTitanMatches = async (
  page: number = 0,
  pageSize: number = 10
): Promise<TitanMatchPage> => {
  // 构造请求 URL，后端页码从 1 开始，所以 page + 1
  const url = `${API_ENDPOINTS.TITAN_MATCHES}?page=${page + 1}&size=${pageSize}`
  const response = await apiFetch(url, { method: "GET" })
  if (!response.ok) {
    throw new Error(`获取 Titan 比赛列表失败，状态码：${response.status}`)
  }

  return response.json()
}

export const useTitanMatches = (pageIndex: number, pageSize: number) => {
  // 任务分页数据状态
  const [data, setData] = useState<TitanMatchPage | null>(null)
  // 加载中状态
  const [loading, setLoading] = useState(false)
  // 错误信息状态
  const [error, setError] = useState<Error | null>(null)

  // 使用 useCallback 缓存 fetch 函数，避免不必要的重复创建
  const fetch = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await fetchTitanMatches(pageIndex, pageSize)
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

export const useCreateTitanMatch = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  /**
   * 创建 Titan 比赛
   * @param payload - 比赛数据
   * @param onSuccess - 创建成功后的回调函数（可选）
   */
  const createTitanMatch = useCallback(
    async (payload: CreateTitanMatchPayload, onSuccess?: () => void) => {
      setLoading(true)
      setError(null)
      try {
        // 构造请求体：设置默认值，展开用户数据，最后对标题去空格

        const matchPayload = {
          mid: payload.mid,
          match_time: payload.match_time,
          league_id: payload.league_id,
          home_id: payload.home_id,
          away_id: payload.away_id,
          status: payload.status,
          // home_score: payload.home_score,
          // away_score: payload.away_score,
          // home_score_half: payload.home_score_half,
          // away_score_half: payload.away_score_half,
          // home_red: payload.home_red,
          // away_red: payload.away_red,
          // home_yellow: payload.home_yellow,
          // away_yellow: payload.away_yellow,
          // home_corner: payload.home_corner,
          // away_corner: payload.away_corner,
          // country_id: payload.country_id,
        }

        const res = await apiFetch(API_ENDPOINTS.TITAN_MATCHES, {
          method: "POST",
          body: JSON.stringify(matchPayload),
        })
        await handleApiResponse(res, "create Titan match match")
        onSuccess?.()
      } catch (err) {
        setError(err as Error)
        console.error("[useCreateTitanMatch] error:", err)
        // 显示用户友好的错误提示
        toast.add({
          type: "warning",
          description: "添加比赛失败，请重试",
        })
      } finally {
        setLoading(false)
      }
    },
    []
  )

  return { createTitanMatch, loading, error }
}

export const useUpdateTitanMatch = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const updateTitanMatch = useCallback(
    async (
      {
        id,
        updates,
      }: {
        id: number
        updates: Partial<TitanMatch>
      },
      onSuccess?: () => void
    ) => {
      setLoading(true)
      setError(null)
      try {
        // 发送 PUT 请求更新指定比赛
        const res = await apiFetch(`${API_ENDPOINTS.TITAN_MATCHES}/${id}`, {
          method: "PUT",
          body: JSON.stringify(updates),
        })
        await handleApiResponse(res, "update Titan match match")
        onSuccess?.()
      } catch (err) {
        setError(err as Error)
        console.error("[useUpdateTitanMatch] error:", err)
        toast.add({
          type: "warning",
          description: "更新比赛失败，请重试",
        })
      } finally {
        setLoading(false)
      }
    },
    []
  )

  return { updateTitanMatch, loading, error }
}

export const useDeleteTitanMatch = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const deleteTitanMatch = useCallback(
    async (id: number, onSuccess?: () => void) => {
      setLoading(true)
      setError(null)
      try {
        // 发送 DELETE 请求删除指定比赛
        const res = await apiFetch(`${API_ENDPOINTS.TITAN_MATCHES}/${id}`, {
          method: "DELETE",
        })
        await handleApiResponse(res, "delete Titan match match")
        onSuccess?.()
      } catch (err) {
        setError(err as Error)
        console.error("[useDeleteTitanMatch] error:", err)
        // 显示用户友好的错误提示
        toast.add({
          type: "warning",
          description: "删除 Titan 比赛失败，请重试",
        })
      } finally {
        setLoading(false)
      }
    },
    []
  )

  return { deleteTitanMatch, loading, error }
}
