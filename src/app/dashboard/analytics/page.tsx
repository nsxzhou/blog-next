'use client'

import React, { useState } from 'react'
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

// 模拟数据
const mockAnalyticsData = {
  overview: {
    totalViews: 45678,
    totalViewsChange: 12.5,
    uniqueVisitors: 12345,
    uniqueVisitorsChange: 8.3,
    avgReadTime: '3:45',
    avgReadTimeChange: -5.2,
    bounceRate: 42.3,
    bounceRateChange: -2.1
  },
  popularArticles: [
    { id: '1', title: '深入理解 React Server Components', views: 5432, readTime: '4:20' },
    { id: '2', title: 'TypeScript 5.0 新特性详解', views: 3210, readTime: '3:15' },
    { id: '3', title: '构建现代化的设计系统', views: 2876, readTime: '5:45' },
    { id: '4', title: 'Next.js 15 App Router 深度解析', views: 2341, readTime: '6:10' },
    { id: '5', title: 'Web 动画性能优化实战', views: 1987, readTime: '3:50' }
  ],
  viewsData: {
    week: [
      { date: '周一', views: 1200, visitors: 450 },
      { date: '周二', views: 1450, visitors: 520 },
      { date: '周三', views: 1380, visitors: 490 },
      { date: '周四', views: 1600, visitors: 580 },
      { date: '周五', views: 1820, visitors: 650 },
      { date: '周六', views: 2100, visitors: 720 },
      { date: '周日', views: 1950, visitors: 680 }
    ],
    month: [
      { date: '第1周', views: 8500, visitors: 3200 },
      { date: '第2周', views: 9200, visitors: 3450 },
      { date: '第3周', views: 8800, visitors: 3300 },
      { date: '第4周', views: 9500, visitors: 3580 }
    ],
    year: [
      { date: '1月', views: 32000, visitors: 12000 },
      { date: '2月', views: 28000, visitors: 10500 },
      { date: '3月', views: 35000, visitors: 13200 },
      { date: '4月', views: 38000, visitors: 14300 }
    ]
  },
  trafficSources: [
    { source: '搜索引擎', value: 45, color: 'bg-blue-500' },
    { source: '直接访问', value: 30, color: 'bg-green-500' },
    { source: '社交媒体', value: 15, color: 'bg-purple-500' },
    { source: '外部链接', value: 10, color: 'bg-amber-500' }
  ],
  devices: [
    { device: '桌面端', value: 65 },
    { device: '移动端', value: 30 },
    { device: '平板', value: 5 }
  ]
}

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState<TimeRange>('week')
  const [isRefreshing, setIsRefreshing] = useState(false)

  // 获取当前时间范围的数据
  const currentViewsData = mockAnalyticsData.viewsData[timeRange]

  // 计算最大值（用于图表缩放）
  const maxViews = Math.max(...currentViewsData.map(d => d.views))
  const maxVisitors = Math.max(...currentViewsData.map(d => d.visitors))

  // 刷新数据
  const handleRefresh = () => {
    setIsRefreshing(true)
    setTimeout(() => setIsRefreshing(false), 1000)
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
                {mockAnalyticsData.overview.totalViews.toLocaleString()}
              </p>
              <div className={cn(
                "flex items-center gap-1 text-xs mt-1",
                mockAnalyticsData.overview.totalViewsChange > 0
                  ? "text-green-600 dark:text-green-400"
                  : "text-red-600 dark:text-red-400"
              )}>
                {mockAnalyticsData.overview.totalViewsChange > 0 ? (
                  <ArrowUp className="w-3 h-3" />
                ) : (
                  <ArrowDown className="w-3 h-3" />
                )}
                <span>{Math.abs(mockAnalyticsData.overview.totalViewsChange)}%</span>
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
                {mockAnalyticsData.overview.uniqueVisitors.toLocaleString()}
              </p>
              <div className={cn(
                "flex items-center gap-1 text-xs mt-1",
                mockAnalyticsData.overview.uniqueVisitorsChange > 0
                  ? "text-green-600 dark:text-green-400"
                  : "text-red-600 dark:text-red-400"
              )}>
                {mockAnalyticsData.overview.uniqueVisitorsChange > 0 ? (
                  <ArrowUp className="w-3 h-3" />
                ) : (
                  <ArrowDown className="w-3 h-3" />
                )}
                <span>{Math.abs(mockAnalyticsData.overview.uniqueVisitorsChange)}%</span>
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
                {mockAnalyticsData.overview.avgReadTime}
              </p>
              <div className={cn(
                "flex items-center gap-1 text-xs mt-1",
                mockAnalyticsData.overview.avgReadTimeChange > 0
                  ? "text-green-600 dark:text-green-400"
                  : "text-red-600 dark:text-red-400"
              )}>
                {mockAnalyticsData.overview.avgReadTimeChange > 0 ? (
                  <ArrowUp className="w-3 h-3" />
                ) : (
                  <ArrowDown className="w-3 h-3" />
                )}
                <span>{Math.abs(mockAnalyticsData.overview.avgReadTimeChange)}%</span>
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
                {mockAnalyticsData.overview.bounceRate}%
              </p>
              <div className={cn(
                "flex items-center gap-1 text-xs mt-1",
                mockAnalyticsData.overview.bounceRateChange < 0
                  ? "text-green-600 dark:text-green-400"
                  : "text-red-600 dark:text-red-400"
              )}>
                {mockAnalyticsData.overview.bounceRateChange < 0 ? (
                  <ArrowDown className="w-3 h-3" />
                ) : (
                  <ArrowUp className="w-3 h-3" />
                )}
                <span>{Math.abs(mockAnalyticsData.overview.bounceRateChange)}%</span>
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
            {mockAnalyticsData.popularArticles.map((article, index) => (
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
            {mockAnalyticsData.trafficSources.map((source) => (
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
              {mockAnalyticsData.devices.map((device) => (
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