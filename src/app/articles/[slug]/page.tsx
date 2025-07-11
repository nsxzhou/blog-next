import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import ArticleDetailClient from './client'
import { getArticleBySlug, getAllArticleSlugs } from '@/lib/articles'
import { formatPostDate } from '@/types/article'

interface PageProps {
  params: Promise<{
    slug: string
  }>
}

// 生成静态路径
export async function generateStaticParams() {
  const slugs = await getAllArticleSlugs()
  return slugs.map((slug) => ({
    slug,
  }))
}

// 生成元数据
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const article = await getArticleBySlug(slug)
  
  if (!article) {
    return {
      title: '文章未找到',
    }
  }

  return {
    title: article.title,
    description: article.excerpt || '',
    keywords: article.metaKeywords || undefined,
    authors: [{ name: article.author.name }],
    openGraph: {
      title: article.title,
      description: article.excerpt || '',
      type: 'article',
      publishedTime: article.publishedAt?.toISOString(),
      authors: [article.author.name],
      images: article.featuredImage ? [article.featuredImage] : [],
      tags: article.tags.map(t => t.tag.name),
    },
    twitter: {
      card: 'summary_large_image',
      title: article.title,
      description: article.excerpt || '',
      images: article.featuredImage ? [article.featuredImage] : [],
    },
  }
}

export default async function ArticleDetailPage({ params }: PageProps) {
  const { slug } = await params
  const article = await getArticleBySlug(slug)

  if (!article) {
    notFound()
  }

  return <ArticleDetailClient article={article} />
}