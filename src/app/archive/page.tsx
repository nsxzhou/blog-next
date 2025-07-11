'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Calendar, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

// TODO: 替换为实际的文章数据获取函数
// import { getPostList } from '@/lib/posts'
// import type { Post } from '@/types/post'

// 临时的 Post 类型定义
type Post = {
  slug: string
  title: string
  date: string
  tags?: string[]
  excerpt?: string
}

// 按年份分组文章
function groupPostsByYear(posts: Post[]) {
  const grouped = posts.reduce((acc, post) => {
    const year = new Date(post.date).getFullYear()
    if (!acc[year]) {
      acc[year] = []
    }
    acc[year].push(post)
    return acc
  }, {} as Record<number, Post[]>)

  // 返回按年份降序排列的数组
  return Object.entries(grouped)
    .sort(([a], [b]) => Number(b) - Number(a))
    .map(([year, posts]) => ({
      year: Number(year),
      posts: posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    }))
}

export default function ArchivePage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedYears, setExpandedYears] = useState<Set<number>>(new Set())

  useEffect(() => {
    async function loadPosts() {
      try {
        // TODO: 替换为实际的数据获取逻辑
        // const postList = await getPostList()
        
        // 模拟数据，用于展示
        const mockPosts: Post[] = [
          {
            slug: 'getting-started-with-nextjs',
            title: 'Next.js 15 入门指南',
            date: '2024-12-15',
            tags: ['Next.js', 'React', 'Web开发']
          },
          {
            slug: 'understanding-react-server-components',
            title: '深入理解 React Server Components',
            date: '2024-12-10',
            tags: ['React', 'RSC', '性能优化']
          },
          {
            slug: 'typescript-best-practices',
            title: 'TypeScript 最佳实践',
            date: '2024-11-28',
            tags: ['TypeScript', '类型系统', '代码质量']
          },
          {
            slug: 'building-scalable-apis',
            title: '构建可扩展的 API 架构',
            date: '2024-11-15',
            tags: ['API', '架构设计', '后端']
          },
          {
            slug: 'modern-css-techniques',
            title: '现代 CSS 技术探索',
            date: '2024-10-20',
            tags: ['CSS', 'Tailwind', '响应式设计']
          },
          {
            slug: 'web-performance-optimization',
            title: 'Web 性能优化实战',
            date: '2023-12-25',
            tags: ['性能', '优化', 'Web']
          },
          {
            slug: 'introduction-to-ai',
            title: 'AI 时代的编程思考',
            date: '2023-11-30',
            tags: ['AI', '编程', '未来']
          }
        ]
        
        setPosts(mockPosts)
        
        // 默认展开所有年份
        const years = new Set(mockPosts.map(post => new Date(post.date).getFullYear()))
        setExpandedYears(years)
      } catch (error) {
        console.error('Failed to load posts:', error)
      } finally {
        setLoading(false)
      }
    }
    loadPosts()
  }, [])

  // 过滤文章
  const filteredPosts = useMemo(() => {
    if (!searchQuery) return posts
    
    const query = searchQuery.toLowerCase()
    return posts.filter(post => 
      post.title.toLowerCase().includes(query) ||
      post.tags?.some(tag => tag.toLowerCase().includes(query))
    )
  }, [posts, searchQuery])

  // 按年份分组
  const groupedPosts = useMemo(() => 
    groupPostsByYear(filteredPosts),
    [filteredPosts]
  )

  // 切换年份展开状态
  const toggleYear = (year: number) => {
    const newExpanded = new Set(expandedYears)
    if (newExpanded.has(year)) {
      newExpanded.delete(year)
    } else {
      newExpanded.add(year)
    }
    setExpandedYears(newExpanded)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse space-y-8 w-full max-w-3xl">
          <div className="h-8 bg-muted/20 rounded w-32"></div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-4 bg-muted/10 rounded w-full"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-6 lg:px-8 py-20 md:py-24">
        <div className="max-w-3xl mx-auto">
          {/* 页面标题 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-16"
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-4 font-mono tracking-tight">
              归档
            </h1>
            <p className="text-muted-foreground">
              共 {posts.length} 篇文章，跨越 {groupedPosts.length} 年的思考与记录
            </p>
          </motion.div>

          {/* 搜索框 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mb-12"
          >
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground transition-colors group-focus-within:text-foreground" />
              <input
                type="text"
                placeholder="搜索文章..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-transparent border border-border/50 rounded-lg focus:outline-none focus:border-foreground/50 transition-all font-mono text-sm"
              />
            </div>
          </motion.div>

          {/* 文章列表 */}
          <div className="space-y-16">
            {groupedPosts.length === 0 ? (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center text-muted-foreground py-12"
              >
                {searchQuery ? '没有找到匹配的文章' : '还没有发布任何文章'}
              </motion.p>
            ) : (
              groupedPosts.map(({ year, posts }, groupIndex) => (
                <motion.div
                  key={year}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: groupIndex * 0.1 }}
                >
                  {/* 年份标题 */}
                  <button
                    onClick={() => toggleYear(year)}
                    className="flex items-center gap-2 mb-6 group"
                  >
                    <motion.div
                      animate={{ rotate: expandedYears.has(year) ? 90 : 0 }}
                      transition={{ duration: 0.2 }}
                      className="text-muted-foreground"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </motion.div>
                    <h2 className="text-2xl font-mono font-bold">
                      {year}
                    </h2>
                    <span className="text-sm text-muted-foreground">
                      {posts.length} 篇
                    </span>
                  </button>

                  {/* 该年份的文章列表 */}
                  <AnimatePresence>
                    {expandedYears.has(year) && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        <div className="space-y-1 pl-8">
                          {posts.map((post, index) => (
                            <motion.div
                              key={post.slug}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.02 }}
                            >
                              <Link
                                href={`/articles/${post.slug}`}
                                className="group flex items-baseline gap-4 py-3 hover:bg-accent/5 rounded-lg px-4 -mx-4 transition-colors"
                              >
                                {/* 日期 */}
                                <time className="text-sm font-mono text-muted-foreground/70 flex-shrink-0">
                                  {new Date(post.date).toLocaleDateString('zh-CN', {
                                    month: '2-digit',
                                    day: '2-digit'
                                  })}
                                </time>
                                
                                {/* 标题 */}
                                <span className="text-foreground group-hover:text-primary transition-colors">
                                  {post.title}
                                </span>
                              </Link>
                            </motion.div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}