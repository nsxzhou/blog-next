// 通知相关的类型定义
import { Notification, NotificationType, User } from '@prisma/client'

// 通知类型（包含关联数据）
export interface NotificationWithRelations extends Notification {
  user?: User | null
}

// 通知列表项
export interface NotificationListItem {
  id: string
  type: NotificationType
  title: string
  content: string | null
  isRead: boolean
  readAt: Date | null
  createdAt: Date
  data?: any
}

// 创建通知的输入类型
export interface NotificationInput {
  userId?: string | null // null表示全体通知
  type: NotificationType
  title: string
  content?: string
  data?: any
}

// 通知查询参数
export interface NotificationQueryParams {
  userId?: string
  type?: NotificationType
  isRead?: boolean
  page?: number
  limit?: number
}

// WebSocket通知事件
export interface NotificationEvent {
  type: 'new' | 'update' | 'delete'
  notification: NotificationListItem
}

// 通知统计
export interface NotificationStats {
  total: number
  unread: number
  byType: Record<NotificationType, number>
}