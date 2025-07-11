'use client'

import { useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { AlertCircle, RefreshCw, Home } from 'lucide-react'

export default function ArticlesError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('文章页面错误:', error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center max-w-md"
      >
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-6"
        >
          <AlertCircle className="w-8 h-8 text-destructive" />
        </motion.div>
        
        <h2 className="text-2xl font-bold mb-4">加载文章时出错</h2>
        <p className="text-muted-foreground mb-8">
          抱歉，我们遇到了一些问题。请稍后再试或返回首页。
        </p>
        
        <div className="flex gap-4 justify-center">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={reset}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            重试
          </motion.button>
          
          <Link href="/">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 px-4 py-2 border border-border bg-background hover:bg-accent transition-colors rounded-lg"
            >
              <Home className="w-4 h-4" />
              返回首页
            </motion.button>
          </Link>
        </div>
      </motion.div>
    </div>
  )
}