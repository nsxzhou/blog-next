import { NextRequest } from 'next/server'
import { successResponse, errorResponse } from '@/lib/utils/api/response'
import { StatsService } from '@/lib/services/stats.service'
import { requireAuth } from '@/lib/auth-helpers'

export async function GET(request: NextRequest) {
  try {
    await requireAuth()
    
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'dashboard'
    
    switch (type) {
      case 'dashboard':
        const dashboardStats = await StatsService.getDashboardStats()
        return successResponse(dashboardStats, '获取仪表盘统计数据成功')
      
      case 'posts':
        const postStats = await StatsService.getPostStats()
        return successResponse(postStats, '获取文章统计数据成功')
      
      case 'pages':
        const pageStats = await StatsService.getPageStats()
        return successResponse(pageStats, '获取页面统计数据成功')
      
      case 'users':
        const userStats = await StatsService.getUserStats()
        return successResponse(userStats, '获取用户统计数据成功')
      
      case 'monthly':
        const year = parseInt(searchParams.get('year') || new Date().getFullYear().toString())
        const monthlyStats = await StatsService.getMonthlyStats(year)
        return successResponse(monthlyStats, '获取月度统计数据成功')
      
      case 'top-tags':
        const limit = parseInt(searchParams.get('limit') || '10')
        const topTags = await StatsService.getTopTags(limit)
        return successResponse(topTags, '获取热门标签成功')
      
      case 'popular-posts':
        const popularLimit = parseInt(searchParams.get('limit') || '10')
        const popularPosts = await StatsService.getPopularPosts(popularLimit)
        return successResponse(popularPosts, '获取热门文章成功')
      
      default:
        return errorResponse('INVALID_TYPE', '不支持的统计类型', 400)
    }
  } catch (error) {
    if (error instanceof Error && error.message === '未授权访问') {
      return errorResponse('UNAUTHORIZED', '请先登录', 401)
    }
    console.error('获取统计数据失败:', error)
    return errorResponse('INTERNAL_ERROR', '获取统计数据失败', 500)
  }
}