'use client'

import React, { useState, useEffect, useRef } from 'react'
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { Calendar, Clock, ChevronRight, Search, Filter } from 'lucide-react'
import { cn } from '@/lib/utils'

// 模拟文章数据类型
interface Article {
  id: string
  title: string
  slug: string
  excerpt: string
  date: string
  readTime: string
  tags: string[]
  featured?: boolean
  coverImage?: string
}

// 模拟文章数据 - 实际项目中应从数据库获取
const mockArticles: Article[] = [
  {
    id: '1',
    title: '现代前端开发的思考与实践',
    slug: 'modern-frontend-development',
    excerpt: '探讨现代前端开发中的设计模式、性能优化和用户体验提升。从 React 18 的并发特性到 CSS-in-JS 的演进，分享一些实际项目中的经验和思考。在这个快速发展的时代，如何保持技术的先进性同时确保代码的可维护性...',
    date: '2024-01-15',
    readTime: '8 分钟',
    tags: ['前端', 'React', '性能优化'],
    featured: true
  },
  {
    id: '2',
    title: '设计系统的构建与维护',
    slug: 'design-system-build',
    excerpt: '如何从零开始构建一个可扩展的设计系统，包括组件库的设计原则、文档规范和团队协作流程。分享在实际项目中遇到的挑战和解决方案。设计系统不仅仅是组件库，更是团队协作的基础...',
    date: '2024-01-10',
    readTime: '12 分钟',
    tags: ['设计系统', 'UI/UX', '团队协作']
  },
  {
    id: '3',
    title: 'TypeScript 进阶技巧与最佳实践',
    slug: 'typescript-advanced-tips',
    excerpt: '深入探讨 TypeScript 的高级特性，包括条件类型、映射类型和模板字面量类型。通过实际案例展示如何提升代码的类型安全性和开发效率。类型系统的强大不仅在于约束，更在于赋能...',
    date: '2024-01-05',
    readTime: '15 分钟',
    tags: ['TypeScript', '编程技巧', '最佳实践']
  },
  {
    id: '4',
    title: 'Next.js 15 App Router 深度解析',
    slug: 'nextjs-15-app-router',
    excerpt: '全面解析 Next.js 15 的 App Router 架构，包括服务端组件、并行路由、拦截路由等高级特性。探讨如何在实际项目中充分利用这些新特性提升应用性能和开发体验...',
    date: '2023-12-20',
    readTime: '20 分钟',
    tags: ['Next.js', 'React', 'SSR'],
    featured: true
  },
  {
    id: '5',
    title: 'Web 动画性能优化实战',
    slug: 'web-animation-performance',
    excerpt: '从浏览器渲染原理出发，深入分析 Web 动画的性能瓶颈和优化策略。介绍 will-change、transform、opacity 等属性的正确使用方式，以及如何利用 GPU 加速提升动画流畅度...',
    date: '2023-12-15',
    readTime: '18 分钟',
    tags: ['动画', '性能', '优化']
  }
]

// 文章项组件
const ArticleItem = React.memo(function ArticleItem({
  article,
  index,
  isInView
}: {
  article: Article
  index: number
  isInView: boolean
}) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 100 }}
      animate={{ 
        opacity: isInView ? 1 : 0.3,
        y: isInView ? 0 : 50,
        scale: isInView ? 1 : 0.95
      }}
      transition={{ 
        duration: 0.8,
        delay: index * 0.1,
        ease: [0.23, 1, 0.32, 1]
      }}
      className="group relative"
    >
      <Link href={`/articles/${article.slug}`}>
        <div className="relative py-16 sm:py-20 lg:py-24">
          {/* 文章内容 */}
          <div className="max-w-4xl mx-auto">
            {/* 元信息 */}
            <motion.div 
              className="flex flex-wrap items-center gap-4 mb-6 text-sm text-muted-foreground"
              animate={{ 
                opacity: isInView ? 1 : 0.5,
                x: isInView ? 0 : -20
              }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <time>{article.date}</time>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>{article.readTime}</span>
              </div>
              {article.featured && (
                <span className="px-3 py-1 text-xs rounded-full bg-primary/10 text-primary border border-primary/20">
                  精选
                </span>
              )}
            </motion.div>
            
            {/* 标题 */}
            <motion.h2 
              className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6 leading-tight group-hover:text-primary transition-colors duration-500"
              animate={{ 
                opacity: isInView ? 1 : 0.6,
                x: isInView ? 0 : -30
              }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              {article.title}
            </motion.h2>
            
            {/* 摘要 */}
            <motion.p 
              className="text-lg text-muted-foreground leading-relaxed mb-8 line-clamp-3"
              animate={{ 
                opacity: isInView ? 0.9 : 0.4,
                x: isInView ? 0 : -20
              }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              {article.excerpt}
            </motion.p>
            
            {/* 标签和阅读更多 */}
            <motion.div 
              className="flex flex-wrap items-center justify-between gap-4"
              animate={{ 
                opacity: isInView ? 1 : 0.3,
                y: isInView ? 0 : 20
              }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              <div className="flex flex-wrap gap-2">
                {article.tags.map(tag => (
                  <span 
                    key={tag}
                    className="px-3 py-1 text-sm rounded-full bg-background border border-border/50 hover:border-primary/50 transition-colors duration-300"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              
              <motion.div 
                className="flex items-center gap-2 text-primary font-medium"
                whileHover={{ x: 10 }}
                transition={{ duration: 0.3 }}
              >
                <span>阅读全文</span>
                <ChevronRight className="w-4 h-4" />
              </motion.div>
            </motion.div>
          </div>
          
          {/* 分隔线 */}
          <motion.div 
            className="absolute bottom-0 left-0 right-0 h-px bg-border/30"
            animate={{ 
              scaleX: isInView ? 1 : 0.8,
              opacity: isInView ? 0.5 : 0.2
            }}
            transition={{ duration: 0.8 }}
          />
        </div>
      </Link>
    </motion.article>
  )
})

export default function ArticlesPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTag, setSelectedTag] = useState<string | null>(null)
  const [showSearch, setShowSearch] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const articleRefs = useRef<(HTMLElement | null)[]>([])
  const [visibleArticles, setVisibleArticles] = useState<Set<string>>(new Set())
  
  const { scrollY } = useScroll()
  const headerOpacity = useTransform(scrollY, [0, 100], [0, 1])
  const headerBlur = useTransform(scrollY, [0, 100], [0, 10])
  
  // 获取所有标签
  const allTags = Array.from(
    new Set(mockArticles.flatMap(article => article.tags))
  )
  
  // 过滤文章
  const filteredArticles = mockArticles.filter(article => {
    const matchesSearch = !searchQuery || 
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.excerpt.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesTag = !selectedTag || article.tags.includes(selectedTag)
    
    return matchesSearch && matchesTag
  })
  
  // 监听文章可见性
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          const articleId = entry.target.getAttribute('data-article-id')
          if (articleId) {
            setVisibleArticles(prev => {
              const newSet = new Set(prev)
              if (entry.isIntersecting) {
                newSet.add(articleId)
              } else {
                newSet.delete(articleId)
              }
              return newSet
            })
          }
        })
      },
      {
        threshold: 0.5,
        rootMargin: '-20% 0px -20% 0px'
      }
    )
    
    articleRefs.current.forEach(ref => {
      if (ref) observer.observe(ref)
    })
    
    return () => observer.disconnect()
  }, [filteredArticles])
  
  // 获取当前可见的文章标题
  const currentArticle = filteredArticles.find(article => 
    visibleArticles.has(article.id)
  )
  
  // 键盘快捷键
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setShowSearch(true)
      }
      if (e.key === 'Escape') {
        setShowSearch(false)
        setSearchQuery('')
      }
    }
    
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])
  
  return (
    <div className="min-h-screen" ref={containerRef}>
      {/* 固定标题栏 - 滚动时显示当前文章标题 */}
      <motion.div
        className="fixed top-16 left-0 right-0 z-30 pointer-events-none"
        style={{ 
          opacity: headerOpacity,
          backdropFilter: `blur(${headerBlur}px)`
        }}
      >
        <div className="bg-background/60 border-b border-border/30">
          <div className="container mx-auto px-6 lg:px-8 py-4">
            <AnimatePresence mode="wait">
              {currentArticle && (
                <motion.h2
                  key={currentArticle.id}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="text-lg font-medium"
                >
                  {currentArticle.title}
                </motion.h2>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
      
      {/* 页面标题区域 */}
      <section className="pt-24 pb-12 sm:pt-32 sm:pb-16 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6"
          >
            文章
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-lg text-muted-foreground mb-8"
          >
            探索技术的边界，分享设计的思考，记录创作的过程
          </motion.p>
          
          {/* 搜索和筛选 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex flex-wrap gap-4 items-center"
          >
            <button
              onClick={() => setShowSearch(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border/50 hover:border-primary/50 transition-all duration-300"
            >
              <Search className="w-4 h-4" />
              <span className="text-sm">搜索文章</span>
              <kbd className="ml-2 px-1.5 py-0.5 bg-muted rounded text-xs">⌘K</kbd>
            </button>
            
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedTag(null)}
                  className={cn(
                    "px-3 py-1 text-sm rounded-full transition-all duration-300",
                    !selectedTag 
                      ? "bg-primary text-primary-foreground" 
                      : "bg-background border border-border/50 hover:border-primary/50"
                  )}
                >
                  全部
                </button>
                {allTags.map(tag => (
                  <button
                    key={tag}
                    onClick={() => setSelectedTag(tag)}
                    className={cn(
                      "px-3 py-1 text-sm rounded-full transition-all duration-300",
                      selectedTag === tag 
                        ? "bg-primary text-primary-foreground" 
                        : "bg-background border border-border/50 hover:border-primary/50"
                    )}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>
      
      {/* 文章列表 - 时间流布局 */}
      <section className="pb-20">
        <div className="container mx-auto px-6 lg:px-8">
          {filteredArticles.length > 0 ? (
            <div className="divide-y divide-border/30">
              {filteredArticles.map((article, index) => (
                <div
                  key={article.id}
                  ref={el => articleRefs.current[index] = el}
                  data-article-id={article.id}
                >
                  <ArticleItem 
                    article={article} 
                    index={index}
                    isInView={visibleArticles.has(article.id)}
                  />
                </div>
              ))}
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20"
            >
              <p className="text-muted-foreground">没有找到相关文章</p>
            </motion.div>
          )}
        </div>
      </section>
      
      {/* 搜索模态框 */}
      <AnimatePresence>
        {showSearch && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm"
            onClick={() => setShowSearch(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              transition={{ duration: 0.3 }}
              className="max-w-2xl mx-auto mt-20 p-6"
              onClick={e => e.stopPropagation()}
            >
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="搜索文章标题或内容..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 text-lg bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  autoFocus
                />
                <kbd className="absolute right-4 top-1/2 -translate-y-1/2 px-2 py-1 bg-muted rounded text-xs">
                  ESC
                </kbd>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}