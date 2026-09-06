import type { TitanTeamPage,TitanTeam } from "@/types"
import { API_ENDPOINTS, apiFetch, handleApiResponse } from "@/lib/api.ts"
import { useCallback, useEffect, useState } from "react"
import { toast } from "@/components/ui/toast.tsx"

/**
 * 创建 Titan 球队请求体
 */
export interface CreateTitanTeamPayload {
  tid: number
  zh: string
  gb: string
  en: string
  icon: string
  pos: string
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


export const useCreateTitanTeam = ()=>{
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  /**
   * 创建 Titan 球队
   * @param payload - 球队数据
   * @param onSuccess - 创建成功后的回调函数（可选）
   */
  const createTitanTeam = useCallback(
    async (payload: CreateTitanTeamPayload, onSuccess?: () => void) => {
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
          pos: payload.pos.trim(),
        }

        const res = await apiFetch(API_ENDPOINTS.TITAN_TEAMS, {
          method: "POST",
          body: JSON.stringify(teamPayload),
        })
        await handleApiResponse(res, "create Titan team team")
        onSuccess?.()
      } catch (err) {
        setError(err as Error)
        console.error("[useCreateTeam] error:", err)
        // 显示用户友好的错误提示
        toast.add({
          type: "warning",
          description: "添加 Titan 球队失败，请重试",
        })
      } finally {
        setLoading(false)
      }
    },
    []
  )

  return { createTitanTeam, loading, error }
}


export const useUpdateTitanTeam = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const updateTitanTeam = useCallback(
    async (
      {
        id,
        updates,
      }: {
        id: number
        updates: Partial<TitanTeam>
      },
      onSuccess?: () => void
    ) => {
      setLoading(true)
      setError(null)
      try {
        // 发送 PUT 请求更新指定球队
        const res = await apiFetch(`${API_ENDPOINTS.TITAN_TEAMS}/${id}`, {
          method: "PUT",
          body: JSON.stringify(updates),
        })
        await handleApiResponse(res, "update Titan team team")
        onSuccess?.()
      } catch (err) {
        setError(err as Error)
        console.error("[useUpdateTitanTeam] error:", err)
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

  return { updateTitanTeam, loading, error }
}



export const useDeleteTitanTeam = ()=>{
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const deleteTitanTeam = useCallback(async (id:number,onSuccess?:()=>void)=>{
    setLoading(true)
    setError(null)
    try {
      // 发送 DELETE 请求删除指定球队
      const res = await apiFetch(`${API_ENDPOINTS.TITAN_TEAMS}/${id}`, {
        method: "DELETE",
      })
      await handleApiResponse(res, "delete Titan team team")
      onSuccess?.()
    } catch (err) {
      setError(err as Error)
      console.error("[useDeleteTitanTeam] error:", err)
      // 显示用户友好的错误提示
      toast.add({
        type: "warning",
        description: "删除 Titan 球队失败，请重试",
      })
    } finally {
      setLoading(false)
    }
  },[])

  return { deleteTitanTeam, loading, error }
}