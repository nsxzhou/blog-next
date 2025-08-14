import { NextRequest } from "next/server"
import { successResponse, errorResponse, notFoundResponse } from "@/lib/utils/api/response"
import { MediaService } from "@/lib/services/media.service"
import {
  validateRequest,
  handleValidationError,
} from "@/lib/utils/validation"
import { UpdateMediaSchema } from "@/lib/validations/media"
import { requireAuth } from "@/lib/auth-helpers"
import { createCOSService } from "@/lib/services/cos.service"

interface RouteParams {
  params: Promise<{ id: string }>
}

/**
 * 获取单个媒体文件详情 - GET /api/media/[id]
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params

    if (!id) {
      return errorResponse("INVALID_ID", "媒体文件ID不能为空", 400)
    }

    const media = await MediaService.getMediaById(id)
    
    if (!media) {
      return notFoundResponse("媒体文件不存在")
    }

    return successResponse(media, "获取媒体文件详情成功")
  } catch (error) {
    console.error("获取媒体文件详情失败:", error)
    return handleValidationError(error)
  }
}

/**
 * 更新媒体文件信息 - PUT /api/media/[id]
 * 目前主要支持更新alt文本
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    await requireAuth()
    const { id } = await params

    if (!id) {
      return errorResponse("INVALID_ID", "媒体文件ID不能为空", 400)
    }

    const body = await request.json()
    const validatedData = await validateRequest(UpdateMediaSchema, body)

    try {
      const result = await MediaService.updateMedia(id, validatedData)
      return successResponse(result, "更新媒体文件信息成功")
    } catch (serviceError) {
      if (serviceError instanceof Error && serviceError.message === "媒体文件不存在") {
        return notFoundResponse("媒体文件不存在")
      }
      throw serviceError
    }
  } catch (error) {
    if (error instanceof Error && error.message === "未授权访问") {
      return errorResponse("UNAUTHORIZED", "请先登录", 401)
    }
    console.error("更新媒体文件信息失败:", error)
    return handleValidationError(error)
  }
}

/**
 * 删除单个媒体文件 - DELETE /api/media/[id]
 * 删除前会检查文件是否正在使用
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    await requireAuth()
    const { id } = await params

    if (!id) {
      return errorResponse("INVALID_ID", "媒体文件ID不能为空", 400)
    }

    // 检查文件是否正在使用
    const usage = await MediaService.checkMediaUsage(id)
    
    if (usage.inUse) {
      const usageDetails = []
      if (usage.posts.length > 0) {
        usageDetails.push(`文章: ${usage.posts.map(p => p?.title).join(", ")}`)
      }
      if (usage.pages.length > 0) {
        usageDetails.push(`页面: ${usage.pages.map(p => p?.title).join(", ")}`)
      }
      
      return errorResponse(
        "MEDIA_IN_USE",
        `该媒体文件正在被以下内容使用，无法删除：${usageDetails.join("；")}`,
        400
      )
    }

    try {
      // 获取媒体文件信息
      const media = await MediaService.getMediaById(id)
      if (!media) {
        return notFoundResponse("媒体文件不存在")
      }

      // 删除COS文件
      try {
        const cosService = createCOSService()
        const deleteResult = await cosService.deleteFile(media.path)
        
        if (!deleteResult.success) {
          console.error(`COS文件删除失败: ${media.path}`, deleteResult.error)
          // COS删除失败时，可以选择是否继续删除数据库记录
          // 这里选择继续删除，避免数据库中出现孤立记录
        }
      } catch (cosError) {
        console.error('COS删除失败:', cosError)
        // COS删除失败时，可以选择是否继续删除数据库记录
        // 这里选择继续删除，避免数据库中出现孤立记录
      }

      // 删除数据库记录
      await MediaService.deleteMedia(id)
      return successResponse(null, "删除媒体文件成功")
    } catch (serviceError) {
      if (serviceError instanceof Error && serviceError.message === "媒体文件不存在") {
        return notFoundResponse("媒体文件不存在")
      }
      throw serviceError
    }
  } catch (error) {
    if (error instanceof Error && error.message === "未授权访问") {
      return errorResponse("UNAUTHORIZED", "请先登录", 401)
    }
    console.error("删除媒体文件失败:", error)
    return handleValidationError(error)
  }
}