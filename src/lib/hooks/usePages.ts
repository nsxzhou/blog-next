import { useApiQuery, useApiMutation } from '../query/hooks/useApiQuery'
import { Page, CreatePageRequest, UpdatePageRequest } from '../../types/blog/page'
import type { SearchParams } from '../../types/api/common'

// 页面查询键
export const pageKeys = {
  all: ['pages'] as const,
  lists: () => [...pageKeys.all, 'list'] as const,
  list: (query?: SearchParams) => [...pageKeys.lists(), query] as const,
  details: () => [...pageKeys.all, 'detail'] as const,
  detail: (id: string) => [...pageKeys.details(), id] as const,
  bySlug: (slug: string) => [...pageKeys.all, 'slug', slug] as const,
}

/**
 * 获取页面列表
 */
export function usePageList(query: SearchParams = {}) {
  return useApiQuery<Page[]>(
    pageKeys.list(query),
    async () => {
      const params = new URLSearchParams()
      Object.entries(query).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, String(value))
        }
      })
      
      const response = await fetch(`/api/pages?${params.toString()}`)
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      const result = await response.json().catch(() => null)
      if (!result) {
        throw new Error('服务器响应解析失败')
      }
      if (!result.success) {
        throw new Error(result.error || '获取页面列表失败')
      }
      
      return result.data
    },
    {
      // 页面缓存时间较长，因为不常变化
      staleTime: 30 * 60 * 1000, // 30分钟
    }
  )
}

/**
 * 获取单个页面详情
 */
export function usePage(id: string, enabled = true) {
  return useApiQuery<Page | null>(
    pageKeys.detail(id),
    async () => {
      const response = await fetch(`/api/pages/${id}`)
      if (!response.ok) {
        if (response.status === 404) return null
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      const result = await response.json().catch(() => null)
      if (!result) {
        throw new Error('服务器响应解析失败')
      }
      if (!result.success) {
        throw new Error(result.error || '获取页面详情失败')
      }
      
      return result.data
    },
    {
      enabled: enabled && !!id,
      staleTime: 30 * 60 * 1000, // 30分钟
    }
  )
}

/**
 * 根据slug获取页面
 */
export function usePageBySlug(slug: string, enabled = true) {
  return useApiQuery<Page | null>(
    pageKeys.bySlug(slug),
    async () => {
      const response = await fetch(`/api/pages/by-slug/${slug}`)
      if (!response.ok) {
        if (response.status === 404) return null
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      const result = await response.json().catch(() => null)
      if (!result) {
        throw new Error('服务器响应解析失败')
      }
      if (!result.success) {
        throw new Error(result.error || '获取页面失败')
      }
      
      return result.data
    },
    {
      enabled: enabled && !!slug,
      staleTime: 30 * 60 * 1000, // 30分钟
    }
  )
}

/**
 * 创建页面
 */
export function useCreatePage() {
  return useApiMutation<Page, CreatePageRequest>(
    async (data) => {
      const response = await fetch('/api/pages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`)
      }
      
      const result = await response.json().catch(() => null)
      if (!result) {
        throw new Error('服务器响应解析失败')
      }
      if (!result.success) {
        throw new Error(result.error || '创建页面失败')
      }
      
      return result.data
    },
    {
      invalidateQueries: [[...pageKeys.lists()]],
      successMessage: '页面创建成功',
    }
  )
}

/**
 * 更新页面
 */
export function useUpdatePage() {
  return useApiMutation<Page, { id: string; data: UpdatePageRequest }>(
    async ({ id, data }) => {
      const response = await fetch(`/api/pages/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`)
      }
      
      const result = await response.json().catch(() => null)
      if (!result) {
        throw new Error('服务器响应解析失败')
      }
      if (!result.success) {
        throw new Error(result.error || '更新页面失败')
      }
      
      return result.data
    },
    {
      invalidateQueries: [
        [...pageKeys.lists()],
      ],
      successMessage: '页面更新成功',
    }
  )
}

/**
 * 删除页面
 */
export function useDeletePage() {
  return useApiMutation<void, string>(
    async (id) => {
      const response = await fetch(`/api/pages/${id}`, {
        method: 'DELETE',
      })
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`)
      }
      
      const result = await response.json().catch(() => null)
      if (!result) {
        throw new Error('服务器响应解析失败')
      }
      if (!result.success) {
        throw new Error(result.error || '删除页面失败')
      }
      
      return result.data
    },
    {
      invalidateQueries: [[...pageKeys.lists()]],
      successMessage: '页面删除成功',
    }
  )
}