'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertCircle, Mail, X, Loader2 } from 'lucide-react'
import { useSession } from 'next-auth/react'
import Button from '@/components/ui/Button'

export default function EmailVerificationBanner() {
  const { data: session } = useSession()
  const [isVisible, setIsVisible] = useState(true)
  const [isSending, setIsSending] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  // 只在用户登录且邮箱未验证时显示
  if (!session?.user || session.user.emailVerified || !isVisible) {
    return null
  }

  const handleSendVerification = async () => {
    setIsSending(true)
    setMessage(null)

    try {
      const response = await fetch('/api/auth/send-verification', {
        method: 'POST',
      })

      const data = await response.json()

      if (data.success) {
        setMessage({ 
          type: 'success', 
          text: data.message || '验证邮件已发送，请检查您的邮箱' 
        })
      } else {
        setMessage({ 
          type: 'error', 
          text: data.error || '发送失败，请稍后重试' 
        })
      }
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: '发送失败，请检查网络连接' 
      })
    } finally {
      setIsSending(false)
    }
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="fixed top-16 left-0 right-0 z-40 px-4"
      >
        <div className="max-w-4xl mx-auto">
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 shadow-lg">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              </div>
              
              <div className="flex-1">
                <h3 className="text-sm font-medium text-amber-800 dark:text-amber-200">
                  请验证您的邮箱地址
                </h3>
                <p className="mt-1 text-sm text-amber-700 dark:text-amber-300">
                  为了使用所有功能，请验证您的邮箱地址 {session.user.email}
                </p>
                
                {message && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className={`mt-2 text-sm ${
                      message.type === 'success' 
                        ? 'text-green-700 dark:text-green-300' 
                        : 'text-red-700 dark:text-red-300'
                    }`}
                  >
                    {message.text}
                  </motion.p>
                )}
                
                <div className="mt-3 flex gap-3">
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={handleSendVerification}
                    disabled={isSending}
                  >
                    {isSending ? (
                      <>
                        <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                        发送中...
                      </>
                    ) : (
                      <>
                        <Mail className="w-3 h-3 mr-1" />
                        发送验证邮件
                      </>
                    )}
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setIsVisible(false)}
                  >
                    稍后提醒
                  </Button>
                </div>
              </div>
              
              <button
                onClick={() => setIsVisible(false)}
                className="flex-shrink-0 text-amber-600 dark:text-amber-400 hover:text-amber-800 dark:hover:text-amber-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}