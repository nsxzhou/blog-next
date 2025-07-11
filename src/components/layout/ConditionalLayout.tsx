'use client'

import { usePathname } from 'next/navigation'
import Header from './Header'
import Footer from './Footer'
import EmailVerificationBanner from '@/components/EmailVerificationBanner'

export default function ConditionalLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const isDashboard = pathname?.startsWith('/dashboard')

  return (
    <>
      {/* 只在非仪表盘页面显示Header */}
      {!isDashboard && <Header />}

      {/* 邮箱验证提醒 */}
      {/* <EmailVerificationBanner /> */}

      {/* 主内容区域 */}
      <main className="flex-1 relative">
        {/* 内容包装器 - 提供呼吸感 */}
        <div className="animate-fade-in">{children}</div>
      </main>

      {/* 只在非仪表盘页面显示Footer */}
      {!isDashboard && <Footer />}
    </>
  )
}