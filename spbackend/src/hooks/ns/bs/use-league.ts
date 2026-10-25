import type { NsBsLeague, NsBsLeaguePage } from "@/types/ns/bs/league.ts"
import { API_ENDPOINTS, apiFetch, handleApiResponse } from "@/lib/api.ts"
import { useCallback, useEffect, useState } from "react"
import { toast } from "@/components/ui/toast.tsx"

/**
 * 创建 NSBS 联赛请求体
 */
export interface CreateNsBsLeaguePayload {
  lid: number
  zh: string
  gb: string
  en: string
  color: string
  country_id: number
}


const fetchNsBsLeagues = async (page:number =0 ,pageSize:number=10):Promise<NsBsLeaguePage> => {
  // 构造请求 URL，后端页码从 1 开始，所以 page + 1
  const url = `${API_ENDPOINTS.NS_BS_LEAGUES}?page=${page + 1}&size=${pageSize}`
  const response = await apiFetch(url, { method: "GET" })
  if (!response.ok) {
    throw new Error(`获取 NSBS 联赛列表失败，状态码：${response.status}`)
  }

  return response.json()
}



export const useNsBsLeagues = (pageIndex: number, pageSize: number) => {
  // 任务分页数据状态
  const [data, setData] = useState<NsBsLeaguePage | null>(null)
  // 加载中状态
  const [loading, setLoading] = useState(false)
  // 错误信息状态
  const [error, setError] = useState<Error | null>(null)

  // 使用 useCallback 缓存 fetch 函数，避免不必要的重复创建
  const fetch = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await fetchNsBsLeagues(pageIndex, pageSize)
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


export const useCreateNsBsLeague = ()=>{
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  /**
   * 创建 NSBS 联赛
   * @param payload - 联赛数据
   * @param onSuccess - 创建成功后的回调函数（可选）
   */
  const createNsBsLeague = useCallback(
    async (payload: CreateNsBsLeaguePayload, onSuccess?: () => void) => {
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

  return { createNsBsLeague, loading, error }
}

export const useUpdateNsBsLeague = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const updateNsBsLeague = useCallback(
    async (
      {
        id,
        updates,
      }: {
        id: number
        updates: Partial<NsBsLeague>
      },
      onSuccess?: () => void
    ) => {
      setLoading(true)
      setError(null)
      try {
        // 发送 PUT 请求更新指定联赛
        const res = await apiFetch(`${API_ENDPOINTS.NS_BS_LEAGUES}/${id}`, {
          method: "PUT",
          body: JSON.stringify(updates),
        })
        await handleApiResponse(res, "update NSBS league league")
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

  return { updateNsBsLeague, loading, error }
}


export const useDeleteNsBsLeague = ()=>{
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const deleteNsBsLeague = useCallback(async (id:number,onSuccess?:()=>void)=>{
    setLoading(true)
    setError(null)
    try {
      // 发送 DELETE 请求删除指定联赛
      const res = await apiFetch(`${API_ENDPOINTS.NS_BS_LEAGUES}/${id}`, {
        method: "DELETE",
      })
      await handleApiResponse(res, "delete NSBS league league")
      onSuccess?.()
    } catch (err) {
      setError(err as Error)
      console.error("[useDeleteNsLeague] error:", err)
      // 显示用户友好的错误提示
      toast.add({
        type: "warning",
        description: "删除NSBS联赛失败，请重试",
      })
    } finally {
      setLoading(false)
    }
  },[])

  return { deleteNsBsLeague, loading, error }
}



