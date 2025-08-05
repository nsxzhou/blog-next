"use client"

import React from "react"
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
  LogOut,
  ChevronLeft,
  ChevronRight,
  Menu,
  Home,
  ExternalLink
} from "lucide-react"
import { Button } from "@/components/ui/forms/Button"
import { signOut } from "next-auth/react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbPage, BreadcrumbSeparator, BreadcrumbHome } from "@/components/ui/breadcrumb"

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

interface SidebarContextType {
  isCollapsed: boolean
  setIsCollapsed: React.Dispatch<React.SetStateAction<boolean>>
}

const SidebarContext = React.createContext<SidebarContextType | undefined>(undefined)

function useSidebar() {
  const context = React.useContext(SidebarContext)
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider")
  }
  return context
}

interface SidebarProviderProps {
  children: React.ReactNode
  defaultCollapsed?: boolean
}

function SidebarProvider({ children, defaultCollapsed = false }: SidebarProviderProps) {
  const [isCollapsed, setIsCollapsed] = React.useState(defaultCollapsed)

  return (
    <SidebarContext.Provider value={{ isCollapsed, setIsCollapsed }}>
      {children}
    </SidebarContext.Provider>
  )
}

interface SidebarContentProps {
  children: React.ReactNode
  className?: string
}

function SidebarContent({ children, className }: SidebarContentProps) {
  const { isCollapsed } = useSidebar()

  return (
    <div className={cn(
      "flex h-full flex-col bg-background border-r transition-all duration-300",
      isCollapsed ? "w-16" : "w-64",
      className
    )}>
      {children}
    </div>
  )
}

interface SidebarHeaderProps {
  children: React.ReactNode
  className?: string
}

function SidebarHeader({ children, className }: SidebarHeaderProps) {
  return (
    <div className={cn("flex h-16 items-center border-b px-4", className)}>
      {children}
    </div>
  )
}

interface SidebarMainProps {
  children: React.ReactNode
  className?: string
}

function SidebarMain({ children, className }: SidebarMainProps) {
  return (
    <div className={cn("flex-1 overflow-y-auto py-4", className)}>
      {children}
    </div>
  )
}

interface SidebarFooterProps {
  children: React.ReactNode
  className?: string
}

function SidebarFooter({ children, className }: SidebarFooterProps) {
  return (
    <div className={cn("border-t p-4", className)}>
      {children}
    </div>
  )
}

interface SidebarMenuProps {
  children: React.ReactNode
  className?: string
}

function SidebarMenu({ children, className }: SidebarMenuProps) {
  return (
    <nav className={cn("space-y-1 px-3", className)}>
      {children}
    </nav>
  )
}

interface SidebarMenuItemProps {
  children: React.ReactNode
  className?: string
}

function SidebarMenuItem({ children, className }: SidebarMenuItemProps) {
  return (
    <div className={cn("", className)}>
      {children}
    </div>
  )
}

interface SidebarMenuButtonProps {
  children: React.ReactNode
  href?: string
  isActive?: boolean
  className?: string
  onClick?: () => void
}

function SidebarMenuButton({ 
  children, 
  href, 
  isActive = false, 
  className, 
  onClick 
}: SidebarMenuButtonProps) {
  const { isCollapsed } = useSidebar()

  const content = (
    <button
      onClick={onClick}
      className={cn(
        "flex w-full items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors",
        isActive
          ? "bg-primary text-primary-foreground"
          : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
        isCollapsed && "justify-center px-2",
        className
      )}
    >
      {children}
    </button>
  )

  if (href) {
    return (
      <Link href={href} className="block">
        {content}
      </Link>
    )
  }

  return content
}

interface SidebarMenuActionProps {
  children: React.ReactNode
  className?: string
  onClick?: () => void
}

function SidebarMenuAction({ children, className, onClick }: SidebarMenuActionProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted-foreground hover:bg-accent hover:text-accent-foreground",
        className
      )}
    >
      {children}
    </button>
  )
}

interface SidebarMenuBadgeProps {
  children: React.ReactNode
  className?: string
}

function SidebarMenuBadge({ children, className }: SidebarMenuBadgeProps) {
  return (
    <span className={cn(
      "ml-auto rounded-md bg-primary px-2 py-1 text-xs font-medium text-primary-foreground",
      className
    )}>
      {children}
    </span>
  )
}

interface SidebarMenuSubProps {
  children: React.ReactNode
  className?: string
}

function SidebarMenuSub({ children, className }: SidebarMenuSubProps) {
  return (
    <div className={cn("ml-4 mt-1 space-y-1", className)}>
      {children}
    </div>
  )
}

interface SidebarMenuSubItemProps {
  children: React.ReactNode
  className?: string
}

function SidebarMenuSubItem({ children, className }: SidebarMenuSubItemProps) {
  return (
    <div className={cn("", className)}>
      {children}
    </div>
  )
}

interface SidebarMenuSubButtonProps {
  children: React.ReactNode
  href?: string
  isActive?: boolean
  className?: string
}

function SidebarMenuSubButton({ 
  children, 
  href, 
  isActive = false, 
  className 
}: SidebarMenuSubButtonProps) {
  const content = (
    <button
      className={cn(
        "flex w-full items-center rounded-md px-3 py-1.5 text-sm transition-colors",
        isActive
          ? "bg-accent text-accent-foreground"
          : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
        className
      )}
    >
      {children}
    </button>
  )

  if (href) {
    return (
      <Link href={href} className="block">
        {content}
      </Link>
    )
  }

  return content
}

interface SidebarTriggerProps {
  className?: string
}

function SidebarTrigger({ className }: SidebarTriggerProps) {
  const { isCollapsed, setIsCollapsed } = useSidebar()

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setIsCollapsed(!isCollapsed)}
      className={cn("h-8 w-8", className)}
    >
      {isCollapsed ? (
        <ChevronRight className="h-4 w-4" />
      ) : (
        <ChevronLeft className="h-4 w-4" />
      )}
      <span className="sr-only">
        {isCollapsed ? "展开侧边栏" : "收起侧边栏"}
      </span>
    </Button>
  )
}

interface SidebarRailProps {
  className?: string
}

function SidebarRail({ className }: SidebarRailProps) {
  const { setIsCollapsed } = useSidebar()

  return (
    <button
      onClick={() => setIsCollapsed(true)}
      className={cn(
        "absolute inset-y-0 right-0 hidden w-1 cursor-col-resize bg-border transition-colors hover:bg-primary/20 md:block",
        className
      )}
    >
      <span className="sr-only">收起侧边栏</span>
    </button>
  )
}

interface SidebarInsetProps {
  children: React.ReactNode
  className?: string
}

function SidebarInset({ children, className }: SidebarInsetProps) {
  return (
    <main className={cn("flex-1 overflow-hidden", className)}>
      {children}
    </main>
  )
}

interface SidebarInputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

function SidebarInput({ className, ...props }: SidebarInputProps) {
  return (
    <input
      className={cn(
        "flex h-8 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
}

interface SidebarSeparatorProps {
  className?: string
}

function SidebarSeparator({ className }: SidebarSeparatorProps) {
  return (
    <div className={cn("my-2 h-px bg-border", className)} />
  )
}

interface SidebarHeaderActionProps {
  children: React.ReactNode
  className?: string
}

function SidebarHeaderAction({ children, className }: SidebarHeaderActionProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      {children}
    </div>
  )
}

function SidebarLogo({ isCollapsed }: { isCollapsed: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
        <Home className="h-5 w-5" />
      </div>
      {!isCollapsed && (
        <span className="text-lg font-semibold">管理后台</span>
      )}
    </div>
  )
}

function SidebarNavigation() {
  const pathname = usePathname()
  const { isCollapsed } = useSidebar()

  return (
    <SidebarMenu>
      {menuItems.map((item) => {
        const isActive = pathname === item.href
        return (
          <SidebarMenuItem key={item.href}>
            <SidebarMenuButton href={item.href} isActive={isActive}>
              <item.icon className="h-4 w-4" />
              {!isCollapsed && <span>{item.title}</span>}
            </SidebarMenuButton>
          </SidebarMenuItem>
        )
      })}
    </SidebarMenu>
  )
}

function SidebarFooterActions() {
  const { isCollapsed } = useSidebar()

  const handleSignOut = () => {
    signOut({ callbackUrl: '/' })
  }

  return (
    <div className="space-y-2">
      {/* 返回首页按钮 */}
      {!isCollapsed && (
        <Link href="/">
          <Button
            variant="ghost"
            className="w-full justify-start"
          >
            <ExternalLink className="mr-2 h-4 w-4" />
            返回首页
          </Button>
        </Link>
      )}
      {isCollapsed && (
        <Link href="/">
          <Button
            variant="ghost"
            size="icon"
            className="w-full justify-center"
          >
            <ExternalLink className="h-4 w-4" />
            <span className="sr-only">返回首页</span>
          </Button>
        </Link>
      )}
      
      {/* 退出登录按钮 */}
      {!isCollapsed && (
        <Button
          variant="ghost"
          className="w-full justify-start"
          onClick={handleSignOut}
        >
          <LogOut className="mr-2 h-4 w-4" />
          退出登录
        </Button>
      )}
      {isCollapsed && (
        <Button
          variant="ghost"
          size="icon"
          className="w-full justify-center"
          onClick={handleSignOut}
        >
          <LogOut className="h-4 w-4" />
          <span className="sr-only">退出登录</span>
        </Button>
      )}
    </div>
  )
}

interface AppSidebarProps {
  className?: string
}

export function AppSidebar({ className }: AppSidebarProps) {
  const { isCollapsed } = useSidebar()

  return (
    <SidebarContent className={className}>
      <SidebarHeader>
        <SidebarHeaderAction>
          <SidebarLogo isCollapsed={isCollapsed} />
          <SidebarTrigger />
        </SidebarHeaderAction>
      </SidebarHeader>
      <SidebarMain>
        <SidebarNavigation />
      </SidebarMain>
      <SidebarFooter>
        <SidebarFooterActions />
      </SidebarFooter>
      <SidebarRail />
    </SidebarContent>
  )
}

export function MobileSidebar() {
  const pathname = usePathname()

  const handleSignOut = () => {
    signOut({ callbackUrl: '/' })
  }

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">打开菜单</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-64 p-0">
        <div className="flex h-full flex-col">
          <div className="flex h-16 items-center border-b px-6">
            <SidebarLogo isCollapsed={false} />
          </div>
          <nav className="flex-1 space-y-1 p-4">
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
                  <item.icon className="mr-3 h-4 w-4" />
                  {item.title}
                </Link>
              )
            })}
          </nav>
          <div className="border-t p-4 space-y-2">
            <Link href="/">
              <Button
                variant="ghost"
                className="w-full justify-start"
              >
                <ExternalLink className="mr-2 h-4 w-4" />
                返回首页
              </Button>
            </Link>
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
      </SheetContent>
    </Sheet>
  )
}

interface AdminBreadcrumbProps {
  items: Array<{
    label: string
    href?: string
  }>
  }

export function AdminBreadcrumb({ items }: AdminBreadcrumbProps) {
  return (
    <Breadcrumb>
      <BreadcrumbItem>
        <BreadcrumbHome href="/admin" />
      </BreadcrumbItem>
      <BreadcrumbSeparator />
      {items.map((item, index) => (
        <React.Fragment key={index}>
          <BreadcrumbItem>
            {item.href ? (
              <BreadcrumbLink href={item.href}>{item.label}</BreadcrumbLink>
            ) : (
              <BreadcrumbPage>{item.label}</BreadcrumbPage>
            )}
          </BreadcrumbItem>
          {index < items.length - 1 && <BreadcrumbSeparator />}
        </React.Fragment>
      ))}
    </Breadcrumb>
  )
}

export {
  SidebarProvider,
  SidebarContent,
  SidebarHeader,
  SidebarMain,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuAction,
  SidebarMenuBadge,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  SidebarTrigger,
  SidebarRail,
  SidebarInset,
  SidebarInput,
  SidebarSeparator,
  SidebarHeaderAction,
  useSidebar,
  SidebarContext,
}