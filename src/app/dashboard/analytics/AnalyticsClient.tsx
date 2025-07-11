'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  TrendingUp,
  TrendingDown,
  Eye,
  FileText,
  Users,
  Clock,
  Calendar,
  BarChart3,
  LineChart,
  PieChart,
  Activity,
  ArrowUp,
  ArrowDown,
  Download,
  RefreshCw
} from 'lucide-react'
import { cn } from '@/lib/utils'

// 时间范围类型
type TimeRange = 'week' | 'month' | 'year'

// 数据类型定义
interface AnalyticsData {
  overview: {
    totalViews: number
    totalViewsChange: number
    uniqueVisitors: number
    uniqueVisitorsChange: number
    avgReadTime: string
    avgReadTimeChange: number
    bounceRate: number
    bounceRateChange: number
  }
  popularArticles: Array<{
    id: string
    title: string
    views: number
    readTime: string
  }>
  viewsData: {
    [key in TimeRange]: Array<{
      date: string
      views: number
      visitors: number
    }>
  }
  trafficSources: Array<{
    source: string
    value: number
    color: string
  }>
  devices: Array<{
    device: string
    value: number
  }>
}

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState<TimeRange>('week')
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)

  // 获取分析数据
  useEffect(() => {
    fetchAnalyticsData()
  }, [timeRange])

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true)
      
      // 并行获取所有需要的数据
      const [overviewRes, activityRes, popularRes, devicesRes] = await Promise.all([
        fetch('/api/dashboard/stats?type=overview'),
        fetch(`/api/dashboard/stats?type=activity&timeRange=${timeRange}`),
        fetch('/api/dashboard/stats?type=popular&limit=5'),
        fetch('/api/dashboard/stats?type=devices')
      ])

      if (overviewRes.ok && activityRes.ok && popularRes.ok && devicesRes.ok) {
        const [overview, activity, popular, devices] = await Promise.all([
          overviewRes.json(),
          activityRes.json(),
          popularRes.json(),
          devicesRes.json()
        ])

        // 处理设备数据
        const deviceStats = devices.data || []
        const totalDeviceViews = deviceStats.reduce((sum: number, d: any) => sum + d.views, 0)
        const deviceData = deviceStats.map((d: any) => ({
          device: d.device === 'desktop' ? '桌面端' : d.device === 'mobile' ? '移动端' : '平板',
          value: totalDeviceViews > 0 ? Math.round((d.views / totalDeviceViews) * 100) : 0
        }))

        // 处理流量来源数据（暂时使用模拟数据，因为 API 没有提供）
        const trafficSources = [
          { source: '搜索引擎', value: 45, color: 'bg-blue-500' },
          { source: '直接访问', value: 30, color: 'bg-green-500' },
          { source: '社交媒体', value: 15, color: 'bg-purple-500' },
          { source: '外部链接', value: 10, color: 'bg-amber-500' }
        ]

        // 格式化活动数据
        const formattedActivity = activity.data.map((item: any) => {
          let date = item.date
          if (timeRange === 'week') {
            const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
            const dayIndex = new Date(item.date).getDay()
            date = weekDays[dayIndex]
          } else if (timeRange === 'month') {
            date = `第${item.week}周`
          } else {
            date = new Date(item.date).toLocaleDateString('zh-CN', { month: 'long' })
          }
          return {
            date,
            views: item.views,
            visitors: item.uniqueVisitors
          }
        })

        // 格式化热门文章
        const formattedPopular = popular.data.map((post: any) => ({
          id: post.id,
          title: post.title,
          views: post.viewCount,
          readTime: `${Math.ceil(post.avgReadTime / 60)}:${String(post.avgReadTime % 60).padStart(2, '0')}`
        }))

        // 计算平均阅读时长
        const avgReadTimeMinutes = Math.floor((overview.data.avgReadTime || 0) / 60)
        const avgReadTimeSeconds = Math.round((overview.data.avgReadTime || 0) % 60)
        const avgReadTime = `${avgReadTimeMinutes}:${String(avgReadTimeSeconds).padStart(2, '0')}`

        setAnalyticsData({
          overview: {
            totalViews: overview.data.totalViews || 0,
            totalViewsChange: overview.data.viewsChange || 0,
            uniqueVisitors: overview.data.uniqueVisitors || 0,
            uniqueVisitorsChange: overview.data.visitorsChange || 0,
            avgReadTime,
            avgReadTimeChange: overview.data.avgReadTimeChange || 0,
            bounceRate: overview.data.bounceRate || 0,
            bounceRateChange: overview.data.bounceRateChange || 0
          },
          popularArticles: formattedPopular,
          viewsData: {
            week: timeRange === 'week' ? formattedActivity : [],
            month: timeRange === 'month' ? formattedActivity : [],
            year: timeRange === 'year' ? formattedActivity : []
          },
          trafficSources,
          devices: deviceData
        })
      }
    } catch (error) {
      console.error('Failed to fetch analytics data:', error)
    } finally {
      setLoading(false)
    }
  }

  // 获取当前时间范围的数据
  const currentViewsData = analyticsData?.viewsData[timeRange] || []

  // 计算最大值（用于图表缩放）
  const maxViews = Math.max(...currentViewsData.map(d => d.views), 1)
  const maxVisitors = Math.max(...currentViewsData.map(d => d.visitors), 1)

  // 刷新数据
  const handleRefresh = () => {
    setIsRefreshing(true)
    fetchAnalyticsData().finally(() => {
      setTimeout(() => setIsRefreshing(false), 500)
    })
  }

  if (loading || !analyticsData) {
    return (
      <div className="container mx-auto max-w-7xl p-6 lg:p-8 space-y-8">
        <div className="animate-pulse space-y-8">
          <div className="h-8 bg-muted rounded w-48"></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-card border border-border rounded-lg p-4 h-32"></div>
            ))}
          </div>
          <div className="bg-card border border-border rounded-xl p-6 h-96"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto max-w-7xl p-6 lg:p-8 space-y-8">
      {/* 页面标题 */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">统计分析</h1>
          <p className="text-muted-foreground mt-1">
            了解您的博客表现和读者行为
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            className="inline-flex items-center gap-2 px-4 py-2 bg-muted hover:bg-muted/80 rounded-lg transition-colors"
          >
            <RefreshCw className={cn("w-4 h-4", isRefreshing && "animate-spin")} />
            <span>刷新</span>
          </button>
          <button className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
            <Download className="w-4 h-4" />
            <span>导出报告</span>
          </button>
        </div>
      </div>

      {/* 概览统计 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card border border-border rounded-lg p-4"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">总浏览量</span>
            <Eye className="w-4 h-4 text-muted-foreground" />
          </div>
          <div className="flex items-end justify-between">
            <div>
              <p className="text-2xl font-bold">
                {analyticsData.overview.totalViews.toLocaleString()}
              </p>
              <div className={cn(
                "flex items-center gap-1 text-xs mt-1",
                analyticsData.overview.totalViewsChange > 0
                  ? "text-green-600 dark:text-green-400"
                  : "text-red-600 dark:text-red-400"
              )}>
                {analyticsData.overview.totalViewsChange > 0 ? (
                  <ArrowUp className="w-3 h-3" />
                ) : (
                  <ArrowDown className="w-3 h-3" />
                )}
                <span>{Math.abs(analyticsData.overview.totalViewsChange)}%</span>
              </div>
            </div>
            <div className="h-12 w-20">
              {/* 迷你图表 */}
              <svg className="w-full h-full" viewBox="0 0 80 48">
                <polyline
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  points="0,30 20,20 40,25 60,10 80,15"
                  className="text-primary"
                />
              </svg>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card border border-border rounded-lg p-4"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">独立访客</span>
            <Users className="w-4 h-4 text-muted-foreground" />
          </div>
          <div className="flex items-end justify-between">
            <div>
              <p className="text-2xl font-bold">
                {analyticsData.overview.uniqueVisitors.toLocaleString()}
              </p>
              <div className={cn(
                "flex items-center gap-1 text-xs mt-1",
                analyticsData.overview.uniqueVisitorsChange > 0
                  ? "text-green-600 dark:text-green-400"
                  : "text-red-600 dark:text-red-400"
              )}>
                {analyticsData.overview.uniqueVisitorsChange > 0 ? (
                  <ArrowUp className="w-3 h-3" />
                ) : (
                  <ArrowDown className="w-3 h-3" />
                )}
                <span>{Math.abs(analyticsData.overview.uniqueVisitorsChange)}%</span>
              </div>
            </div>
            <div className="h-12 w-20">
              <svg className="w-full h-full" viewBox="0 0 80 48">
                <polyline
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  points="0,25 20,15 40,20 60,12 80,18"
                  className="text-primary"
                />
              </svg>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-card border border-border rounded-lg p-4"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">平均阅读时长</span>
            <Clock className="w-4 h-4 text-muted-foreground" />
          </div>
          <div className="flex items-end justify-between">
            <div>
              <p className="text-2xl font-bold">
                {analyticsData.overview.avgReadTime}
              </p>
              <div className={cn(
                "flex items-center gap-1 text-xs mt-1",
                analyticsData.overview.avgReadTimeChange > 0
                  ? "text-green-600 dark:text-green-400"
                  : "text-red-600 dark:text-red-400"
              )}>
                {analyticsData.overview.avgReadTimeChange > 0 ? (
                  <ArrowUp className="w-3 h-3" />
                ) : (
                  <ArrowDown className="w-3 h-3" />
                )}
                <span>{Math.abs(analyticsData.overview.avgReadTimeChange)}%</span>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-card border border-border rounded-lg p-4"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">跳出率</span>
            <Activity className="w-4 h-4 text-muted-foreground" />
          </div>
          <div className="flex items-end justify-between">
            <div>
              <p className="text-2xl font-bold">
                {analyticsData.overview.bounceRate}%
              </p>
              <div className={cn(
                "flex items-center gap-1 text-xs mt-1",
                analyticsData.overview.bounceRateChange < 0
                  ? "text-green-600 dark:text-green-400"
                  : "text-red-600 dark:text-red-400"
              )}>
                {analyticsData.overview.bounceRateChange < 0 ? (
                  <ArrowDown className="w-3 h-3" />
                ) : (
                  <ArrowUp className="w-3 h-3" />
                )}
                <span>{Math.abs(analyticsData.overview.bounceRateChange)}%</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* 访问趋势 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-card border border-border rounded-xl p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold">访问趋势</h2>
          <div className="flex gap-2">
            {(['week', 'month', 'year'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={cn(
                  "px-3 py-1 text-sm rounded-md transition-colors",
                  timeRange === range
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
              >
                {range === 'week' ? '周' : range === 'month' ? '月' : '年'}
              </button>
            ))}
          </div>
        </div>

        {/* 图例 */}
        <div className="flex items-center gap-6 text-sm mb-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-primary rounded" />
            <span className="text-muted-foreground">浏览量</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-primary/50 rounded" />
            <span className="text-muted-foreground">访客数</span>
          </div>
        </div>

        {/* 图表 */}
        <div className="h-64 relative">
          {currentViewsData.length > 0 ? (
            <div className="absolute inset-0 flex items-end justify-between gap-2">
              {currentViewsData.map((data, index) => (
                <div key={index} className="flex-1 flex flex-col items-center gap-2">
                  <div className="w-full flex gap-1 items-end h-48">
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${(data.views / maxViews) * 100}%` }}
                      transition={{ delay: index * 0.1, duration: 0.5 }}
                      className="flex-1 bg-primary rounded-t"
                    />
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${(data.visitors / maxVisitors) * 100}%` }}
                      transition={{ delay: index * 0.1 + 0.05, duration: 0.5 }}
                      className="flex-1 bg-primary/50 rounded-t"
                    />
                  </div>
                  <span className="text-xs text-muted-foreground">{data.date}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-full flex items-center justify-center">
              <p className="text-muted-foreground text-sm">暂无数据</p>
            </div>
          )}
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 热门文章 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="lg:col-span-2 bg-card border border-border rounded-xl p-6"
        >
          <h2 className="text-lg font-semibold mb-4">热门文章</h2>
          <div className="space-y-3">
            {analyticsData.popularArticles.map((article, index) => (
              <div
                key={article.id}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/30 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg font-semibold text-muted-foreground">
                    #{index + 1}
                  </span>
                  <div>
                    <p className="font-medium">{article.title}</p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        {article.views.toLocaleString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {article.readTime}
                      </span>
                    </div>
                  </div>
                </div>
                <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
            ))}
          </div>
        </motion.div>

        {/* 流量来源 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-card border border-border rounded-xl p-6"
        >
          <h2 className="text-lg font-semibold mb-4">流量来源</h2>
          <div className="space-y-3">
            {analyticsData.trafficSources.map((source) => (
              <div key={source.source}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm">{source.source}</span>
                  <span className="text-sm font-medium">{source.value}%</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${source.value}%` }}
                    transition={{ duration: 0.5 }}
                    className={cn("h-full rounded-full", source.color)}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-6 border-t border-border">
            <h3 className="font-medium mb-3">设备分布</h3>
            <div className="space-y-2">
              {analyticsData.devices.map((device) => (
                <div key={device.device} className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">{device.device}</span>
                  <span className="text-sm font-medium">{device.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}