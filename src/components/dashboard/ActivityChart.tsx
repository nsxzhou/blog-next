'use client'

import React, { useMemo } from 'react'
import { motion } from 'framer-motion'
import { BarChart3, Activity } from 'lucide-react'
import { cn } from '@/lib/utils'

interface DataPoint {
  date: string
  views: number
  articles: number
}

interface ActivityChartProps {
  data: DataPoint[]
  timeRange: 'week' | 'month' | 'year'
  className?: string
}

export default function ActivityChart({ data, timeRange, className }: ActivityChartProps) {
  // 计算最大值用于缩放
  const maxValues = useMemo(() => {
    const maxViews = Math.max(...data.map(d => d.views))
    const maxArticles = Math.max(...data.map(d => d.articles))
    return { maxViews, maxArticles }
  }, [data])
  
  // 格式化日期
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    switch (timeRange) {
      case 'week':
        return date.toLocaleDateString('zh-CN', { weekday: 'short' })
      case 'month':
        return date.toLocaleDateString('zh-CN', { day: 'numeric' })
      case 'year':
        return date.toLocaleDateString('zh-CN', { month: 'short' })
      default:
        return dateString
    }
  }
  
  return (
    <div className={cn("space-y-4", className)}>
      {/* 图例 */}
      <div className="flex items-center gap-6 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-primary rounded" />
          <span className="text-muted-foreground">浏览量</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-primary/30 rounded" />
          <span className="text-muted-foreground">发布文章</span>
        </div>
      </div>
      
      {/* 图表区域 */}
      <div className="relative h-48">
        {/* Y轴刻度 */}
        <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between text-xs text-muted-foreground">
          <span>{maxValues.maxViews}</span>
          <span>{Math.floor(maxValues.maxViews / 2)}</span>
          <span>0</span>
        </div>
        
        {/* 图表主体 */}
        <div className="ml-8 h-full flex items-end justify-between gap-2">
          {data.map((point, index) => {
            const viewsHeight = (point.views / maxValues.maxViews) * 100
            const articlesHeight = point.articles > 0 ? Math.max((point.articles / maxValues.maxArticles) * 100, 10) : 0
            
            return (
              <motion.div
                key={point.date}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex-1 flex flex-col items-center gap-1"
              >
                {/* 柱状图 */}
                <div className="relative w-full flex-1 flex items-end">
                  {/* 浏览量柱 */}
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${viewsHeight}%` }}
                    transition={{ 
                      delay: index * 0.05 + 0.1,
                      type: "spring",
                      stiffness: 300,
                      damping: 20
                    }}
                    className="absolute bottom-0 left-0 right-0 bg-primary rounded-t"
                  >
                    {/* 悬停提示 */}
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 hover:opacity-100 transition-opacity pointer-events-none">
                      <div className="bg-background border border-border rounded px-2 py-1 text-xs whitespace-nowrap shadow-lg">
                        <div>{point.views} 浏览</div>
                        {point.articles > 0 && <div>{point.articles} 篇文章</div>}
                      </div>
                    </div>
                  </motion.div>
                  
                  {/* 文章数量柱 */}
                  {articlesHeight > 0 && (
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${articlesHeight}%` }}
                      transition={{ 
                        delay: index * 0.05 + 0.2,
                        type: "spring",
                        stiffness: 300,
                        damping: 20
                      }}
                      className="absolute bottom-0 left-0 right-0 bg-primary/30 rounded-t"
                    />
                  )}
                </div>
                
                {/* X轴标签 */}
                <span className="text-xs text-muted-foreground mt-2">
                  {formatDate(point.date)}
                </span>
              </motion.div>
            )
          })}
        </div>
      </div>
      
      {/* 统计信息 */}
      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border/50">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <BarChart3 className="w-4 h-4 text-primary" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">总浏览量</p>
            <p className="text-sm font-medium">
              {data.reduce((sum, d) => sum + d.views, 0).toLocaleString()}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Activity className="w-4 h-4 text-primary" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">发布文章</p>
            <p className="text-sm font-medium">
              {data.reduce((sum, d) => sum + d.articles, 0)} 篇
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}