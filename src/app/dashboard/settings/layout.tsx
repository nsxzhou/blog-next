import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authConfig } from '@/lib/auth'
import SettingsLayout from '@/components/dashboard/settings/SettingsLayout'

export const metadata: Metadata = {
  title: '设置 - 思维笔记',
  description: '管理您的个人资料和博客设置',
}

export default async function SettingsPageLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authConfig)
  
  // 如果未登录，重定向到登录页
  if (!session) {
    redirect('/login?callbackUrl=/dashboard/settings')
  }
  
  return <SettingsLayout>{children}</SettingsLayout>
}