'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

interface SettingsLayoutProps {
  children: React.ReactNode
}

const settingsNav = [
  { title: '个人资料', href: '/dashboard/settings' },
  { title: '账号安全', href: '/dashboard/settings/security' },
  { title: '通知设置', href: '/dashboard/settings/notifications' },
]

export default function SettingsLayout({ children }: SettingsLayoutProps) {
  const pathname = usePathname()
  
  return (
    <div className="flex flex-col lg:flex-row gap-8">
      {/* 侧边导航 */}
      <aside className="lg:w-64 flex-shrink-0">
        <nav className="lg:sticky lg:top-8 space-y-1">
          {settingsNav.map((item) => {
            const isActive = pathname === item.href ||
              (item.href !== '/dashboard/settings' && pathname.startsWith(item.href))
              
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "block px-4 py-2 rounded-lg text-sm transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground font-medium"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                {item.title}
              </Link>
            )
          })}
        </nav>
      </aside>
      
      {/* 主内容区域 */}
      <main className="flex-1">
        {children}
      </main>
    </div>
  )
}