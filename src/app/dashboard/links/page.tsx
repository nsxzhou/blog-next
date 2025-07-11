'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Link as LinkIcon,
  Plus,
  ExternalLink,
  Edit2,
  Trash2,
  Globe,
  Mail,
  User,
  FileText,
  CheckCircle,
  XCircle,
  RefreshCw,
  Search,
  MoreVertical,
  Calendar,
  Clock
} from 'lucide-react'
import { cn } from '@/lib/utils'

// 友链状态
type LinkStatus = 'active' | 'pending' | 'broken'

// 模拟友链数据
const mockLinks = [
  {
    id: '1',
    name: '张三的博客',
    url: 'https://zhangsan.blog',
    description: '专注于前端开发和用户体验设计',
    avatar: '/api/placeholder/100/100',
    email: 'zhangsan@example.com',
    status: 'active' as LinkStatus,
    addedAt: '2024-01-15',
    lastCheck: '2024-01-20T10:30:00'
  },
  {
    id: '2',
    name: '技术随笔',
    url: 'https://tech-notes.cn',
    description: '分享编程心得和技术见解',
    avatar: '/api/placeholder/100/100',
    email: 'admin@tech-notes.cn',
    status: 'active' as LinkStatus,
    addedAt: '2024-01-10',
    lastCheck: '2024-01-20T10:30:00'
  },
  {
    id: '3',
    name: '设计师的思考',
    url: 'https://designer-think.com',
    description: '探索设计与艺术的边界',
    avatar: '/api/placeholder/100/100',
    email: 'hello@designer-think.com',
    status: 'pending' as LinkStatus,
    addedAt: '2024-01-18',
    lastCheck: null
  },
  {
    id: '4',
    name: '代码诗人',
    url: 'https://code-poet.dev',
    description: '用代码书写诗意的生活',
    avatar: '/api/placeholder/100/100',
    email: 'poet@code-poet.dev',
    status: 'broken' as LinkStatus,
    addedAt: '2023-12-20',
    lastCheck: '2024-01-20T10:30:00'
  }
]

interface FriendLink {
  id: string
  name: string
  url: string
  description: string
  avatar: string
  email: string
  status: LinkStatus
  addedAt: string
  lastCheck: string | null
}

export default function LinksPage() {
  const [links, setLinks] = useState<FriendLink[]>(mockLinks)
  const [searchQuery, setSearchQuery] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingLink, setEditingLink] = useState<string | null>(null)
  const [checkingLinks, setCheckingLinks] = useState(false)
  const [newLink, setNewLink] = useState({
    name: '',
    url: '',
    description: '',
    email: '',
    avatar: ''
  })

  // 过滤链接
  const filteredLinks = links.filter(link =>
    link.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    link.url.toLowerCase().includes(searchQuery.toLowerCase()) ||
    link.description.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // 获取状态样式
  const getStatusStyle = (status: LinkStatus) => {
    switch (status) {
      case 'active':
        return {
          color: 'text-green-600 dark:text-green-400',
          bg: 'bg-green-500/10',
          icon: <CheckCircle className="w-4 h-4" />
        }
      case 'pending':
        return {
          color: 'text-amber-600 dark:text-amber-400',
          bg: 'bg-amber-500/10',
          icon: <Clock className="w-4 h-4" />
        }
      case 'broken':
        return {
          color: 'text-red-600 dark:text-red-400',
          bg: 'bg-red-500/10',
          icon: <XCircle className="w-4 h-4" />
        }
    }
  }

  // 添加友链
  const handleAddLink = () => {
    if (newLink.name && newLink.url) {
      const link: FriendLink = {
        id: Date.now().toString(),
        ...newLink,
        status: 'pending',
        addedAt: new Date().toISOString().split('T')[0],
        lastCheck: null
      }
      setLinks([...links, link])
      setNewLink({ name: '', url: '', description: '', email: '', avatar: '' })
      setShowAddForm(false)
    }
  }

  // 检查链接状态
  const checkLinksStatus = () => {
    setCheckingLinks(true)
    // 模拟检查过程
    setTimeout(() => {
      setLinks(links.map(link => ({
        ...link,
        lastCheck: new Date().toISOString()
      })))
      setCheckingLinks(false)
    }, 2000)
  }

  // 删除链接
  const handleDeleteLink = (id: string) => {
    setLinks(links.filter(link => link.id !== id))
  }

  // 统计数据
  const stats = {
    total: links.length,
    active: links.filter(l => l.status === 'active').length,
    pending: links.filter(l => l.status === 'pending').length,
    broken: links.filter(l => l.status === 'broken').length
  }

  return (
    <div className="container mx-auto max-w-7xl p-6 lg:p-8 space-y-8">
      {/* 页面标题 */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">友链管理</h1>
          <p className="text-muted-foreground mt-1">
            管理您的友情链接
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={checkLinksStatus}
            disabled={checkingLinks}
            className="inline-flex items-center gap-2 px-4 py-2 bg-muted hover:bg-muted/80 rounded-lg transition-colors disabled:opacity-50"
          >
            <RefreshCw className={cn("w-4 h-4", checkingLinks && "animate-spin")} />
            <span>检查状态</span>
          </button>
          <button
            onClick={() => setShowAddForm(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>添加友链</span>
          </button>
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card border border-border rounded-lg p-4"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <LinkIcon className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.total}</p>
              <p className="text-sm text-muted-foreground">总链接</p>
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
              <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.active}</p>
              <p className="text-sm text-muted-foreground">正常</p>
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
              <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.pending}</p>
              <p className="text-sm text-muted-foreground">待审核</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-card border border-border rounded-lg p-4"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-500/10 rounded-lg">
              <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.broken}</p>
              <p className="text-sm text-muted-foreground">失效</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* 搜索栏 */}
      <div className="bg-card border border-border rounded-xl p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="搜索友链..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-muted/50 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
          />
        </div>
      </div>

      {/* 友链列表 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredLinks.map((link, index) => (
          <motion.div
            key={link.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-all"
          >
            <div className="flex items-start gap-4">
              {/* 头像 */}
              <img
                src={link.avatar}
                alt={link.name}
                className="w-16 h-16 rounded-full object-cover"
              />

              {/* 信息 */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-semibold text-lg">{link.name}</h3>
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary hover:underline flex items-center gap-1"
                    >
                      {link.url}
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                  
                  {/* 状态标签 */}
                  <div className={cn(
                    "flex items-center gap-1 px-2 py-1 rounded-full text-xs",
                    getStatusStyle(link.status).bg,
                    getStatusStyle(link.status).color
                  )}>
                    {getStatusStyle(link.status).icon}
                    <span>
                      {link.status === 'active' && '正常'}
                      {link.status === 'pending' && '待审核'}
                      {link.status === 'broken' && '失效'}
                    </span>
                  </div>
                </div>

                {/* 描述 */}
                <p className="text-sm text-muted-foreground mb-3">
                  {link.description}
                </p>

                {/* 元信息 */}
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Mail className="w-3 h-3" />
                    {link.email}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {link.addedAt}
                  </span>
                </div>

                {/* 操作按钮 */}
                <div className="flex items-center gap-2 mt-4">
                  <button
                    onClick={() => setEditingLink(link.id)}
                    className="flex items-center gap-1 px-3 py-1.5 text-sm bg-muted/50 hover:bg-muted rounded-lg transition-colors"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    编辑
                  </button>
                  <button
                    onClick={() => handleDeleteLink(link.id)}
                    className="flex items-center gap-1 px-3 py-1.5 text-sm bg-muted/50 hover:bg-muted rounded-lg transition-colors text-destructive"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    删除
                  </button>
                  {link.status === 'pending' && (
                    <button className="flex items-center gap-1 px-3 py-1.5 text-sm bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg transition-colors">
                      <CheckCircle className="w-3.5 h-3.5" />
                      通过
                    </button>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* 空状态 */}
      {filteredLinks.length === 0 && (
        <div className="text-center py-16">
          <LinkIcon className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground mb-4">暂无友链</p>
          <button
            onClick={() => setShowAddForm(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>添加第一个友链</span>
          </button>
        </div>
      )}

      {/* 添加友链弹窗 */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowAddForm(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-card border border-border rounded-xl p-6 w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-semibold mb-4">添加友链</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block flex items-center gap-2">
                    <User className="w-4 h-4" />
                    站点名称
                  </label>
                  <input
                    type="text"
                    placeholder="友情链接的名称"
                    value={newLink.name}
                    onChange={(e) => setNewLink({ ...newLink, name: e.target.value })}
                    className="w-full px-3 py-2 bg-muted/50 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block flex items-center gap-2">
                    <Globe className="w-4 h-4" />
                    站点地址
                  </label>
                  <input
                    type="url"
                    placeholder="https://example.com"
                    value={newLink.url}
                    onChange={(e) => setNewLink({ ...newLink, url: e.target.value })}
                    className="w-full px-3 py-2 bg-muted/50 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    站点描述
                  </label>
                  <textarea
                    placeholder="简短介绍一下这个站点..."
                    value={newLink.description}
                    onChange={(e) => setNewLink({ ...newLink, description: e.target.value })}
                    className="w-full px-3 py-2 bg-muted/50 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none h-20"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    联系邮箱
                  </label>
                  <input
                    type="email"
                    placeholder="admin@example.com"
                    value={newLink.email}
                    onChange={(e) => setNewLink({ ...newLink, email: e.target.value })}
                    className="w-full px-3 py-2 bg-muted/50 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>

                <div className="flex items-center gap-3 pt-4">
                  <button
                    onClick={() => setShowAddForm(false)}
                    className="flex-1 px-4 py-2 bg-muted hover:bg-muted/80 rounded-lg transition-colors"
                  >
                    取消
                  </button>
                  <button
                    onClick={handleAddLink}
                    className="flex-1 px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg transition-colors"
                  >
                    添加
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