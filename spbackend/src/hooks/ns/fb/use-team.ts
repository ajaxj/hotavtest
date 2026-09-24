import type { NsFbTeam, NsFbTeamPage } from "@/types"
import { API_ENDPOINTS, apiFetch, handleApiResponse } from "@/lib/api.ts"
import { useCallback, useEffect, useState } from "react"
import { toast } from "@/components/ui/toast.tsx"

/**
 * 创建Ns 球队请求体
 */
export interface CreateNsTeamPayload {
  tid: number
  zh: string
  gb: string
  en: string
  icon: string
  tag: number
}

const fetchNsTeamsPage = async (
  page: number = 0,
  pageSize: number = 10
): Promise<NsFbTeamPage> => {
  // 构造请求 URL，后端页码从 1 开始，所以 page + 1
  const url = `${API_ENDPOINTS.NS_FB_TEAMS}?page=${page + 1}&size=${pageSize}`
  const response = await apiFetch(url, { method: "GET" })
  if (!response.ok) {
    throw new Error(`获取Ns 球队列表失败，状态码：${response.status}`)
  }

  return response.json()
}

export const useNsTeamsPage = (pageIndex: number, pageSize: number) => {
  // 任务分页数据状态
  const [data, setData] = useState<NsFbTeamPage | null>(null)
  // 加载中状态
  const [loading, setLoading] = useState(false)
  // 错误信息状态
  const [error, setError] = useState<Error | null>(null)

  // 使用 useCallback 缓存 fetch 函数，避免不必要的重复创建
  const fetch = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await fetchNsTeamsPage(pageIndex, pageSize)
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

export const useCreateNsTeam = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  /**
   * 创建Ns 球队
   * @param payload - 球队数据
   * @param onSuccess - 创建成功后的回调函数（可选）
   */
  const createNsTeam = useCallback(
    async (payload: CreateNsTeamPayload, onSuccess?: () => void) => {
      setLoading(true)
      setError(null)
      try {
        // 构造请求体：设置默认值，展开用户数据，最后对标题去空格

        const teamPayload = {
          tid: payload.tid,
          zh: payload.zh.trim(),
          gb: payload.gb.trim(),
          en: payload.en.trim(),
          icon: payload.icon.trim(),
          tag: payload.tag,
        }

        const res = await apiFetch(API_ENDPOINTS.NS_FB_TEAMS, {
          method: "POST",
          body: JSON.stringify(teamPayload),
        })
        await handleApiResponse(res, "create Ns team team")
        onSuccess?.()
      } catch (err) {
        setError(err as Error)
        console.error("[useCreateNsTeam] error:", err)
        // 显示用户友好的错误提示
        toast.add({
          type: "warning",
          description: "添加球队失败，请重试",
        })
      } finally {
        setLoading(false)
      }
    },
    []
  )

  return { createNsTeam, loading, error }
}

export const useUpdateNsTeam = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const updateNsTeam = useCallback(
    async (
      {
        id,
        updates,
      }: {
        id: number
        updates: Partial<NsFbTeam>
      },
      onSuccess?: () => void
    ) => {
      setLoading(true)
      setError(null)
      try {
        // 发送 PUT 请求更新指定球队
        const res = await apiFetch(`${API_ENDPOINTS.NS_FB_TEAMS}/${id}`, {
          method: "PUT",
          body: JSON.stringify(updates),
        })
        await handleApiResponse(res, "update Ns team team")
        onSuccess?.()
      } catch (err) {
        setError(err as Error)
        console.error("[useUpdateNsTeam] error:", err)
        toast.add({
          type: "warning",
          description: "更新球队失败，请重试",
        })
      } finally {
        setLoading(false)
      }
    },
    []
  )

  return { updateNsTeam, loading, error }
}

export const useDeleteNsTeam = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const deleteNsTeam = useCallback(
    async (id: number, onSuccess?: () => void) => {
      setLoading(true)
      setError(null)
      try {
        // 发送 DELETE 请求删除指定球队
        const res = await apiFetch(`${API_ENDPOINTS.NS_FB_TEAMS}/${id}`, {
          method: "DELETE",
        })
        await handleApiResponse(res, "delete Ns team team")
        onSuccess?.()
      } catch (err) {
        setError(err as Error)
        console.error("[useDeleteNsTeam] error:", err)
        // 显示用户友好的错误提示
        toast.add({
          type: "warning",
          description: "删除球队失败，请重试",
        })
      } finally {
        setLoading(false)
      }
    },
    []
  )

  return { deleteNsTeam, loading, error }
}
