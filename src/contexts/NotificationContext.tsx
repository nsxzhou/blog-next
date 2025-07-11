'use client'

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import type { Notification } from '@prisma/client'

interface NotificationContextType {
  notifications: Notification[]
  unreadCount: number
  loading: boolean
  markAsRead: (notificationId: string) => Promise<void>
  markAllAsRead: () => Promise<void>
  refreshNotifications: () => Promise<void>
}

const NotificationContext = createContext<NotificationContextType>({
  notifications: [],
  unreadCount: 0,
  loading: false,
  markAsRead: async () => {},
  markAllAsRead: async () => {},
  refreshNotifications: async () => {}
})

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(false)

  // 获取通知列表
  const fetchNotifications = useCallback(async () => {
    if (!session?.user) return
    
    try {
      const response = await fetch('/api/notifications')
      if (response.ok) {
        const data = await response.json()
        setNotifications(data.notifications)
      }
    } catch (error) {
      console.error('获取通知失败:', error)
    }
  }, [session])

  // 获取未读数量
  const fetchUnreadCount = useCallback(async () => {
    if (!session?.user) return
    
    try {
      const response = await fetch('/api/notifications/unread-count')
      if (response.ok) {
        const data = await response.json()
        setUnreadCount(data.count)
      }
    } catch (error) {
      console.error('获取未读数量失败:', error)
    }
  }, [session])

  // 标记为已读
  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}/read`, {
        method: 'PUT'
      })
      
      if (response.ok) {
        // 更新本地状态
        setNotifications(prev => 
          prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n)
        )
        setUnreadCount(prev => Math.max(0, prev - 1))
      }
    } catch (error) {
      console.error('标记已读失败:', error)
    }
  }, [])

  // 标记全部为已读
  const markAllAsRead = useCallback(async () => {
    try {
      const response = await fetch('/api/notifications/read-all', {
        method: 'PUT'
      })
      
      if (response.ok) {
        // 更新本地状态
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
        setUnreadCount(0)
      }
    } catch (error) {
      console.error('标记全部已读失败:', error)
    }
  }, [])

  // 刷新通知
  const refreshNotifications = useCallback(async () => {
    setLoading(true)
    try {
      await Promise.all([fetchNotifications(), fetchUnreadCount()])
    } finally {
      setLoading(false)
    }
  }, [fetchNotifications, fetchUnreadCount])

  // 初始加载和定期轮询
  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      // 初始加载
      refreshNotifications()
      
      // 每30秒轮询一次
      const interval = setInterval(refreshNotifications, 30000)
      
      return () => clearInterval(interval)
    }
  }, [session, status, refreshNotifications])

  // 请求浏览器通知权限
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }
  }, [])

  // 监听新通知（通过比较数量）
  useEffect(() => {
    if (unreadCount > 0 && notifications.length > 0) {
      const latestUnread = notifications.find(n => !n.isRead)
      if (latestUnread && 'Notification' in window && Notification.permission === 'granted') {
        // 检查是否是新通知（5秒内创建的）
        const isNew = new Date().getTime() - new Date(latestUnread.createdAt).getTime() < 5000
        if (isNew) {
          new Notification(latestUnread.title, {
            body: latestUnread.content || '',
            icon: '/favicon.ico'
          })
        }
      }
    }
  }, [unreadCount, notifications])

  return (
    <NotificationContext.Provider value={{
      notifications,
      unreadCount,
      loading,
      markAsRead,
      markAllAsRead,
      refreshNotifications
    }}>
      {children}
    </NotificationContext.Provider>
  )
}

export const useNotifications = () => {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider')
  }
  return context
}