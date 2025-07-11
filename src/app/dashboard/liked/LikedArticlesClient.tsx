'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Heart, Calendar, Clock, Eye, ExternalLink, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface LikedPost {
  id: string
  post: {
    id: string
    title: string
    slug: string
    excerpt: string | null
    publishedAt: string
    viewCount: number
    content: string
    author: {
      name: string | null
      email: string | null
    }
    tags: { id: string; name: string }[]
  }
  createdAt: string
}

export default function LikedArticlesClient() {
  const [likedPosts, setLikedPosts] = useState<LikedPost[]>([])
  const [loading, setLoading] = useState(true)
  const [removing, setRemoving] = useState<string | null>(null)

  useEffect(() => {
    fetchLikedPosts()
  }, [])

  const fetchLikedPosts = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/posts/liked')
      
      if (response.ok) {
        const data = await response.json()
        setLikedPosts(data.likes || [])
      }
    } catch (error) {
      console.error('Failed to fetch liked posts:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUnlike = async (postId: string) => {
    try {
      setRemoving(postId)
      const response = await fetch(`/api/posts/${postId}/like`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        setLikedPosts(prev => prev.filter(item => item.post.id !== postId))
      }
    } catch (error) {
      console.error('Failed to unlike post:', error)
    } finally {
      setRemoving(null)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto max-w-7xl p-6 lg:p-8">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto max-w-7xl p-6 lg:p-8 space-y-8">
      {/* 页面标题 */}
      <div className="flex flex-col gap-4">
        <div>
          <h1 className="text-3xl font-bold">我的点赞</h1>
          <p className="text-muted-foreground mt-1">
            您点赞过的文章列表
          </p>
        </div>
      </div>

      {/* 统计信息 */}
      <div className="bg-card border border-border rounded-xl p-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Heart className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-2xl font-bold">{likedPosts.length}</p>
            <p className="text-sm text-muted-foreground">篇点赞文章</p>
          </div>
        </div>
      </div>

      {/* 文章列表 */}
      {likedPosts.length === 0 ? (
        <div className="bg-card border border-border rounded-xl p-16 text-center">
          <Heart className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
          <p className="text-muted-foreground mb-4">您还没有点赞任何文章</p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            浏览文章
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {likedPosts.map((item, index) => (
            <motion.article
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-all duration-300"
            >
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div className="flex-1 space-y-3">
                  <div>
                    <h3 className="text-xl font-semibold line-clamp-1 mb-2">
                      <Link 
                        href={`/articles/${item.post.slug}`}
                        className="hover:text-primary transition-colors"
                      >
                        {item.post.title}
                      </Link>
                    </h3>
                    {item.post.excerpt && (
                      <p className="text-muted-foreground line-clamp-2">
                        {item.post.excerpt}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      点赞于 {new Date(item.createdAt).toLocaleDateString('zh-CN')}
                    </span>
                    <span className="flex items-center gap-1">
                      <Eye className="w-3.5 h-3.5" />
                      {item.post.viewCount} 次浏览
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {Math.ceil(item.post.content.length / 400)} 分钟阅读
                    </span>
                    {item.post.author.name && (
                      <span>作者: {item.post.author.name}</span>
                    )}
                  </div>

                  {item.post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {item.post.tags.map(tag => (
                        <span
                          key={tag.id}
                          className="px-2.5 py-1 text-xs bg-muted rounded-md"
                        >
                          {tag.name}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <Link
                    href={`/articles/${item.post.slug}`}
                    target="_blank"
                    className="p-2 hover:bg-muted rounded-lg transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Link>
                  <button
                    onClick={() => handleUnlike(item.post.id)}
                    disabled={removing === item.post.id}
                    className={cn(
                      "p-2 rounded-lg transition-colors",
                      removing === item.post.id
                        ? "opacity-50 cursor-not-allowed"
                        : "hover:bg-muted text-destructive hover:text-destructive"
                    )}
                  >
                    {removing === item.post.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Heart className="w-4 h-4 fill-current" />
                    )}
                  </button>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      )}
    </div>
  )
}