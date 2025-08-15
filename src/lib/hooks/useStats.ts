import { useApiQuery } from '../query/hooks/useApiQuery'

// 统计数据查询键
export const statsKeys = {
  all: ['stats'] as const,
  dashboard: () => [...statsKeys.all, 'dashboard'] as const,
  detail: (type: string) => [...statsKeys.all, type] as const,
}

/**
 * 获取仪表板统计数据
 */
export function useDashboardStats() {
  return useApiQuery(
    statsKeys.dashboard(),
    async () => {
      const response = await fetch('/api/stats?type=dashboard')
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      const result = await response.json().catch(() => null)
      if (!result) {
        throw new Error('服务器响应解析失败')
      }
      if (!result.success) {
        throw new Error(result.error || '获取统计数据失败')
      }
      
      return result.data
    },
    {
      // 统计数据缓存时间较短，因为可能经常变化
      staleTime: 30 * 1000, // 30秒
    }
  )
}

/**
 * 获取指定类型的统计数据
 */
export function useStats(type: string, enabled = true) {
  return useApiQuery(
    statsKeys.detail(type),
    async () => {
      const response = await fetch(`/api/stats?type=${type}`)
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      const result = await response.json().catch(() => null)
      if (!result) {
        throw new Error('服务器响应解析失败')
      }
      if (!result.success) {
        throw new Error(result.error || '获取统计数据失败')
      }
      
      return result.data
    },
    {
      enabled: enabled && !!type,
      staleTime: 30 * 1000, // 30秒
    }
  )
}