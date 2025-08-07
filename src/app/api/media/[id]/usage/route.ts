import { NextRequest } from "next/server"
import { successResponse, errorResponse } from "@/lib/utils/api/response"
import { MediaService } from "@/lib/services/media.service"
import { handleValidationError } from "@/lib/utils/validation"

interface RouteParams {
  params: Promise<{ id: string }>
}

/**
 * 检查媒体文件使用情况 - GET /api/media/[id]/usage
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params

    if (!id) {
      return errorResponse("INVALID_ID", "媒体文件ID不能为空", 400)
    }

    const usage = await MediaService.checkMediaUsage(id)
    return successResponse(usage, "获取媒体文件使用情况成功")
  } catch (error) {
    console.error("检查媒体文件使用情况失败:", error)
    return handleValidationError(error)
  }
}