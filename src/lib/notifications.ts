import { prisma } from '@/lib/prisma'
import { NotificationType, Notification } from '@prisma/client'

interface CreateNotificationData {
  userId: string
  type: NotificationType
  title: string
  content: string
  link?: string
  metadata?: any
}

// 创建通知
export async function createNotification(data: CreateNotificationData): Promise<Notification> {
  const notification = await prisma.notification.create({
    data: {
      userId: data.userId,
      type: data.type,
      title: data.title,
      content: data.content,
      data: data.metadata || {}
    }
  })

  // 发送实时通知
  try {
    const io = (global as any).io
    if (io) {
      // 发送给特定用户
      io.to(`user:${data.userId}`).emit('new-notification', notification)
      
      // 更新未读数量
      const unreadCount = await prisma.notification.count({
        where: {
          userId: data.userId,
          isRead: false
        }
      })
      io.to(`user:${data.userId}`).emit('unread-count', unreadCount)
    }
  } catch (error) {
    console.error('Failed to send real-time notification:', error)
  }

  return notification
}

// 创建系统通知（发送给所有用户）
export async function createSystemNotification(data: Omit<CreateNotificationData, 'userId'>) {
  const users = await prisma.user.findMany({
    select: { id: true }
  })

  const notifications = await prisma.notification.createMany({
    data: users.map(user => ({
      userId: user.id,
      type: data.type,
      title: data.title,
      content: data.content,
      link: data.link,
      metadata: data.metadata || {}
    }))
  })

  // 发送实时通知给所有用户
  try {
    const io = (global as any).io
    if (io) {
      io.emit('new-notification', {
        type: data.type,
        title: data.title,
        content: data.content,
        link: data.link
      })
    }
  } catch (error) {
    console.error('Failed to send system notification:', error)
  }

  return notifications
}

// 创建管理员通知（发送给所有管理员）
export async function createAdminNotification(data: Omit<CreateNotificationData, 'userId'>) {
  const admins = await prisma.user.findMany({
    where: { role: 'ADMIN' },
    select: { id: true }
  })

  const notifications = await prisma.notification.createMany({
    data: admins.map(admin => ({
      userId: admin.id,
      type: data.type,
      title: data.title,
      content: data.content,
      link: data.link,
      metadata: data.metadata || {}
    }))
  })

  // 发送实时通知给管理员
  try {
    const io = (global as any).io
    if (io) {
      io.to('admin').emit('new-notification', {
        type: data.type,
        title: data.title,
        content: data.content,
        link: data.link
      })
    }
  } catch (error) {
    console.error('Failed to send admin notification:', error)
  }

  return notifications
}

// 获取用户通知
export async function getUserNotifications(
  userId: string,
  page: number = 1,
  limit: number = 20
) {
  const [notifications, total] = await Promise.all([
    prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: (page - 1) * limit
    }),
    prisma.notification.count({
      where: { userId }
    })
  ])

  return {
    notifications,
    total,
    page,
    totalPages: Math.ceil(total / limit)
  }
}

// 获取未读通知数量
export async function getUnreadNotificationCount(userId: string): Promise<number> {
  return prisma.notification.count({
    where: {
      userId,
      isRead: false
    }
  })
}

// 标记通知为已读
export async function markNotificationAsRead(notificationId: string, userId: string) {
  return prisma.notification.update({
    where: {
      id: notificationId,
      userId // 确保只能标记自己的通知
    },
    data: { isRead: true }
  })
}

// 标记所有通知为已读
export async function markAllNotificationsAsRead(userId: string) {
  return prisma.notification.updateMany({
    where: {
      userId,
      isRead: false
    },
    data: { isRead: true }
  })
}

// 删除通知
export async function deleteNotification(notificationId: string, userId: string) {
  return prisma.notification.delete({
    where: {
      id: notificationId,
      userId // 确保只能删除自己的通知
    }
  })
}

// 清空所有已读通知
export async function clearReadNotifications(userId: string) {
  return prisma.notification.deleteMany({
    where: {
      userId,
      isRead: true
    }
  })
}