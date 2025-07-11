'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  TrendingUp,
  TrendingDown,
  Eye,
  Users,
  Clock,
  Calendar,
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
  viewsData: {
    [key in TimeRange]: Array<{
      date: string
      views: number
      visitors: number
    }>
  }
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
      
      // 并行获取需要的数据
      const [overviewRes, activityRes] = await Promise.all([
        fetch('/api/dashboard/stats?type=overview'),
        fetch(`/api/dashboard/stats?type=activity&timeRange=${timeRange}`)
      ])

      if (overviewRes.ok && activityRes.ok) {
        const [overview, activity] = await Promise.all([
          overviewRes.json(),
          activityRes.json()
        ])

        // 格式化活动数据
        const formattedActivity = (activity.data || []).map((item: any) => {
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
            views: item.views || 0,
            visitors: item.visitors || Math.round((item.views || 0) * 0.7) // 如果没有访客数据，估算为浏览量的70%
          }
        })

        // 计算平均阅读时长
        const overviewData = overview?.data || {}
        const avgReadTimeMinutes = Math.floor((overviewData.avgReadTime || 0) / 60)
        const avgReadTimeSeconds = Math.round((overviewData.avgReadTime || 0) % 60)
        const avgReadTime = `${avgReadTimeMinutes}:${String(avgReadTimeSeconds).padStart(2, '0')}`

        setAnalyticsData({
          overview: {
            totalViews: overviewData.totalViews || 0,
            totalViewsChange: overviewData.viewsChange || 0,
            uniqueVisitors: overviewData.uniqueVisitors || 0,
            uniqueVisitorsChange: overviewData.visitorsChange || 0,
            avgReadTime,
            avgReadTimeChange: overviewData.avgReadTimeChange || 0,
            bounceRate: overviewData.bounceRate || 0,
            bounceRateChange: overviewData.bounceRateChange || 0
          },
          viewsData: {
            week: timeRange === 'week' ? formattedActivity : [],
            month: timeRange === 'month' ? formattedActivity : [],
            year: timeRange === 'year' ? formattedActivity : []
          }
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

        {/* 改进的图表显示 */}
        <div className="h-64">
          {currentViewsData.length > 0 ? (
            <div className="h-full flex items-end justify-between gap-1">
              {currentViewsData.map((data, index) => (
                <div key={index} className="flex-1 flex flex-col items-center">
                  <div className="w-full flex gap-0.5 items-end h-48">
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${Math.max((data.views / maxViews) * 100, 2)}%` }}
                      transition={{ delay: index * 0.05, duration: 0.5 }}
                      className="flex-1 bg-primary rounded-t min-h-[2px]"
                    />
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${Math.max((data.visitors / maxVisitors) * 100, 2)}%` }}
                      transition={{ delay: index * 0.05 + 0.025, duration: 0.5 }}
                      className="flex-1 bg-primary/50 rounded-t min-h-[2px]"
                    />
                  </div>
                  <div className="mt-2 text-xs text-muted-foreground text-center">
                    <div>{data.date}</div>
                    <div className="text-[10px]">
                      {data.views} / {data.visitors}
                    </div>
                  </div>
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
    </div>
  )
}