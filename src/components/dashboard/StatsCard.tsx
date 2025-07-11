'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { ArrowUp, ArrowDown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StatsCardProps {
  title: string
  value: number
  icon: React.ReactNode
  trend?: number
  isLoading?: boolean
  format?: 'number' | 'percent' | 'currency'
  className?: string
}

export default function StatsCard({
  title,
  value,
  icon,
  trend,
  isLoading = false,
  format = 'number',
  className
}: StatsCardProps) {
  // 格式化数值
  const formatValue = (val: number) => {
    switch (format) {
      case 'percent':
        return `${val}%`
      case 'currency':
        return `¥${val.toLocaleString()}`
      case 'number':
      default:
        return val.toLocaleString()
    }
  }
  
  // 获取趋势颜色
  const getTrendColor = (trendValue?: number) => {
    if (!trendValue) return 'text-muted-foreground'
    return trendValue > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
  }
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={cn(
        "relative bg-card border border-border rounded-xl p-6 overflow-hidden",
        "hover:shadow-lg transition-shadow duration-300",
        className
      )}
    >
      {/* 背景装饰 */}
      <div className="absolute top-0 right-0 w-32 h-32 -mr-8 -mt-8">
        <div className="absolute inset-0 bg-primary/5 rounded-full blur-2xl" />
      </div>
      
      {/* 内容 */}
      <div className="relative">
        {/* 标题和图标 */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
          <div className="p-2 bg-muted rounded-lg">
            {icon}
          </div>
        </div>
        
        {/* 数值 */}
        {isLoading ? (
          <div className="space-y-2">
            <div className="h-8 bg-muted rounded animate-pulse" />
            <div className="h-4 w-1/2 bg-muted rounded animate-pulse" />
          </div>
        ) : (
          <>
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ 
                type: "spring",
                stiffness: 260,
                damping: 20,
                delay: 0.1
              }}
              className="text-3xl font-bold mb-2"
            >
              {formatValue(value)}
            </motion.div>
            
            {/* 趋势 */}
            {trend !== undefined && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className={cn(
                  "flex items-center gap-1 text-sm",
                  getTrendColor(trend)
                )}
              >
                {trend > 0 ? (
                  <ArrowUp className="w-4 h-4" />
                ) : (
                  <ArrowDown className="w-4 h-4" />
                )}
                <span>
                  {Math.abs(trend)}% 
                  <span className="text-muted-foreground ml-1">
                    较上月
                  </span>
                </span>
              </motion.div>
            )}
          </>
        )}
      </div>
    </motion.div>
  )
}