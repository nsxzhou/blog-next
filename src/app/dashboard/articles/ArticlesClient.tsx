'use client'

import { useState, useEffect } from 'react'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { 
  Search, 
  Plus, 
  Eye, 
  Edit, 
  Trash2, 
  Calendar,
  User
} from 'lucide-react'
import Link from 'next/link'

interface Article {
  id: string
  title: string
  slug: string
  excerpt?: string
  content: string
  published: boolean
  publishedAt?: Date
  createdAt: Date
  updatedAt: Date
  author: {
    name: string
    email: string
  }
  tags: {
    id: string
    name: string
  }[]
}

export default function ArticlesClient() {
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    fetchArticles()
  }, [])

  const fetchArticles = async () => {
    try {
      const response = await fetch('/api/articles')
      if (response.ok) {
        const data = await response.json()
        setArticles(data.articles || [])
      }
    } catch (error) {
      console.error('获取文章失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除这篇文章吗？')) return
    
    try {
      const response = await fetch(`/api/articles/${id}`, {
        method: 'DELETE',
      })
      
      if (response.ok) {
        setArticles(articles.filter(article => article.id !== id))
      }
    } catch (error) {
      console.error('删除文章失败:', error)
    }
  }

  const filteredArticles = articles.filter(article =>
    article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    article.content.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (loading) {
    return (
      <div className="container mx-auto max-w-7xl p-6 lg:p-8">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/4 mb-6"></div>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-16 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto max-w-7xl p-6 lg:p-8">
      <div className="flex flex-col gap-6">
        {/* 头部 */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">文章管理</h1>
            <p className="text-muted-foreground mt-2">
              管理你的所有文章，包括已发布和草稿
            </p>
          </div>
          <Link href="/dashboard/articles/new">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              写新文章
            </Button>
          </Link>
        </div>

        {/* 搜索栏 */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="搜索文章..."
              value={searchQuery}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* 文章列表 */}
        <div className="space-y-4">
          {filteredArticles.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {searchQuery ? '没有找到匹配的文章' : '暂无文章'}
            </div>
          ) : (
            filteredArticles.map((article) => (
              <div key={article.id} className="border rounded-lg p-6 bg-card">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold">{article.title}</h3>
                      <Badge variant={article.published ? "default" : "secondary"}>
                        {article.published ? "已发布" : "草稿"}
                      </Badge>
                    </div>
                    {article.excerpt && (
                      <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
                        {article.excerpt}
                      </p>
                    )}
                    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        <span>{article.author.name}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(article.createdAt).toLocaleDateString('zh-CN')}</span>
                      </div>
                      {article.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {article.tags.map((tag) => (
                            <Badge key={tag.id} variant="outline" className="text-xs">
                              {tag.name}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link href={`/articles/${article.slug}`}>
                      <Button variant="secondary" size="sm">
                        <Eye className="w-4 h-4 mr-1" />
                        查看
                      </Button>
                    </Link>
                    <Link href={`/dashboard/articles/${article.id}/edit`}>
                      <Button variant="secondary" size="sm">
                        <Edit className="w-4 h-4 mr-1" />
                        编辑
                      </Button>
                    </Link>
                    <Button 
                      variant="danger" 
                      size="sm"
                      onClick={() => handleDelete(article.id)}
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      删除
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* 底部统计 */}
        <div className="flex justify-between items-center text-sm text-muted-foreground border-t pt-4">
          <span>
            共 {filteredArticles.length} 篇文章
            {searchQuery && ` (搜索: "${searchQuery}")`}
          </span>
          <span>
            已发布: {filteredArticles.filter(a => a.published).length} | 
            草稿: {filteredArticles.filter(a => !a.published).length}
          </span>
        </div>
      </div>
    </div>
  )
}