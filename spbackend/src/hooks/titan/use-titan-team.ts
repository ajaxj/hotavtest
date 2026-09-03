import type { TitanTeamPage } from "@/types"
import { API_ENDPOINTS, apiFetch } from "@/lib/api.ts"
import { useCallback, useEffect, useState } from "react"

/**
 * 创建 Titan 团队请求体
 */
export interface CreateTitanTeamPayload {
  zh: string
  gb: string
  en: string
  color: string
  ltype: number
  country_id: number
}

const fetchTitanTeams = async (
  page: number = 0,
  pageSize: number = 10
): Promise<TitanTeamPage> => {
  // 构造请求 URL，后端页码从 1 开始，所以 page + 1
  const url = `${API_ENDPOINTS.TITAN_TEAMS}?page=${page + 1}&size=${pageSize}`
  const response = await apiFetch(url, { method: "GET" })
  if (!response.ok) {
    throw new Error(`获取 Titan Team列表失败，状态码：${response.status}`)
  }

  return response.json()
}

export const useTitanTeams = (pageIndex: number, pageSize: number) => {
  // 任务分页数据状态
  const [data, setData] = useState<TitanTeamPage | null>(null)
  // 加载中状态
  const [loading, setLoading] = useState(false)
  // 错误信息状态
  const [error, setError] = useState<Error | null>(null)

  // 使用 useCallback 缓存 fetch 函数，避免不必要的重复创建
  const fetch = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await fetchTitanTeams(pageIndex, pageSize)
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
