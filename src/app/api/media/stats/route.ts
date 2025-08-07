import { NextResponse } from 'next/server'
import { MediaService } from '@/lib/services/media.service'

/**
 * 获取媒体统计信息
 * GET /api/media/stats
 */
export async function GET() {
  try {
    const stats = await MediaService.getMediaStats()
    
    return NextResponse.json({
      success: true,
      data: stats
    })
  } catch (error) {
    console.error('获取媒体统计信息失败:', error)
    
    return NextResponse.json(
      {
        success: false,
        error: '获取媒体统计信息失败',
        message: error instanceof Error ? error.message : '未知错误'
      },
      { status: 500 }
    )
  }
}