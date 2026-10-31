import { useState, useEffect, useCallback } from "react"
import { API_ENDPOINTS, apiFetch } from "@/lib/api"
import type { FetchSite, FetchSitePage } from "@/types"

import { toast } from "@/components/ui/toast"

export interface CreateFetchSitePayload {
  name: string
  fetch_url: string
  status?: number
}

const handleResponse = async (res: Response, label: string) => {
  if (!res.ok) {
    const text = await res.text().catch(() => "")
    throw new Error(`Failed to ${label}: HTTP ${res.status} ${text}`)
  }
  const contentType = res.headers.get("content-type") ?? ""
  return contentType.includes("application/json") ? res.json() : undefined
}

const fetchFetchSites = async (
  page: number = 0,
  pageSize: number = 10
): Promise<FetchSitePage> => {
  const url = `${API_ENDPOINTS.FETCH_SITES}?page=${page + 1}&size=${pageSize}`
  const res = await apiFetch(url)
  if (!res.ok) {
    throw new Error(`Failed to fetch fetch sites: HTTP ${res.status}`)
  }
  return res.json()
}

export const useFetchSitesPage = (pageIndex: number, pageSize: number) => {
  const [data, setData] = useState<FetchSitePage | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const fetch = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await fetchFetchSites(pageIndex, pageSize)
      setData(result)
    } catch (err) {
      setError(err as Error)
    } finally {
      setLoading(false)
    }
  }, [pageIndex, pageSize])

  useEffect(() => {
    const loadData = async () => {
      await fetch()
    }
    loadData()
  }, [fetch])

  return { data, loading, error, refetch: fetch }
}

export const useCreateFetchSite = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const createFetchSite = useCallback(
    async (payload: CreateFetchSitePayload, onSuccess?: () => void) => {
      setLoading(true)
      setError(null)
      try {
        const fetchSitePayload = {
          ...payload,
          status: payload.status ?? 0,
          fetch_url: payload.fetch_url.trim(),
          name: payload.name.trim(),
        }
        const res = await apiFetch(API_ENDPOINTS.FETCH_SITES, {
          method: "POST",
          body: JSON.stringify(fetchSitePayload),
        })
        await handleResponse(res, "create fetch site")
        onSuccess?.()
      } catch (err) {
        setError(err as Error)
        console.error("[useCreateFetchSite] error:", err)
        toast.add({
          type: "warning",
          description: "添加站点配置失败，请重试",
        })
      } finally {
        setLoading(false)
      }
    },
    []
  )

  return { createFetchSite, loading, error }
}

export const useUpdateFetchSite = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const updateFetchSite = useCallback(
    async (
      {
        id,
        updates,
      }: {
        id: number
        updates: Partial<FetchSite>
      },
      onSuccess?: () => void
    ) => {
      setLoading(true)
      setError(null)
      try {
        const res = await apiFetch(`${API_ENDPOINTS.FETCH_SITES}/${id}`, {
          method: "PUT",
          body: JSON.stringify(updates),
        })
        await handleResponse(res, "update fetch site")
        onSuccess?.()
      } catch (err) {
        setError(err as Error)
        console.error("[useUpdateFetchSite] error:", err)
        toast.add({
          type: "warning",
          description: "更新站点配置失败，请重试",
        })
      } finally {
        setLoading(false)
      }
    },
    []
  )

  return { updateFetchSite, loading, error }
}

export const useDeleteFetchSite = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const deleteFetchSite = useCallback(
    async (id: number, onSuccess?: () => void) => {
      setLoading(true)
      setError(null)
      try {
        const res = await apiFetch(`${API_ENDPOINTS.FETCH_SITES}/${id}`, {
          method: "DELETE",
        })
        await handleResponse(res, "delete fetch site")
        onSuccess?.()
      } catch (err) {
        setError(err as Error)
        console.error("[useDeleteFetchSite] error:", err)
        toast.add({
          type: "warning",
          description: "删除站点配置失败，请重试",
        })
      } finally {
        setLoading(false)
      }
    },
    []
  )

  return { deleteFetchSite, loading, error }
}
