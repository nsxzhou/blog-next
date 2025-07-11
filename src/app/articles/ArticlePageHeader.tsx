'use client'

import React from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Filter } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Tag } from '@prisma/client'

interface ArticlePageHeaderProps {
  tags: (Tag & { _count: { posts: number } })[]
  selectedTag?: string
  totalArticles: number
}

export default function ArticlePageHeader({ tags, selectedTag, totalArticles }: ArticlePageHeaderProps) {
  return (
    <>
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
            <span className="text-xs opacity-70">({totalArticles})</span>
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
    </>
  )
}