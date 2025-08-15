import { useApiQuery, useApiMutation } from '../query/hooks/useApiQuery'
import { Tag, CreateTagRequest, UpdateTagRequest } from '../../types/blog/tag'
import type { SearchParams } from '../../types/api/common'

// 标签查询键
export const tagKeys = {
  all: ['tags'] as const,
  lists: () => [...tagKeys.all, 'list'] as const,
  list: (query?: SearchParams) => [...tagKeys.lists(), query] as const,
  details: () => [...tagKeys.all, 'detail'] as const,
  detail: (id: string) => [...tagKeys.details(), id] as const,
  bySlug: (slug: string) => [...tagKeys.all, 'slug', slug] as const,
}

/**
 * 获取标签列表
 */
export function useTagList(query: SearchParams = {}) {
  return useApiQuery<Tag[]>(
    tagKeys.list(query),
    async () => {
      const params = new URLSearchParams()
      Object.entries(query).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, String(value))
        }
      })
      
      const response = await fetch(`/api/tags?${params.toString()}`)
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      const result = await response.json().catch(() => null)
      if (!result) {
        throw new Error('服务器响应解析失败')
      }
      if (!result.success) {
        throw new Error(result.error || '获取标签列表失败')
      }
      
      return result.data
    },
    {
      // 标签列表缓存时间较长，因为不常变化
      staleTime: 30 * 60 * 1000, // 30分钟
    }
  )
}

/**
 * 获取单个标签详情
 */
export function useTag(id: string, enabled = true) {
  return useApiQuery<Tag | null>(
    tagKeys.detail(id),
    async () => {
      const response = await fetch(`/api/tags/${id}`)
      if (!response.ok) {
        if (response.status === 404) return null
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      const result = await response.json().catch(() => null)
      if (!result) {
        throw new Error('服务器响应解析失败')
      }
      if (!result.success) {
        throw new Error(result.error || '获取标签详情失败')
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
 * 根据slug获取标签
 */
export function useTagBySlug(slug: string, enabled = true) {
  return useApiQuery<Tag | null>(
    tagKeys.bySlug(slug),
    async () => {
      const response = await fetch(`/api/tags/by-slug/${slug}`)
      if (!response.ok) {
        if (response.status === 404) return null
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      const result = await response.json().catch(() => null)
      if (!result) {
        throw new Error('服务器响应解析失败')
      }
      if (!result.success) {
        throw new Error(result.error || '获取标签失败')
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
 * 创建标签
 */
export function useCreateTag() {
  return useApiMutation<Tag, CreateTagRequest>(
    async (data) => {
      const response = await fetch('/api/tags', {
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
        throw new Error(result.error || '创建标签失败')
      }
      
      return result.data
    },
    {
      invalidateQueries: [[...tagKeys.lists()]],
      successMessage: '标签创建成功',
    }
  )
}

/**
 * 更新标签
 */
export function useUpdateTag() {
  return useApiMutation<Tag, { id: string; data: UpdateTagRequest }>(
    async ({ id, data }) => {
      const response = await fetch(`/api/tags/${id}`, {
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
        throw new Error(result.error || '更新标签失败')
      }
      
      return result.data
    },
    {
      invalidateQueries: [
        [...tagKeys.lists()],
      ],
      successMessage: '标签更新成功',
    }
  )
}

/**
 * 删除标签
 */
export function useDeleteTag() {
  return useApiMutation<void, string>(
    async (id) => {
      const response = await fetch(`/api/tags/${id}`, {
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
        throw new Error(result.error || '删除标签失败')
      }
      
      return result.data
    },
    {
      invalidateQueries: [[...tagKeys.lists()]],
      successMessage: '标签删除成功',
    }
  )
}