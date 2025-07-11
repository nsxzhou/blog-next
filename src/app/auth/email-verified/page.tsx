'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle, Mail, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import Button from '@/components/ui/Button'

export default function EmailVerifiedPage() {
  const [countdown, setCountdown] = useState(5)

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          window.location.href = '/dashboard'
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          className="w-20 h-20 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-6"
        >
          <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
        </motion.div>

        <h1 className="text-2xl font-bold mb-4">邮箱验证成功！</h1>
        
        <p className="text-muted-foreground mb-8">
          您的邮箱地址已成功验证。现在您可以使用所有功能了。
        </p>

        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {countdown > 0 ? `${countdown} 秒后自动跳转到仪表盘...` : '正在跳转...'}
          </p>

          <Link href="/dashboard">
            <Button variant="primary" size="lg" className="w-full">
              立即进入仪表盘
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>

        <div className="mt-8 pt-8 border-t">
          <p className="text-sm text-muted-foreground">
            需要帮助？
            <Link href="/contact" className="text-primary hover:underline ml-1">
              联系我们
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}