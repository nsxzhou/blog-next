'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard,
  FilePlus,
  FolderOpen,
  Hash,
  Image as ImageIcon,
  Link as LinkIcon,
  BarChart3,
  FileText,
  Settings
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface NavItem {
  title: string
  href: string
  icon: React.ReactNode
}

interface NavSection {
  title: string
  items: NavItem[]
}

const navigation: NavSection[] = [
  {
    title: '导航',
    items: [
      {
        title: '概览',
        href: '/dashboard',
        icon: <LayoutDashboard className="w-4 h-4" />
      },
      {
        title: '文章管理',
        href: '/dashboard/articles',
        icon: <FileText className="w-4 h-4" />
      },
      {
        title: '写文章',
        href: '/dashboard/articles/new',
        icon: <FilePlus className="w-4 h-4" />
      },
      {
        title: '草稿箱',
        href: '/dashboard/drafts',
        icon: <FolderOpen className="w-4 h-4" />
      }
    ]
  },
  {
    title: '管理',
    items: [
      {
        title: '标签管理',
        href: '/dashboard/tags',
        icon: <Hash className="w-4 h-4" />
      },
      {
        title: '媒体库',
        href: '/dashboard/media',
        icon: <ImageIcon className="w-4 h-4" />
      },
      {
        title: '友链管理',
        href: '/dashboard/links',
        icon: <LinkIcon className="w-4 h-4" />
      },
      {
        title: '统计分析',
        href: '/dashboard/analytics',
        icon: <BarChart3 className="w-4 h-4" />
      }
    ]
  },
  {
    title: '系统',
    items: [
      {
        title: '系统设置',
        href: '/dashboard/settings',
        icon: <Settings className="w-4 h-4" />
      }
    ]
  }
]

export default function DashboardSidebar() {
  const pathname = usePathname()
  
  return (
    <aside className="hidden lg:flex flex-col w-64 bg-card/50 backdrop-blur-sm border-r border-border/40 min-h-[calc(100vh-4rem)]">
      <nav className="flex-1 p-6 space-y-6">
        {navigation.map((section) => (
          <div key={section.title}>
            <h3 className="text-sm font-medium text-muted-foreground mb-3">
              {section.title}
            </h3>
            <ul className="space-y-1">
              {section.items.map((item) => {
                // 特殊处理文章管理页面，避免与写文章页面冲突
                const isActive = pathname === item.href ||
                  (item.href === '/dashboard/articles' && pathname === '/dashboard/articles') ||
                  (item.href !== '/dashboard' && 
                   item.href !== '/dashboard/articles' && 
                   pathname.startsWith(item.href))
                  
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2 text-sm rounded-md transition-all duration-200",
                        isActive
                          ? "bg-primary text-primary-foreground shadow-sm"
                          : "text-muted-foreground hover:text-foreground hover:bg-accent"
                      )}
                    >
                      {item.icon}
                      <span>{item.title}</span>
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </nav>
    </aside>
  )
}