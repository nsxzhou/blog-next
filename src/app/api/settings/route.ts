import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getSettings, saveSettings, clearSettingsCache } from '@/lib/settings'
import { z } from 'zod'
import { settingSchema, settingsSchema, validateRequest } from '@/lib/validations'
import { USER_ROLES } from '@/lib/constants'

// GET /api/settings - 获取所有设置
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: '请先登录' }, { status: 401 })
    }
    
    // 只有管理员可以查看设置
    if (session.user.role !== USER_ROLES.ADMIN) {
      return NextResponse.json({ error: '没有权限' }, { status: 403 })
    }
    
    const settings = await getSettings()
    
    // 转换为键值对格式 - 处理Json类型字段
    const settingsMap: Record<string, any> = {}
    for (const setting of settings) {
      // value字段在数据库中是Json类型，直接使用
      settingsMap[setting.key] = setting.value
    }
    
    return NextResponse.json(settingsMap)
  } catch (error) {
    console.error('获取设置失败:', error)
    return NextResponse.json({ error: '获取设置失败' }, { status: 500 })
  }
}

// POST /api/settings - 批量保存设置
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: '请先登录' }, { status: 401 })
    }
    
    // 只有管理员可以修改设置
    if (session.user.role !== USER_ROLES.ADMIN) {
      return NextResponse.json({ error: '没有权限' }, { status: 403 })
    }
    
    const body = await request.json()
    
    // 支持两种格式：数组格式和对象格式
    let settingsToSave: Array<{ key: string; value: any; description?: string }>
    
    if (Array.isArray(body)) {
      // 数组格式
      settingsToSave = validateRequest(settingsSchema, body) as Array<{ key: string; value: any; description?: string }>
    } else {
      // 对象格式：将对象转换为数组
      settingsToSave = Object.entries(body).map(([key, value]) => ({
        key,
        value: value ?? null, // 使用 nullish coalescing 确保 value 有值
        description: undefined
      }))
    }
    
    const results = await saveSettings(settingsToSave)
    
    // 清除缓存
    clearSettingsCache()
    
    return NextResponse.json({ 
      success: true,
      updated: results.length,
      message: '设置已保存'
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: '输入验证失败', 
        details: error.errors 
      }, { status: 400 })
    }
    
    console.error('保存设置失败:', error)
    return NextResponse.json({ error: '保存设置失败' }, { status: 500 })
  }
}