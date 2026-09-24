

import type {
  NsFbMatch,
  NsFbMatchPage,
} from "@/types"
import { API_ENDPOINTS, apiFetch, handleApiResponse } from "@/lib/api.ts"
import { useCallback, useEffect, useState } from "react"
import { toast } from "@/components/ui/toast.tsx"

/**
 * 创建 NS 比赛请求体
 */
export interface CreateNsMatchPayload {
  mid: number
  match_time: string
  league_id: number
  home_id: number
  away_id: number
  // country_id: number
  status: number
  home_score: number
  away_score: number
  // home_score_half: number
  // away_score_half: number
  // home_red: number
  // away_red: number
  // home_yellow: number
  // away_yellow: number
  // home_corner: number
  // away_corner: number
}

const fetchNsMatches = async (
  page: number = 0,
  pageSize: number = 10
): Promise<NsFbMatchPage> => {
  // 构造请求 URL，后端页码从 1 开始，所以 page + 1
  const url = `${API_ENDPOINTS.NS_FB_MATCHES}?page=${page + 1}&size=${pageSize}`
  const response = await apiFetch(url, { method: "GET" })
  if (!response.ok) {
    throw new Error(`获取 NS 比赛列表失败，状态码：${response.status}`)
  }

  return response.json()
}

export const useNsMatchesPage = (pageIndex: number, pageSize: number) => {
  // 任务分页数据状态
  const [data, setData] = useState<NsFbMatchPage | null>(null)
  // 加载中状态
  const [loading, setLoading] = useState(false)
  // 错误信息状态
  const [error, setError] = useState<Error | null>(null)

  // 使用 useCallback 缓存 fetch 函数，避免不必要的重复创建
  const fetch = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await fetchNsMatches(pageIndex, pageSize)
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

export const useCreateNsMatch = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  /**
   * 创建 NS 比赛
   * @param payload - 比赛数据
   * @param onSuccess - 创建成功后的回调函数（可选）
   */
  const createNsMatch = useCallback(
    async (payload: CreateNsMatchPayload, onSuccess?: () => void) => {
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

        const res = await apiFetch(API_ENDPOINTS.NS_FB_MATCHES, {
          method: "POST",
          body: JSON.stringify(matchPayload),
        })
        await handleApiResponse(res, "create NS match match")
        onSuccess?.()
      } catch (err) {
        setError(err as Error)
        console.error("[useCreateNsMatch] error:", err)
        // 显示用户友好的错误提示
        toast.add({
          type: "warning",
          description: "添加NS比赛失败，请重试",
        })
      } finally {
        setLoading(false)
      }
    },
    []
  )

  return { createNsMatch, loading, error }
}

export const useUpdateNsMatch = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const updateNsMatch = useCallback(
    async (
      {
        mid,
        updates,
      }: {
        mid: number
        updates: Partial<NsFbMatch>
      },
      onSuccess?: () => void
    ) => {
      setLoading(true)
      setError(null)
      try {
        // 发送 PUT 请求更新指定比赛
        const res = await apiFetch(`${API_ENDPOINTS.NS_FB_MATCHES}/${mid}`, {
          method: "PUT",
          body: JSON.stringify(updates),
        })
        await handleApiResponse(res, "update NS match match")
        onSuccess?.()
      } catch (err) {
        setError(err as Error)
        console.error("[useUpdateNsMatch] error:", err)
        toast.add({
          type: "warning",
          description: "更新NS比赛失败，请重试",
        })
      } finally {
        setLoading(false)
      }
    },
    []
  )

  return { updateNsMatch, loading, error }
}

export const useDeleteNsMatch = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const deleteNsMatch = useCallback(
    async (id: number, onSuccess?: () => void) => {
      setLoading(true)
      setError(null)
      try {
        // 发送 DELETE 请求删除指定比赛
        const res = await apiFetch(`${API_ENDPOINTS.NS_FB_MATCHES}/${id}`, {
          method: "DELETE",
        })
        await handleApiResponse(res, "delete NS match match")
        onSuccess?.()
      } catch (err) {
        setError(err as Error)
        console.error("[useDeleteNsMatch] error:", err)
        // 显示用户友好的错误提示
        toast.add({
          type: "warning",
          description: "删除NS比赛失败，请重试",
        })
      } finally {
        setLoading(false)
      }
    },
    []
  )

  return { deleteNsMatch, loading, error }
}
