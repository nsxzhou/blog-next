'use client'

import React, { useEffect, useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { Hash } from 'lucide-react'

interface TocItem {
  id: string
  text: string
  level: number
}

interface TableOfContentsProps {
  content: string
  className?: string
}

export default function TableOfContents({ content, className }: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string>('')
  const [isCollapsed, setIsCollapsed] = useState(false)
  
  // 从内容中提取标题
  const headings = useMemo(() => {
    const temp = document.createElement('div')
    temp.innerHTML = content
    
    const headingElements = temp.querySelectorAll('h1, h2, h3')
    const items: TocItem[] = []
    
    headingElements.forEach((heading, index) => {
      const text = heading.textContent || ''
      const level = parseInt(heading.tagName.substring(1))
      const id = `heading-${index}`
      
      items.push({ id, text, level })
    })
    
    return items
  }, [content])
  
  // 监听滚动，高亮当前章节
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id)
          }
        })
      },
      {
        rootMargin: '-20% 0% -70% 0%',
        threshold: 0
      }
    )
    
    // 给文章中的标题添加 ID
    const articleHeadings = document.querySelectorAll('article h1, article h2, article h3')
    articleHeadings.forEach((heading, index) => {
      const id = `heading-${index}`
      heading.id = id
      observer.observe(heading)
    })
    
    return () => {
      articleHeadings.forEach((heading) => {
        observer.unobserve(heading)
      })
    }
  }, [content])
  
  // 点击目录项滚动到对应位置
  const handleClick = (id: string) => {
    const element = document.getElementById(id)
    if (element) {
      const offset = 80 // 导航栏高度
      const elementPosition = element.getBoundingClientRect().top
      const offsetPosition = elementPosition + window.pageYOffset - offset
      
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      })
    }
  }
  
  if (headings.length === 0) {
    return null
  }
  
  return (
    <motion.nav
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6, delay: 0.4 }}
      className={cn("relative", className)}
    >
      {/* 标题 */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold flex items-center gap-2">
          <Hash className="w-4 h-4" />
          目录
        </h3>
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="lg:hidden p-1 rounded hover:bg-muted transition-colors"
        >
          <motion.svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            animate={{ rotate: isCollapsed ? 180 : 0 }}
            transition={{ duration: 0.3 }}
          >
            <path
              fill="currentColor"
              d="M4.646 6.646a.5.5 0 0 1 .708 0L8 9.293l2.646-2.647a.5.5 0 0 1 .708.708l-3 3a.5.5 0 0 1-.708 0l-3-3a.5.5 0 0 1 0-.708z"
            />
          </motion.svg>
        </button>
      </div>
      
      {/* 目录列表 */}
      <AnimatePresence>
        {!isCollapsed && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <ul className="space-y-2 text-sm">
              {headings.map((heading) => {
                const isActive = activeId === heading.id
                const paddingLeft = (heading.level - 1) * 16
                
                return (
                  <motion.li
                    key={heading.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <button
                      onClick={() => handleClick(heading.id)}
                      className={cn(
                        "w-full text-left py-1.5 px-3 rounded-md transition-all duration-300",
                        "hover:bg-muted/50 hover:text-foreground",
                        isActive ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground"
                      )}
                      style={{ paddingLeft: `${paddingLeft + 12}px` }}
                    >
                      <span className="line-clamp-2">{heading.text}</span>
                    </button>
                    
                    {/* 活动指示器 */}
                    {isActive && (
                      <motion.div
                        layoutId="toc-indicator"
                        className="absolute left-0 w-1 h-7 bg-primary rounded-r"
                        style={{ top: `${heading.id}` }}
                        transition={{
                          type: "spring",
                          stiffness: 500,
                          damping: 30
                        }}
                      />
                    )}
                  </motion.li>
                )
              })}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* 边框装饰 */}
      <div className="absolute -left-px top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-border to-transparent" />
    </motion.nav>
  )
}