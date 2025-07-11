import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getMediaStats } from '@/lib/media'

// GET /api/media/stats - 获取媒体统计
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: '请先登录' }, { status: 401 })
    }
    
    // 管理员查看所有统计，普通用户只看自己的
    const userId = session.user.role === 'ADMIN' ? undefined : session.user.id
    
    const stats = await getMediaStats(userId)
    
    return NextResponse.json(stats)
  } catch (error) {
    console.error('获取媒体统计失败:', error)
    return NextResponse.json({ error: '获取媒体统计失败' }, { status: 500 })
  }
}