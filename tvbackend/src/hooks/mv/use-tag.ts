import type { Tag, TagPage } from "@/types"
import { API_ENDPOINTS, apiFetch, handleApiResponse } from "@/lib/api.ts"
import { useCallback, useEffect, useState } from "react"
import { toast } from "@/components/ui/toast.tsx"

/**
 * 创建标签请求体
 */
export interface CreateTagPayload {
  name: string
}

const fetchTags = async (
  page: number = 0,
  pageSize: number = 10,
  src: number = 0
): Promise<TagPage> => {
  // 构造请求 URL，后端页码从 1 开始，所以 page + 1
  const url = `${API_ENDPOINTS.TAGS}?page=${page + 1}&size=${pageSize}&src=${src}`
  const response = await apiFetch(url, { method: "GET" })
  if (!response.ok) {
    throw new Error(`获取标签列表失败，状态码：${response.status}`)
  }

  return response.json()
}

export const useTags = (
  pageIndex: number,
  pageSize: number,
  src: number
) => {
  // 任务分页数据状态
  const [data, setData] = useState<TagPage | null>(null)
  // 加载中状态
  const [loading, setLoading] = useState(false)
  // 错误信息状态
  const [error, setError] = useState<Error | null>(null)

  // 使用 useCallback 缓存 fetch 函数，避免不必要的重复创建
  const fetch = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await fetchTags(pageIndex, pageSize, src)
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

export const useCreateTag = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  /**
   * 创建标签
   * @param payload - 标签数据
   * @param onSuccess - 创建成功后的回调函数（可选）
   */
  const createTag = useCallback(
    async (payload: CreateTagPayload, onSuccess?: () => void) => {
      setLoading(true)
      setError(null)
      try {
        // 构造请求体：设置默认值，展开用户数据，最后对标题去空格

        const tagPayload = {
          name: payload.name.trim(),
        }

        const res = await apiFetch(API_ENDPOINTS.TAGS, {
          method: "POST",
          body: JSON.stringify(tagPayload),
        })
        await handleApiResponse(res, "create tag")
        onSuccess?.()
      } catch (err) {
        setError(err as Error)
        console.error("[useCreateTag] error:", err)
        // 显示用户友好的错误提示
        toast.add({
          type: "warning",
          description: "添加标签失败，请重试",
        })
      } finally {
        setLoading(false)
      }
    },
    []
  )

  return { createTag, loading, error }
}

export const useUpdateTag = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const updateTag = useCallback(
    async (
      {
        id,
        updates,
      }: {
        id: number
        updates: Partial<Tag>
      },
      onSuccess?: () => void
    ) => {
      setLoading(true)
      setError(null)
      try {
        // 发送 PUT 请求更新指定标签
        const res = await apiFetch(`${API_ENDPOINTS.TAGS}/${id}`, {
          method: "PUT",
          body: JSON.stringify(updates),
        })
        await handleApiResponse(res, "update tag")
        onSuccess?.()
      } catch (err) {
        setError(err as Error)
        console.error("[useUpdateTag] error:", err)
        toast.add({
          type: "warning",
          description: "更新标签失败，请重试",
        })
      } finally {
        setLoading(false)
      }
    },
    []
  )

  return { updateTag, loading, error }
}

const fetchTagDetail = async (id: number): Promise<Tag> => {
  const url = `${API_ENDPOINTS.TAGS}/${id}`
  const response = await apiFetch(url, { method: "GET" })
  if (!response.ok) {
    throw new Error(`获取标签详情失败，状态码：${response.status}`)
  }
  return response.json()
}

export const useTagDetail = (id?: number) => {
  const [data, setData] = useState<Tag | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const fetch = useCallback(async () => {
    if (id === undefined || id === null) return
    setLoading(true)
    setError(null)
    try {
      const result = await fetchTagDetail(id)
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

export const useDeleteTag = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const deleteTag = useCallback(
    async (id: number, onSuccess?: () => void) => {
      setLoading(true)
      setError(null)
      try {
        // 发送 DELETE 请求删除指定标签
        const res = await apiFetch(`${API_ENDPOINTS.TAGS}/${id}`, {
          method: "DELETE",
        })
        await handleApiResponse(res, "delete tag")
        onSuccess?.()
      } catch (err) {
        setError(err as Error)
        console.error("[useDeleteTag] error:", err)
        // 显示用户友好的错误提示
        toast.add({
          type: "warning",
          description: "删除标签失败，请重试",
        })
      } finally {
        setLoading(false)
      }
    },
    []
  )

  return { deleteTag, loading, error }
}
