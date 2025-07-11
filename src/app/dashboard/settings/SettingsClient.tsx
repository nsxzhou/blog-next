'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Globe, 
  Mail, 
  Shield, 
  Palette, 
  Database, 
  Save, 
  Loader2,
  AlertCircle,
  Check,
  Eye,
  EyeOff,
  Upload
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { SETTING_KEYS } from '@/lib/settings'

interface SettingsData {
  [key: string]: any
}

export default function SettingsClient() {
  const [settings, setSettings] = useState<SettingsData>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [savedSection, setSavedSection] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('site')
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({})

  // 获取设置
  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/settings')
      
      if (!response.ok) {
        throw new Error('获取设置失败')
      }
      
      const data = await response.json()
      setSettings(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : '获取设置失败')
    } finally {
      setLoading(false)
    }
  }

  // 更新设置值
  const updateSetting = (key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }))
  }

  // 保存设置
  const saveSettings = async (section?: string) => {
    try {
      setSaving(true)
      setError(null)
      
      // 根据section筛选要保存的设置
      let dataToSave = settings
      if (section) {
        const sectionKeys = getSectionKeys(section)
        dataToSave = Object.fromEntries(
          Object.entries(settings).filter(([key]) => sectionKeys.includes(key))
        )
      }
      
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSave)
      })
      
      if (!response.ok) {
        throw new Error('保存设置失败')
      }
      
      // 显示保存成功提示
      setSavedSection(section || 'all')
      setTimeout(() => setSavedSection(null), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : '保存设置失败')
    } finally {
      setSaving(false)
    }
  }

  // 获取分组的设置键
  const getSectionKeys = (section: string): string[] => {
    switch (section) {
      case 'site':
        return [
          SETTING_KEYS.SITE_TITLE,
          SETTING_KEYS.SITE_DESCRIPTION,
          SETTING_KEYS.SITE_KEYWORDS,
          SETTING_KEYS.SITE_URL,
          SETTING_KEYS.COPYRIGHT_TEXT,
          SETTING_KEYS.ICP_RECORD
        ]
      case 'email':
        return [
          SETTING_KEYS.SMTP_HOST,
          SETTING_KEYS.SMTP_PORT,
          SETTING_KEYS.SMTP_USER,
          SETTING_KEYS.SMTP_PASS,
          SETTING_KEYS.SMTP_FROM,
          SETTING_KEYS.SMTP_SECURE
        ]
      case 'features':
        return [
          SETTING_KEYS.ENABLE_REGISTRATION,
          SETTING_KEYS.ENABLE_LIKES,
          SETTING_KEYS.ENABLE_ANALYTICS,
          SETTING_KEYS.MAINTENANCE_MODE,
          SETTING_KEYS.MAINTENANCE_MESSAGE
        ]
      case 'storage':
        return [
          SETTING_KEYS.STORAGE_LIMIT,
          SETTING_KEYS.UPLOAD_MAX_SIZE,
          SETTING_KEYS.ALLOWED_FILE_TYPES
        ]
      case 'social':
        return [
          SETTING_KEYS.SOCIAL_GITHUB,
          SETTING_KEYS.SOCIAL_TWITTER,
          SETTING_KEYS.SOCIAL_WEIBO,
          SETTING_KEYS.SOCIAL_EMAIL
        ]
      default:
        return []
    }
  }

  const tabs = [
    { id: 'site', label: '站点信息', icon: Globe },
    { id: 'email', label: '邮件设置', icon: Mail },
    { id: 'features', label: '功能开关', icon: Shield },
    { id: 'storage', label: '存储设置', icon: Database },
    { id: 'social', label: '社交媒体', icon: Palette }
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 错误提示 */}
      {error && (
        <div className="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}

      {/* 标签切换 */}
      <div className="border-b border-border">
        <nav className="-mb-px flex space-x-8">
          {tabs.map(tab => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex items-center gap-2 py-3 px-1 border-b-2 font-medium text-sm transition-colors",
                  activeTab === tab.id
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted"
                )}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            )
          })}
        </nav>
      </div>

      {/* 设置内容 */}
      <div className="bg-card border border-border rounded-xl p-6">
        {/* 站点信息 */}
        {activeTab === 'site' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">站点信息</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">站点标题</label>
                  <input
                    type="text"
                    value={settings[SETTING_KEYS.SITE_TITLE] || ''}
                    onChange={(e) => updateSetting(SETTING_KEYS.SITE_TITLE, e.target.value)}
                    className="w-full px-3 py-2 bg-muted/50 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                    placeholder="我的博客"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">站点描述</label>
                  <textarea
                    value={settings[SETTING_KEYS.SITE_DESCRIPTION] || ''}
                    onChange={(e) => updateSetting(SETTING_KEYS.SITE_DESCRIPTION, e.target.value)}
                    className="w-full px-3 py-2 bg-muted/50 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                    rows={3}
                    placeholder="这是一个个人博客..."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">关键词</label>
                  <input
                    type="text"
                    value={settings[SETTING_KEYS.SITE_KEYWORDS] || ''}
                    onChange={(e) => updateSetting(SETTING_KEYS.SITE_KEYWORDS, e.target.value)}
                    className="w-full px-3 py-2 bg-muted/50 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                    placeholder="博客,技术,生活"
                  />
                  <p className="text-xs text-muted-foreground mt-1">多个关键词用逗号分隔</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">站点URL</label>
                  <input
                    type="url"
                    value={settings[SETTING_KEYS.SITE_URL] || ''}
                    onChange={(e) => updateSetting(SETTING_KEYS.SITE_URL, e.target.value)}
                    className="w-full px-3 py-2 bg-muted/50 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                    placeholder="https://example.com"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">版权信息</label>
                  <input
                    type="text"
                    value={settings[SETTING_KEYS.COPYRIGHT_TEXT] || ''}
                    onChange={(e) => updateSetting(SETTING_KEYS.COPYRIGHT_TEXT, e.target.value)}
                    className="w-full px-3 py-2 bg-muted/50 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                    placeholder="© 2024 我的博客"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">备案号</label>
                  <input
                    type="text"
                    value={settings[SETTING_KEYS.ICP_RECORD] || ''}
                    onChange={(e) => updateSetting(SETTING_KEYS.ICP_RECORD, e.target.value)}
                    className="w-full px-3 py-2 bg-muted/50 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                    placeholder="京ICP备12345678号"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 邮件设置 */}
        {activeTab === 'email' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">邮件设置</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">SMTP服务器</label>
                  <input
                    type="text"
                    value={settings[SETTING_KEYS.SMTP_HOST] || ''}
                    onChange={(e) => updateSetting(SETTING_KEYS.SMTP_HOST, e.target.value)}
                    className="w-full px-3 py-2 bg-muted/50 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                    placeholder="smtp.gmail.com"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">端口</label>
                    <input
                      type="number"
                      value={settings[SETTING_KEYS.SMTP_PORT] || ''}
                      onChange={(e) => updateSetting(SETTING_KEYS.SMTP_PORT, parseInt(e.target.value))}
                      className="w-full px-3 py-2 bg-muted/50 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                      placeholder="587"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">安全连接</label>
                    <select
                      value={settings[SETTING_KEYS.SMTP_SECURE] || 'false'}
                      onChange={(e) => updateSetting(SETTING_KEYS.SMTP_SECURE, e.target.value === 'true')}
                      className="w-full px-3 py-2 bg-muted/50 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                    >
                      <option value="false">STARTTLS</option>
                      <option value="true">SSL/TLS</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">用户名</label>
                  <input
                    type="text"
                    value={settings[SETTING_KEYS.SMTP_USER] || ''}
                    onChange={(e) => updateSetting(SETTING_KEYS.SMTP_USER, e.target.value)}
                    className="w-full px-3 py-2 bg-muted/50 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                    placeholder="your-email@gmail.com"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">密码</label>
                  <div className="relative">
                    <input
                      type={showPasswords.smtp ? 'text' : 'password'}
                      value={settings[SETTING_KEYS.SMTP_PASS] || ''}
                      onChange={(e) => updateSetting(SETTING_KEYS.SMTP_PASS, e.target.value)}
                      className="w-full px-3 py-2 pr-10 bg-muted/50 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords(prev => ({ ...prev, smtp: !prev.smtp }))}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPasswords.smtp ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">发件人地址</label>
                  <input
                    type="email"
                    value={settings[SETTING_KEYS.SMTP_FROM] || ''}
                    onChange={(e) => updateSetting(SETTING_KEYS.SMTP_FROM, e.target.value)}
                    className="w-full px-3 py-2 bg-muted/50 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                    placeholder="noreply@example.com"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 功能开关 */}
        {activeTab === 'features' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">功能开关</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">允许注册</p>
                    <p className="text-sm text-muted-foreground">允许新用户注册账号</p>
                  </div>
                  <button
                    onClick={() => updateSetting(SETTING_KEYS.ENABLE_REGISTRATION, !settings[SETTING_KEYS.ENABLE_REGISTRATION])}
                    className={cn(
                      "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
                      settings[SETTING_KEYS.ENABLE_REGISTRATION] ? "bg-primary" : "bg-muted"
                    )}
                  >
                    <span
                      className={cn(
                        "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                        settings[SETTING_KEYS.ENABLE_REGISTRATION] ? "translate-x-6" : "translate-x-1"
                      )}
                    />
                  </button>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">启用点赞</p>
                    <p className="text-sm text-muted-foreground">允许用户点赞文章</p>
                  </div>
                  <button
                    onClick={() => updateSetting(SETTING_KEYS.ENABLE_LIKES, !settings[SETTING_KEYS.ENABLE_LIKES])}
                    className={cn(
                      "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
                      settings[SETTING_KEYS.ENABLE_LIKES] ? "bg-primary" : "bg-muted"
                    )}
                  >
                    <span
                      className={cn(
                        "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                        settings[SETTING_KEYS.ENABLE_LIKES] ? "translate-x-6" : "translate-x-1"
                      )}
                    />
                  </button>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">启用统计</p>
                    <p className="text-sm text-muted-foreground">收集访问统计数据</p>
                  </div>
                  <button
                    onClick={() => updateSetting(SETTING_KEYS.ENABLE_ANALYTICS, !settings[SETTING_KEYS.ENABLE_ANALYTICS])}
                    className={cn(
                      "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
                      settings[SETTING_KEYS.ENABLE_ANALYTICS] ? "bg-primary" : "bg-muted"
                    )}
                  >
                    <span
                      className={cn(
                        "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                        settings[SETTING_KEYS.ENABLE_ANALYTICS] ? "translate-x-6" : "translate-x-1"
                      )}
                    />
                  </button>
                </div>
                
                <div className="pt-4 border-t">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="font-medium">维护模式</p>
                      <p className="text-sm text-muted-foreground">暂时关闭站点访问</p>
                    </div>
                    <button
                      onClick={() => updateSetting(SETTING_KEYS.MAINTENANCE_MODE, !settings[SETTING_KEYS.MAINTENANCE_MODE])}
                      className={cn(
                        "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
                        settings[SETTING_KEYS.MAINTENANCE_MODE] ? "bg-destructive" : "bg-muted"
                      )}
                    >
                      <span
                        className={cn(
                          "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                          settings[SETTING_KEYS.MAINTENANCE_MODE] ? "translate-x-6" : "translate-x-1"
                        )}
                      />
                    </button>
                  </div>
                  
                  {settings[SETTING_KEYS.MAINTENANCE_MODE] && (
                    <div>
                      <label className="block text-sm font-medium mb-2">维护提示信息</label>
                      <textarea
                        value={settings[SETTING_KEYS.MAINTENANCE_MESSAGE] || ''}
                        onChange={(e) => updateSetting(SETTING_KEYS.MAINTENANCE_MESSAGE, e.target.value)}
                        className="w-full px-3 py-2 bg-muted/50 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                        rows={3}
                        placeholder="网站正在维护中，请稍后访问..."
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 存储设置 */}
        {activeTab === 'storage' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">存储设置</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">存储限制（GB）</label>
                  <input
                    type="number"
                    value={settings[SETTING_KEYS.STORAGE_LIMIT] || 1}
                    onChange={(e) => updateSetting(SETTING_KEYS.STORAGE_LIMIT, parseInt(e.target.value))}
                    className="w-full px-3 py-2 bg-muted/50 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                    min="1"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">单文件大小限制（MB）</label>
                  <input
                    type="number"
                    value={settings[SETTING_KEYS.UPLOAD_MAX_SIZE] || 50}
                    onChange={(e) => updateSetting(SETTING_KEYS.UPLOAD_MAX_SIZE, parseInt(e.target.value))}
                    className="w-full px-3 py-2 bg-muted/50 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                    min="1"
                    max="100"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">允许的文件类型</label>
                  <textarea
                    value={settings[SETTING_KEYS.ALLOWED_FILE_TYPES] || 'image/*,video/*,audio/*,application/pdf'}
                    onChange={(e) => updateSetting(SETTING_KEYS.ALLOWED_FILE_TYPES, e.target.value)}
                    className="w-full px-3 py-2 bg-muted/50 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                    rows={3}
                    placeholder="image/*,video/*,audio/*,application/pdf"
                  />
                  <p className="text-xs text-muted-foreground mt-1">多个类型用逗号分隔</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 社交媒体 */}
        {activeTab === 'social' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">社交媒体链接</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">GitHub</label>
                  <input
                    type="url"
                    value={settings[SETTING_KEYS.SOCIAL_GITHUB] || ''}
                    onChange={(e) => updateSetting(SETTING_KEYS.SOCIAL_GITHUB, e.target.value)}
                    className="w-full px-3 py-2 bg-muted/50 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                    placeholder="https://github.com/username"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Twitter</label>
                  <input
                    type="url"
                    value={settings[SETTING_KEYS.SOCIAL_TWITTER] || ''}
                    onChange={(e) => updateSetting(SETTING_KEYS.SOCIAL_TWITTER, e.target.value)}
                    className="w-full px-3 py-2 bg-muted/50 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                    placeholder="https://twitter.com/username"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">微博</label>
                  <input
                    type="url"
                    value={settings[SETTING_KEYS.SOCIAL_WEIBO] || ''}
                    onChange={(e) => updateSetting(SETTING_KEYS.SOCIAL_WEIBO, e.target.value)}
                    className="w-full px-3 py-2 bg-muted/50 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                    placeholder="https://weibo.com/username"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">邮箱</label>
                  <input
                    type="email"
                    value={settings[SETTING_KEYS.SOCIAL_EMAIL] || ''}
                    onChange={(e) => updateSetting(SETTING_KEYS.SOCIAL_EMAIL, e.target.value)}
                    className="w-full px-3 py-2 bg-muted/50 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                    placeholder="contact@example.com"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 保存按钮 */}
        <div className="mt-6 pt-6 border-t flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            修改后请保存设置
          </p>
          <button
            onClick={() => saveSettings(activeTab)}
            disabled={saving}
            className={cn(
              "px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2",
              saving
                ? "bg-muted text-muted-foreground cursor-not-allowed"
                : "bg-primary text-primary-foreground hover:bg-primary/90"
            )}
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                保存中...
              </>
            ) : savedSection === activeTab ? (
              <>
                <Check className="w-4 h-4" />
                已保存
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                保存设置
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}