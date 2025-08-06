"use client"

import { useSession, signOut } from "next-auth/react"
import Link from "next/link"
import { Button } from "@/components/ui/forms/Button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useSidebar } from "@/components/admin/Sidebar"
import { LogOut, Settings, User, Sun, Moon, ChevronLeft, ChevronRight, ExternalLink } from "lucide-react"
import { ToastHelper } from "@/lib/utils/toast"
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"

interface AdminHeaderProps {
  title?: string
}

export function AdminHeader({
  title,
}: AdminHeaderProps) {
  const { data: session } = useSession()
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  
  // 获取侧边栏状态
  const sidebar = useSidebar()

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!session?.user) {
    return null
  }

  const userInitials = session.user.name
    ? session.user.name.split(' ').map(n => n[0]).join('').toUpperCase()
    : session.user.username?.substring(0, 2).toUpperCase() || 'A'

  const handleSignOut = () => {
    ToastHelper.success("已退出登录")
    signOut({ callbackUrl: '/' })
  }

  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center px-6">
        {/* 侧边栏展开/收起按钮 */}
        <div className="flex items-center mr-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => sidebar?.setIsCollapsed(!sidebar?.isCollapsed)}
            className="h-8 w-8"
          >
            {sidebar?.isCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
            <span className="sr-only">
              {sidebar?.isCollapsed ? "展开侧边栏" : "收起侧边栏"}
            </span>
          </Button>
        </div>
        
        <div className="flex-1">
          <h1 className="text-xl font-semibold">{title || "管理后台"}</h1>
        </div>

        <div className="flex items-center space-x-4">

          {/* 返回首页按钮 */}
          <Link href="/">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
            >
              <ExternalLink className="h-4 w-4" />
              <span className="sr-only">返回首页</span>
            </Button>
          </Link>

          {/* 主题切换 */}
          {mounted && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            >
              {theme === "light" ? (
                <Moon className="h-4 w-4" />
              ) : (
                <Sun className="h-4 w-4" />
              )}
              <span className="sr-only">切换主题</span>
            </Button>
          )}

          {/* 用户菜单 */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="text-xs">
                    {userInitials}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <div className="flex items-center justify-start gap-2 p-2">
                <div className="flex flex-col space-y-1 leading-none">
                  {session.user.name && (
                    <p className="font-medium">{session.user.name}</p>
                  )}
                  <p className="w-[200px] truncate text-sm text-muted-foreground">
                    {session.user.username}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    管理员
                  </p>
                </div>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="flex items-center">
                <User className="mr-2 h-4 w-4" />
                <span>个人资料</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="flex items-center">
                <Settings className="mr-2 h-4 w-4" />
                <span>账户设置</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleSignOut}
                className="flex items-center"
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>退出登录</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}