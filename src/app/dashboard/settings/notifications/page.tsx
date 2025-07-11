'use client'

import React, { useState } from 'react'
import { Bell, Mail, Volume2 } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function NotificationSettingsPage() {
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [pushNotifications, setPushNotifications] = useState(false)
  const [soundEnabled, setSoundEnabled] = useState(true)

  return (
    <div className="p-6 lg:p-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">通知设置</h1>
        <p className="text-muted-foreground">管理您的通知偏好</p>
      </div>
      
      <div className="space-y-6">
        {/* 邮件通知 */}
        <div className="bg-card border border-border rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Mail className="w-5 h-5 text-primary" />
            邮件通知
          </h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">新评论通知</p>
                <p className="text-sm text-muted-foreground">当有人评论您的文章时收到邮件</p>
              </div>
              <button
                onClick={() => setEmailNotifications(!emailNotifications)}
                className={cn(
                  "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
                  emailNotifications ? "bg-primary" : "bg-muted"
                )}
              >
                <span
                  className={cn(
                    "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                    emailNotifications ? "translate-x-6" : "translate-x-1"
                  )}
                />
              </button>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">每周摘要</p>
                <p className="text-sm text-muted-foreground">每周收到博客数据摘要</p>
              </div>
              <button
                className={cn(
                  "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
                  "bg-primary"
                )}
              >
                <span
                  className={cn(
                    "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                    "translate-x-6"
                  )}
                />
              </button>
            </div>
          </div>
        </div>

        {/* 推送通知 */}
        <div className="bg-card border border-border rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Bell className="w-5 h-5 text-primary" />
            推送通知
          </h2>
          
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">浏览器推送通知</p>
              <p className="text-sm text-muted-foreground">在浏览器中接收实时通知</p>
            </div>
            <button
              onClick={() => setPushNotifications(!pushNotifications)}
              className={cn(
                "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
                pushNotifications ? "bg-primary" : "bg-muted"
              )}
            >
              <span
                className={cn(
                  "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                  pushNotifications ? "translate-x-6" : "translate-x-1"
                )}
              />
            </button>
          </div>
        </div>

        {/* 声音设置 */}
        <div className="bg-card border border-border rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Volume2 className="w-5 h-5 text-primary" />
            声音设置
          </h2>
          
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">通知声音</p>
              <p className="text-sm text-muted-foreground">收到通知时播放声音</p>
            </div>
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={cn(
                "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
                soundEnabled ? "bg-primary" : "bg-muted"
              )}
            >
              <span
                className={cn(
                  "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                  soundEnabled ? "translate-x-6" : "translate-x-1"
                )}
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}