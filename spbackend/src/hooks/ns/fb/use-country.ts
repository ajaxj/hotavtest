import type { NsFbCountry, NsFbCountryPage } from "@/types"
import { API_ENDPOINTS, apiFetch, handleApiResponse } from "@/lib/api.ts"
import { useCallback, useEffect, useState } from "react"
import { toast } from "@/components/ui/toast.tsx"

/**
 * 创建Ns 国家请求体
 */
export interface CreateNsCountryPayload {
  cid: number
  zh: string
  gb: string
  en: string
  image: string
  tag: number
}

const fetchNsCountriesPage = async (
  page: number = 0,
  pageSize: number = 10
): Promise<NsFbCountryPage> => {
  // 构造请求 URL，后端页码从 1 开始，所以 page + 1
  const url = `${API_ENDPOINTS.NS_FB_COUNTRIES}?page=${page + 1}&size=${pageSize}`
  const response = await apiFetch(url, { method: "GET" })
  if (!response.ok) {
    throw new Error(`获取Ns 国家列表失败，状态码：${response.status}`)
  }

  return response.json()
}

export const useNsCountriesPage = (pageIndex: number, pageSize: number) => {
  // 任务分页数据状态
  const [data, setData] = useState<NsFbCountryPage | null>(null)
  // 加载中状态
  const [loading, setLoading] = useState(false)
  // 错误信息状态
  const [error, setError] = useState<Error | null>(null)

  // 使用 useCallback 缓存 fetch 函数，避免不必要的重复创建
  const fetch = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await fetchNsCountriesPage(pageIndex, pageSize)
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

export const useCreateNsCountry = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  /**
   * 创建Ns 国家
   * @param payload - 国家数据
   * @param onSuccess - 创建成功后的回调函数（可选）
   */
  const createNsCountry = useCallback(
    async (payload: CreateNsCountryPayload, onSuccess?: () => void) => {
      setLoading(true)
      setError(null)
      try {
        // 构造请求体：设置默认值，展开用户数据，最后对标题去空格

        const countryPayload = {
          cid: payload.cid,
          zh: payload.zh.trim(),
          gb: payload.gb.trim(),
          en: payload.en.trim(),
          image: payload.image.trim(),
          tag: payload.tag,
        }

        const res = await apiFetch(API_ENDPOINTS.NS_FB_COUNTRIES, {
          method: "POST",
          body: JSON.stringify(countryPayload),
        })
        await handleApiResponse(res, "create Ns country country")
        onSuccess?.()
      } catch (err) {
        setError(err as Error)
        console.error("[useCreateNsCountry] error:", err)
        // 显示用户友好的错误提示
        toast.add({
          type: "warning",
          description: "添加国家失败，请重试",
        })
      } finally {
        setLoading(false)
      }
    },
    []
  )

  return { createNsCountry, loading, error }
}

export const useUpdateNsCountry = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const updateNsCountry = useCallback(
    async (
      {
        id,
        updates,
      }: {
        id: number
        updates: Partial<NsFbCountry>
      },
      onSuccess?: () => void
    ) => {
      setLoading(true)
      setError(null)
      try {
        // 发送 PUT 请求更新指定国家
        const res = await apiFetch(`${API_ENDPOINTS.NS_FB_COUNTRIES}/${id}`, {
          method: "PUT",
          body: JSON.stringify(updates),
        })
        await handleApiResponse(res, "update Ns country country")
        onSuccess?.()
      } catch (err) {
        setError(err as Error)
        console.error("[useUpdateNsCountry] error:", err)
        toast.add({
          type: "warning",
          description: "更新国家失败，请重试",
        })
      } finally {
        setLoading(false)
      }
    },
    []
  )

  return { updateNsCountry, loading, error }
}

export const useDeleteNsCountry = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const deleteNsCountry = useCallback(
    async (id: number, onSuccess?: () => void) => {
      setLoading(true)
      setError(null)
      try {
        // 发送 DELETE 请求删除指定国家
        const res = await apiFetch(`${API_ENDPOINTS.NS_FB_COUNTRIES}/${id}`, {
          method: "DELETE",
        })
        await handleApiResponse(res, "delete Ns country country")
        onSuccess?.()
      } catch (err) {
        setError(err as Error)
        console.error("[useDeleteNsCountry] error:", err)
        // 显示用户友好的错误提示
        toast.add({
          type: "warning",
          description: "删除国家失败，请重试",
        })
      } finally {
        setLoading(false)
      }
    },
    []
  )

  return { deleteNsCountry, loading, error }
}



