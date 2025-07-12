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
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  LineChart,
  Line
} from 'recharts'

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

// 自定义工具提示
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-popover border border-border rounded-lg p-3 shadow-lg">
        <p className="text-sm font-medium">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {entry.name}: {entry.value.toLocaleString()}
          </p>
        ))}
      </div>
    )
  }
  return null
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

        // 确保活动数据是数组
        const activityData = Array.isArray(activity?.data) ? activity.data : []

        // 格式化活动数据
        const formattedActivity = activityData.map((item: any) => {
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
      // 设置默认空数据以避免报错
      setAnalyticsData({
        overview: {
          totalViews: 0,
          totalViewsChange: 0,
          uniqueVisitors: 0,
          uniqueVisitorsChange: 0,
          avgReadTime: '0:00',
          avgReadTimeChange: 0,
          bounceRate: 0,
          bounceRateChange: 0
        },
        viewsData: {
          week: [],
          month: [],
          year: []
        }
      })
    } finally {
      setLoading(false)
    }
  }

  // 获取当前时间范围的数据，确保总是返回数组
  const currentViewsData = analyticsData?.viewsData[timeRange] || []

  // 刷新数据
  const handleRefresh = () => {
    setIsRefreshing(true)
    fetchAnalyticsData().finally(() => {
      setTimeout(() => setIsRefreshing(false), 500)
    })
  }

  // 导出报告功能（示例）
  const handleExport = () => {
    // 这里可以实现导出功能
    console.log('导出报告功能待实现')
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
          <button 
            onClick={handleExport}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
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
              {/* 迷你趋势图 */}
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={currentViewsData.slice(-7)}>
                  <Line 
                    type="monotone" 
                    dataKey="views" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
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
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={currentViewsData.slice(-7)}>
                  <Line 
                    type="monotone" 
                    dataKey="visitors" 
                    stroke="hsl(var(--chart-2))" 
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
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

      {/* 访问趋势 - 使用 Recharts */}
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

        {/* 使用 Recharts 面积图 */}
        <div className="h-[400px]">
          {currentViewsData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={currentViewsData}>
                <defs>
                  <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorVisitors" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--chart-2))" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="hsl(var(--chart-2))" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  dataKey="date" 
                  className="text-xs"
                  tick={{ fill: 'hsl(var(--muted-foreground))' }}
                />
                <YAxis 
                  className="text-xs"
                  tick={{ fill: 'hsl(var(--muted-foreground))' }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend 
                  wrapperStyle={{ paddingTop: '20px' }}
                  iconType="line"
                  formatter={(value) => value === 'views' ? '浏览量' : '访客数'}
                />
                <Area
                  type="monotone"
                  dataKey="views"
                  stroke="hsl(var(--primary))"
                  fillOpacity={1}
                  fill="url(#colorViews)"
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="visitors"
                  stroke="hsl(var(--chart-2))"
                  fillOpacity={1}
                  fill="url(#colorVisitors)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center">
              <p className="text-muted-foreground text-sm">暂无数据</p>
            </div>
          )}
        </div>
      </motion.div>

      {/* 设备分布和页面浏览排名 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 设备分布 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-card border border-border rounded-xl p-6"
        >
          <h2 className="text-lg font-semibold mb-4">设备分布</h2>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={[
                  { name: '桌面端', value: 65, fill: 'hsl(var(--chart-1))' },
                  { name: '移动端', value: 30, fill: 'hsl(var(--chart-2))' },
                  { name: '平板', value: 5, fill: 'hsl(var(--chart-3))' }
                ]}
                layout="vertical"
              >
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis type="number" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                <YAxis dataKey="name" type="category" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* 热门页面 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-card border border-border rounded-xl p-6"
        >
          <h2 className="text-lg font-semibold mb-4">热门页面</h2>
          <div className="space-y-3">
            {[
              { page: '/blog/getting-started', views: 1234, change: 12 },
              { page: '/blog/advanced-tips', views: 987, change: -5 },
              { page: '/about', views: 765, change: 8 },
              { page: '/projects', views: 543, change: 15 },
              { page: '/blog/tutorial', views: 432, change: -2 }
            ].map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium truncate">{item.page}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-muted-foreground">
                      {item.views.toLocaleString()} 浏览
                    </span>
                    <span className={cn(
                      "text-xs flex items-center gap-0.5",
                      item.change > 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
                    )}>
                      {item.change > 0 ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                      {Math.abs(item.change)}%
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  )
}