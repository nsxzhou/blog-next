import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getAllTags, createTag, findOrCreateTags } from '@/lib/tags'
import { z } from 'zod'
import { tagSchema, validateRequest } from '@/lib/validations'
import { USER_ROLES } from '@/lib/constants'

// 批量创建标签的验证schema
const batchCreateTagsSchema = z.object({
  names: z.array(z.string().min(1)).min(1, '至少需要一个标签名')
})

// 扩展标签schema以支持颜色和图标
const createTagWithExtrasSchema = tagSchema.extend({
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, '颜色格式不正确').optional(),
  icon: z.string().optional()
})

// GET /api/tags - 获取所有标签
export async function GET() {
  try {
    const tags = await getAllTags()
    return NextResponse.json(tags)
  } catch (error) {
    console.error('获取标签列表失败:', error)
    return NextResponse.json({ error: '获取标签列表失败' }, { status: 500 })
  }
}

// POST /api/tags - 创建标签
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: '请先登录' }, { status: 401 })
    }
    
    // 只有管理员可以创建标签
    if (session.user.role !== USER_ROLES.ADMIN) {
      return NextResponse.json({ error: '没有权限' }, { status: 403 })
    }
    
    const body = await request.json()
    
    // 批量创建标签（通过名称）
    if (body.names && Array.isArray(body.names)) {
      const validatedData = validateRequest(batchCreateTagsSchema, body)
      const tags = await findOrCreateTags(validatedData.names)
      return NextResponse.json(tags)
    }
    
    // 创建单个标签
    const validatedData = validateRequest(createTagWithExtrasSchema, body)
    const tag = await createTag(validatedData)
    
    return NextResponse.json(tag)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: '输入验证失败', 
        details: error.errors 
      }, { status: 400 })
    }
    
    console.error('创建标签失败:', error)
    return NextResponse.json({ error: '创建标签失败' }, { status: 500 })
  }
}