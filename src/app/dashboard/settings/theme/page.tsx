'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Palette, 
  Sun, 
  Moon, 
  Monitor,
  Check,
  Sparkles,
  Sliders
} from 'lucide-react'
import { useTheme } from 'next-themes'
import { cn } from '@/lib/utils'

export default function ThemeSettingsPage() {
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [primaryColor, setPrimaryColor] = useState('#6366f1')
  const [fontSize, setFontSize] = useState('16')
  const [fontFamily, setFontFamily] = useState('inter')
  
  useEffect(() => {
    setMounted(true)
  }, [])
  
  if (!mounted) {
    return null
  }
  
  const themes = [
    {
      name: 'light',
      label: '浅色',
      icon: <Sun className="w-5 h-5" />,
      description: '默认浅色主题'
    },
    {
      name: 'dark',
      label: '深色',
      icon: <Moon className="w-5 h-5" />,
      description: '深色护眼主题'
    },
    {
      name: 'system',
      label: '系统',
      icon: <Monitor className="w-5 h-5" />,
      description: '跟随系统设置'
    }
  ]
  
  const colorPresets = [
    { name: 'Indigo', value: '#6366f1' },
    { name: 'Blue', value: '#3b82f6' },
    { name: 'Purple', value: '#a855f7' },
    { name: 'Pink', value: '#ec4899' },
    { name: 'Green', value: '#10b981' },
    { name: 'Orange', value: '#f97316' },
  ]
  
  const fontOptions = [
    { value: 'inter', label: 'Inter', style: 'font-sans' },
    { value: 'system', label: 'System', style: 'font-sans' },
    { value: 'serif', label: 'Serif', style: 'font-serif' },
    { value: 'mono', label: 'Mono', style: 'font-mono' },
  ]
  
  return (
    <div className="p-6 lg:p-8 max-w-4xl">
      {/* 页面标题 */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">主题设置</h1>
        <p className="text-muted-foreground">自定义您的博客外观和风格</p>
      </div>
      
      {/* 主题选择 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card border border-border rounded-xl p-6 mb-8"
      >
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Palette className="w-5 h-5 text-primary" />
          主题模式
        </h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {themes.map((themeOption) => (
            <motion.button
              key={themeOption.name}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setTheme(themeOption.name)}
              className={cn(
                "relative p-4 rounded-lg border-2 transition-all",
                theme === themeOption.name
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50"
              )}
            >
              {theme === themeOption.name && (
                <div className="absolute top-2 right-2">
                  <Check className="w-4 h-4 text-primary" />
                </div>
              )}
              
              <div className="flex flex-col items-center gap-3">
                <div className={cn(
                  "p-3 rounded-lg",
                  theme === themeOption.name
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted"
                )}>
                  {themeOption.icon}
                </div>
                <div className="text-center">
                  <p className="font-medium">{themeOption.label}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {themeOption.description}
                  </p>
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      </motion.div>
      
      {/* 颜色设置 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-card border border-border rounded-xl p-6 mb-8"
      >
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          主题颜色
        </h2>
        
        <div className="space-y-4">
          {/* 颜色预设 */}
          <div className="flex flex-wrap gap-3">
            {colorPresets.map((color) => (
              <motion.button
                key={color.value}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setPrimaryColor(color.value)}
                className={cn(
                  "relative w-12 h-12 rounded-lg transition-all",
                  primaryColor === color.value && "ring-2 ring-offset-2 ring-offset-background"
                )}
                style={{ 
                  backgroundColor: color.value
                }}
              >
                {primaryColor === color.value && (
                  <Check className="w-4 h-4 text-white absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                )}
              </motion.button>
            ))}
          </div>
          
          {/* 自定义颜色选择器 */}
          <div className="flex items-center gap-4">
            <input
              type="color"
              value={primaryColor}
              onChange={(e) => setPrimaryColor(e.target.value)}
              className="w-12 h-12 rounded-lg border-2 border-border cursor-pointer"
            />
            <div>
              <p className="text-sm font-medium">自定义颜色</p>
              <p className="text-xs text-muted-foreground">{primaryColor}</p>
            </div>
          </div>
        </div>
      </motion.div>
      
      {/* 字体设置 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-card border border-border rounded-xl p-6 mb-8"
      >
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Sliders className="w-5 h-5 text-primary" />
          字体设置
        </h2>
        
        <div className="space-y-6">
          {/* 字体家族 */}
          <div>
            <label className="block text-sm font-medium mb-3">字体家族</label>
            <div className="grid grid-cols-2 gap-3">
              {fontOptions.map((font) => (
                <button
                  key={font.value}
                  onClick={() => setFontFamily(font.value)}
                  className={cn(
                    "p-3 rounded-lg border-2 transition-all text-left",
                    fontFamily === font.value
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50",
                    font.style
                  )}
                >
                  <p className="font-medium">{font.label}</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    The quick brown fox
                  </p>
                </button>
              ))}
            </div>
          </div>
          
          {/* 字体大小 */}
          <div>
            <label className="block text-sm font-medium mb-3">
              字体大小: {fontSize}px
            </label>
            <input
              type="range"
              min="14"
              max="20"
              value={fontSize}
              onChange={(e) => setFontSize(e.target.value)}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>14px</span>
              <span>20px</span>
            </div>
          </div>
        </div>
      </motion.div>
      
      {/* 预览区域 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-card border border-border rounded-xl p-6"
      >
        <h2 className="text-lg font-semibold mb-4">预览</h2>
        
        <div 
          className="space-y-4 p-6 rounded-lg bg-background border border-border"
          style={{ fontSize: `${fontSize}px` }}
        >
          <h3 className="text-2xl font-bold" style={{ color: primaryColor }}>
            这是一个标题示例
          </h3>
          <p className="text-muted-foreground">
            这是一段正文示例。您可以看到不同的主题设置如何影响页面的外观。
            调整上面的设置，实时预览效果。
          </p>
          <div className="flex gap-2">
            <button 
              className="px-4 py-2 rounded-lg text-white"
              style={{ backgroundColor: primaryColor }}
            >
              主要按钮
            </button>
            <button className="px-4 py-2 rounded-lg border border-border hover:bg-muted">
              次要按钮
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}