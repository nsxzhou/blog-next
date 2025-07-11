'use client'

import React, { useState, useEffect, useRef } from 'react'
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { 
  Calendar, 
  Clock, 
  ChevronLeft, 
  ChevronRight,
  BookOpen,
  Maximize2,
  X,
  Coffee,
  Eye,
  Heart
} from 'lucide-react'
import { cn } from '@/lib/utils'
import ReadingProgress from '@/components/article/ReadingProgress'
import AnalyticsTracker from '@/components/AnalyticsTracker'
import TableOfContents from '@/components/article/TableOfContents'
import CodeBlock from '@/components/article/CodeBlock'
import ImageViewer from '@/components/article/ImageViewer'
import { PostDetail } from '@/types/article'
import { formatPostDate, formatReadingTime } from '@/types/article'
import { useSession } from 'next-auth/react'

interface ArticleDetailClientProps {
  article: PostDetail
}

export default function ArticleDetailClient({ article }: ArticleDetailClientProps) {
  const [isImageViewerOpen, setIsImageViewerOpen] = useState(false)
  const [currentImage, setCurrentImage] = useState<string>('')
  const [isFocusMode, setIsFocusMode] = useState(false)
  const [isLiked, setIsLiked] = useState(false)
  const contentRef = useRef<HTMLDivElement>(null)
  const { scrollY } = useScroll()
  const { data: session } = useSession()
  
  // 标题动画
  const titleY = useTransform(scrollY, [0, 300], [0, -50])
  const titleOpacity = useTransform(scrollY, [0, 200], [1, 0])
  const metaY = useTransform(scrollY, [0, 300], [0, -30])
  const metaOpacity = useTransform(scrollY, [0, 150], [1, 0])
  
  // 处理图片点击
  const handleImageClick = (src: string) => {
    setCurrentImage(src)
    setIsImageViewerOpen(true)
  }
  
  // 处理点赞
  const handleLike = async () => {
    if (!session?.user) {
      // 提示用户登录
      alert('请先登录后再点赞')
      return
    }
    
    try {
      const response = await fetch(`/api/posts/${article.id}/like`, {
        method: 'POST'
      })
      
      if (response.ok) {
        const { liked } = await response.json()
        setIsLiked(liked)
      }
    } catch (error) {
      console.error('点赞失败:', error)
    }
  }
  
  // 键盘快捷键
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Escape 退出全屏图片或专注模式
      if (e.key === 'Escape') {
        if (isImageViewerOpen) {
          setIsImageViewerOpen(false)
        } else if (isFocusMode) {
          setIsFocusMode(false)
        }
      }
      // F 键切换专注模式
      if (e.key === 'f' && !e.metaKey && !e.ctrlKey) {
        setIsFocusMode(prev => !prev)
      }
    }
    
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isImageViewerOpen, isFocusMode])
  
  // 处理文章内容中的图片
  useEffect(() => {
    if (contentRef.current) {
      const images = contentRef.current.querySelectorAll('img')
      images.forEach(img => {
        img.style.cursor = 'zoom-in'
        img.addEventListener('click', () => handleImageClick(img.src))
      })
      
      return () => {
        images.forEach(img => {
          img.removeEventListener('click', () => handleImageClick(img.src))
        })
      }
    }
  }, [article.content])
  
  // 检查用户是否已点赞
  useEffect(() => {
    if (session?.user?.id) {
      fetch(`/api/posts/${article.id}/like/status`)
        .then(res => res.json())
        .then(data => setIsLiked(data.liked))
        .catch(console.error)
    }
  }, [session, article.id])
  
  return (
    <>
      {/* 分析追踪器 - 追踪文章页面访问 */}
      <AnalyticsTracker postId={article.id} />
      
      {/* 阅读进度条 */}
      <ReadingProgress />
      
      <article className={cn(
        "min-h-screen",
        isFocusMode && "focus-mode"
      )}>
        {/* Hero 标题区域 */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent" />
          <div className="relative px-6 pt-24 pb-16 sm:pt-32 sm:pb-20 lg:pt-40 lg:pb-24">
            <div className="max-w-4xl mx-auto">
              {/* 面包屑导航 */}
              <motion.nav 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="flex items-center gap-2 text-sm text-muted-foreground mb-8"
              >
                <Link href="/" className="hover:text-foreground transition-colors">
                  首页
                </Link>
                <ChevronRight className="w-4 h-4" />
                <Link href="/articles" className="hover:text-foreground transition-colors">
                  文章
                </Link>
                <ChevronRight className="w-4 h-4" />
                <span className="text-foreground truncate max-w-[200px]">
                  {article.title}
                </span>
              </motion.nav>
              
              {/* 标题 */}
              <motion.h1 
                style={{ y: titleY, opacity: titleOpacity }}
                className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-8"
              >
                {article.title}
              </motion.h1>
              
              {/* 元信息 */}
              <motion.div 
                style={{ y: metaY, opacity: metaOpacity }}
                className="flex flex-wrap items-center gap-6 text-muted-foreground"
              >
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <time dateTime={article.publishedAt?.toISOString()}>
                    {formatPostDate(article.publishedAt)}
                  </time>
                </div>
                {article.readingTime && (
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span>{formatReadingTime(article.readingTime)}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  <span>{article.wordCount} 字</span>
                </div>
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4" />
                  <span>{article.viewCount} 次阅读</span>
                </div>
                <div className="flex items-center gap-2">
                  <Coffee className="w-4 h-4" />
                  <span>{article.author.name}</span>
                </div>
              </motion.div>
              
              {/* 标签 */}
              {article.tags && article.tags.length > 0 && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  className="flex flex-wrap gap-2 mt-6"
                >
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
                      {tag.icon && <span className="text-xs">{tag.icon}</span>}
                      {tag.name}
                    </Link>
                  ))}
                </motion.div>
              )}
            </div>
          </div>
        </section>
        
        {/* 文章内容区域 */}
        <section className="relative">
          <div className="max-w-6xl mx-auto px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-12">
              {/* 主要内容 */}
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="min-w-0"
              >
                <div 
                  ref={contentRef}
                  className={cn(
                    "prose prose-lg dark:prose-invert max-w-none",
                    "prose-headings:font-bold prose-headings:tracking-tight",
                    "prose-h1:text-3xl prose-h1:mt-12 prose-h1:mb-8",
                    "prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-6",
                    "prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-4",
                    "prose-p:leading-relaxed prose-p:text-foreground/90",
                    "prose-a:text-primary prose-a:no-underline hover:prose-a:underline",
                    "prose-blockquote:border-l-4 prose-blockquote:border-primary/30 prose-blockquote:pl-6 prose-blockquote:italic",
                    "prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:font-mono prose-code:text-sm",
                    "prose-pre:bg-background prose-pre:border prose-pre:border-border",
                    "prose-img:rounded-lg prose-img:shadow-lg prose-img:mx-auto",
                    "prose-hr:border-border/50",
                    "prose-ul:list-disc prose-ol:list-decimal",
                    "prose-li:marker:text-primary/50"
                  )}
                  dangerouslySetInnerHTML={{ __html: article.content }}
                />
                
                {/* 文章底部信息 */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.8 }}
                  className="mt-16 pt-8 border-t border-border/50"
                >
                  {/* 点赞按钮 */}
                  <div className="flex items-center gap-4 mb-8">
                    <button
                      onClick={handleLike}
                      className={cn(
                        "flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300",
                        isLiked 
                          ? "bg-primary text-primary-foreground" 
                          : "bg-background border border-border/50 hover:border-primary/50"
                      )}
                    >
                      <Heart className={cn("w-4 h-4", isLiked && "fill-current")} />
                      <span>{article.likeCount} 人喜欢</span>
                    </button>
                  </div>
                  
                  {/* 相关文章 */}
                  {article.relatedPosts && article.relatedPosts.length > 0 && (
                    <div className="mb-12">
                      <h3 className="text-xl font-semibold mb-6">相关文章</h3>
                      <div className="grid gap-4">
                        {article.relatedPosts.map(related => (
                          <Link
                            key={related.id}
                            href={`/articles/${related.slug}`}
                            className="group p-4 rounded-lg border border-border/50 hover:border-primary/50 transition-all duration-300"
                          >
                            <h4 className="font-medium group-hover:text-primary transition-colors">
                              {related.title}
                            </h4>
                            {related.excerpt && (
                              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                                {related.excerpt}
                              </p>
                            )}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* 上一篇/下一篇导航 */}
                  <div className="flex flex-col sm:flex-row gap-4 justify-between">
                    {article.prevPost && (
                      <Link
                        href={`/articles/${article.prevPost.slug}`}
                        className="group flex items-center gap-3 p-4 rounded-lg border border-border/50 hover:border-primary/50 transition-all duration-300 flex-1"
                      >
                        <ChevronLeft className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                        <div className="text-left">
                          <p className="text-sm text-muted-foreground">上一篇</p>
                          <p className="font-medium group-hover:text-primary transition-colors line-clamp-1">
                            {article.prevPost.title}
                          </p>
                        </div>
                      </Link>
                    )}
                    {article.nextPost && (
                      <Link
                        href={`/articles/${article.nextPost.slug}`}
                        className="group flex items-center gap-3 p-4 rounded-lg border border-border/50 hover:border-primary/50 transition-all duration-300 flex-1 sm:flex-row-reverse sm:text-right"
                      >
                        <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                        <div>
                          <p className="text-sm text-muted-foreground">下一篇</p>
                          <p className="font-medium group-hover:text-primary transition-colors line-clamp-1">
                            {article.nextPost.title}
                          </p>
                        </div>
                      </Link>
                    )}
                  </div>
                </motion.div>
              </motion.div>
              
              {/* 侧边栏 - 目录导航 */}
              <aside className="hidden lg:block">
                <div className="sticky top-24">
                  <TableOfContents content={article.content} />
                  
                  {/* 专注模式按钮 */}
                  <motion.button
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.6, delay: 1 }}
                    onClick={() => setIsFocusMode(true)}
                    className="mt-8 w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-border/50 hover:border-primary/50 transition-all duration-300"
                  >
                    <Maximize2 className="w-4 h-4" />
                    <span className="text-sm">专注模式</span>
                    <kbd className="ml-auto px-1.5 py-0.5 bg-muted rounded text-xs">F</kbd>
                  </motion.button>
                </div>
              </aside>
            </div>
          </div>
        </section>
      </article>
      
      {/* 图片查看器 */}
      <ImageViewer
        isOpen={isImageViewerOpen}
        imageSrc={currentImage}
        onClose={() => setIsImageViewerOpen(false)}
      />
      
      {/* 专注模式遮罩 */}
      <AnimatePresence>
        {isFocusMode && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-background"
          >
            <button
              onClick={() => setIsFocusMode(false)}
              className="fixed top-6 right-6 p-2 rounded-lg bg-muted hover:bg-muted/80 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="h-full overflow-y-auto py-20 px-6">
              <div className="max-w-3xl mx-auto">
                <h1 className="text-3xl font-bold mb-12">{article.title}</h1>
                <div 
                  className={cn(
                    "prose prose-lg dark:prose-invert max-w-none",
                    "prose-p:text-lg prose-p:leading-relaxed",
                    "prose-headings:font-semibold",
                    "prose-h2:text-2xl prose-h2:mt-12 prose-h2:mb-6",
                    "prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-4"
                  )}
                  dangerouslySetInnerHTML={{ __html: article.content }}
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* 样式注入 */}
      <style jsx global>{`
        .focus-mode {
          @media (min-width: 1024px) {
            .prose {
              font-size: 1.125rem;
              line-height: 1.8;
            }
          }
        }
      `}</style>
    </>
  )
}