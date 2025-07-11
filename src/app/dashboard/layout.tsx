import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authConfig } from '@/lib/auth'
import DashboardNav from '@/components/dashboard/DashboardNav'
import DashboardSidebar from '@/components/dashboard/DashboardSidebar'

export const metadata: Metadata = {
  title: '仪表盘 - 思维笔记',
  description: '管理您的博客内容和设置',
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authConfig)
  
  // 如果未登录，重定向到登录页
  if (!session) {
    redirect('/login?callbackUrl=/dashboard')
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      {/* 仪表盘导航 */}
      <DashboardNav />
      
      {/* 主内容区域 */}
      <div className="flex">
        {/* 侧边栏 - 在大屏幕上显示 */}
        <DashboardSidebar />
        
        {/* 主内容 */}
        <main className="flex-1 overflow-y-auto">
          <div className="min-h-[calc(100vh-4rem)]">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}