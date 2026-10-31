import type { Article, ArticlePage } from "@/types"
import { API_ENDPOINTS, apiFetch, handleApiResponse } from "@/lib/api.ts"
import { useCallback, useEffect, useState } from "react"
import { toast } from "@/components/ui/toast.tsx"

/**
 * 创建文章请求体
 */
export interface CreateArticlePayload {
  id: number
  title: string
  content: string
  status: number
  fetch_url: string
}

const fetchArticlesPage = async (
  page: number = 0,
  pageSize: number = 10
): Promise<ArticlePage> => {
  // 构造请求 URL，后端页码从 1 开始，所以 page + 1
  const url = `${API_ENDPOINTS.ARTICLES}?page=${page + 1}&size=${pageSize}`
  const response = await apiFetch(url, { method: "GET" })
  if (!response.ok) {
    throw new Error(`获取文章列表失败，状态码：${response.status}`)
  }

  return response.json()
}

export const useArticlesPage = (pageIndex: number, pageSize: number) => {
  // 任务分页数据状态
  const [data, setData] = useState<ArticlePage | null>(null)
  // 加载中状态
  const [loading, setLoading] = useState(false)
  // 错误信息状态
  const [error, setError] = useState<Error | null>(null)

  // 使用 useCallback 缓存 fetch 函数，避免不必要的重复创建
  const fetch = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await fetchArticlesPage(pageIndex, pageSize)
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

export const useCreateArticle = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  /**
   * 创建文章
   * @param payload - 文章数据
   * @param onSuccess - 创建成功后的回调函数（可选）
   */
  const createArticle = useCallback(
    async (payload: CreateArticlePayload, onSuccess?: () => void) => {
      setLoading(true)
      setError(null)
      try {
        // 构造请求体：设置默认值，展开用户数据，最后对标题去空格

        const articlePayload = {
          id: payload.id,
          title: payload.title.trim(),
          content: payload.content.trim(),
          status: payload.status,
        }

        const res = await apiFetch(API_ENDPOINTS.ARTICLES, {
          method: "POST",
          body: JSON.stringify(articlePayload),
        })
        await handleApiResponse(res, "create article")
        onSuccess?.()
      } catch (err) {
        setError(err as Error)
        console.error("[useCreateArticle] error:", err)
        // 显示用户友好的错误提示
        toast.add({
          type: "warning",
          description: "添加文章失败，请重试",
        })
      } finally {
        setLoading(false)
      }
    },
    []
  )

  return { createArticle, loading, error }
}

export const useUpdateArticle = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const updateArticle = useCallback(
    async (
      {
        id,
        updates,
      }: {
        id: number
        updates: Partial<Article>
      },
      onSuccess?: () => void
    ) => {
      setLoading(true)
      setError(null)
      try {
        // 发送 PUT 请求更新指定文章
        const res = await apiFetch(`${API_ENDPOINTS.ARTICLES}/${id}`, {
          method: "PUT",
          body: JSON.stringify(updates),
        })
        await handleApiResponse(res, "update article")
        onSuccess?.()
      } catch (err) {
        setError(err as Error)
        console.error("[useUpdateArticle] error:", err)
        toast.add({
          type: "warning",
          description: "更新文章失败，请重试",
        })
      } finally {
        setLoading(false)
      }
    },
    []
  )

  return { updateArticle, loading, error }
}

export const useDeleteArticle = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const deleteArticle = useCallback(
    async (id: number, onSuccess?: () => void) => {
      setLoading(true)
      setError(null)
      try {
        // 发送 DELETE 请求删除指定文章
        const res = await apiFetch(`${API_ENDPOINTS.ARTICLES}/${id}`, {
          method: "DELETE",
        })
        await handleApiResponse(res, "delete article")
        onSuccess?.()
      } catch (err) {
        setError(err as Error)
        console.error("[useDeleteArticle] error:", err)
        // 显示用户友好的错误提示
        toast.add({
          type: "warning",
          description: "删除文章失败，请重试",
        })
      } finally {
        setLoading(false)
      }
    },
    []
  )

  return { deleteArticle, loading, error }
}
