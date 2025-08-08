"use client"

import { useSession } from "next-auth/react"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/admin/AppSidebar"
import { AdminHeader } from "@/components/admin/AdminHeader"

function AdminLayoutContent({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-screen flex">
      <SidebarProvider defaultOpen={true} className="w-full">
        <AppSidebar />
        <SidebarInset className="flex flex-col min-w-0">
          <AdminHeader />
          <main className="flex-1 overflow-y-auto">
            <div className="p-6">
              {children}
            </div>
          </main>
        </SidebarInset>
      </SidebarProvider>
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

  return <AdminLayoutContent>{children}</AdminLayoutContent>
}