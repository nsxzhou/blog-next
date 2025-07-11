'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { 
  LayoutDashboard,
  FileText,
  Settings,
  LogOut,
  ChevronRight,
  User
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { signOut, useSession } from 'next-auth/react'

export default function DashboardNav() {
  const pathname = usePathname()
  const { data: session } = useSession()
  
  return (
    <nav className="sticky top-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-lg supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* 左侧 - 面包屑导航 */}
          <div className="flex items-center space-x-4">
            <Link
              href="/"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors font-medium"
            >
              ← 返回首页
            </Link>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium">仪表盘</span>
          </div>
          
          {/* 右侧 - 用户信息和操作 */}
          <div className="flex items-center gap-4">
            {/* 用户信息 */}
            {session?.user && (
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-sm font-medium">{session.user.name}</p>
                  <p className="text-xs text-muted-foreground">{session.user.email}</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  {session.user.image ? (
                    <img 
                      src={session.user.image} 
                      alt={session.user.name || ''}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <User className="w-5 h-5 text-primary" />
                  )}
                </div>
              </div>
            )}
            
            {/* 退出按钮 */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => signOut({ callbackUrl: '/' })}
              className="flex items-center gap-2 px-4 py-2 text-sm rounded-lg bg-muted/50 hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
            >
              <LogOut className="w-4 h-4" />
              <span>退出</span>
            </motion.button>
          </div>
        </div>
      </div>
    </nav>
  )
}