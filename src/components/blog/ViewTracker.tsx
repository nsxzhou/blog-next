'use client'

import { useEffect } from 'react'

/**
 * 浏览量追踪组件
 * 
 * 功能：在页面加载时自动增加文章浏览量
 * 设计原则：
 * - KISS: 简单直接的实现
 * - SRP: 单一职责，只负责浏览量追踪
 * - DIP: 依赖抽象的 API 接口
 */
interface ViewTrackerProps {
  postId: string
}

export function ViewTracker({ postId }: ViewTrackerProps) {
  useEffect(() => {
    /**
     * 增加文章浏览量
     * 遵循 YAGNI 原则：只实现必需的功能
     */
    const incrementViewCount = async () => {
      try {
        // 防重复调用：检查 sessionStorage
        const viewKey = `post-viewed-${postId}`
        if (sessionStorage.getItem(viewKey)) {
          return // 本次会话已经浏览过，不重复计数
        }

        const response = await fetch(`/api/posts/${postId}/view`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
        })

        if (response.ok) {
          // 标记为已浏览
          sessionStorage.setItem(viewKey, 'true')
        } else {
          console.error('增加浏览量失败:', response.statusText)
        }
      } catch (error) {
        console.error('增加浏览量失败:', error)
      }
    }

    // 延迟执行，确保页面完全加载
    const timer = setTimeout(() => {
      incrementViewCount()
    }, 1000)

    return () => clearTimeout(timer)
  }, [postId])

  return null // 此组件不渲染任何 UI
}