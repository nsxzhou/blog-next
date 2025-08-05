"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { 
  LayoutDashboard, 
  FileText, 
  File, 
  Tags, 
  Image, 
  Settings,
  LogOut
} from "lucide-react"
import { Button } from "@/components/ui/forms/Button"
import { signOut } from "next-auth/react"

interface AdminSidebarProps {
  className?: string
}

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

export function AdminSidebar({ className }: AdminSidebarProps) {
  const pathname = usePathname()

  const handleSignOut = () => {
    signOut({ callbackUrl: '/' })
  }

  return (
    <div className={cn("pb-12 w-64", className)}>
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <div className="flex items-center mb-6">
            <h2 className="text-lg font-semibold">管理后台</h2>
          </div>
          <div className="space-y-1">
            {menuItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  )}
                >
                  <item.icon className="mr-2 h-4 w-4" />
                  {item.title}
                </Link>
              )
            })}
          </div>
        </div>
        
        <div className="px-3 py-2">
          <div className="space-y-1">
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={handleSignOut}
            >
              <LogOut className="mr-2 h-4 w-4" />
              退出登录
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}