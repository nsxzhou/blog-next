import { useApiQuery, useApiMutation } from '../query/hooks/useApiQuery'
import { Post, PostListQuery, PostListResponse, CreatePostRequest, UpdatePostRequest } from '../../types/blog/post'

// 文章查询键
export const postKeys = {
  all: ['posts'] as const,
  lists: () => [...postKeys.all, 'list'] as const,
  list: (query: PostListQuery) => [...postKeys.lists(), query] as const,
  details: () => [...postKeys.all, 'detail'] as const,
  detail: (id: string) => [...postKeys.details(), id] as const,
  bySlug: (slug: string) => [...postKeys.all, 'slug', slug] as const,
}

/**
 * 获取文章列表
 */
export function usePostList(query: PostListQuery = {}) {
  return useApiQuery<PostListResponse>(
    postKeys.list(query),
    async () => {
      const params = new URLSearchParams()
      Object.entries(query).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, String(value))
        }
      })
      
      const response = await fetch(`/api/posts?${params.toString()}`)
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      const result = await response.json().catch(() => null)
      if (!result) {
        throw new Error('服务器响应解析失败')
      }
      if (!result.success) {
        throw new Error(result.error || '获取文章列表失败')
      }
      
      return result.data
    },
    {
      // 启用缓存，提高列表页面性能
      staleTime: 2 * 60 * 1000, // 2分钟
    }
  )
}

/**
 * 获取单个文章详情
 */
export function usePost(id: string, enabled = true) {
  return useApiQuery<Post | null>(
    postKeys.detail(id),
    async () => {
      const response = await fetch(`/api/posts/${id}`)
      if (!response.ok) {
        if (response.status === 404) return null
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      const result = await response.json().catch(() => null)
      if (!result) {
        throw new Error('服务器响应解析失败')
      }
      if (!result.success) {
        throw new Error(result.error || '获取文章详情失败')
      }
      
      return result.data
    },
    {
      enabled: enabled && !!id,
      // 文章详情缓存时间更长
      staleTime: 10 * 60 * 1000, // 10分钟
    }
  )
}

/**
 * 根据slug获取文章
 */
export function usePostBySlug(slug: string, enabled = true) {
  return useApiQuery<Post | null>(
    postKeys.bySlug(slug),
    async () => {
      const response = await fetch(`/api/posts/by-slug/${slug}`)
      if (!response.ok) {
        if (response.status === 404) return null
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      const result = await response.json().catch(() => null)
      if (!result) {
        throw new Error('服务器响应解析失败')
      }
      if (!result.success) {
        throw new Error(result.error || '获取文章失败')
      }
      
      return result.data
    },
    {
      enabled: enabled && !!slug,
      staleTime: 10 * 60 * 1000, // 10分钟
    }
  )
}

/**
 * 创建文章
 */
export function useCreatePost() {
  return useApiMutation<Post, CreatePostRequest & { authorId: string }>(
    async (data) => {
      const response = await fetch('/api/posts', {
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
        throw new Error(result.error || '创建文章失败')
      }
      
      return result.data
    },
    {
      invalidateQueries: [[...postKeys.lists()]],
      successMessage: '文章创建成功',
    }
  )
}

/**
 * 更新文章
 */
export function useUpdatePost() {
  return useApiMutation<Post, { id: string; data: UpdatePostRequest }>(
    async ({ id, data }) => {
      const response = await fetch(`/api/posts/${id}`, {
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
        throw new Error(result.error || '更新文章失败')
      }
      
      return result.data
    },
    {
      invalidateQueries: [
        [...postKeys.lists()],
      ],
      successMessage: '文章更新成功',
    }
  )
}

/**
 * 删除文章
 */
export function useDeletePost() {
  return useApiMutation<void, string>(
    async (id) => {
      const response = await fetch(`/api/posts/${id}`, {
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
        throw new Error(result.error || '删除文章失败')
      }
      
      return result.data
    },
    {
      invalidateQueries: [[...postKeys.lists()]],
      successMessage: '文章删除成功',
    }
  )
}

/**
 * 增加文章浏览量
 */
export function useIncrementViewCount() {
  return useApiMutation<void, string>(
    async (postId) => {
      const response = await fetch(`/api/posts/${postId}/view`, {
        method: 'PATCH',
      })
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      const result = await response.json().catch(() => null)
      if (!result) {
        throw new Error('服务器响应解析失败')
      }
      if (!result.success) {
        throw new Error(result.error || '更新浏览量失败')
      }
      
      return result.data
    },
    {
      // 不需要使查询失效，因为浏览量更新不需要立即反映在UI上
      invalidateQueries: [],
    }
  )
}