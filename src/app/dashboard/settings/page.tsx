import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'

export default async function SettingsPage() {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    redirect('/auth/signin')
  }
  
  // TODO: 实现个人资料设置页面
  return (
    <div className="p-6 lg:p-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">个人资料</h1>
        <p className="text-muted-foreground">管理您的个人信息和账号设置</p>
      </div>
      
      <div className="bg-card border border-border rounded-xl p-6">
        <p className="text-muted-foreground">个人资料设置功能正在开发中...</p>
      </div>
    </div>
  )
}