import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import PersonalSettingsClient from './PersonalSettingsClient'

export default async function SettingsPage() {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    redirect('/auth/signin')
  }
  
  return (
    <div className="container mx-auto max-w-5xl p-6 lg:p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold">个人设置</h1>
        <p className="text-muted-foreground mt-1">
          管理您的个人资料、账号安全和偏好设置
        </p>
      </div>
      
      <PersonalSettingsClient />
    </div>
  )
}