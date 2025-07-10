'use client'

import { useEffect, useState } from 'react'
import { Sun, Moon, Monitor } from 'lucide-react'
import { useTheme } from './ThemeProvider'
import { Theme } from '@/lib/theme'

export default function ThemeToggle() {
  const [mounted, setMounted] = useState(false)
  const { config, setTheme, resolvedTheme } = useTheme()

  useEffect(() => {
    setMounted(true)
  }, [])

  // 避免服务端渲染时的不匹配
  if (!mounted) {
    return (
      <button
        className="p-2 text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors rounded-md hover:bg-accent"
        aria-label="切换主题"
      >
        <div className="h-5 w-5" />
      </button>
    )
  }

  // 循环切换主题：light -> dark -> system -> light
  const cycleTheme = () => {
    const themes: Theme[] = ['light', 'dark', 'system']
    const currentIndex = themes.indexOf(config.theme)
    const nextIndex = (currentIndex + 1) % themes.length
    setTheme(themes[nextIndex])
  }

  // 根据当前主题显示对应图标
  const getThemeIcon = () => {
    if (config.theme === 'system') {
      return <Monitor className="h-5 w-5" />
    }
    return resolvedTheme === 'light' ? (
      <Sun className="h-5 w-5" />
    ) : (
      <Moon className="h-5 w-5" />
    )
  }

  // 获取主题标签
  const getThemeLabel = () => {
    if (config.theme === 'system') {
      return `系统主题 (当前: ${resolvedTheme === 'light' ? '亮色' : '暗色'})`
    }
    return resolvedTheme === 'light' ? '亮色主题' : '暗色主题'
  }

  return (
    <button
      onClick={cycleTheme}
      className="p-2 text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-all duration-200 rounded-md hover:bg-accent group relative"
      aria-label={getThemeLabel()}
      title={getThemeLabel()}
    >
      <div className="relative">
        {getThemeIcon()}
        {/* 可选：添加主题指示器 */}
        {config.theme === 'system' && (
          <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-primary rounded-full" />
        )}
      </div>
    </button>
  )
}
