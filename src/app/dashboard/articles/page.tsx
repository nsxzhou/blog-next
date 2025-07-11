'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { 
  Search,
  Filter,
  Plus,
  LayoutGrid,
  List,
  Calendar,
  Eye,
  Edit,
  Trash2,
  MoreVertical,
  FileText,
  Clock,
  Tag,
  CheckSquare,
  Square,
  TrendingUp,
  ArrowUpDown
} from 'lucide-react'
import { cn } from '@/lib/utils'

// 模拟数据
const mockArticles = [
  {
    id: '1',
    title: '深入理解 React Server Components',
    excerpt: '探索 Next.js 15 中的 RSC 架构，了解其工作原理和最佳实践...',
    status: 'published',
    publishedAt: '2024-01-15',
    updatedAt: '2024-01-15',
    views: 1543,
    readingTime: 8,
    tags: ['React', 'Next.js', 'Web开发'],
    cover: '/api/placeholder/400/300'
  },
  {
    id: '2',
    title: '构建现代化的设计系统',
    excerpt: '从零开始构建一个可扩展、可维护的设计系统，包括颜色、排版、组件等...',
    status: 'draft',
    publishedAt: null,
    updatedAt: '2024-01-18',
    views: 0,
    readingTime: 12,
    tags: ['设计', 'UI/UX', 'CSS'],
    cover: '/api/placeholder/400/300'
  },
  {
    id: '3',
    title: 'TypeScript 5.0 新特性详解',
    excerpt: '全面解析 TypeScript 5.0 带来的新特性和改进，包括装饰器、性能优化等...',
    status: 'published',
    publishedAt: '2024-01-10',
    updatedAt: '2024-01-12',
    views: 892,
    readingTime: 6,
    tags: ['TypeScript', '编程语言'],
    cover: '/api/placeholder/400/300'
  }
]

type ViewMode = 'grid' | 'list'
type SortBy = 'date' | 'views' | 'title'
type FilterStatus = 'all' | 'published' | 'draft'

export default function ArticlesPage() {
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<SortBy>('date')
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all')
  const [selectedArticles, setSelectedArticles] = useState<string[]>([])
  const [showFilters, setShowFilters] = useState(false)

  // 过滤和排序文章
  const filteredArticles = mockArticles
    .filter(article => {
      const matchesSearch = article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          article.excerpt.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesStatus = filterStatus === 'all' || article.status === filterStatus
      return matchesSearch && matchesStatus
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        case 'views':
          return b.views - a.views
        case 'title':
          return a.title.localeCompare(b.title)
        default:
          return 0
      }
    })

  const toggleArticleSelection = (id: string) => {
    setSelectedArticles(prev =>
      prev.includes(id)
        ? prev.filter(articleId => articleId !== id)
        : [...prev, id]
    )
  }

  const selectAllArticles = () => {
    if (selectedArticles.length === filteredArticles.length) {
      setSelectedArticles([])
    } else {
      setSelectedArticles(filteredArticles.map(article => article.id))
    }
  }

  return (
    <div className="container mx-auto max-w-7xl p-6 lg:p-8 space-y-8">
      {/* 页面标题和操作 */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">文章管理</h1>
          <p className="text-muted-foreground mt-1">管理和组织您的所有文章</p>
        </div>
        <Link
          href="/dashboard/articles/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>写新文章</span>
        </Link>
      </div>

      {/* 搜索和筛选栏 */}
      <div className="bg-card border border-border rounded-xl p-4 space-y-4">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* 搜索框 */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="搜索文章标题或内容..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-muted/50 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
            />
          </div>

          {/* 筛选和视图切换 */}
          <div className="flex gap-2">
            {/* 筛选按钮 */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg transition-colors",
                showFilters
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted/50 hover:bg-muted"
              )}
            >
              <Filter className="w-4 h-4" />
              <span className="hidden sm:inline">筛选</span>
            </button>

            {/* 排序选择 */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortBy)}
              className="px-4 py-2 bg-muted/50 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              <option value="date">按日期</option>
              <option value="views">按浏览量</option>
              <option value="title">按标题</option>
            </select>

            {/* 视图切换 */}
            <div className="flex bg-muted/50 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={cn(
                  "p-1.5 rounded transition-colors",
                  viewMode === 'grid'
                    ? "bg-background shadow-sm"
                    : "hover:bg-background/50"
                )}
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={cn(
                  "p-1.5 rounded transition-colors",
                  viewMode === 'list'
                    ? "bg-background shadow-sm"
                    : "hover:bg-background/50"
                )}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* 展开的筛选选项 */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="pt-4 border-t border-border/50 space-y-4">
                {/* 状态筛选 */}
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium">状态：</span>
                  <div className="flex gap-2">
                    {(['all', 'published', 'draft'] as const).map((status) => (
                      <button
                        key={status}
                        onClick={() => setFilterStatus(status)}
                        className={cn(
                          "px-3 py-1 text-sm rounded-md transition-colors",
                          filterStatus === status
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted/50 hover:bg-muted"
                        )}
                      >
                        {status === 'all' ? '全部' : status === 'published' ? '已发布' : '草稿'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 批量操作 */}
                {selectedArticles.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-4 p-3 bg-primary/10 rounded-lg"
                  >
                    <span className="text-sm">
                      已选择 {selectedArticles.length} 篇文章
                    </span>
                    <div className="flex gap-2">
                      <button className="text-sm text-primary hover:underline">
                        批量发布
                      </button>
                      <span className="text-muted-foreground">|</span>
                      <button className="text-sm text-destructive hover:underline">
                        批量删除
                      </button>
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 文章统计 */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <FileText className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{mockArticles.length}</p>
              <p className="text-sm text-muted-foreground">总文章数</p>
            </div>
          </div>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-500/10 rounded-lg">
              <Eye className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {mockArticles.reduce((sum, article) => sum + article.views, 0).toLocaleString()}
              </p>
              <p className="text-sm text-muted-foreground">总浏览量</p>
            </div>
          </div>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500/10 rounded-lg">
              <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {mockArticles.filter(a => a.status === 'draft').length}
              </p>
              <p className="text-sm text-muted-foreground">草稿数量</p>
            </div>
          </div>
        </div>
      </div>

      {/* 文章列表 */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredArticles.map((article, index) => (
            <motion.article
              key={article.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="group bg-card border border-border rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300"
            >
              {/* 封面图 */}
              <div className="relative aspect-[16/10] overflow-hidden bg-muted">
                <img
                  src={article.cover}
                  alt={article.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                {/* 选择框 */}
                <div className="absolute top-3 left-3">
                  <button
                    onClick={() => toggleArticleSelection(article.id)}
                    className="p-1.5 bg-background/80 backdrop-blur-sm rounded-lg hover:bg-background transition-colors"
                  >
                    {selectedArticles.includes(article.id) ? (
                      <CheckSquare className="w-4 h-4 text-primary" />
                    ) : (
                      <Square className="w-4 h-4" />
                    )}
                  </button>
                </div>
                {/* 状态标签 */}
                <div className="absolute top-3 right-3">
                  <span className={cn(
                    "px-2 py-1 text-xs rounded-full",
                    article.status === 'published'
                      ? "bg-green-500/90 text-white"
                      : "bg-amber-500/90 text-white"
                  )}>
                    {article.status === 'published' ? '已发布' : '草稿'}
                  </span>
                </div>
              </div>

              {/* 内容 */}
              <div className="p-5 space-y-3">
                <h3 className="font-semibold line-clamp-2 group-hover:text-primary transition-colors">
                  {article.title}
                </h3>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {article.excerpt}
                </p>

                {/* 元信息 */}
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(article.updatedAt).toLocaleDateString('zh-CN')}
                  </span>
                  <span className="flex items-center gap-1">
                    <Eye className="w-3 h-3" />
                    {article.views.toLocaleString()}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {article.readingTime} 分钟
                  </span>
                </div>

                {/* 标签 */}
                <div className="flex flex-wrap gap-2">
                  {article.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-1 text-xs bg-muted rounded-md"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* 操作按钮 */}
                <div className="flex items-center justify-between pt-3 border-t border-border/50">
                  <div className="flex gap-2">
                    <Link
                      href={`/dashboard/articles/${article.id}/edit`}
                      className="flex items-center gap-1 px-3 py-1.5 text-sm bg-muted/50 hover:bg-muted rounded-lg transition-colors"
                    >
                      <Edit className="w-3.5 h-3.5" />
                      编辑
                    </Link>
                    <Link
                      href={`/articles/${article.id}`}
                      target="_blank"
                      className="flex items-center gap-1 px-3 py-1.5 text-sm bg-muted/50 hover:bg-muted rounded-lg transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      预览
                    </Link>
                  </div>
                  <button className="p-1.5 hover:bg-muted rounded-lg transition-colors">
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      ) : (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          {/* 表头 */}
          <div className="grid grid-cols-12 gap-4 p-4 bg-muted/30 text-sm font-medium">
            <div className="col-span-1 flex items-center">
              <button
                onClick={selectAllArticles}
                className="p-1.5 hover:bg-muted rounded transition-colors"
              >
                {selectedArticles.length === filteredArticles.length ? (
                  <CheckSquare className="w-4 h-4 text-primary" />
                ) : (
                  <Square className="w-4 h-4" />
                )}
              </button>
            </div>
            <div className="col-span-5">标题</div>
            <div className="col-span-1">状态</div>
            <div className="col-span-2">更新时间</div>
            <div className="col-span-1 text-right">浏览</div>
            <div className="col-span-2 text-right">操作</div>
          </div>

          {/* 文章行 */}
          {filteredArticles.map((article, index) => (
            <motion.div
              key={article.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: index * 0.05 }}
              className="grid grid-cols-12 gap-4 p-4 border-t border-border/50 hover:bg-muted/20 transition-colors"
            >
              <div className="col-span-1 flex items-center">
                <button
                  onClick={() => toggleArticleSelection(article.id)}
                  className="p-1.5 hover:bg-muted rounded transition-colors"
                >
                  {selectedArticles.includes(article.id) ? (
                    <CheckSquare className="w-4 h-4 text-primary" />
                  ) : (
                    <Square className="w-4 h-4" />
                  )}
                </button>
              </div>
              <div className="col-span-5">
                <h3 className="font-medium line-clamp-1">{article.title}</h3>
                <p className="text-sm text-muted-foreground line-clamp-1">
                  {article.excerpt}
                </p>
              </div>
              <div className="col-span-1">
                <span className={cn(
                  "inline-flex px-2 py-1 text-xs rounded-full",
                  article.status === 'published'
                    ? "bg-green-500/10 text-green-600 dark:text-green-400"
                    : "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                )}>
                  {article.status === 'published' ? '已发布' : '草稿'}
                </span>
              </div>
              <div className="col-span-2 text-sm text-muted-foreground">
                {new Date(article.updatedAt).toLocaleDateString('zh-CN')}
              </div>
              <div className="col-span-1 text-right text-sm">
                {article.views.toLocaleString()}
              </div>
              <div className="col-span-2 flex items-center justify-end gap-1">
                <Link
                  href={`/dashboard/articles/${article.id}/edit`}
                  className="p-1.5 hover:bg-muted rounded transition-colors"
                >
                  <Edit className="w-4 h-4" />
                </Link>
                <Link
                  href={`/articles/${article.id}`}
                  target="_blank"
                  className="p-1.5 hover:bg-muted rounded transition-colors"
                >
                  <Eye className="w-4 h-4" />
                </Link>
                <button className="p-1.5 hover:bg-muted rounded transition-colors text-destructive">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* 空状态 */}
      {filteredArticles.length === 0 && (
        <div className="text-center py-16">
          <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground mb-4">没有找到相关文章</p>
          <Link
            href="/dashboard/articles/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>写第一篇文章</span>
          </Link>
        </div>
      )}
    </div>
  )
}