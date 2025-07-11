import React from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Calendar, Clock, ChevronRight, Filter, Tag as TagIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { getArticles } from '@/lib/articles'
import { getPopularTags } from '@/lib/tags'
import { formatPostDate, formatReadingTime } from '@/types/article'
import { PostListItem } from '@/types/article'
import ArticleListClient from './ArticleListClient'

// 获取页面数据
async function getPageData(searchParams: { tag?: string }) {
  const [articles, tags] = await Promise.all([
    getArticles({
      tagSlug: searchParams.tag,
      orderBy: 'publishedAt',
      order: 'desc'
    }),
    getPopularTags(10)
  ])

  return { articles, tags, selectedTag: searchParams.tag }
}

// 服务端页面组件
export default async function ArticlesPage({
  searchParams
}: {
  searchParams: Promise<{ tag?: string }>
}) {
  const params = await searchParams
  const { articles, tags, selectedTag } = await getPageData(params)

  return (
    <div className="min-h-screen">
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
          
          {/* 搜索提示 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.15 }}
            className="mb-8 text-sm text-muted-foreground"
          >
            <span>使用 </span>
            <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs mx-1">⌘</kbd>
            <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs mr-1">K</kbd>
            <span> 快速搜索文章</span>
          </motion.div>
          
          {/* 标签筛选 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex flex-wrap gap-4 items-center"
          >
            <div className="flex items-center gap-2 mr-4">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">筛选：</span>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link
                href="/articles"
                className={cn(
                  "px-3 py-1 text-sm rounded-full transition-all duration-300 inline-flex items-center gap-1",
                  !selectedTag 
                    ? "bg-primary text-primary-foreground" 
                    : "bg-background border border-border/50 hover:border-primary/50"
                )}
              >
                全部
                <span className="text-xs opacity-70">({articles.length})</span>
              </Link>
              {tags.map(tag => (
                <Link
                  key={tag.id}
                  href={`/articles?tag=${tag.slug}`}
                  className={cn(
                    "px-3 py-1 text-sm rounded-full transition-all duration-300 inline-flex items-center gap-1",
                    selectedTag === tag.slug 
                      ? "bg-primary text-primary-foreground" 
                      : "bg-background border border-border/50 hover:border-primary/50"
                  )}
                >
                  {tag.icon && <span>{tag.icon}</span>}
                  {tag.name}
                  <span className="text-xs opacity-70">({tag._count.posts})</span>
                </Link>
              ))}
            </div>
          </motion.div>
        </div>
      </section>
      
      {/* 客户端组件处理动画和交互 */}
      <ArticleListClient articles={articles} />
    </div>
  )
}

// 生成元数据
export async function generateMetadata({ searchParams }: { searchParams: Promise<{ tag?: string }> }) {
  const params = await searchParams
  const tagName = params.tag ? ` - ${params.tag}` : ''
  
  return {
    title: `文章${tagName}`,
    description: '探索技术的边界，分享设计的思考，记录创作的过程',
  }
}