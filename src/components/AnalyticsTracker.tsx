'use client'

import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'

interface AnalyticsTrackerProps {
  postId?: string
}

export default function AnalyticsTracker({ postId }: AnalyticsTrackerProps) {
  const pathname = usePathname()
  const startTime = useRef<number>(Date.now())
  const tracked = useRef(false)

  useEffect(() => {
    // 避免开发环境重复追踪
    if (tracked.current) return
    tracked.current = true

    // 记录页面访问
    const trackView = async () => {
      try {
        await fetch('/api/analytics/track', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            pageUrl: pathname,
            postId,
          }),
        })
      } catch (error) {
        console.error('Failed to track page view:', error)
      }
    }

    trackView()

    // 页面卸载时记录停留时间
    const handleUnload = () => {
      const duration = Math.floor((Date.now() - startTime.current) / 1000) // 秒
      
      // 使用 sendBeacon 确保请求发送
      if (navigator.sendBeacon) {
        const data = JSON.stringify({
          pageUrl: pathname,
          postId,
          duration,
        })
        navigator.sendBeacon('/api/analytics/track', data)
      }
    }

    window.addEventListener('beforeunload', handleUnload)
    
    return () => {
      window.removeEventListener('beforeunload', handleUnload)
      handleUnload() // 组件卸载时也记录
    }
  }, [pathname, postId])

  return null
}