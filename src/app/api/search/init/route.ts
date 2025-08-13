import { successResponse, errorResponse } from "@/lib/utils/api/response";
import { SearchIndexSync } from "@/lib/utils/searchIndexSync";

/**
 * 搜索索引初始化 API
 * 用于应用启动时或需要时重建搜索索引
 */

export async function POST() {
  try {
    console.log('开始重建搜索索引...');
    await SearchIndexSync.rebuildIndex();
    return successResponse(
      { message: "搜索索引初始化完成" }, 
      "搜索索引初始化成功"
    );
  } catch (error) {
    console.error("搜索索引初始化失败:", error);
    return errorResponse(
      'INDEX_INIT_ERROR', 
      error instanceof Error ? error.message : "初始化失败",
      500
    );
  }
}

export async function GET() {
  return successResponse({ 
    message: "搜索索引初始化端点",
    usage: "使用 POST 方法重建搜索索引"
  });
}