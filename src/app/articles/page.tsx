import React from 'react'
import { getArticles } from '@/lib/articles'
import { getPopularTags } from '@/lib/tags'
import ArticleListClient from './ArticleListClient'
import ArticlePageHeader from './ArticlePageHeader'

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
          <ArticlePageHeader 
            tags={tags} 
            selectedTag={selectedTag} 
            totalArticles={articles.length} 
          />
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