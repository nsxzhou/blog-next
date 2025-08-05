"use client"

import { useSession, signOut } from "next-auth/react"
import { Button } from "@/components/ui/forms/Button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { LogOut } from "lucide-react"
import { ToastHelper } from "@/lib/utils/toast"

interface AdminHeaderProps {
  title?: string
}

export function AdminHeader({ title }: AdminHeaderProps) {
  const { data: session } = useSession()

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
    <header className="border-b">
      <div className="flex h-16 items-center px-6">
        <div className="flex-1">
          <h1 className="text-xl font-semibold">{title || "管理后台"}</h1>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="text-sm text-muted-foreground">
            欢迎, {session.user.name || session.user.username}
          </div>
          
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