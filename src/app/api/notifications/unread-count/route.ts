import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getUnreadNotificationCount } from '@/lib/notifications'

// GET /api/notifications/unread-count - 获取未读通知数量
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: '请先登录' }, { status: 401 })
    }
    
    const count = await getUnreadNotificationCount(session.user.id)
    
    return NextResponse.json({ count })
  } catch (error) {
    console.error('获取未读通知数量失败:', error)
    return NextResponse.json({ error: '获取未读通知数量失败' }, { status: 500 })
  }
}