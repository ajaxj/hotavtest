import type { Category, CategoryPage } from "@/types"
import { API_ENDPOINTS, apiFetch, handleApiResponse } from "@/lib/api.ts"
import { useCallback, useEffect, useState } from "react"
import { toast } from "@/components/ui/toast.tsx"

/**
 * 创建 Tv Category请求体
 */
export interface CreateCategoryPayload {
  name: string
  parent: number
}

const fetchCategories = async (
  page: number = 0,
  pageSize: number = 10,
  src: number
): Promise<CategoryPage> => {
  // 构造请求 URL，后端页码从 1 开始，所以 page + 1
  const url = `${API_ENDPOINTS.CATEGORIES}?page=${page + 1}&size=${pageSize}&src=${src}`
  const response = await apiFetch(url, { method: "GET" })
  if (!response.ok) {
    throw new Error(`获取 分类列表失败，状态码：${response.status}`)
  }

  return response.json()
}

export const useCategories = (
  pageIndex: number,
  pageSize: number,
  src: number
) => {
  // 任务分页数据状态
  const [data, setData] = useState<CategoryPage | null>(null)
  // 加载中状态
  const [loading, setLoading] = useState(false)
  // 错误信息状态
  const [error, setError] = useState<Error | null>(null)

  // 使用 useCallback 缓存 fetch 函数，避免不必要的重复创建
  const fetch = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await fetchCategories(pageIndex, pageSize, src)
      setData(result)
    } catch (err) {
      setError(err as Error)
    } finally {
      // 无论成功失败，最终都关闭加载状态
      setLoading(false)
    }
  }, [pageIndex, pageSize, src])

  // 副作用：在 fetch 函数变化时自动加载数据
  useEffect(() => {
    const loadData = async () => {
      await fetch()
    }
    loadData()
  }, [fetch])

  return { data, loading, error, refetch: fetch }
}

export const useCreateCategory = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  /**
   * 创建 分类
   * @param payload - 分类数据
   * @param onSuccess - 创建成功后的回调函数（可选）
   */
  const createCategory = useCallback(
    async (payload: CreateCategoryPayload, onSuccess?: () => void) => {
      setLoading(true)
      setError(null)
      try {
        // 构造请求体：设置默认值，展开用户数据，最后对标题去空格

        const categoryPayload = {
          name: payload.name.trim(),
          parent: payload.parent,
        }

        const res = await apiFetch(API_ENDPOINTS.CATEGORIES, {
          method: "POST",
          body: JSON.stringify(categoryPayload),
        })
        await handleApiResponse(res, "create category")
        onSuccess?.()
      } catch (err) {
        setError(err as Error)
        console.error("[useCreateCategory] error:", err)
        // 显示用户友好的错误提示
        toast.add({
          type: "warning",
          description: "添加分类失败，请重试",
        })
      } finally {
        setLoading(false)
      }
    },
    []
  )

  return { createCategory, loading, error }
}

export const useUpdateCategory = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const updateCategory = useCallback(
    async (
      {
        id,
        updates,
      }: {
        id: number
        updates: Partial<Category>
      },
      onSuccess?: () => void
    ) => {
      setLoading(true)
      setError(null)
      try {
        // 发送 PUT 请求更新指定分类
        const res = await apiFetch(`${API_ENDPOINTS.CATEGORIES}/${id}`, {
          method: "PUT",
          body: JSON.stringify(updates),
        })
        await handleApiResponse(res, "update Temp category category")
        onSuccess?.()
      } catch (err) {
        setError(err as Error)
        console.error("[useUpdateTempCategory] error:", err)
        toast.add({
          type: "warning",
          description: "更新分类失败，请重试",
        })
      } finally {
        setLoading(false)
      }
    },
    []
  )

  return { updateCategory, loading, error }
}

export const useDeleteCategory = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const deleteCategory = useCallback(
    async (id: number, onSuccess?: () => void) => {
      setLoading(true)
      setError(null)
      try {
        // 发送 DELETE 请求删除指定分类
        const res = await apiFetch(`${API_ENDPOINTS.CATEGORIES}/${id}`, {
          method: "DELETE",
        })
        await handleApiResponse(res, "delete category")
        onSuccess?.()
      } catch (err) {
        setError(err as Error)
        console.error("[useDeleteCategory] error:", err)
        // 显示用户友好的错误提示
        toast.add({
          type: "warning",
          description: "删除分类失败，请重试",
        })
      } finally {
        setLoading(false)
      }
    },
    []
  )

  return { deleteCategory, loading, error }
}
