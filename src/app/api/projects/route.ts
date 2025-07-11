import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getProjects, createProject } from '@/lib/projects'
import { ProjectStatus } from '@prisma/client'
import { z } from 'zod'
import { 
  projectSchema,
  paginationSchema,
  projectStatusSchema,
  validateRequest 
} from '@/lib/validations'

// GET请求参数验证
const getProjectsSchema = paginationSchema.extend({
  status: projectStatusSchema.optional(),
  featured: z.coerce.boolean().optional(),
  search: z.string().optional(),
  techStack: z.string().optional(),
  orderBy: z.enum(['order', 'createdAt', 'updatedAt', 'title']).default('order'),
  order: z.enum(['asc', 'desc']).default('asc'),
})

// GET /api/projects - 获取项目列表
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    // 验证查询参数
    const validatedParams = validateRequest(getProjectsSchema, {
      page: searchParams.get('page'),
      limit: searchParams.get('limit'),
      status: searchParams.get('status'),
      featured: searchParams.get('featured'),
      search: searchParams.get('search'),
      techStack: searchParams.get('techStack'),
      orderBy: searchParams.get('orderBy'),
      order: searchParams.get('order'),
    })
    
    const projects = await getProjects({
      status: validatedParams.status,
      featured: validatedParams.featured,
      search: validatedParams.search,
      techStack: validatedParams.techStack,
      page: validatedParams.page,
      limit: validatedParams.limit,
      orderBy: validatedParams.orderBy as any,
      order: validatedParams.order
    })
    
    return NextResponse.json(projects)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: '参数验证失败', 
        details: error.errors 
      }, { status: 400 })
    }
    
    console.error('获取项目列表失败:', error)
    return NextResponse.json({ error: '获取项目列表失败' }, { status: 500 })
  }
}

// POST /api/projects - 创建项目
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: '请先登录' }, { status: 401 })
    }
    
    // 只有管理员可以创建项目
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: '没有权限' }, { status: 403 })
    }
    
    const body = await request.json()
    
    // 验证输入
    const validatedData = validateRequest(projectSchema, body)
    
    // 创建项目
    const project = await createProject({
      title: validatedData.title,
      slug: validatedData.slug,
      description: validatedData.description,
      content: validatedData.content,
      coverImage: validatedData.coverImage || undefined,
      demoUrl: validatedData.demoUrl || undefined,
      githubUrl: validatedData.githubUrl || undefined,
      techStack: validatedData.techStack,
      status: validatedData.status as ProjectStatus,
      featured: validatedData.featured,
      order: validatedData.order
    })
    
    return NextResponse.json(project)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: '输入验证失败', 
        details: error.errors 
      }, { status: 400 })
    }
    
    console.error('创建项目失败:', error)
    return NextResponse.json({ error: '创建项目失败' }, { status: 500 })
  }
}