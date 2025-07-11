import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getUserNotifications } from '@/lib/notifications'

// GET /api/notifications - 获取用户通知
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: '请先登录' }, { status: 401 })
    }
    
    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    
    const result = await getUserNotifications(session.user.id, page, limit)
    
    return NextResponse.json(result)
  } catch (error) {
    console.error('获取通知失败:', error)
    return NextResponse.json({ error: '获取通知失败' }, { status: 500 })
  }
}