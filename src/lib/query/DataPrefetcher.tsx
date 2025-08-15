'use client'

import { useEffect } from 'react'
import { prefetchHelpers } from './client'

/**
 * 数据预获取组件
 * 在应用启动时预取常用数据，提升用户体验
 */
export function DataPrefetcher() {
  useEffect(() => {
    // 预取常用数据
    const prefetchData = async () => {
      try {
        // 预取标签列表（不常变化的数据）
        await prefetchHelpers.prefetchTagList()
        
        // 预取文章列表（首页可能需要）
        await prefetchHelpers.prefetchPostList({ 
          page: 1, 
          pageSize: 10, 
          status: 'PUBLISHED' 
        })
        
        // 如果用户可能访问管理后台，预取统计数据
        if (window.location.pathname.startsWith('/admin')) {
          await prefetchHelpers.prefetchDashboardStats()
        }
      } catch (error) {
        console.warn('预取数据失败:', error)
        // 预取失败不影响正常功能
      }
    }

    // 使用 requestIdleCallback 在浏览器空闲时预取
    if ('requestIdleCallback' in window) {
      window.requestIdleCallback(prefetchData, { timeout: 3000 })
    } else {
      // 回退方案：使用 setTimeout
      setTimeout(prefetchData, 1000)
    }
  }, [])

  return null
}