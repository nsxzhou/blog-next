"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSession, signOut } from "next-auth/react"
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"
import {
  LayoutDashboard,
  FileText,
  File,
  Tags,
  Image,
  Settings,
  LogOut,
  Home,
  ExternalLink,
  Sun,
  Moon,
  ChevronUp,
  User,
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/forms/Button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ToastHelper } from "@/lib/utils/toast"

// 菜单项配置
const menuItems = [
  {
    title: "仪表板",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    title: "文章管理",
    href: "/admin/posts",
    icon: FileText,
  },
  {
    title: "页面管理",
    href: "/admin/pages",
    icon: File,
  },
  {
    title: "标签管理",
    href: "/admin/tags",
    icon: Tags,
  },
  {
    title: "媒体管理",
    href: "/admin/media",
    icon: Image,
  },
  {
    title: "系统设置",
    href: "/admin/settings",
    icon: Settings,
  },
]

// Logo组件
function SidebarLogo() {
  const { state } = useSidebar()

  return (
    <div className="flex items-center gap-2">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
        <Home className="h-5 w-5" />
      </div>
      <div className={`overflow-hidden transition-all duration-300 ${state === "expanded" ? "w-auto opacity-100" : "w-0 opacity-0"}`}>
        <span className="text-lg font-semibold text-sidebar-foreground whitespace-nowrap">管理后台</span>
      </div>
    </div>
  )
}

// 导航菜单组件
function NavigationMenu() {
  const pathname = usePathname()

  return (
    <SidebarGroup>
      <SidebarGroupLabel>应用</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {menuItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton asChild isActive={isActive}>
                  <Link href={item.href}>
                    <item.icon className="h-4 w-4" />
                    <span className="truncate">{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}

// 用户菜单组件
function UserMenu() {
  const { data: session } = useSession()
  const { theme, setTheme } = useTheme()
  const { state } = useSidebar()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!session?.user) return null

  const userInitials = session.user.name
    ? session.user.name.split(" ").map((n) => n[0]).join("").toUpperCase()
    : session.user.username?.substring(0, 2).toUpperCase() || "A"

  const handleSignOut = () => {
    ToastHelper.success("已退出登录")
    signOut({ callbackUrl: "/" })
  }

  return (
    <div className="space-y-2">
      {/* 用户信息和菜单 */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="flex w-full items-center justify-start rounded-lg px-2 py-2 text-left text-sm hover:bg-sidebar-accent hover:text-sidebar-accent-foreground data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-2"
          >
            <div className="flex items-center gap-2 min-w-0">
              <Avatar className="h-8 w-8 shrink-0">
                <AvatarFallback className="text-xs">
                  {userInitials}
                </AvatarFallback>
              </Avatar>
              <div className={`flex flex-col text-left overflow-hidden transition-all duration-300 ${state === "collapsed" ? "w-0 opacity-0" : "w-auto opacity-100"}`}>
                <p className="text-sm font-medium truncate">
                  {session.user.name || session.user.username}
                </p>
                <p className="text-xs text-sidebar-foreground/70">管理员</p>
              </div>
            </div>
            <ChevronUp className={`h-4 w-4 shrink-0 transition-all duration-300 ${state === "collapsed" ? "opacity-0 w-0" : "opacity-100"}`} />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent side={state === "collapsed" ? "right" : "top"} align={state === "collapsed" ? "start" : "center"} className="w-56">
          <div className="flex items-center justify-start gap-2 p-2">
            <div className="flex flex-col space-y-1 leading-none">
              {session.user.name && (
                <p className="font-medium">{session.user.name}</p>
              )}
              <p className="w-[200px] truncate text-sm text-muted-foreground">
                {session.user.username}
              </p>
              <p className="text-xs text-muted-foreground">管理员</p>
            </div>
          </div>
          <DropdownMenuSeparator />
          {/* <DropdownMenuItem>
            <User className="mr-2 h-4 w-4" />
            <span>个人资料</span>
          </DropdownMenuItem> */}
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleSignOut}>
            <LogOut className="mr-2 h-4 w-4" />
            <span>退出登录</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* 功能按钮 */}
      <div className="flex flex-col gap-2">
        {/* 主题切换 */}
        {mounted && (
          <Button
            variant="ghost"
            size={state === "collapsed" ? "icon" : "sm"}
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            className={`${state === "collapsed" ? "h-8 w-8 justify-center" : "w-full justify-start"} transition-all duration-200`}
            title={state === "collapsed" ? "切换主题" : undefined}
          >
            {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            {state === "expanded" && <span className="ml-2">切换主题</span>}
            {state === "collapsed" && <span className="sr-only">切换主题</span>}
          </Button>
        )}

        {/* 返回首页 */}
        <Button 
          variant="ghost" 
          size={state === "collapsed" ? "icon" : "sm"} 
          asChild 
          className={`${state === "collapsed" ? "h-8 w-8 justify-center" : "w-full justify-start"} transition-all duration-200`}
        >
          <Link href="/" title={state === "collapsed" ? "返回首页" : undefined}>
            <ExternalLink className="h-4 w-4" />
            {state === "expanded" && <span className="ml-2">返回首页</span>}
            {state === "collapsed" && <span className="sr-only">返回首页</span>}
          </Link>
        </Button>
      </div>
    </div>
  )
}

// 主要的AppSidebar组件
export function AppSidebar() {
  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center gap-2">
          <SidebarLogo />
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        <NavigationMenu />
      </SidebarContent>
      
      <SidebarFooter>
        <UserMenu />
      </SidebarFooter>
    </Sidebar>
  )
}