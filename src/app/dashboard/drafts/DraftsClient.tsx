'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import {
  FileText,
  Clock,
  Edit,
  Trash2,
  MoreVertical,
  Search,
  Filter,
  Calendar,
  ArrowUpRight,
  FolderOpen
} from 'lucide-react'
import { cn } from '@/lib/utils'

// 草稿类型定义
interface Draft {
  id: string
  title: string
  excerpt: string
  content: string
  lastModified: string
  wordCount: number
  tags: string[]
  progress: number
}

type SortBy = 'date' | 'title' | 'progress'

export default function DraftsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<SortBy>('date')
  const [selectedDrafts, setSelectedDrafts] = useState<string[]>([])
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null)
  const [drafts, setDrafts] = useState<Draft[]>([])
  const [loading, setLoading] = useState(true)

  // 获取草稿数据
  useEffect(() => {
    fetchDrafts()
  }, [])

  const fetchDrafts = async () => {
    try {
      const response = await fetch('/api/posts?status=DRAFT&orderBy=updatedAt&order=desc')
      if (response.ok) {
        const data = await response.json()
        
        // 转换数据格式
        const formattedDrafts: Draft[] = data.posts.map((post: any) => {
          // 计算字数
          const wordCount = post.content.length
          
          // 计算完成度（基于内容长度的简单估算）
          let progress = 0
          if (wordCount < 500) progress = 20
          else if (wordCount < 1000) progress = 40
          else if (wordCount < 2000) progress = 60
          else if (wordCount < 3000) progress = 80
          else progress = 90
          
          return {
            id: post.id,
            title: post.title,
            excerpt: post.excerpt || post.content.substring(0, 100) + '...',
            content: post.content,
            lastModified: post.updatedAt,
            wordCount,
            tags: post.tags.map((tag: any) => tag.name),
            progress
          }
        })
        
        setDrafts(formattedDrafts)
      }
    } catch (error) {
      console.error('Failed to fetch drafts:', error)
    } finally {
      setLoading(false)
    }
  }

  // 删除草稿
  const deleteDraft = async (id: string) => {
    try {
      const response = await fetch(`/api/posts/${id}`, {
        method: 'DELETE'
      })
      if (response.ok) {
        setDrafts(prev => prev.filter(draft => draft.id !== id))
        setShowDeleteConfirm(null)
      }
    } catch (error) {
      console.error('Failed to delete draft:', error)
    }
  }

  // 过滤和排序草稿
  const filteredDrafts = drafts
    .filter(draft => {
      const matchesSearch = draft.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          draft.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          draft.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      return matchesSearch
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime()
        case 'title':
          return a.title.localeCompare(b.title)
        case 'progress':
          return b.progress - a.progress
        default:
          return 0
      }
    })

  const toggleDraftSelection = (id: string) => {
    setSelectedDrafts(prev =>
      prev.includes(id)
        ? prev.filter(draftId => draftId !== id)
        : [...prev, id]
    )
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    
    if (days === 0) {
      const hours = Math.floor(diff / (1000 * 60 * 60))
      if (hours === 0) {
        const minutes = Math.floor(diff / (1000 * 60))
        return `${minutes} 分钟前`
      }
      return `${hours} 小时前`
    } else if (days === 1) {
      return '昨天'
    } else if (days < 7) {
      return `${days} 天前`
    } else {
      return date.toLocaleDateString('zh-CN')
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto max-w-7xl p-6 lg:p-8 space-y-8">
        <div className="animate-pulse space-y-8">
          <div className="h-8 bg-muted rounded w-48"></div>
          <div className="bg-card border border-border rounded-xl p-4 h-16"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-card border border-border rounded-xl p-6 h-64"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto max-w-7xl p-6 lg:p-8 space-y-8">
      {/* 页面标题 */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">草稿箱</h1>
          <p className="text-muted-foreground mt-1">
            您有 {drafts.length} 篇未发布的草稿
          </p>
        </div>
        <Link
          href="/dashboard/articles/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
        >
          <Edit className="w-4 h-4" />
          <span>继续写作</span>
        </Link>
      </div>

      {/* 搜索和筛选 */}
      <div className="bg-card border border-border rounded-xl p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="搜索草稿..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-muted/50 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
            />
          </div>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortBy)}
            className="px-4 py-2 bg-muted/50 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            <option value="date">按修改时间</option>
            <option value="title">按标题</option>
            <option value="progress">按完成度</option>
          </select>

          {selectedDrafts.length > 0 && (
            <button
              onClick={() => {
                // 批量删除
                setSelectedDrafts([])
              }}
              className="px-4 py-2 bg-destructive text-destructive-foreground rounded-lg hover:bg-destructive/90 transition-colors"
            >
              删除选中 ({selectedDrafts.length})
            </button>
          )}
        </div>
      </div>

      {/* 草稿列表 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredDrafts.map((draft, index) => (
          <motion.article
            key={draft.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="group bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-all duration-300"
          >
            {/* 草稿头部 */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold line-clamp-1 group-hover:text-primary transition-colors">
                  {draft.title}
                </h3>
                <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatDate(draft.lastModified)}
                  </span>
                  <span>{draft.wordCount} 字</span>
                </div>
              </div>
              <button
                onClick={() => toggleDraftSelection(draft.id)}
                className={cn(
                  "w-5 h-5 rounded border-2 transition-colors",
                  selectedDrafts.includes(draft.id)
                    ? "bg-primary border-primary"
                    : "border-border hover:border-primary"
                )}
              />
            </div>

            {/* 草稿摘要 */}
            <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
              {draft.excerpt}
            </p>

            {/* 标签 */}
            <div className="flex flex-wrap gap-2 mb-4">
              {draft.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-1 text-xs bg-muted rounded-md"
                >
                  {tag}
                </span>
              ))}
            </div>

            {/* 进度条 */}
            <div className="mb-4">
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                <span>完成度</span>
                <span>{draft.progress}%</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${draft.progress}%` }}
                  transition={{ duration: 0.5, delay: index * 0.05 + 0.2 }}
                  className={cn(
                    "h-full rounded-full",
                    draft.progress < 30 ? "bg-red-500" :
                    draft.progress < 60 ? "bg-amber-500" :
                    draft.progress < 80 ? "bg-yellow-500" :
                    "bg-green-500"
                  )}
                />
              </div>
            </div>

            {/* 操作按钮 */}
            <div className="flex items-center justify-between">
              <Link
                href={`/dashboard/articles/${draft.id}/edit`}
                className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm"
              >
                <Edit className="w-3.5 h-3.5" />
                继续编辑
              </Link>
              
              <div className="flex items-center gap-1">
                <button
                  className="p-1.5 hover:bg-muted rounded transition-colors"
                  title="预览"
                >
                  <ArrowUpRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(draft.id)}
                  className="p-1.5 hover:bg-muted rounded transition-colors text-destructive"
                  title="删除"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* 删除确认 */}
            {showDeleteConfirm === draft.id && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute inset-0 bg-background/95 backdrop-blur-sm rounded-xl flex items-center justify-center p-6"
              >
                <div className="text-center space-y-4">
                  <p className="text-sm">确定要删除这篇草稿吗？</p>
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() => setShowDeleteConfirm(null)}
                      className="px-3 py-1.5 text-sm bg-muted hover:bg-muted/80 rounded-lg transition-colors"
                    >
                      取消
                    </button>
                    <button
                      onClick={() => {
                        // 删除草稿
                        deleteDraft(draft.id)
                      }}
                      className="px-3 py-1.5 text-sm bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-lg transition-colors"
                    >
                      确认删除
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </motion.article>
        ))}
      </div>

      {/* 空状态 */}
      {filteredDrafts.length === 0 && (
        <div className="text-center py-16">
          <FolderOpen className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground mb-4">
            {searchQuery ? '没有找到相关草稿' : '暂无草稿'}
          </p>
          <Link
            href="/dashboard/articles/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            <Edit className="w-4 h-4" />
            <span>开始写作</span>
          </Link>
        </div>
      )}
    </div>
  )
}