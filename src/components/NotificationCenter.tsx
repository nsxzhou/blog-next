'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, X, Check, Trash2, ExternalLink, Loader2 } from 'lucide-react'
import { useNotifications } from '@/contexts/NotificationContext'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { zhCN } from 'date-fns/locale'

export default function NotificationCenter() {
  const { notifications, unreadCount, loading, markAsRead, markAllAsRead, refreshNotifications } = useNotifications()
  const [isOpen, setIsOpen] = useState(false)

  // 获取通知图标
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'LIKE':
        return '❤️'
      case 'COMMENT':
        return '💬'
      case 'FOLLOW':
        return '👥'
      case 'SYSTEM':
        return '📢'
      case 'UPDATE':
        return '🔔'
      default:
        return '📌'
    }
  }

  // 获取通知类型文本
  const getNotificationTypeText = (type: string) => {
    switch (type) {
      case 'LIKE':
        return '点赞'
      case 'COMMENT':
        return '评论'
      case 'FOLLOW':
        return '关注'
      case 'SYSTEM':
        return '系统'
      case 'UPDATE':
        return '更新'
      default:
        return '通知'
    }
  }

  return (
    <>
      {/* 通知按钮 */}
      <button
        onClick={() => {
          setIsOpen(true)
          refreshNotifications() // 打开时刷新
        }}
        className="relative p-2 hover:bg-muted rounded-lg transition-colors"
      >
        <Bell className="w-5 h-5" />
        
        {/* 未读数量标记 */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* 通知中心弹窗 */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* 背景遮罩 */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/20 z-40"
            />

            {/* 通知面板 */}
            <motion.div
              initial={{ opacity: 0, x: 400 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 400 }}
              className="fixed right-0 top-0 h-full w-full max-w-md bg-background border-l border-border shadow-xl z-50"
            >
              {/* 头部 */}
              <div className="flex items-center justify-between p-6 border-b border-border">
                <div>
                  <h2 className="text-xl font-semibold">通知中心</h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    {unreadCount > 0 ? `${unreadCount} 条未读消息` : '暂无未读消息'}
                  </p>
                </div>
                
                <div className="flex items-center gap-2">
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="text-sm text-primary hover:underline"
                    >
                      全部标记已读
                    </button>
                  )}
                  
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-2 hover:bg-muted rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* 通知列表 */}
              <div className="h-[calc(100%-5rem)] overflow-y-auto">
                {loading && notifications.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                    <Bell className="w-12 h-12 mb-4 opacity-20" />
                    <p>暂无通知</p>
                  </div>
                ) : (
                  <div className="divide-y divide-border">
                    {notifications.map((notification) => (
                      <motion.div
                        key={notification.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={cn(
                          "p-4 hover:bg-muted/50 transition-colors cursor-pointer",
                          !notification.isRead && "bg-primary/5"
                        )}
                        onClick={() => {
                          if (!notification.isRead) {
                            markAsRead(notification.id)
                          }
                          if (notification.link) {
                            window.location.href = notification.link
                          }
                        }}
                      >
                        <div className="flex gap-3">
                          {/* 图标 */}
                          <div className="flex-shrink-0 text-2xl">
                            {getNotificationIcon(notification.type)}
                          </div>
                          
                          {/* 内容 */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1">
                                <p className="font-medium">
                                  {notification.title}
                                </p>
                                <p className="text-sm text-muted-foreground mt-1">
                                  {notification.content}
                                </p>
                              </div>
                              
                              {/* 未读标记 */}
                              {!notification.isRead && (
                                <span className="flex-shrink-0 w-2 h-2 bg-primary rounded-full mt-2" />
                              )}
                            </div>
                            
                            {/* 底部信息 */}
                            <div className="flex items-center gap-4 mt-2">
                              <span className="text-xs text-muted-foreground">
                                {getNotificationTypeText(notification.type)}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {formatDistanceToNow(new Date(notification.createdAt), {
                                  addSuffix: true,
                                  locale: zhCN
                                })}
                              </span>
                              
                              {notification.link && (
                                <ExternalLink className="w-3 h-3 text-muted-foreground" />
                              )}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}