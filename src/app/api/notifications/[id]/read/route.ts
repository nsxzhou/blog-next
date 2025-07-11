import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { markNotificationAsRead } from '@/lib/notifications'

// PUT /api/notifications/[id]/read - 标记通知为已读
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: '请先登录' }, { status: 401 })
    }
    
    await markNotificationAsRead(params.id, session.user.id)
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('标记通知已读失败:', error)
    return NextResponse.json({ error: '标记通知已读失败' }, { status: 500 })
  }
}