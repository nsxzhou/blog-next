import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createArticle, getArticles, getArticleStats } from '@/lib/articles'
import { PostStatus } from '@prisma/client'
import { z } from 'zod'
import { 
  postSchema, 
  paginationSchema, 
  postStatusSchema,
  validateRequest,
  safeValidateRequest 
} from '@/lib/validations'

// GET请求参数验证
const getPostsSchema = paginationSchema.extend({
  status: postStatusSchema.optional(),
  authorId: z.string().optional(),
  tag: z.string().optional(),
  search: z.string().optional(),
  orderBy: z.enum(['publishedAt', 'createdAt', 'updatedAt', 'title']).default('publishedAt'),
  order: z.enum(['asc', 'desc']).default('desc'),
})

// GET /api/posts - 获取文章列表
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    // 验证查询参数
    const validatedParams = validateRequest(getPostsSchema, {
      page: searchParams.get('page'),
      limit: searchParams.get('limit'),
      status: searchParams.get('status'),
      authorId: searchParams.get('authorId'),
      tag: searchParams.get('tag'),
      search: searchParams.get('search'),
      orderBy: searchParams.get('orderBy'),
      order: searchParams.get('order'),
    })
    
    const articles = await getArticles({
      status: validatedParams.status,
      authorId: validatedParams.authorId,
      tagSlug: validatedParams.tag,
      search: validatedParams.search,
      page: validatedParams.page,
      limit: validatedParams.limit,
      orderBy: validatedParams.orderBy as any,
      order: validatedParams.order
    })
    
    return NextResponse.json(articles)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: '参数验证失败', 
        details: error.errors 
      }, { status: 400 })
    }
    
    console.error('获取文章列表失败:', error)
    return NextResponse.json({ error: '获取文章列表失败' }, { status: 500 })
  }
}

// POST /api/posts - 创建文章
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: '请先登录' }, { status: 401 })
    }
    
    // 只有管理员可以创建文章
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: '没有权限' }, { status: 403 })
    }
    
    const body = await request.json()
    
    // 验证输入（使用通用的文章验证模式）
    const validatedData = validateRequest(postSchema.extend({
      summary: z.string().optional(), // 兼容旧字段名
      coverImage: z.string().url().optional().nullable(), // 兼容旧字段名
      tagIds: z.array(z.string()).optional(), // 标签ID数组
    }), body)
    
    // 创建文章
    const article = await createArticle({
      title: validatedData.title,
      slug: validatedData.slug,
      content: validatedData.content,
      excerpt: validatedData.summary || undefined,
      featuredImage: validatedData.coverImage || undefined,
      status: validatedData.status as PostStatus,
      isFeatured: validatedData.featured,
      tagIds: validatedData.tagIds || validatedData.tags,
      authorId: session.user.id
    })
    
    return NextResponse.json(article)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: '输入验证失败', 
        details: error.errors 
      }, { status: 400 })
    }
    
    console.error('创建文章失败:', error)
    return NextResponse.json({ error: '创建文章失败' }, { status: 500 })
  }
}