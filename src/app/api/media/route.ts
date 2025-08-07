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

    const deletedCount = await MediaService.batchDeleteMedia(ids)
    return successResponse(
      { deletedCount },
      `成功删除 ${deletedCount} 个媒体文件`
    )
  } catch (error) {
    if (error instanceof Error && error.message === "未授权访问") {
      return errorResponse("UNAUTHORIZED", "请先登录", 401)
    }
    console.error("批量删除媒体文件失败:", error)
    return handleValidationError(error)
  }
}