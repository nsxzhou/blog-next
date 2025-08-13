import { NextRequest, NextResponse } from 'next/server'
import { MediaService } from '@/lib/services/media.service'

/**
 * 获取随机图片 API 端点
 * 
 * 支持的查询参数：
 * - count: 返回图片数量，默认 1
 * - type: 媒体类型，默认 'image'
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const count = parseInt(searchParams.get('count') || '1')
    const type = searchParams.get('type') || 'image'

    // 验证参数
    if (isNaN(count) || count < 1 || count > 10) {
      return NextResponse.json(
        { success: false, error: 'count 参数必须在 1-10 之间' },
        { status: 400 }
      )
    }

    // 获取随机图片
    const randomImages = await MediaService.getRandomImages(count, type)

    return NextResponse.json({
      success: true,
      data: randomImages
    })
  } catch (error) {
    console.error('获取随机图片失败:', error)
    return NextResponse.json(
      { success: false, error: '获取随机图片失败' },
      { status: 500 }
    )
  }
}