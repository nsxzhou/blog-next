// 统计分析相关的数据库操作
import { prisma } from '@/lib/prisma'
import { cache } from 'react'
import { AnalyticsInput, AnalyticsQueryParams, AnalyticsStats, PostAnalytics } from '@/types/analytics'
import { PostStatus } from '@prisma/client'

// 记录页面访问
export async function trackPageView(data: AnalyticsInput) {
  try {
    await prisma.analytics.create({
      data: {
        sessionId: data.sessionId,
        postId: data.postId,
        userId: data.userId,
        pageUrl: data.pageUrl,
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
        referrer: data.referrer,
        device: data.device,
        browser: data.browser,
        os: data.os,
        country: data.country,
        city: data.city,
        duration: data.duration,
      }
    })
  } catch (error) {
    console.error('记录页面访问失败:', error)
  }
}

// 获取总体统计数据
export const getOverallStats = cache(async () => {
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0)

  // 获取文章统计
  const [totalPosts, publishedPosts, draftPosts] = await Promise.all([
    prisma.post.count(),
    prisma.post.count({ where: { status: PostStatus.PUBLISHED } }),
    prisma.post.count({ where: { status: PostStatus.DRAFT } })
  ])

  // 获取总浏览量
  const totalViews = await prisma.analytics.count()

  // 获取本月浏览量
  const monthlyViews = await prisma.analytics.count({
    where: {
      createdAt: {
        gte: startOfMonth
      }
    }
  })

  // 获取上月浏览量（用于计算趋势）
  const lastMonthViews = await prisma.analytics.count({
    where: {
      createdAt: {
        gte: startOfLastMonth,
        lte: endOfLastMonth
      }
    }
  })

  // 获取独立访客数（通过session统计）
  const uniqueVisitors = await prisma.analytics.groupBy({
    by: ['sessionId'],
    _count: true
  })

  // 获取总点赞数
  const totalLikes = await prisma.postLike.count()

  // 计算趋势
  const viewsTrend = lastMonthViews > 0 
    ? ((monthlyViews - lastMonthViews) / lastMonthViews) * 100 
    : 0

  return {
    totalPosts,
    publishedPosts,
    draftPosts,
    totalViews,
    monthlyViews,
    uniqueVisitors: uniqueVisitors.length,
    totalLikes,
    viewsTrend: parseFloat(viewsTrend.toFixed(1))
  }
})

// 获取文章统计数据
export const getPostStats = cache(async (postId: string): Promise<PostAnalytics> => {
  // 获取文章浏览量
  const views = await prisma.analytics.count({
    where: { postId }
  })

  // 获取独立访客
  const uniqueVisitors = await prisma.analytics.groupBy({
    by: ['sessionId'],
    where: { postId },
    _count: true
  })

  // 获取平均阅读时间
  const durations = await prisma.analytics.aggregate({
    where: { 
      postId,
      duration: { not: null }
    },
    _avg: { duration: true }
  })

  // 获取点赞数
  const likes = await prisma.postLike.count({
    where: { postId }
  })

  // 获取流量来源
  const referrers = await prisma.analytics.groupBy({
    by: ['referrer'],
    where: { 
      postId,
      referrer: { not: null }
    },
    _count: true,
    orderBy: { _count: { referrer: 'desc' } },
    take: 5
  })

  // 获取最近7天的每日浏览量
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
  
  const dailyViews = await prisma.$queryRaw<Array<{ date: Date, views: bigint }>>`
    SELECT 
      DATE(created_at) as date,
      COUNT(*) as views
    FROM analytics
    WHERE post_id = ${postId}
      AND created_at >= ${sevenDaysAgo}
    GROUP BY DATE(created_at)
    ORDER BY date ASC
  `

  return {
    postId,
    views,
    uniqueVisitors: uniqueVisitors.length,
    avgReadingTime: durations._avg.duration || 0,
    completionRate: 0, // 需要更复杂的计算逻辑
    likes,
    trafficSources: referrers.map(r => ({
      source: r.referrer || '直接访问',
      count: r._count
    })),
    dailyViews: dailyViews.map(d => ({
      date: new Date(d.date),
      views: Number(d.views)
    }))
  }
})

// 获取活动数据（用于图表）
export const getActivityData = cache(async (timeRange: 'week' | 'month' | 'year' = 'week') => {
  let startDate = new Date()
  
  switch (timeRange) {
    case 'week':
      startDate.setDate(startDate.getDate() - 7)
      break
    case 'month':
      startDate.setMonth(startDate.getMonth() - 1)
      break
    case 'year':
      startDate.setFullYear(startDate.getFullYear() - 1)
      break
  }

  // 获取浏览量数据
  const viewsData = await prisma.$queryRaw<Array<{ date: Date, views: bigint }>>`
    SELECT 
      DATE(created_at) as date,
      COUNT(*) as views
    FROM analytics
    WHERE created_at >= ${startDate}
    GROUP BY DATE(created_at)
    ORDER BY date ASC
  `

  // 获取文章发布数据
  const articlesData = await prisma.$queryRaw<Array<{ date: Date, articles: bigint }>>`
    SELECT 
      DATE(published_at) as date,
      COUNT(*) as articles
    FROM posts
    WHERE published_at >= ${startDate}
      AND status = 'PUBLISHED'
    GROUP BY DATE(published_at)
    ORDER BY date ASC
  `

  // 合并数据
  const dateMap = new Map<string, { views: number, articles: number }>()
  
  viewsData.forEach(item => {
    const dateStr = item.date.toISOString().split('T')[0]
    dateMap.set(dateStr, { 
      views: Number(item.views), 
      articles: 0 
    })
  })

  articlesData.forEach(item => {
    const dateStr = item.date.toISOString().split('T')[0]
    const existing = dateMap.get(dateStr) || { views: 0, articles: 0 }
    dateMap.set(dateStr, {
      ...existing,
      articles: Number(item.articles)
    })
  })

  // 转换为数组格式
  return Array.from(dateMap.entries()).map(([date, data]) => ({
    date,
    ...data
  }))
})

// 获取热门文章
export const getPopularPosts = cache(async (limit: number = 5) => {
  const popularPosts = await prisma.analytics.groupBy({
    by: ['postId'],
    where: {
      postId: { not: null }
    },
    _count: true,
    orderBy: {
      _count: { postId: 'desc' }
    },
    take: limit
  })

  // 获取文章详情
  const postIds = popularPosts.map(p => p.postId!).filter(Boolean)
  const posts = await prisma.post.findMany({
    where: {
      id: { in: postIds },
      status: PostStatus.PUBLISHED
    },
    select: {
      id: true,
      title: true,
      slug: true,
      publishedAt: true,
      _count: {
        select: {
          likes: true,
          analytics: true
        }
      }
    }
  })

  // 按浏览量排序
  const postMap = new Map(posts.map(p => [p.id, p]))
  return popularPosts
    .map(p => postMap.get(p.postId!))
    .filter(Boolean)
    .map(post => ({
      id: post!.id,
      title: post!.title,
      slug: post!.slug,
      views: post!._count.analytics,
      likes: post!._count.likes,
      publishedAt: post!.publishedAt
    }))
})

// 获取设备统计
export const getDeviceStats = cache(async () => {
  const devices = await prisma.analytics.groupBy({
    by: ['device'],
    where: {
      device: { not: null }
    },
    _count: true
  })

  const total = devices.reduce((sum, d) => sum + d._count, 0)
  
  return devices.map(d => ({
    device: d.device || '未知',
    count: d._count,
    percentage: total > 0 ? (d._count / total) * 100 : 0
  }))
})

// 获取浏览器统计
export const getBrowserStats = cache(async () => {
  const browsers = await prisma.analytics.groupBy({
    by: ['browser'],
    where: {
      browser: { not: null }
    },
    _count: true,
    orderBy: {
      _count: { browser: 'desc' }
    },
    take: 5
  })

  const total = browsers.reduce((sum, b) => sum + b._count, 0)
  
  return browsers.map(b => ({
    browser: b.browser || '未知',
    count: b._count,
    percentage: total > 0 ? (b._count / total) * 100 : 0
  }))
})