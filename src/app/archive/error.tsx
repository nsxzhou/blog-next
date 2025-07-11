'use client'

import { useEffect } from 'react'
import { motion } from 'framer-motion'
import Button from '@/components/ui/Button'
import { AlertCircle } from 'lucide-react'

export default function ArchiveError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Archive page error:', error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center space-y-6 max-w-md"
      >
        <AlertCircle className="w-12 h-12 text-destructive mx-auto" />
        <h2 className="text-2xl font-bold">加载失败</h2>
        <p className="text-muted-foreground">
          抱歉，加载归档页面时出现了问题。请稍后再试。
        </p>
        <Button onClick={reset} variant="secondary">
          重试
        </Button>
      </motion.div>
    </div>
  )
}