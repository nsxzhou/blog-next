'use client'

import { useSearchParams } from 'next/navigation'
import { Construction } from 'lucide-react'
import { motion } from 'framer-motion'

export default function MaintenancePage() {
  const searchParams = useSearchParams()
  const message = searchParams.get('message') || '网站正在维护中，请稍后访问'
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center max-w-md mx-auto px-6"
      >
        <motion.div
          animate={{
            rotate: [0, 10, -10, 0],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="mb-8 inline-block"
        >
          <Construction className="w-24 h-24 text-primary" />
        </motion.div>
        
        <h1 className="text-3xl font-bold mb-4">网站维护中</h1>
        
        <p className="text-muted-foreground mb-8">
          {message}
        </p>
        
        <div className="space-y-4">
          <div className="bg-muted/50 rounded-lg p-4">
            <p className="text-sm text-muted-foreground">
              我们正在进行系统升级以提供更好的服务体验
            </p>
          </div>
          
          <motion.div
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-xs text-muted-foreground"
          >
            预计很快恢复，感谢您的耐心等待
          </motion.div>
        </div>
      </motion.div>
    </div>
  )
}