'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { 
  LayoutDashboard,
  FilePlus,
  FolderOpen,
  Hash,
  Image as ImageIcon,
  Link as LinkIcon,
  BarChart3,
  FileText,
  Settings,
  User,
  Heart
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface NavItem {
  title: string
  href: string
  icon: React.ReactNode
  adminOnly?: boolean
}

interface NavSection {
  title: string
  items: NavItem[]
  adminOnly?: boolean
}

export default function DashboardSidebar() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const isAdmin = session?.user?.role === 'ADMIN'

  // 定义所有导航项
  const allNavigation: NavSection[] = [
    {
      title: '导航',
      items: [
        {
          title: '概览',
          href: '/dashboard',
          icon: <LayoutDashboard className="w-4 h-4" />
        },
        {
          title: '我的点赞',
          href: '/dashboard/liked',
          icon: <Heart className="w-4 h-4" />
        },
        {
          title: '文章管理',
          href: '/dashboard/articles',
          icon: <FileText className="w-4 h-4" />,
          adminOnly: true
        },
        {
          title: '写文章',
          href: '/dashboard/articles/new',
          icon: <FilePlus className="w-4 h-4" />,
          adminOnly: true
        },
        {
          title: '草稿箱',
          href: '/dashboard/drafts',
          icon: <FolderOpen className="w-4 h-4" />,
          adminOnly: true
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
      ],
      adminOnly: true
    },
    {
      title: '设置',
      items: [
        {
          title: '个人设置',
          href: '/dashboard/settings',
          icon: <User className="w-4 h-4" />
        },
        {
          title: '系统设置',
          href: '/dashboard/system-settings',
          icon: <Settings className="w-4 h-4" />,
          adminOnly: true
        }
      ]
    }
  ]

  // 根据用户角色过滤导航项
  const navigation = allNavigation
    .filter(section => !section.adminOnly || isAdmin)
    .map(section => ({
      ...section,
      items: section.items.filter(item => !item.adminOnly || isAdmin)
    }))
    .filter(section => section.items.length > 0)
  
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