'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  FileText,
  Eye,
  TrendingUp,
  Users,
  PenTool,
  Calendar,
  BarChart3,
  Activity,
  ArrowUp,
  ArrowDown,
  MoreVertical,
  Plus,
  Heart
} from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import StatsCard from '@/components/dashboard/StatsCard'
import ArticleList from '@/components/dashboard/ArticleList'
import ActivityChart from '@/components/dashboard/ActivityChart'
import QuickActions from '@/components/dashboard/QuickActions'
import { useSession } from 'next-auth/react'

export default function DashboardPage() {
  const { data: session } = useSession()
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('week')
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState<any>(null)
  const [activityData, setActivityData] = useState<any[]>([])
  const [popularPosts, setPopularPosts] = useState<any[]>([])

  // 获取统计数据
  useEffect(() => {
    if (!session?.user?.id) return
    
    const fetchStats = async () => {
      try {
        // 获取总体统计
        const statsRes = await fetch('/api/dashboard/stats?type=overview')
        if (statsRes.ok) {
          const data = await statsRes.json()
          setStats(data)
        }

        // 获取热门文章
        const popularRes = await fetch('/api/dashboard/stats?type=popular&limit=5')
        if (popularRes.ok) {
          const data = await popularRes.json()
          setPopularPosts(data)
        }
      } catch (error) {
        console.error('获取统计数据失败:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchStats()
  }, [session])

  // 获取活动数据
  useEffect(() => {
    if (!session?.user?.id) return
    
    const fetchActivityData = async () => {
      try {
        const res = await fetch(`/api/dashboard/stats?type=activity&timeRange=${timeRange}`)
        if (res.ok) {
          const data = await res.json()
          setActivityData(data)
        }
      } catch (error) {
        console.error('获取活动数据失败:', error)
      }
    }

    fetchActivityData()
  }, [session, timeRange])

  return (
    <div className="container mx-auto max-w-7xl p-6 lg:p-8 space-y-8">
      {/* 页面标题 */}
      <div>
        <h1 className="text-3xl font-bold">仪表盘</h1>
        <p className="text-muted-foreground mt-1">欢迎回来，让我们看看您的博客表现如何</p>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="文章总数"
          value={stats?.publishedPosts || 0}
          icon={<FileText className="w-5 h-5" />}
          trend={0} // 暂时没有趋势数据
          isLoading={isLoading}
        />
        <StatsCard
          title="总浏览量"
          value={stats?.totalViews || 0}
          icon={<Eye className="w-5 h-5" />}
          trend={stats?.viewsTrend || 0}
          isLoading={isLoading}
          format="number"
        />
        <StatsCard
          title="本月浏览"
          value={stats?.monthlyViews || 0}
          icon={<TrendingUp className="w-5 h-5" />}
          trend={stats?.viewsTrend || 0}
          isLoading={isLoading}
          format="number"
        />
        <StatsCard
          title="总点赞数"
          value={stats?.totalLikes || 0}
          icon={<Heart className="w-5 h-5" />}
          trend={0} // 暂时没有趋势数据
          isLoading={isLoading}
        />
      </div>

      {/* 主要内容区域 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 左侧 - 文章列表和图表 */}
        <div className="lg:col-span-2 space-y-8">
          {/* 活动图表 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-card border border-border rounded-xl p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold">活动概览</h2>
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
            <ActivityChart data={activityData} timeRange={timeRange} />
          </motion.div>

          {/* 最近文章 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="bg-card border border-border rounded-xl p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold">最近文章</h2>
              <Link
                href="/dashboard/articles"
                className="text-sm text-primary hover:underline"
              >
                查看全部
              </Link>
            </div>
            <ArticleList articles={popularPosts.map(post => ({
              id: post.id,
              title: post.title,
              views: post.views,
              date: post.publishedAt,
              status: 'published',
              trend: 0 // 暂时没有趋势数据
            }))} />
          </motion.div>
        </div>

        {/* 右侧 - 快速操作和其他信息 */}
        <div className="space-y-8">
          {/* 快速操作 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <QuickActions />
          </motion.div>

          {/* 写作统计 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="bg-card border border-border rounded-xl p-6"
          >
            <h3 className="text-lg font-semibold mb-4">写作统计</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">已发布</span>
                <span className="font-medium">{stats?.publishedPosts || 0} 篇</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">草稿数量</span>
                <span className="font-medium">{stats?.draftPosts || 0} 篇</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">独立访客</span>
                <span className="font-medium">{stats?.uniqueVisitors || 0} 人</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">总点赞数</span>
                <span className="font-medium">{stats?.totalLikes || 0} 次</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}