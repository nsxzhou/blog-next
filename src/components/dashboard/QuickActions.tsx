'use client'

import React from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { 
  PenTool, 
  Image as ImageIcon, 
  Link as LinkIcon, 
  FileText,
  Hash,
  Settings,
  BarChart3,
  Sparkles
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface QuickAction {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  href: string
  color: string
}

const quickActions: QuickAction[] = [
  {
    id: 'write',
    title: '写文章',
    description: '创建新的博客文章',
    icon: <PenTool className="w-5 h-5" />,
    href: '/dashboard/articles/new',
    color: 'from-primary/20 to-primary/10 hover:from-primary/30 hover:to-primary/20'
  },
  {
    id: 'media',
    title: '管理媒体',
    description: '上传和管理图片',
    icon: <ImageIcon className="w-5 h-5" />,
    href: '/dashboard/media',
    color: 'from-violet-500/20 to-violet-500/10 hover:from-violet-500/30 hover:to-violet-500/20'
  },
  {
    id: 'links',
    title: '友链管理',
    description: '管理友情链接',
    icon: <LinkIcon className="w-5 h-5" />,
    href: '/dashboard/links',
    color: 'from-emerald-500/20 to-emerald-500/10 hover:from-emerald-500/30 hover:to-emerald-500/20'
  },
  {
    id: 'drafts',
    title: '草稿箱',
    description: '查看未发布的草稿',
    icon: <FileText className="w-5 h-5" />,
    href: '/dashboard/drafts',
    color: 'from-amber-500/20 to-amber-500/10 hover:from-amber-500/30 hover:to-amber-500/20'
  },
  {
    id: 'tags',
    title: '标签管理',
    description: '管理文章标签',
    icon: <Hash className="w-5 h-5" />,
    href: '/dashboard/tags',
    color: 'from-rose-500/20 to-rose-500/10 hover:from-rose-500/30 hover:to-rose-500/20'
  },
  {
    id: 'analytics',
    title: '数据分析',
    description: '查看详细统计',
    icon: <BarChart3 className="w-5 h-5" />,
    href: '/dashboard/analytics',
    color: 'from-indigo-500/20 to-indigo-500/10 hover:from-indigo-500/30 hover:to-indigo-500/20'
  }
]

export default function QuickActions() {
  return (
    <div className="bg-card border border-border rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold">快速操作</h3>
        <Sparkles className="w-5 h-5 text-primary" />
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        {quickActions.map((action, index) => (
          <motion.div
            key={action.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ 
              delay: index * 0.05,
              type: "spring",
              stiffness: 300,
              damping: 20
            }}
          >
            <Link
              href={action.href}
              className={cn(
                "group relative block p-4 rounded-lg transition-all duration-300",
                "bg-gradient-to-br overflow-hidden",
                action.color
              )}
            >
              {/* 背景装饰 */}
              <div className="absolute inset-0 bg-gradient-to-br from-transparent to-muted/50 opacity-0 group-hover:opacity-100 transition-opacity" />
              
              {/* 内容 */}
              <div className="relative">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-muted/50 backdrop-blur-sm rounded-lg group-hover:scale-110 transition-transform">
                    {action.icon}
                  </div>
                  <h4 className="font-medium text-sm">{action.title}</h4>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {action.description}
                </p>
              </div>
              
              {/* 悬停效果 */}
              <motion.div
                className="absolute inset-0 rounded-lg ring-2 ring-primary/50 opacity-0 group-hover:opacity-100"
                transition={{ duration: 0.2 }}
              />
            </Link>
          </motion.div>
        ))}
      </div>
      
      {/* 设置入口 */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="mt-4 pt-4 border-t border-border/50"
      >
        <Link
          href="/dashboard/settings"
          className="flex items-center gap-3 p-3 -mx-3 rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors group"
        >
          <div className="p-2 bg-muted rounded-lg group-hover:bg-accent transition-colors">
            <Settings className="w-5 h-5 text-muted-foreground" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium">系统设置</p>
            <p className="text-xs text-muted-foreground">管理博客配置和偏好</p>
          </div>
        </Link>
      </motion.div>
    </div>
  )
}