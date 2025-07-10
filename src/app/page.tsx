'use client'

import React, { useState, useEffect, useRef } from 'react'
import { motion, useScroll, useTransform, useSpring } from 'framer-motion'
import { ChevronDown, Sparkles, Code, Palette, Lightbulb } from 'lucide-react'
import Link from 'next/link'
import { InteractiveGridPattern } from '@/components/magicui/InteractiveGridPattern'

// 打字机效果组件
const TypewriterText = React.memo(function TypewriterText({ text, delay = 0 }: { text: string; delay?: number }) {
  const [displayText, setDisplayText] = useState('')
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayText(prev => prev + text[currentIndex])
        setCurrentIndex(prev => prev + 1)
      }, 50 + Math.random() * 50) // 随机延迟增加真实感

      return () => clearTimeout(timeout)
    }
  }, [currentIndex, text])

  useEffect(() => {
    const startTimeout = setTimeout(() => {
      setCurrentIndex(0)
      setDisplayText('')
    }, delay)

    return () => clearTimeout(startTimeout)
  }, [delay])

  return (
    <span className="relative">
      {displayText}
      <motion.span
        animate={{ opacity: [1, 0] }}
        transition={{ duration: 0.8, repeat: Infinity, repeatType: 'reverse' }}
        className="inline-block w-0.5 h-6 bg-primary ml-1"
      />
    </span>
  )
})


// 特色文章卡片组件
const FeaturedArticleCard = React.memo(function FeaturedArticleCard({ 
  title, 
  excerpt, 
  date, 
  readTime, 
  tags,
  index 
}: {
  title: string
  excerpt: string
  date: string
  readTime: string
  tags: string[]
  index: number
}) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 60 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.8, ease: 'easeOut' }}
      viewport={{ once: true, margin: '-100px' }}
      className="group relative"
    >
      <Link href={`/articles/${title.toLowerCase().replace(/\s+/g, '-')}`}>
        <div className="relative p-4 sm:p-6 lg:p-8 rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm transition-all duration-500 hover:border-border hover:bg-card/80 hover:shadow-lg hover:-translate-y-1">
          {/* 悬浮光效 */}
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-primary/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          
          <div className="relative z-10">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2 sm:gap-4">
              <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                <time>{date}</time>
                <span>·</span>
                <span>{readTime}</span>
              </div>
              <div className="flex space-x-2">
                {tags.slice(0, 2).map(tag => (
                  <span 
                    key={tag}
                    className="px-2 py-1 text-xs rounded-full bg-primary/10 text-primary border border-primary/20"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
            
            <h3 className="text-lg sm:text-xl font-semibold mb-3 group-hover:text-primary transition-colors duration-300">
              {title}
            </h3>
            
            <p className="text-muted-foreground leading-relaxed line-clamp-3 text-sm sm:text-base">
              {excerpt}
            </p>
            
            <div className="mt-4 sm:mt-6 flex items-center text-sm text-primary font-medium">
              阅读全文
              <motion.span
                className="ml-2"
                animate={{ x: [0, 4, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
              >
                →
              </motion.span>
            </div>
          </div>
        </div>
      </Link>
    </motion.article>
  )
})

export default function HomePage() {
  const { scrollY } = useScroll()
  const heroRef = useRef<HTMLDivElement>(null)
  
  // 视差效果
  const y1 = useTransform(scrollY, [0, 1000], [0, -200])
  const y2 = useTransform(scrollY, [0, 1000], [0, -100])
  const opacity = useTransform(scrollY, [0, 400], [1, 0])
  
  // 平滑的鼠标跟踪
  const springConfig = { damping: 25, stiffness: 150 }
  const mouseX = useSpring(0, springConfig)
  const mouseY = useSpring(0, springConfig)

  // 响应式网格方块数量
  const [gridSquares, setGridSquares] = useState<[number, number]>([20, 15])

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const { clientX, clientY } = e
      const { innerWidth, innerHeight } = window
      
      mouseX.set((clientX - innerWidth / 2) / 50)
      mouseY.set((clientY - innerHeight / 2) / 50)
    }

    const updateGridSquares = () => {
      const width = window.innerWidth
      const height = window.innerHeight
      setGridSquares([Math.floor(width / 60), Math.floor(height / 60)])
    }

    updateGridSquares()
    window.addEventListener('resize', updateGridSquares)
    window.addEventListener('mousemove', handleMouseMove)
    
    return () => {
      window.removeEventListener('resize', updateGridSquares)
      window.removeEventListener('mousemove', handleMouseMove)
    }
  }, [mouseX, mouseY])

  // 模拟文章数据
  const featuredArticles = [
    {
      title: "现代前端开发的思考与实践",
      excerpt: "探讨现代前端开发中的设计模式、性能优化和用户体验提升。从 React 18 的并发特性到 CSS-in-JS 的演进，分享一些实际项目中的经验和思考。",
      date: "2024-01-15",
      readTime: "8 分钟",
      tags: ["前端", "React", "性能优化"]
    },
    {
      title: "设计系统的构建与维护",
      excerpt: "如何从零开始构建一个可扩展的设计系统，包括组件库的设计原则、文档规范和团队协作流程。分享在实际项目中遇到的挑战和解决方案。",
      date: "2024-01-10",
      readTime: "12 分钟",
      tags: ["设计系统", "UI/UX", "团队协作"]
    },
    {
      title: "TypeScript 进阶技巧与最佳实践",
      excerpt: "深入探讨 TypeScript 的高级特性，包括条件类型、映射类型和模板字面量类型。通过实际案例展示如何提升代码的类型安全性和开发效率。",
      date: "2024-01-05",
      readTime: "15 分钟",
      tags: ["TypeScript", "编程技巧", "最佳实践"]
    }
  ]

  return (
    <div className="relative ">
      {/* Hero Section - 全屏欢迎区域 */}
      <section 
        ref={heroRef}
        className="relative min-h-screen flex items-center justify-center overflow-hidden"
      >
        
        {/* 渐变背景 */}
        <motion.div 
          style={{ y: y1 }}
          className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10"
        />
        
        {/* 交互式网格背景 */}
        <motion.div 
          style={{ y: y2 }}
          className="absolute inset-0"
        >
          <InteractiveGridPattern
            width={60}
            height={60}
            squares={gridSquares}
            className="w-full h-full border-0"
            squaresClassName="stroke-border/20 dark:stroke-border/10 hover:fill-primary/5 dark:hover:fill-primary/3 transition-all duration-300"
          />
        </motion.div>
        
        {/* 主要内容 */}
        <motion.div 
          style={{ opacity, x: mouseX, y: mouseY }}
          className="relative z-10 text-center px-6 max-w-4xl mx-auto"
        >
          {/* 装饰图标 */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="flex justify-center mb-8"
          >
            <div className="relative">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                className="w-16 h-16 rounded-full border-2 border-primary/20 flex items-center justify-center"
              >
                <Sparkles className="w-8 h-8 text-primary" />
              </motion.div>
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute inset-0 rounded-full bg-primary/10 blur-xl"
              />
            </div>
          </motion.div>
          
          {/* 主标题 - 改进响应式设计 */}
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 1 }}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold mb-6 leading-tight px-4 sm:px-0"
            style={{
              background: 'linear-gradient(to right, hsl(var(--foreground)), hsl(var(--primary)), hsl(var(--foreground)))',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              // 降级方案：如果背景裁剪不支持，则显示普通文字
              color: 'hsl(var(--foreground))'
            }}
          >
            思维笔记
          </motion.h1>
          
          {/* 副标题 - 改进响应式设计 */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2, duration: 0.8 }}
            className="text-lg sm:text-xl md:text-2xl text-muted-foreground mb-8 font-light px-4 sm:px-0"
          >
            <TypewriterText 
              text="用心记录，让思想自由流动" 
              delay={1500}
            />
          </motion.div>
          
          {/* 特色标签 - 改进响应式设计 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 2, duration: 0.8 }}
            className="flex flex-wrap justify-center gap-3 sm:gap-4 mb-8 sm:mb-12 px-4 sm:px-0"
          >
            {[
              { icon: Code, text: "技术分享" },
              { icon: Palette, text: "设计思考" },
              { icon: Lightbulb, text: "创意灵感" }
            ].map(({ icon: Icon, text }, index) => (
              <motion.div
                key={text}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 2.2 + index * 0.1, duration: 0.5 }}
                className="flex items-center space-x-2 px-3 sm:px-4 py-2 rounded-full bg-background/50 backdrop-blur-sm border border-border/50"
              >
                <Icon className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">{text}</span>
              </motion.div>
            ))}
          </motion.div>
          
          {/* CTA 按钮 - 改进响应式设计 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 2.5, duration: 0.8 }}
            className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4 sm:px-0"
          >
            <Link href="/articles">
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="w-full sm:w-auto px-6 sm:px-8 py-3 bg-primary text-primary-foreground rounded-full font-medium shadow-lg hover:shadow-xl transition-all duration-300"
              >
                开始阅读
              </motion.button>
            </Link>
            <Link href="/about">
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="w-full sm:w-auto px-6 sm:px-8 py-3 border border-border bg-background/50 backdrop-blur-sm rounded-full font-medium hover:bg-background/80 transition-all duration-300"
              >
                了解更多
              </motion.button>
            </Link>
          </motion.div>
        </motion.div>
      </section>
      
      {/* Featured Articles Section - 特色文章 */}
      <section className="relative sm:py-20 lg:py-24 sm:px-6">
        <div className="max-w-6xl mx-auto">
          {/* 区域标题 */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-12 sm:mb-16"
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">
              精选文章
            </h2>
            <p className="text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto">
              探索技术的边界，分享设计的思考，记录创作的过程
            </p>
          </motion.div>
          
          {/* 文章网格 */}
          <div className="grid gap-6 sm:gap-8 md:gap-12">
            {featuredArticles.map((article, index) => (
              <FeaturedArticleCard
                key={article.title}
                {...article}
                index={index}
              />
            ))}
          </div>
          
          {/* 查看更多 */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mt-12 sm:mt-16"
          >
            <Link href="/articles">
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="px-6 sm:px-8 py-3 border border-border bg-background/50 backdrop-blur-sm rounded-full font-medium hover:bg-background/80 hover:border-primary/50 transition-all duration-300"
              >
                查看所有文章
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  )
}