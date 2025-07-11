'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  User, 
  Mail, 
  Globe, 
  Github, 
  Twitter, 
  Linkedin,
  Camera,
  Save,
  Loader2
} from 'lucide-react'
import { useSession } from 'next-auth/react'
import { cn } from '@/lib/utils'

export default function ProfileSettings() {
  const { data: session } = useSession()
  const [isLoading, setIsLoading] = useState(false)
  const [isSaved, setIsSaved] = useState(false)
  
  // 表单状态
  const [formData, setFormData] = useState({
    name: session?.user?.name || '',
    email: session?.user?.email || '',
    bio: '',
    website: '',
    github: '',
    twitter: '',
    linkedin: '',
  })
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    // 模拟保存操作
    setTimeout(() => {
      setIsLoading(false)
      setIsSaved(true)
      setTimeout(() => setIsSaved(false), 3000)
    }, 1500)
  }
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-card border border-border rounded-xl p-6 lg:p-8"
    >
      <h2 className="text-2xl font-semibold mb-6">个人资料</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 头像上传 */}
        <div>
          <label className="block text-sm font-medium mb-4">头像</label>
          <div className="flex items-center gap-6">
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
                {session?.user?.image ? (
                  <img 
                    src={session.user.image} 
                    alt="头像"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-12 h-12 text-primary" />
                )}
              </div>
              <button
                type="button"
                className="absolute bottom-0 right-0 p-2 bg-primary text-primary-foreground rounded-full hover:bg-primary/90 transition-colors"
              >
                <Camera className="w-4 h-4" />
              </button>
            </div>
            <div className="text-sm text-muted-foreground">
              <p>点击头像更换图片</p>
              <p>推荐尺寸：400x400px</p>
            </div>
          </div>
        </div>
        
        {/* 基本信息 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-2">
              姓名
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
                placeholder="您的姓名"
              />
            </div>
          </div>
          
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-2">
              邮箱
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
                placeholder="your@email.com"
              />
            </div>
          </div>
        </div>
        
        {/* 个人简介 */}
        <div>
          <label htmlFor="bio" className="block text-sm font-medium mb-2">
            个人简介
          </label>
          <textarea
            id="bio"
            name="bio"
            value={formData.bio}
            onChange={handleInputChange}
            rows={4}
            className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors resize-none"
            placeholder="简单介绍一下您自己..."
          />
        </div>
        
        {/* 社交链接 */}
        <div>
          <h3 className="text-sm font-medium mb-4">社交链接</h3>
          <div className="space-y-4">
            <div>
              <label htmlFor="website" className="block text-sm text-muted-foreground mb-2">
                个人网站
              </label>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="url"
                  id="website"
                  name="website"
                  value={formData.website}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
                  placeholder="https://yourwebsite.com"
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="github" className="block text-sm text-muted-foreground mb-2">
                GitHub
              </label>
              <div className="relative">
                <Github className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  id="github"
                  name="github"
                  value={formData.github}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
                  placeholder="username"
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="twitter" className="block text-sm text-muted-foreground mb-2">
                Twitter
              </label>
              <div className="relative">
                <Twitter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  id="twitter"
                  name="twitter"
                  value={formData.twitter}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
                  placeholder="@username"
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="linkedin" className="block text-sm text-muted-foreground mb-2">
                LinkedIn
              </label>
              <div className="relative">
                <Linkedin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  id="linkedin"
                  name="linkedin"
                  value={formData.linkedin}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
                  placeholder="username"
                />
              </div>
            </div>
          </div>
        </div>
        
        {/* 保存按钮 */}
        <div className="flex items-center justify-between pt-6 border-t border-border">
          <div>
            {isSaved && (
              <motion.p
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="text-sm text-green-500"
              >
                保存成功！
              </motion.p>
            )}
          </div>
          
          <motion.button
            type="submit"
            disabled={isLoading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={cn(
              "flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium transition-colors",
              "bg-primary text-primary-foreground hover:bg-primary/90",
              "disabled:opacity-50 disabled:cursor-not-allowed"
            )}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>保存中...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>保存更改</span>
              </>
            )}
          </motion.button>
        </div>
      </form>
    </motion.div>
  )
}