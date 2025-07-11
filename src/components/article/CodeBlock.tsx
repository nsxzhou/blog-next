'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, Copy, Terminal } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CodeBlockProps {
  code: string
  language?: string
  filename?: string
  showLineNumbers?: boolean
  className?: string
}

export default function CodeBlock({
  code,
  language = 'text',
  filename,
  showLineNumbers = true,
  className
}: CodeBlockProps) {
  const [isCopied, setIsCopied] = useState(false)
  
  // 复制代码到剪贴板
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code)
      setIsCopied(true)
      setTimeout(() => setIsCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy code:', err)
    }
  }
  
  // 计算行数
  const lines = code.split('\n')
  const lineCount = lines.length
  
  return (
    <div className={cn("relative group rounded-lg overflow-hidden border border-border", className)}>
      {/* 顶部栏 */}
      <div className="flex items-center justify-between px-4 py-2 bg-muted/50 border-b border-border">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-mono text-muted-foreground">
            {filename || language}
          </span>
        </div>
        
        {/* 复制按钮 */}
        <motion.button
          onClick={handleCopy}
          className="flex items-center gap-2 px-2 py-1 rounded-md text-xs text-muted-foreground hover:text-foreground hover:bg-muted transition-all duration-200"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <AnimatePresence mode="wait">
            {isCopied ? (
              <motion.div
                key="check"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="flex items-center gap-1 text-green-500"
              >
                <Check className="w-3.5 h-3.5" />
                <span>已复制</span>
              </motion.div>
            ) : (
              <motion.div
                key="copy"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="flex items-center gap-1"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>复制代码</span>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>
      </div>
      
      {/* 代码内容 */}
      <div className="relative overflow-x-auto">
        <table className="w-full">
          <tbody>
            {lines.map((line, index) => (
              <tr key={index} className="group/line hover:bg-muted/30 transition-colors">
                {showLineNumbers && (
                  <td className="sticky left-0 w-12 px-3 py-0 text-right text-muted-foreground text-sm font-mono select-none bg-background/50 backdrop-blur-sm">
                    {index + 1}
                  </td>
                )}
                <td className="px-4 py-0">
                  <pre className="text-sm font-mono">
                    <code
                      dangerouslySetInnerHTML={{
                        __html: line || '<span class="text-muted-foreground">&nbsp;</span>'
                      }}
                    />
                  </pre>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* 语言标签 */}
      <div className="absolute bottom-2 right-2 px-2 py-1 bg-background/80 backdrop-blur-sm rounded text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        {language}
      </div>
    </div>
  )
}

// 导出一个包装函数，用于在文章中使用
export function enhanceCodeBlocks(content: string): string {
  // 这个函数可以在服务端处理 MDX 或 Markdown 时使用
  // 将普通的代码块转换为使用 CodeBlock 组件
  // 具体实现取决于你使用的内容处理方式
  return content
}