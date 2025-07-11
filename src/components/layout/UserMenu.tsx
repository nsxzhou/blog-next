'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { signOut } from 'next-auth/react'
import { User, Settings, LogOut, FileText, ChevronDown } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'

interface UserMenuProps {
  user: {
    name?: string | null
    email?: string | null
    image?: string | null
  }
}

export default function UserMenu({ user }: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSignOut = async () => {
    try {
      // 使用 NextAuth 的 signOut 函数进行登出
      // 这会自动清除会话并重定向到首页
      await signOut({
        callbackUrl: '/', // 登出后重定向到首页
        redirect: true, // 自动重定向
      })
    } catch (error) {
      console.error('登出失败:', error)
      // 如果 NextAuth 登出失败，回退到手动清除
      try {
        const response = await fetch('/api/auth/signout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        })

        if (response.ok) {
          // 手动重定向到首页
          window.location.href = '/'
        } else {
          throw new Error('API 登出失败')
        }
      } catch (apiError) {
        console.error('API 登出也失败:', apiError)
        // 最后的回退方案：直接重定向到 NextAuth 的登出页面
        window.location.href = '/api/auth/signout'
      }
    }
  }

  const menuItems = [
    {
      href: '/dashboard',
      icon: User,
      label: '仪表板',
    }
  ]

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center gap-2 p-2 rounded-lg",
          "transition-all duration-200",
          "hover:bg-accent",
          "focus:outline-none focus:ring-2 focus:ring-primary/20",
          "group"
        )}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        {user.image ? (
          <Image
            src={user.image}
            alt={user.name || '用户'}
            width={32}
            height={32}
            className="rounded-full ring-2 ring-background"
          />
        ) : (
          <div className={cn(
            "h-8 w-8 rounded-full",
            "bg-primary text-primary-foreground",
            "flex items-center justify-center",
            "font-medium text-sm",
            "ring-2 ring-background"
          )}>
            {user.name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || 'U'}
          </div>
        )}

        {/* 用户名（可选显示） */}
        <span className="hidden md:block text-sm font-medium text-foreground max-w-[100px] truncate">
          {user.name || user.email?.split('@')[0]}
        </span>

        {/* 下拉箭头 */}
        <ChevronDown className={cn(
          "h-4 w-4 text-muted-foreground",
          "transition-transform duration-200",
          isOpen && "rotate-180"
        )} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className={cn(
              "absolute right-0 mt-2 w-64",
              "bg-popover text-popover-foreground",
              "rounded-lg shadow-lg",
              "border border-border",
              "overflow-hidden",
              "z-50"
            )}
          >
            {/* 用户信息头部 */}
            <div className={cn(
              "px-4 py-3",
              "bg-muted/50",
              "border-b border-border"
            )}>
              <p className="text-sm font-medium text-foreground truncate">
                {user.name || '用户'}
              </p>
              <p className="text-xs text-muted-foreground truncate mt-0.5">
                {user.email}
              </p>
            </div>

            {/* 菜单项 */}
            <div className="py-1">
              {menuItems.map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 px-4 py-2.5",
                      "text-sm text-foreground",
                      "hover:bg-accent hover:text-accent-foreground",
                      "transition-all duration-150",
                      "focus:outline-none focus:bg-accent",
                      "group"
                    )}
                    onClick={() => setIsOpen(false)}
                  >
                    <Icon className="h-4 w-4 text-muted-foreground transition-all duration-150 group-hover:text-accent-foreground group-hover:scale-110" />
                    <span>{item.label}</span>
                  </Link>
                )
              })}
            </div>

            {/* 分隔线 */}
            <div className="h-px bg-border my-1" />

            {/* 退出登录按钮 */}
            <div className="py-1">
              <button
                onClick={handleSignOut}
                className={cn(
                  "flex items-center gap-3 w-full px-4 py-2.5",
                  "text-sm text-destructive",
                  "hover:bg-destructive/10 hover:text-destructive",
                  "transition-all duration-150",
                  "focus:outline-none focus:bg-destructive/10",
                  "group"
                )}
              >
                <LogOut className="h-4 w-4 transition-transform duration-150 group-hover:scale-110" />
                <span className="transition-all duration-150 group-hover:scale-110">退出登录</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}