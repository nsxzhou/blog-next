import { NextRequest } from "next/server"
import { successResponse, errorResponse } from "@/lib/utils/api/response"
import { MediaService } from "@/lib/services/media.service"
import {
  validateQueryParams,
  validateRequest,
  handleValidationError,
} from "@/lib/utils/validation"
import { 
  MediaListQuerySchema, 
  CreateMediaSchema, 
  BatchDeleteMediaSchema 
} from "@/lib/validations/media"
import { requireAuth } from "@/lib/auth-helpers"
import { createCOSService } from "@/lib/services/cos.service"

/**
 * 获取媒体文件列表 - GET /api/media
 * 支持分页、搜索、按类型过滤和排序
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = await validateQueryParams(MediaListQuerySchema, searchParams)

    const result = await MediaService.getMediaList(query)
    return successResponse(result, "获取媒体文件列表成功")
  } catch (error) {
    console.error("获取媒体文件列表失败:", error)
    return handleValidationError(error)
  }
}

/**
 * 创建媒体文件记录 - POST /api/media
 * 用于上传文件后创建数据库记录
 */
export async function POST(request: NextRequest) {
  try {
    await requireAuth()
    const body = await request.json()
    const validatedData = await validateRequest(CreateMediaSchema, body)

    const result = await MediaService.createMedia(validatedData)
    return successResponse(result, "创建媒体文件记录成功", 201)
  } catch (error) {
    if (error instanceof Error && error.message === "未授权访问") {
      return errorResponse("UNAUTHORIZED", "请先登录", 401)
    }
    console.error("创建媒体文件记录失败:", error)
    return handleValidationError(error)
  }
}

/**
 * 批量删除媒体文件 - DELETE /api/media
 * 支持同时删除多个媒体文件
 */
export async function DELETE(request: NextRequest) {
  try {
    await requireAuth()
    const body = await request.json()
    const { ids } = await validateRequest(BatchDeleteMediaSchema, body)

    // 检查文件使用情况
    const usageChecks = await Promise.all(
      ids.map(id => MediaService.checkMediaUsage(id))
    )

    const inUseFiles = usageChecks
      .filter(check => check.inUse)
      .map((check, index) => ({ id: ids[index], ...check }))

    if (inUseFiles.length > 0) {
      return errorResponse(
        "MEDIA_IN_USE",
        `有 ${inUseFiles.length} 个文件正在使用中，无法删除`,
        400
      )
    }

    // 获取要删除的媒体文件列表
    const mediaList = await Promise.all(
      ids.map(id => MediaService.getMediaById(id))
    )
    
    const validMedia = mediaList.filter(media => media !== null)
    const cosKeys = validMedia.map(media => media!.path)
    
    // 批量删除COS文件
    let cosDeleteSuccess = true
    try {
      const cosService = createCOSService()
      const deleteResults = await cosService.batchDeleteFiles(cosKeys)
      
      // 检查是否有删除失败的文件
      const failedDeletes = deleteResults.filter(result => !result.success)
      if (failedDeletes.length > 0) {
        console.error('部分COS文件删除失败:', failedDeletes)
        cosDeleteSuccess = false
      }
    } catch (cosError) {
      console.error('COS批量删除失败:', cosError)
      cosDeleteSuccess = false
    }

    // 删除数据库记录
    const deletedCount = await MediaService.batchDeleteMedia(ids)
    
    const message = cosDeleteSuccess 
      ? `成功删除 ${deletedCount} 个媒体文件`
      : `成功删除 ${deletedCount} 个媒体文件，部分COS文件删除失败，请检查日志`
    
    return successResponse(
      { deletedCount, cosDeleteSuccess },
      message
    )
  } catch (error) {
    if (error instanceof Error && error.message === "未授权访问") {
      return errorResponse("UNAUTHORIZED", "请先登录", 401)
    }
    console.error("批量删除媒体文件失败:", error)
    return handleValidationError(error)
  }
}