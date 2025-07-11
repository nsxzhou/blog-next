'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useSession } from 'next-auth/react'
import { 
  User,
  Shield,
  Save,
  Loader2,
  AlertCircle,
  Check,
  Camera,
  Key,
  Smartphone
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface UserData {
  name: string
  email: string
  bio: string
  avatarUrl: string
  website: string
  socialLinks: {
    github?: string
    twitter?: string
  }
}

export default function PersonalSettingsClient() {
  const { data: session } = useSession()
  const [userData, setUserData] = useState<UserData>({
    name: '',
    email: '',
    bio: '',
    avatarUrl: '',
    website: '',
    socialLinks: {
      github: '',
      twitter: ''
    }
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [savedSection, setSavedSection] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('profile')
  const [previewAvatar, setPreviewAvatar] = useState<string | null>(null)
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  
  // 获取用户数据
  useEffect(() => {
    fetchUserData()
  }, [])
  
  const fetchUserData = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/users/profile')
      
      if (!response.ok) {
        throw new Error('获取用户资料失败')
      }
      
      const data = await response.json()
      setUserData({
        name: data.name || '',
        email: data.email || '',
        bio: data.bio || '',
        avatarUrl: data.avatarUrl || '',
        website: data.website || '',
        socialLinks: data.socialLinks || {
          github: '',
          twitter: ''
        }
      })
    } catch (error) {
      console.error('获取用户资料失败:', error)
      setError('获取用户资料失败')
    } finally {
      setLoading(false)
    }
  }

  // 更新用户数据
  const updateUserData = (key: keyof UserData, value: any) => {
    setUserData(prev => ({
      ...prev,
      [key]: value
    }))
  }
  
  // 更新社交链接
  const updateSocialLink = (platform: 'github' | 'twitter', value: string) => {
    setUserData(prev => ({
      ...prev,
      socialLinks: {
        ...prev.socialLinks,
        [platform]: value
      }
    }))
  }

  // 保存设置
  const saveSettings = async (section: string) => {
    try {
      setSaving(true)
      setError(null)
      
      let updateData: any = {}
      
      switch (section) {
        case 'profile':
          updateData = {
            name: userData.name,
            bio: userData.bio,
            website: userData.website,
            socialLinks: userData.socialLinks
          }
          break
      }
      
      const response = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData)
      })
      
      if (!response.ok) {
        throw new Error('保存失败')
      }
      
      // 显示保存成功提示
      setSavedSection(section)
      setTimeout(() => setSavedSection(null), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : '保存失败')
    } finally {
      setSaving(false)
    }
  }

  // 处理头像上传
  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      try {
        setSaving(true)
        setError(null)
        
        // 预览
        const reader = new FileReader()
        reader.onloadend = () => {
          setPreviewAvatar(reader.result as string)
        }
        reader.readAsDataURL(file)
        
        // 上传
        const formData = new FormData()
        formData.append('file', file)
        
        const response = await fetch('/api/users/avatar', {
          method: 'POST',
          body: formData
        })
        
        if (!response.ok) {
          throw new Error('上传头像失败')
        }
        
        const data = await response.json()
        setUserData(prev => ({ ...prev, avatarUrl: data.url }))
        setPreviewAvatar(null)
      } catch (error) {
        setError(error instanceof Error ? error.message : '上传失败')
      } finally {
        setSaving(false)
      }
    }
  }
  
  // 修改密码
  const handlePasswordChange = async () => {
    try {
      if (passwordData.newPassword !== passwordData.confirmPassword) {
        setError('两次输入的密码不一致')
        return
      }
      
      if (passwordData.newPassword.length < 6) {
        setError('新密码至少需要 6 个字符')
        return
      }
      
      setSaving(true)
      setError(null)
      
      const response = await fetch('/api/users/password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        })
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || '修改密码失败')
      }
      
      // 清空密码表单
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      })
      
      setSavedSection('password')
      setTimeout(() => setSavedSection(null), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : '修改密码失败')
    } finally {
      setSaving(false)
    }
  }

  const tabs = [
    { id: 'profile', label: '个人资料', icon: User },
    { id: 'account', label: '账号安全', icon: Shield }
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
        {/* 个人资料 */}
        {activeTab === 'profile' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">基本信息</h3>
              
              {/* 头像上传 */}
              <div className="flex items-center gap-6 mb-6">
                <div className="relative">
                  <div className="w-24 h-24 rounded-full overflow-hidden bg-muted">
                    {(previewAvatar || userData.avatarUrl) ? (
                      <img 
                        src={previewAvatar || userData.avatarUrl} 
                        alt="Avatar" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <User className="w-12 h-12 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <label className="absolute bottom-0 right-0 p-1.5 bg-primary text-primary-foreground rounded-full cursor-pointer hover:bg-primary/90 transition-colors">
                    <Camera className="w-4 h-4" />
                    <input 
                      type="file" 
                      className="hidden" 
                      accept="image/*"
                      onChange={handleAvatarChange}
                    />
                  </label>
                </div>
                <div>
                  <p className="font-medium">个人头像</p>
                  <p className="text-sm text-muted-foreground">点击相机图标上传新头像</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">用户名</label>
                  <input
                    type="text"
                    value={userData.name}
                    onChange={(e) => updateUserData('name', e.target.value)}
                    className="w-full px-3 py-2 bg-muted/50 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">邮箱</label>
                  <input
                    type="email"
                    value={userData.email}
                    disabled
                    className="w-full px-3 py-2 bg-muted/50 border border-border rounded-lg opacity-60"
                  />
                  <p className="text-xs text-muted-foreground mt-1">邮箱不可修改</p>
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2">个人网站</label>
                  <input
                    type="url"
                    value={userData.website}
                    onChange={(e) => updateUserData('website', e.target.value)}
                    placeholder="https://example.com"
                    className="w-full px-3 py-2 bg-muted/50 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
              </div>
              
              <div className="mt-4">
                <label className="block text-sm font-medium mb-2">个人简介</label>
                <textarea
                  value={userData.bio}
                  onChange={(e) => updateUserData('bio', e.target.value)}
                  rows={4}
                  placeholder="介绍一下自己..."
                  className="w-full px-3 py-2 bg-muted/50 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
            </div>

            <div className="pt-6 border-t">
              <h3 className="text-lg font-semibold mb-4">社交账号</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">GitHub</label>
                  <input
                    type="text"
                    value={userData.socialLinks.github || ''}
                    onChange={(e) => updateSocialLink('github', e.target.value)}
                    placeholder="username"
                    className="w-full px-3 py-2 bg-muted/50 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Twitter</label>
                  <input
                    type="text"
                    value={userData.socialLinks.twitter || ''}
                    onChange={(e) => updateSocialLink('twitter', e.target.value)}
                    placeholder="@username"
                    className="w-full px-3 py-2 bg-muted/50 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 账号安全 */}
        {activeTab === 'account' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">密码设置</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">当前密码</label>
                  <input
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                    className="w-full px-3 py-2 bg-muted/50 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">新密码</label>
                  <input
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    className="w-full px-3 py-2 bg-muted/50 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">确认新密码</label>
                  <input
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                    className="w-full px-3 py-2 bg-muted/50 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
                <div className="flex justify-end">
                  <button
                    onClick={handlePasswordChange}
                    disabled={saving || !passwordData.currentPassword || !passwordData.newPassword}
                    className={cn(
                      "px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2",
                      saving || !passwordData.currentPassword || !passwordData.newPassword
                        ? "bg-muted text-muted-foreground cursor-not-allowed"
                        : "bg-primary text-primary-foreground hover:bg-primary/90"
                    )}
                  >
                    {saving ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        保存中...
                      </>
                    ) : savedSection === 'password' ? (
                      <>
                        <Check className="w-4 h-4" />
                        已保存
                      </>
                    ) : (
                      '修改密码'
                    )}
                  </button>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t">
              <h3 className="text-lg font-semibold mb-4">两步验证</h3>
              <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                <div className="flex items-center gap-3">
                  <Smartphone className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">启用两步验证</p>
                    <p className="text-sm text-muted-foreground">为您的账号添加额外的安全保护</p>
                  </div>
                </div>
                <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
                  设置
                </button>
              </div>
            </div>

            <div className="pt-6 border-t">
              <h3 className="text-lg font-semibold mb-4">登录历史</h3>
              <p className="text-muted-foreground">暂无登录历史记录</p>
            </div>
          </div>
        )}

        {/* 保存按钮 */}
        {activeTab === 'profile' && (
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
        )}
      </div>
    </div>
  )
}