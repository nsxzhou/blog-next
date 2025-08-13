import { successResponse, errorResponse } from "@/lib/utils/api/response";
import { SearchService } from "@/lib/services/searchService";

/**
 * 搜索索引管理 API
 * 用于重建搜索索引
 */

export async function POST() {
  try {
    // 重建整个搜索索引
    await SearchService.rebuildIndex();
    return successResponse(null, "搜索索引重建成功");
  } catch (error) {
    console.error("重建搜索索引失败:", error);
    return errorResponse(
      'REBUILD_INDEX_ERROR', 
      error instanceof Error ? error.message : "重建索引失败",
      500
    );
  }
}

export async function GET() {
  return successResponse({ 
    message: "使用 POST 方法重建搜索索引" 
  }, "索引管理API");
}