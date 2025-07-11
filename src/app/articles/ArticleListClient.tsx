'use client'

import React, { useState, useEffect, useRef } from 'react'
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { Calendar, Clock, ChevronRight } from 'lucide-react'
import { PostListItem } from '@/types/article'
import { formatPostDate, formatReadingTime } from '@/types/article'

// 文章项组件
const ArticleItem = React.memo(function ArticleItem({
  article,
  index,
  isInView
}: {
  article: PostListItem
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
                <time>{formatPostDate(article.publishedAt)}</time>
              </div>
              {article.readingTime && (
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>{formatReadingTime(article.readingTime)}</span>
                </div>
              )}
              {article.isFeatured && (
                <span className="px-3 py-1 text-xs rounded-full bg-primary/10 text-primary border border-primary/20">
                  精选
                </span>
              )}
              {article.viewCount > 0 && (
                <span className="text-xs">
                  {article.viewCount} 次阅读
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
            {article.excerpt && (
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
            )}
            
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
                {article.tags.map(({ tag }) => (
                  <Link
                    key={tag.id}
                    href={`/articles?tag=${tag.slug}`}
                    className="px-3 py-1 text-sm rounded-full bg-background border border-border/50 hover:border-primary/50 transition-colors duration-300 inline-flex items-center gap-1"
                    style={{
                      borderColor: tag.color ? `${tag.color}30` : undefined,
                      backgroundColor: tag.color ? `${tag.color}10` : undefined
                    }}
                  >
                    {tag.name}
                  </Link>
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

export default function ArticleListClient({ articles }: { articles: PostListItem[] }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const articleRefs = useRef<(HTMLDivElement | null)[]>([])
  const [visibleArticles, setVisibleArticles] = useState<Set<string>>(new Set())
  
  const { scrollY } = useScroll()
  const headerOpacity = useTransform(scrollY, [0, 100], [0, 1])
  const headerBlur = useTransform(scrollY, [0, 100], [0, 10])
  
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
  }, [articles])
  
  // 获取当前可见的文章标题
  const currentArticle = articles.find(article => 
    visibleArticles.has(article.id)
  )
  
  return (
    <div ref={containerRef}>
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
      
      {/* 文章列表 - 时间流布局 */}
      <section className="pb-20">
        <div className="container mx-auto px-6 lg:px-8">
          {articles.length > 0 ? (
            <div className="divide-y divide-border/30">
              {articles.map((article, index) => (
                <div
                  key={article.id}
                  ref={el => {
                    articleRefs.current[index] = el
                  }}
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
    </div>
  )
}