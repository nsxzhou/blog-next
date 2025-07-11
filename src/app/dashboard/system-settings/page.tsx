import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import SettingsClient from '../settings/SettingsClient'
import { AlertCircle } from 'lucide-react'
import Link from 'next/link'

export default async function SystemSettingsPage() {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    redirect('/auth/signin')
  }
  
  if (session.user.role !== 'ADMIN') {
    return (
      <div className="container mx-auto max-w-5xl p-6 lg:p-8">
        <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5" />
            <div>
              <h3 className="font-semibold text-amber-800 dark:text-amber-200">权限不足</h3>
              <p className="mt-1 text-sm text-amber-700 dark:text-amber-300">
                只有管理员才能访问系统设置。如需管理员权限，请联系网站管理员。
              </p>
              <Link 
                href="/dashboard" 
                className="inline-flex items-center gap-2 mt-3 text-sm text-amber-600 dark:text-amber-400 hover:underline"
              >
                ← 返回仪表盘
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }
  
  return (
    <div className="container mx-auto max-w-5xl p-6 lg:p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold">系统设置</h1>
        <p className="text-muted-foreground mt-1">
          配置站点信息、功能开关和其他系统参数
        </p>
      </div>
      
      <SettingsClient />
    </div>
  )
}