import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { updateTag, deleteTag } from '@/lib/tags'
import { z } from 'zod'
import { USER_ROLES } from '@/lib/constants'

// 更新标签的验证schema
const updateTagSchema = z.object({
  name: z.string().min(1, '标签名不能为空').max(50).optional(),
  slug: z.string().min(1, 'URL别名不能为空').regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'URL别名格式不正确').optional(),
  description: z.string().optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, '颜色格式不正确').optional(),
  icon: z.string().optional()
})

// GET /api/tags/[id] - 获取单个标签
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params
    const tag = await prisma.tag.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: {
            posts: true
          }
        }
      }
    })
    
    if (!tag) {
      return NextResponse.json({ error: '标签不存在' }, { status: 404 })
    }
    
    return NextResponse.json(tag)
  } catch (error) {
    console.error('获取标签失败:', error)
    return NextResponse.json({ error: '获取标签失败' }, { status: 500 })
  }
}

// PUT /api/tags/[id] - 更新标签
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: '请先登录' }, { status: 401 })
    }
    
    // 只有管理员可以更新标签
    if (session.user.role !== USER_ROLES.ADMIN) {
      return NextResponse.json({ error: '没有权限' }, { status: 403 })
    }
    
    const body = await request.json()
    const validatedData = updateTagSchema.parse(body)
    
    // 检查标签是否存在
    const existingTag = await prisma.tag.findUnique({
      where: { id: params.id }
    })
    
    if (!existingTag) {
      return NextResponse.json({ error: '标签不存在' }, { status: 404 })
    }
    
    // 如果更新slug，检查新slug是否已存在
    if (validatedData.slug && validatedData.slug !== existingTag.slug) {
      const slugExists = await prisma.tag.findUnique({
        where: { slug: validatedData.slug }
      })
      
      if (slugExists) {
        return NextResponse.json({ error: 'URL别名已存在' }, { status: 400 })
      }
    }
    
    const tag = await updateTag(params.id, validatedData)
    
    return NextResponse.json(tag)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: '输入验证失败', 
        details: error.errors 
      }, { status: 400 })
    }
    
    console.error('更新标签失败:', error)
    return NextResponse.json({ error: '更新标签失败' }, { status: 500 })
  }
}

// DELETE /api/tags/[id] - 删除标签
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: '请先登录' }, { status: 401 })
    }
    
    // 只有管理员可以删除标签
    if (session.user.role !== USER_ROLES.ADMIN) {
      return NextResponse.json({ error: '没有权限' }, { status: 403 })
    }
    
    // 检查标签是否存在
    const tag = await prisma.tag.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: {
            posts: true
          }
        }
      }
    })
    
    if (!tag) {
      return NextResponse.json({ error: '标签不存在' }, { status: 404 })
    }
    
    // 如果标签有关联文章，不允许删除
    if (tag._count.posts > 0) {
      return NextResponse.json({ 
        error: '该标签下还有文章，无法删除',
        postsCount: tag._count.posts
      }, { status: 400 })
    }
    
    await deleteTag(params.id)
    
    return NextResponse.json({ success: true, message: '标签已删除' })
  } catch (error) {
    console.error('删除标签失败:', error)
    return NextResponse.json({ error: '删除标签失败' }, { status: 500 })
  }
}