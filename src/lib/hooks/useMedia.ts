import { useApiQuery, useApiMutation } from '../query/hooks/useApiQuery'
import { Media, MediaListQuery, MediaListResponse, UpdateMediaRequest } from '../../types/blog/media'

// 媒体文件查询键
export const mediaKeys = {
  all: ['media'] as const,
  lists: () => [...mediaKeys.all, 'list'] as const,
  list: (query: MediaListQuery) => [...mediaKeys.lists(), query] as const,
  details: () => [...mediaKeys.all, 'detail'] as const,
  detail: (id: string) => [...mediaKeys.details(), id] as const,
  upload: () => [...mediaKeys.all, 'upload'] as const,
}

/**
 * 获取媒体文件列表
 */
export function useMediaList(query: MediaListQuery = {}) {
  return useApiQuery<MediaListResponse>(
    mediaKeys.list(query),
    async () => {
      const params = new URLSearchParams()
      Object.entries(query).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, String(value))
        }
      })
      
      const response = await fetch(`/api/media?${params.toString()}`)
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      const result = await response.json().catch(() => null)
      if (!result) {
        throw new Error('服务器响应解析失败')
      }
      if (!result.success) {
        throw new Error(result.error || '获取媒体文件列表失败')
      }
      
      return result.data
    },
    {
      // 媒体文件列表缓存时间较短，因为可能经常变化
      staleTime: 1 * 60 * 1000, // 1分钟
    }
  )
}

/**
 * 获取单个媒体文件详情
 */
export function useMedia(id: string, enabled = true) {
  return useApiQuery<Media | null>(
    mediaKeys.detail(id),
    async () => {
      const response = await fetch(`/api/media/${id}`)
      if (!response.ok) {
        if (response.status === 404) return null
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      const result = await response.json().catch(() => null)
      if (!result) {
        throw new Error('服务器响应解析失败')
      }
      if (!result.success) {
        throw new Error(result.error || '获取媒体文件详情失败')
      }
      
      return result.data
    },
    {
      enabled: enabled && !!id,
      staleTime: 5 * 60 * 1000, // 5分钟
    }
  )
}

/**
 * 上传媒体文件
 */
export function useUploadMedia() {
  return useApiMutation<Media, FormData>(
    async (formData) => {
      const response = await fetch('/api/media/upload', {
        method: 'POST',
        body: formData,
        // 不设置Content-Type，让浏览器自动设置boundary
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
        throw new Error(result.error || '上传媒体文件失败')
      }
      
      return result.data
    },
    {
      invalidateQueries: [[...mediaKeys.lists()]],
      successMessage: '媒体文件上传成功',
    }
  )
}

/**
 * 批量上传媒体文件
 */
export function useBatchUploadMedia() {
  return useApiMutation<Media[], FormData[]>(
    async (filesData) => {
      const uploadPromises = filesData.map(formData => 
        fetch('/api/media/upload', {
          method: 'POST',
          body: formData,
        }).then(response => {
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`)
          }
          return response.json().catch(() => null).then(result => {
            if (!result) {
              throw new Error('服务器响应解析失败')
            }
            if (!result.success) {
              throw new Error(result.error || '上传文件失败')
            }
            return result
          })
        })
      )
      
      const results = await Promise.all(uploadPromises)
      const failedUploads = results.filter(result => !result.success)
      
      if (failedUploads.length > 0) {
        throw new Error(`${failedUploads.length}个文件上传失败`)
      }
      
      return results.map(result => result.data)
    },
    {
      invalidateQueries: [[...mediaKeys.lists()]],
      successMessage: '媒体文件批量上传成功',
    }
  )
}

/**
 * 更新媒体文件信息
 */
export function useUpdateMedia() {
  return useApiMutation<Media, { id: string; data: UpdateMediaRequest }>(
    async ({ id, data }) => {
      const response = await fetch(`/api/media/${id}`, {
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
        throw new Error(result.error || '更新媒体文件失败')
      }
      
      return result.data
    },
    {
      invalidateQueries: [
        [...mediaKeys.lists()],
      ],
      successMessage: '媒体文件信息更新成功',
    }
  )
}

/**
 * 删除媒体文件
 */
export function useDeleteMedia() {
  return useApiMutation<void, string>(
    async (id) => {
      const response = await fetch(`/api/media/${id}`, {
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
        throw new Error(result.error || '删除媒体文件失败')
      }
      
      return result.data
    },
    {
      invalidateQueries: [[...mediaKeys.lists()]],
      successMessage: '媒体文件删除成功',
    }
  )
}

/**
 * 批量删除媒体文件
 */
export function useBatchDeleteMedia() {
  return useApiMutation<void, string[]>(
    async (ids) => {
      const response = await fetch('/api/media/batch', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ids }),
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
        throw new Error(result.error || '批量删除媒体文件失败')
      }
      
      return result.data
    },
    {
      invalidateQueries: [[...mediaKeys.lists()]],
      successMessage: '媒体文件批量删除成功',
    }
  )
}