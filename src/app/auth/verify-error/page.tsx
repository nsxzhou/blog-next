'use client'

import { useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { XCircle, RefreshCw, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import Button from '@/components/ui/Button'

export default function VerifyErrorPage() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error') || '验证链接无效或已过期'

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
          className="w-20 h-20 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-6"
        >
          <XCircle className="w-10 h-10 text-red-600 dark:text-red-400" />
        </motion.div>

        <h1 className="text-2xl font-bold mb-4">验证失败</h1>
        
        <p className="text-muted-foreground mb-8">
          {error}
        </p>

        <div className="space-y-4">
          <Link href="/dashboard">
            <Button variant="primary" size="lg" className="w-full">
              <RefreshCw className="w-4 h-4 mr-2" />
              重新发送验证邮件
            </Button>
          </Link>

          <Link href="/">
            <Button variant="ghost" size="lg" className="w-full">
              <ArrowLeft className="w-4 h-4 mr-2" />
              返回首页
            </Button>
          </Link>
        </div>

        <div className="mt-8 pt-8 border-t">
          <p className="text-sm text-muted-foreground">
            遇到问题？
            <Link href="/contact" className="text-primary hover:underline ml-1">
              联系支持
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}