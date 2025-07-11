// 统计分析相关的类型定义
import { Analytics } from '@prisma/client'

// 访问统计类型
export interface AnalyticsWithRelations extends Analytics {
  // 关联数据可以在这里添加
}

// 访问记录输入类型
export interface AnalyticsInput {
  sessionId: string
  postId?: string
  userId?: string
  pageUrl: string
  ipAddress?: string
  userAgent?: string
  referrer?: string
  device?: string
  browser?: string
  os?: string
  country?: string
  city?: string
  duration?: number
}

// 统计查询参数
export interface AnalyticsQueryParams {
  startDate?: Date
  endDate?: Date
  postId?: string
  userId?: string
  device?: string
  country?: string
  groupBy?: 'day' | 'week' | 'month'
  limit?: number
}

// 访问统计数据
export interface AnalyticsStats {
  pageViews: number
  uniqueVisitors: number
  avgDuration: number
  bounceRate: number
  topPages: Array<{
    url: string
    title?: string
    views: number
    avgDuration: number
  }>
  topReferrers: Array<{
    referrer: string
    count: number
  }>
  deviceStats: {
    desktop: number
    mobile: number
    tablet: number
  }
  browserStats: Array<{
    browser: string
    count: number
    percentage: number
  }>
  countryStats: Array<{
    country: string
    count: number
    percentage: number
  }>
}

// 实时统计数据
export interface RealtimeStats {
  activeUsers: number
  currentPageViews: Array<{
    pageUrl: string
    count: number
  }>
  recentActivities: Array<{
    sessionId: string
    pageUrl: string
    timestamp: Date
    device?: string
    country?: string
  }>
}

// 文章统计数据
export interface PostAnalytics {
  postId: string
  views: number
  uniqueVisitors: number
  avgReadingTime: number
  completionRate: number
  likes: number
  shareCount?: number
  trafficSources: Array<{
    source: string
    count: number
  }>
  dailyViews: Array<{
    date: Date
    views: number
  }>
}