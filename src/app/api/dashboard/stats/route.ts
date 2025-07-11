import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { 
  getOverallStats, 
  getActivityData, 
  getPopularPosts,
  getDeviceStats,
  getBrowserStats 
} from '@/lib/analytics'
import { USER_ROLES } from '@/lib/constants'

// GET /api/dashboard/stats - 获取仪表盘统计数据
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: '请先登录' }, { status: 401 })
    }
    
    // 只有管理员可以查看统计数据
    if (session.user.role !== USER_ROLES.ADMIN) {
      return NextResponse.json({ error: '没有权限' }, { status: 403 })
    }
    
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'overview'
    
    switch (type) {
      case 'overview':
        const stats = await getOverallStats()
        return NextResponse.json(stats)
        
      case 'activity':
        const timeRange = searchParams.get('timeRange') as 'week' | 'month' | 'year' || 'week'
        const activityData = await getActivityData(timeRange)
        return NextResponse.json(activityData)
        
      case 'popular':
        const limit = parseInt(searchParams.get('limit') || '5')
        const popularPosts = await getPopularPosts(limit)
        return NextResponse.json(popularPosts)
        
      case 'devices':
        const deviceStats = await getDeviceStats()
        return NextResponse.json(deviceStats)
        
      case 'browsers':
        const browserStats = await getBrowserStats()
        return NextResponse.json(browserStats)
        
      default:
        return NextResponse.json({ error: '无效的统计类型' }, { status: 400 })
    }
  } catch (error) {
    console.error('获取统计数据失败:', error)
    return NextResponse.json({ error: '获取统计数据失败' }, { status: 500 })
  }
}