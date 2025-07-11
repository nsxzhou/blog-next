'use client'

import React from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { 
  Eye, 
  TrendingUp, 
  TrendingDown, 
  MoreVertical,
  Edit,
  Trash2,
  ExternalLink
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface Article {
  id: string
  title: string
  views: number
  date: string
  status: 'published' | 'draft'
  trend?: number
}

interface ArticleListProps {
  articles: Article[]
  showActions?: boolean
}

export default function ArticleList({ articles, showActions = true }: ArticleListProps) {
  const [openMenuId, setOpenMenuId] = React.useState<string | null>(null)
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return 'text-green-600 dark:text-green-400 bg-green-500/10 border-green-500/20'
      case 'draft':
        return 'text-yellow-600 dark:text-yellow-400 bg-yellow-500/10 border-yellow-500/20'
      default:
        return 'text-muted-foreground bg-muted'
    }
  }
  
  const getStatusText = (status: string) => {
    switch (status) {
      case 'published':
        return '已发布'
      case 'draft':
        return '草稿'
      default:
        return status
    }
  }
  
  return (
    <div className="space-y-1">
      {articles.map((article, index) => (
        <motion.div
          key={article.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.05 }}
          className="group relative p-4 -mx-4 rounded-lg hover:bg-muted/50 transition-colors"
        >
          <div className="flex items-center justify-between">
            {/* 文章信息 */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-1">
                <Link
                  href={`/articles/${article.id}`}
                  className="text-sm font-medium hover:text-primary transition-colors truncate"
                >
                  {article.title}
                </Link>
                <span
                  className={cn(
                    "inline-flex items-center px-2 py-0.5 text-xs rounded-full border",
                    getStatusColor(article.status)
                  )}
                >
                  {getStatusText(article.status)}
                </span>
              </div>
              
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span>{article.date}</span>
                <div className="flex items-center gap-1">
                  <Eye className="w-3 h-3" />
                  <span>{article.views.toLocaleString()}</span>
                </div>
                {article.trend !== undefined && (
                  <div className={cn(
                    "flex items-center gap-1",
                    article.trend > 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
                  )}>
                    {article.trend > 0 ? (
                      <TrendingUp className="w-3 h-3" />
                    ) : (
                      <TrendingDown className="w-3 h-3" />
                    )}
                    <span>{Math.abs(article.trend)}%</span>
                  </div>
                )}
              </div>
            </div>
            
            {/* 操作按钮 */}
            {showActions && (
              <div className="relative">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setOpenMenuId(openMenuId === article.id ? null : article.id)}
                  className="p-1.5 rounded-md hover:bg-muted transition-colors opacity-0 group-hover:opacity-100"
                >
                  <MoreVertical className="w-4 h-4 text-muted-foreground" />
                </motion.button>
                
                {/* 下拉菜单 */}
                {openMenuId === article.id && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="absolute right-0 top-8 w-48 bg-background border border-border rounded-lg shadow-lg py-1 z-10"
                  >
                    <Link
                      href={`/dashboard/articles/${article.id}/edit`}
                      className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                      编辑
                    </Link>
                    <Link
                      href={`/articles/${article.id}`}
                      target="_blank"
                      className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                      查看
                    </Link>
                    <button
                      className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted transition-colors w-full text-left text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                      删除
                    </button>
                  </motion.div>
                )}
              </div>
            )}
          </div>
        </motion.div>
      ))}
    </div>
  )
}