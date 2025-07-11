'use client'

import React, { useState } from 'react'
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

// 模拟草稿数据
const mockDrafts = [
  {
    id: '1',
    title: '未完成的 Rust 教程',
    excerpt: '探索 Rust 的所有权系统和内存安全特性...',
    content: '# Rust 教程\n\n这是一篇关于 Rust 的教程...',
    lastModified: '2024-01-20T10:30:00',
    wordCount: 1200,
    tags: ['Rust', '编程语言'],
    progress: 60
  },
  {
    id: '2',
    title: '微服务架构设计思考',
    excerpt: '从单体应用到微服务的演进之路...',
    content: '# 微服务架构\n\n在现代软件开发中...',
    lastModified: '2024-01-19T15:45:00',
    wordCount: 800,
    tags: ['架构', '微服务'],
    progress: 30
  },
  {
    id: '3',
    title: 'Vue 3 Composition API 实践',
    excerpt: 'Composition API 带来的新思维模式...',
    content: '# Vue 3 Composition API\n\nVue 3 引入了...',
    lastModified: '2024-01-18T09:00:00',
    wordCount: 2500,
    tags: ['Vue', '前端'],
    progress: 80
  },
  {
    id: '4',
    title: '数据库优化技巧总结',
    excerpt: '从索引优化到查询重构的实战经验...',
    content: '# 数据库优化\n\n性能优化是...',
    lastModified: '2024-01-17T14:20:00',
    wordCount: 500,
    tags: ['数据库', '性能优化'],
    progress: 20
  }
]

type SortBy = 'date' | 'title' | 'progress'

export default function DraftsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<SortBy>('date')
  const [selectedDrafts, setSelectedDrafts] = useState<string[]>([])
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null)

  // 过滤和排序草稿
  const filteredDrafts = mockDrafts
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

  return (
    <div className="container mx-auto max-w-7xl p-6 lg:p-8 space-y-8">
      {/* 页面标题 */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">草稿箱</h1>
          <p className="text-muted-foreground mt-1">
            您有 {mockDrafts.length} 篇未发布的草稿
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
                        setShowDeleteConfirm(null)
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