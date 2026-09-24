import type { NsFbLeague, NsFbLeaguePage } from "@/types"
import { API_ENDPOINTS, apiFetch, handleApiResponse } from "@/lib/api.ts"
import { useCallback, useEffect, useState } from "react"
import { toast } from "@/components/ui/toast.tsx"

/**
 * 创建 NSFB 联赛请求体
 */
export interface CreateNsLeaguePayload {
  lid: number
  zh: string
  gb: string
  en: string
  color: string
  country_id: number
}


const fetchNsLeagues = async (page:number =0 ,pageSize:number=10):Promise<NsFbLeaguePage> => {
  // 构造请求 URL，后端页码从 1 开始，所以 page + 1
  const url = `${API_ENDPOINTS.NS_FB_LEAGUES}?page=${page + 1}&size=${pageSize}`
  const response = await apiFetch(url, { method: "GET" })
  if (!response.ok) {
    throw new Error(`获取 Titan 联赛列表失败，状态码：${response.status}`)
  }

  return response.json()
}



export const useNsLeagues = (pageIndex: number, pageSize: number) => {
  // 任务分页数据状态
  const [data, setData] = useState<NsFbLeaguePage | null>(null)
  // 加载中状态
  const [loading, setLoading] = useState(false)
  // 错误信息状态
  const [error, setError] = useState<Error | null>(null)

  // 使用 useCallback 缓存 fetch 函数，避免不必要的重复创建
  const fetch = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await fetchNsLeagues(pageIndex, pageSize)
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

  return { data, loading, error ,refetch:fetch}
}


export const useCreateNsLeague = ()=>{
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  /**
   * 创建 NSFB 联赛
   * @param payload - 联赛数据
   * @param onSuccess - 创建成功后的回调函数（可选）
   */
  const createNsLeague = useCallback(
    async (payload: CreateNsLeaguePayload, onSuccess?: () => void) => {
      setLoading(true)
      setError(null)
      try {
        // 构造请求体：设置默认值，展开用户数据，最后对标题去空格

        const leaguePayload = {
          lid: payload.lid,
          zh: payload.zh.trim(),
          gb: payload.gb.trim(),
          en: payload.en.trim(),
          color: payload.color.trim(),

          country_id: payload.country_id,
        }

        const res = await apiFetch(API_ENDPOINTS.NS_FB_LEAGUES, {
          method: "POST",
          body: JSON.stringify(leaguePayload),
        })
        await handleApiResponse(res, "create NSFB league league")
        onSuccess?.()
      } catch (err) {
        setError(err as Error)
        console.error("[useCreateNsLeague] error:", err)
        // 显示用户友好的错误提示
        toast.add({
          type: "warning",
          description: "添加NSFB联赛失败，请重试",
        })
      } finally {
        setLoading(false)
      }
    },
    []
  )

  return { createNsLeague, loading, error }
}

export const useUpdateNsLeague = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const updateNsLeague = useCallback(
    async (
      {
        id,
        updates,
      }: {
        id: number
        updates: Partial<NsFbLeague>
      },
      onSuccess?: () => void
    ) => {
      setLoading(true)
      setError(null)
      try {
        // 发送 PUT 请求更新指定联赛
        const res = await apiFetch(`${API_ENDPOINTS.NS_FB_LEAGUES}/${id}`, {
          method: "PUT",
          body: JSON.stringify(updates),
        })
        await handleApiResponse(res, "update NSFB league league")
        onSuccess?.()
      } catch (err) {
        setError(err as Error)
        console.error("[useUpdateNsLeague] error:", err)
        toast.add({
          type: "warning",
          description: "更新NSFB联赛失败，请重试",
        })
      } finally {
        setLoading(false)
      }
    },
    []
  )

  return { updateNsLeague, loading, error }
}


export const useDeleteNsLeague = ()=>{
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const deleteNsLeague = useCallback(async (id:number,onSuccess?:()=>void)=>{
    setLoading(true)
    setError(null)
    try {
      // 发送 DELETE 请求删除指定联赛
      const res = await apiFetch(`${API_ENDPOINTS.NS_FB_LEAGUES}/${id}`, {
        method: "DELETE",
      })
      await handleApiResponse(res, "delete NSFB league league")
      onSuccess?.()
    } catch (err) {
      setError(err as Error)
      console.error("[useDeleteNsLeague] error:", err)
      // 显示用户友好的错误提示
      toast.add({
        type: "warning",
        description: "删除NSFB联赛失败，请重试",
      })
    } finally {
      setLoading(false)
    }
  },[])

  return { deleteNsLeague, loading, error }
}



