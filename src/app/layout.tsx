import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Providers } from '@/components/providers'
import ConditionalLayout from '@/components/layout/ConditionalLayout'
import AnalyticsTracker from '@/components/AnalyticsTracker'
import './globals.css'
import { cn } from '@/lib/utils'
import { getSiteSettings } from '@/lib/settings'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
  display: 'swap',
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
  display: 'swap',
})

export async function generateMetadata(): Promise<Metadata> {
  const siteSettings = await getSiteSettings()
  
  const title = siteSettings.site_title || '思维笔记'
  const description = siteSettings.site_description || '用心记录，让思想自由流动'
  const keywords = siteSettings.site_keywords 
    ? siteSettings.site_keywords.split(',').map((k: string) => k.trim())
    : ['博客', '技术', '设计', '思考', '创意']
  const url = siteSettings.site_url || 'https://flowspace.blog'
  
  return {
    title: {
      default: title,
      template: `%s | ${title}`,
    },
    description,
    keywords,
    authors: [{ name: title }],
    creator: title,
    openGraph: {
      type: 'website',
      locale: 'zh_CN',
      url,
      siteName: title,
      title,
      description,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
    robots: {
      index: true,
      follow: true,
    },
    ...(siteSettings.site_favicon && {
      icons: {
        icon: siteSettings.site_favicon,
        shortcut: siteSettings.site_favicon,
        apple: siteSettings.site_favicon,
      }
    })
  }
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#020817' },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="zh-CN"
      suppressHydrationWarning
      className={cn(
        'scroll-smooth',
        'selection:bg-primary/20 selection:text-primary'
      )}
    >
      <head>
        <meta name="color-scheme" content="light dark" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  // 读取主题配置
                  var stored = localStorage.getItem('blog-theme-config');
                  var config = stored ? JSON.parse(stored) : null;
                  var theme = config ? config.theme : 'system';
                  
                  // 获取系统主题
                  var systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                  
                  // 决定实际使用的主题
                  var resolvedTheme = theme === 'system' ? systemTheme : theme;
                  
                  // 应用主题
                  if (resolvedTheme === 'dark') {
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                  }
                  
                  // 应用自定义圆角（如果有）
                  if (config && config.radius !== undefined) {
                    document.documentElement.style.setProperty('--radius', config.radius + 'rem');
                  }
                  
                  // 设置主题色
                  var themeColorMeta = document.querySelector('meta[name="theme-color"]');
                  if (themeColorMeta) {
                    themeColorMeta.content = resolvedTheme === 'dark' ? '#020817' : '#ffffff';
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body
        className={cn(
          geistSans.variable,
          geistMono.variable,
          'antialiased',
          'min-h-screen flex flex-col',
          'bg-background text-foreground',
          'transition-colors duration-300',
          // 优化字体渲染
          "font-feature-settings-['liga', 'kern']",
          // 为中文优化行高
          'leading-relaxed'
        )}
      >
        <Providers>
          {/* 背景装饰元素 */}
          <div className="fixed inset-0 -z-10 overflow-hidden">
            {/* 渐变背景 */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />

            {/* 网格背景 */}
            <div
              className="absolute inset-0 opacity-[0.02] dark:opacity-[0.01]"
              style={{
                backgroundImage: `linear-gradient(to right, currentColor 1px, transparent 1px),
                                 linear-gradient(to bottom, currentColor 1px, transparent 1px)`,
                backgroundSize: '50px 50px',
              }}
            />

            {/* 动态光晕效果 */}
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse-subtle" />
            <div
              className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse-subtle"
              style={{ animationDelay: '2s' }}
            />
          </div>

          {/* 主要布局结构 */}
          <div className="relative flex flex-col min-h-screen">
            <ConditionalLayout>{children}</ConditionalLayout>
          </div>

          {/* 分析追踪器 */}
          <AnalyticsTracker />

          {/* 全局装饰元素 */}
          <div className="pointer-events-none fixed inset-0 z-50">
            {/* 顶部渐变遮罩 */}
            <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-background via-background/50 to-transparent" />

            {/* 底部渐变遮罩 */}
            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background via-background/50 to-transparent" />
          </div>
        </Providers>
      </body>
    </html>
  )
}
