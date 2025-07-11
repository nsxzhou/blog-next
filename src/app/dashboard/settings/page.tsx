import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import SettingsClient from './SettingsClient'

export default async function SettingsPage() {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    redirect('/auth/signin')
  }
  
  if (session.user.role !== 'ADMIN') {
    redirect('/dashboard')
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