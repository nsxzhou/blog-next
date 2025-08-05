"use client"

import { useSession } from "next-auth/react"
import { SidebarProvider, AppSidebar, MobileSidebar } from "@/components/admin/Sidebar"
import { AdminHeader } from "@/components/admin/AdminHeader"

function AdminLayoutContent({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-background">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex">
        <AppSidebar />
      </div>
      
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile Header */}
        <div className="md:hidden border-b">
          <div className="flex h-16 items-center px-6">
            <MobileSidebar />
            <div className="ml-4">
              <h1 className="text-lg font-semibold">管理后台</h1>
            </div>
          </div>
        </div>
        
        {/* Desktop Header */}
        <div className="hidden md:block">
          <AdminHeader />
        </div>
        
        {/* Main Content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto">
          <div className="p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { data: session, status } = useSession()

  if (status === "loading") {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-lg">加载中...</div>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-lg">请先登录</div>
      </div>
    )
  }

  if (session.user.role !== "ADMIN") {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center space-y-4">
          <div className="text-lg font-semibold">访问被拒绝</div>
          <div className="text-muted-foreground">您没有访问管理后台的权限</div>
        </div>
      </div>
    )
  }

  return (
    <SidebarProvider>
      <AdminLayoutContent>{children}</AdminLayoutContent>
    </SidebarProvider>
  )
}