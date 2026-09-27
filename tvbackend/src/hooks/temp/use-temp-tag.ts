import type { TempTag, TempTagPage } from "@/types"
import { API_ENDPOINTS, apiFetch, handleApiResponse } from "@/lib/api.ts"
import { useCallback, useEffect, useState } from "react"
import { toast } from "@/components/ui/toast.tsx"

/**
 * 创建 Tv TempTag请求体
 */
export interface CreateTempTagPayload {
  name: string
  fetch_url: string
  src: number

}

const fetchTempTags = async (
  page: number = 0,
  pageSize: number = 10
): Promise<TempTagPage> => {
  // 构造请求 URL，后端页码从 1 开始，所以 page + 1
  const url = `${API_ENDPOINTS.TEMP_TAGS}?page=${page + 1}&size=${pageSize}`
  const response = await apiFetch(url, { method: "GET" })
  if (!response.ok) {
    throw new Error(`获取 Temp Tag列表失败，状态码：${response.status}`)
  }

  return response.json()
}

export const useTempTags = (pageIndex: number, pageSize: number) => {
  // 任务分页数据状态
  const [data, setData] = useState<TempTagPage | null>(null)
  // 加载中状态
  const [loading, setLoading] = useState(false)
  // 错误信息状态
  const [error, setError] = useState<Error | null>(null)

  // 使用 useCallback 缓存 fetch 函数，避免不必要的重复创建
  const fetch = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await fetchTempTags(pageIndex, pageSize)
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

export const useCreateTempTag = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  /**
   * 创建 Temp Tag
   * @param payload - Tag数据
   * @param onSuccess - 创建成功后的回调函数（可选）
   */
  const createTempTag = useCallback(
    async (payload: CreateTempTagPayload, onSuccess?: () => void) => {
      setLoading(true)
      setError(null)
      try {
        // 构造请求体：设置默认值，展开用户数据，最后对标题去空格

        const categoryPayload = {
          name: payload.name.trim(),
          fetch_url: payload.fetch_url.trim(),
          src: payload.src,
        }

        const res = await apiFetch(API_ENDPOINTS.TEMP_TAGS, {
          method: "POST",
          body: JSON.stringify(categoryPayload),
        })
        await handleApiResponse(res, "create Temp Tag")
        onSuccess?.()
      } catch (err) {
        setError(err as Error)
        console.error("[useCreateTempTag] error:", err)
        // 显示用户友好的错误提示
        toast.add({
          type: "warning",
          description: "添加Tag失败，请重试",
        })
      } finally {
        setLoading(false)
      }
    },
    []
  )

  return { createTempTag, loading, error }
}

export const useUpdateTempTag = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const updateTempTag = useCallback(
    async (
      {
        id,
        updates,
      }: {
        id: number
        updates: Partial<TempTag>
      },
      onSuccess?: () => void
    ) => {
      setLoading(true)
      setError(null)
      try {
        // 发送 PUT 请求更新指定Tag
        const res = await apiFetch(`${API_ENDPOINTS.TEMP_TAGS}/${id}`, {
          method: "PUT",
          body: JSON.stringify(updates),
        })
        await handleApiResponse(res, "update Temp category category")
        onSuccess?.()
      } catch (err) {
        setError(err as Error)
        console.error("[useUpdateTempTag] error:", err)
        toast.add({
          type: "warning",
          description: "更新Tag失败，请重试",
        })
      } finally {
        setLoading(false)
      }
    },
    []
  )

  return { updateTempTag, loading, error }
}

export const useDeleteTempTag = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const deleteTempTag = useCallback(
    async (id: number, onSuccess?: () => void) => {
      setLoading(true)
      setError(null)
      try {
        // 发送 DELETE 请求删除指定Tag
        const res = await apiFetch(`${API_ENDPOINTS.TEMP_TAGS}/${id}`, {
          method: "DELETE",
        })
        await handleApiResponse(res, "delete Temp category")
        onSuccess?.()
      } catch (err) {
        setError(err as Error)
        console.error("[useDeleteTempTag] error:", err)
        // 显示用户友好的错误提示
        toast.add({
          type: "warning",
          description: "删除 Temp TagTag失败，请重试",
        })
      } finally {
        setLoading(false)
      }
    },
    []
  )

  return { deleteTempTag, loading, error }
}
