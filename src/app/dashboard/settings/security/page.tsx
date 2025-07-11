'use client'

import React from 'react'
import { Shield, Lock, Key, Smartphone } from 'lucide-react'

export default function SecuritySettingsPage() {
  return (
    <div className="p-6 lg:p-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">账号安全</h1>
        <p className="text-muted-foreground">保护您的账号安全</p>
      </div>
      
      <div className="space-y-6">
        {/* 修改密码 */}
        <div className="bg-card border border-border rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Lock className="w-5 h-5 text-primary" />
            修改密码
          </h2>
          <p className="text-muted-foreground mb-4">定期更改密码有助于保护账号安全</p>
          <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
            修改密码
          </button>
        </div>

        {/* 两步验证 */}
        <div className="bg-card border border-border rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-primary" />
            两步验证
          </h2>
          <p className="text-muted-foreground mb-4">启用两步验证为您的账号添加额外的安全保护</p>
          <button className="px-4 py-2 bg-muted hover:bg-muted/80 rounded-lg transition-colors">
            设置两步验证
          </button>
        </div>

        {/* 登录活动 */}
        <div className="bg-card border border-border rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            登录活动
          </h2>
          <p className="text-muted-foreground">暂无登录记录</p>
        </div>
      </div>
    </div>
  )
}