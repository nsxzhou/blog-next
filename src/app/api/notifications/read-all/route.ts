import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { markAllNotificationsAsRead } from '@/lib/notifications'

// PUT /api/notifications/read-all - 标记所有通知为已读
export async function PUT() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: '请先登录' }, { status: 401 })
    }
    
    await markAllNotificationsAsRead(session.user.id)
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('标记所有通知已读失败:', error)
    return NextResponse.json({ error: '标记所有通知已读失败' }, { status: 500 })
  }
}