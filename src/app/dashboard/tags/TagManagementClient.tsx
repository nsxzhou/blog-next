'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Hash,
  Plus,
  Edit2,
  Trash2,
  Search,
  TrendingUp,
  BarChart,
  Check,
  X,
  Loader2
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { TagWithCount } from '@/lib/tags'
import { useRouter } from 'next/navigation'

// 预定义的标签颜色（使用十六进制）
const tagColors = [
  '#ef4444', // red-500
  '#f97316', // orange-500
  '#f59e0b', // amber-500
  '#eab308', // yellow-500
  '#84cc16', // lime-500
  '#22c55e', // green-500
  '#10b981', // emerald-500
  '#14b8a6', // teal-500
  '#06b6d4', // cyan-500
  '#0ea5e9', // sky-500
  '#3b82f6', // blue-500
  '#6366f1', // indigo-500
  '#8b5cf6', // violet-500
  '#a855f7', // purple-500
  '#d946ef', // fuchsia-500
  '#ec4899', // pink-500
  '#f43f5e'  // rose-500
]

interface Props {
  initialTags: TagWithCount[]
  stats: {
    totalTags: number
    totalPosts: number
    popularTag: string
  }
}

export default function TagManagementClient({ initialTags, stats }: Props) {
  const router = useRouter()
  const [tags, setTags] = useState<TagWithCount[]>(initialTags)
  const [searchQuery, setSearchQuery] = useState('')
  const [editingTag, setEditingTag] = useState<string | null>(null)
  const [newTagName, setNewTagName] = useState('')
  const [newTagSlug, setNewTagSlug] = useState('')
  const [newTagColor, setNewTagColor] = useState(tagColors[0])
  const [newTagDescription, setNewTagDescription] = useState('')
  const [showNewTagForm, setShowNewTagForm] = useState(false)
  const [editForm, setEditForm] = useState({ 
    name: '', 
    slug: '', 
    color: '', 
    description: '' 
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // 过滤标签
  const filteredTags = tags.filter(tag =>
    tag.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tag.slug.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // 计算标签大小（用于标签云）
  const getTagSize = (count: number) => {
    const maxCount = Math.max(...tags.map(t => t._count.posts))
    if (maxCount === 0) return '1rem'
    const minSize = 0.875 // 14px
    const maxSize = 2 // 32px
    const size = minSize + (count / maxCount) * (maxSize - minSize)
    return `${size}rem`
  }

  // 自动生成slug
  const generateSlug = (name: string) => {
    return name.toLowerCase()
      .replace(/[^\w\s\u4e00-\u9fa5-]/g, '') // 保留中文、字母、数字、空格和连字符
      .replace(/\s+/g, '-') // 空格替换为连字符
      .replace(/-+/g, '-') // 多个连字符替换为一个
      .replace(/^-|-$/g, '') // 去除首尾连字符
  }

  // 添加新标签
  const handleAddTag = async () => {
    if (!newTagName.trim()) return
    
    setIsSubmitting(true)
    setError(null)
    
    try {
      const response = await fetch('/api/tags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newTagName.trim(),
          slug: newTagSlug || generateSlug(newTagName),
          color: newTagColor,
          description: newTagDescription.trim() || undefined
        })
      })
      
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || '创建标签失败')
      }
      
      const newTag = await response.json()
      
      // 刷新页面以获取最新数据
      router.refresh()
      
      // 重置表单
      setNewTagName('')
      setNewTagSlug('')
      setNewTagDescription('')
      setShowNewTagForm(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : '创建标签失败')
    } finally {
      setIsSubmitting(false)
    }
  }

  // 编辑标签
  const handleEditTag = (tag: TagWithCount) => {
    setEditingTag(tag.id)
    setEditForm({ 
      name: tag.name, 
      slug: tag.slug,
      color: tag.color || tagColors[0], 
      description: tag.description || '' 
    })
  }

  // 保存编辑
  const handleSaveEdit = async (id: string) => {
    setIsSubmitting(true)
    setError(null)
    
    try {
      const response = await fetch(`/api/tags/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm)
      })
      
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || '更新标签失败')
      }
      
      // 刷新页面以获取最新数据
      router.refresh()
      
      setEditingTag(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : '更新标签失败')
    } finally {
      setIsSubmitting(false)
    }
  }

  // 删除标签
  const handleDeleteTag = async (id: string) => {
    if (!confirm('确定要删除这个标签吗？')) return
    
    setIsSubmitting(true)
    setError(null)
    
    try {
      const response = await fetch(`/api/tags/${id}`, {
        method: 'DELETE'
      })
      
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || '删除标签失败')
      }
      
      // 刷新页面以获取最新数据
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : '删除标签失败')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container mx-auto max-w-7xl p-6 lg:p-8 space-y-8">
      {/* 页面标题和操作按钮 */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">标签管理</h1>
          <p className="text-muted-foreground mt-1">
            共有 {stats.totalTags} 个标签
          </p>
        </div>
        <button
          onClick={() => setShowNewTagForm(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>新建标签</span>
        </button>
      </div>

      {/* 错误提示 */}
      {error && (
        <div className="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* 搜索栏 */}
      <div className="bg-card border border-border rounded-xl p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="搜索标签..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-muted/50 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
          />
        </div>
      </div>

      {/* 标签统计 */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card border border-border rounded-lg p-4"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Hash className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.totalTags}</p>
              <p className="text-sm text-muted-foreground">标签总数</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card border border-border rounded-lg p-4"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-500/10 rounded-lg">
              <BarChart className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.totalPosts}</p>
              <p className="text-sm text-muted-foreground">文章标记</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-card border border-border rounded-lg p-4"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500/10 rounded-lg">
              <TrendingUp className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.popularTag}</p>
              <p className="text-sm text-muted-foreground">热门标签</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* 标签云 */}
      {filteredTags.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-card border border-border rounded-xl p-8"
        >
          <h2 className="text-lg font-semibold mb-6">标签云</h2>
          <div className="flex flex-wrap gap-4 items-center justify-center min-h-[200px]">
            {filteredTags.map((tag, index) => (
              <motion.div
                key={tag.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: 1.1 }}
                className="relative group"
                style={{ fontSize: getTagSize(tag._count.posts) }}
              >
                <span
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-white cursor-pointer transition-all"
                  style={{ backgroundColor: tag.color || '#3b82f6' }}
                >
                  {tag.name}
                  <span className="text-xs opacity-75">({tag._count.posts})</span>
                </span>
                
                {/* 悬停时显示操作按钮 */}
                <div className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleEditTag(tag)}
                    className="p-1 bg-background rounded-full shadow-lg hover:bg-muted transition-colors"
                  >
                    <Edit2 className="w-3 h-3" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* 标签列表 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-card border border-border rounded-xl overflow-hidden"
      >
        <div className="p-6">
          <h2 className="text-lg font-semibold mb-4">所有标签</h2>
        </div>
        <div className="border-t border-border">
          {filteredTags.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              暂无标签
            </div>
          ) : (
            filteredTags
              .sort((a, b) => b._count.posts - a._count.posts)
              .map((tag, index) => (
                <motion.div
                  key={tag.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="p-4 border-b border-border/50 last:border-b-0 hover:bg-muted/30 transition-colors"
                >
                  {editingTag === tag.id ? (
                    // 编辑模式
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm text-muted-foreground">标签名称</label>
                          <input
                            type="text"
                            value={editForm.name}
                            onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                            className="w-full mt-1 px-3 py-1.5 bg-muted/50 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                          />
                        </div>
                        <div>
                          <label className="text-sm text-muted-foreground">URL别名</label>
                          <input
                            type="text"
                            value={editForm.slug}
                            onChange={(e) => setEditForm({ ...editForm, slug: e.target.value })}
                            className="w-full mt-1 px-3 py-1.5 bg-muted/50 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label className="text-sm text-muted-foreground">描述</label>
                        <input
                          type="text"
                          value={editForm.description}
                          onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                          className="w-full mt-1 px-3 py-1.5 bg-muted/50 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                          placeholder="可选的标签描述"
                        />
                      </div>
                      
                      <div>
                        <label className="text-sm text-muted-foreground">颜色</label>
                        <div className="flex gap-1 mt-1">
                          {tagColors.map((color) => (
                            <button
                              key={color}
                              onClick={() => setEditForm({ ...editForm, color })}
                              className={cn(
                                "w-6 h-6 rounded-full transition-all",
                                editForm.color === color && "ring-2 ring-offset-2 ring-primary"
                              )}
                              style={{ backgroundColor: color }}
                            />
                          ))}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleSaveEdit(tag.id)}
                          disabled={isSubmitting}
                          className="px-3 py-1.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors"
                        >
                          {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : '保存'}
                        </button>
                        <button
                          onClick={() => setEditingTag(null)}
                          className="px-3 py-1.5 hover:bg-muted rounded-lg transition-colors"
                        >
                          取消
                        </button>
                      </div>
                    </div>
                  ) : (
                    // 显示模式
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <span 
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: tag.color || '#3b82f6' }}
                        />
                        <span className="font-medium">{tag.name}</span>
                        <span className="text-sm text-muted-foreground">/{tag.slug}</span>
                        <span className="px-2 py-1 bg-muted rounded-md text-xs">
                          {tag._count.posts} 篇文章
                        </span>
                        {tag.description && (
                          <span className="text-sm text-muted-foreground">{tag.description}</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEditTag(tag)}
                          className="p-1.5 hover:bg-muted rounded transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteTag(tag.id)}
                          disabled={tag._count.posts > 0}
                          className={cn(
                            "p-1.5 hover:bg-muted rounded transition-colors",
                            tag._count.posts > 0 
                              ? "text-muted-foreground cursor-not-allowed" 
                              : "text-destructive"
                          )}
                          title={tag._count.posts > 0 ? "无法删除有文章的标签" : "删除标签"}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </motion.div>
              ))
          )}
        </div>
      </motion.div>

      {/* 新建标签弹窗 */}
      <AnimatePresence>
        {showNewTagForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowNewTagForm(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-card border border-border rounded-xl p-6 w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-semibold mb-4">新建标签</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">标签名称</label>
                  <input
                    type="text"
                    placeholder="输入标签名称..."
                    value={newTagName}
                    onChange={(e) => {
                      setNewTagName(e.target.value)
                      if (!newTagSlug) {
                        setNewTagSlug(generateSlug(e.target.value))
                      }
                    }}
                    className="w-full px-3 py-2 bg-muted/50 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                    autoFocus
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">URL别名</label>
                  <input
                    type="text"
                    placeholder="输入URL别名..."
                    value={newTagSlug}
                    onChange={(e) => setNewTagSlug(e.target.value)}
                    className="w-full px-3 py-2 bg-muted/50 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    留空将自动生成，只能包含小写字母、数字和连字符
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">描述（可选）</label>
                  <input
                    type="text"
                    placeholder="输入标签描述..."
                    value={newTagDescription}
                    onChange={(e) => setNewTagDescription(e.target.value)}
                    className="w-full px-3 py-2 bg-muted/50 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">标签颜色</label>
                  <div className="grid grid-cols-9 gap-2">
                    {tagColors.map((color) => (
                      <button
                        key={color}
                        onClick={() => setNewTagColor(color)}
                        className={cn(
                          "w-full aspect-square rounded-lg transition-all",
                          newTagColor === color && "ring-2 ring-offset-2 ring-primary"
                        )}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-4">
                  <button
                    onClick={() => setShowNewTagForm(false)}
                    className="flex-1 px-4 py-2 bg-muted hover:bg-muted/80 rounded-lg transition-colors"
                  >
                    取消
                  </button>
                  <button
                    onClick={handleAddTag}
                    disabled={isSubmitting || !newTagName.trim()}
                    className="flex-1 px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 rounded-lg transition-colors"
                  >
                    {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : '创建'}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}