import { NextRequest } from "next/server";
import { successResponse } from "@/lib/utils/api/response";
import { SearchService } from "@/lib/services/searchService";
import {
  validateQueryParams,
  handleValidationError,
} from "@/lib/utils/validation";
import { SearchQuerySchema } from "@/lib/validations/search";

/**
 * 搜索API路由
 * 方法：GET
 * 参数：
 *   - q: 搜索关键词
 *   - type: 内容类型（post/page/tag，可选）
 *   - limit: 结果数量限制（可选，默认20）
 *   - page: 页码（可选，默认1）
 *   - pageSize: 每页数量（可选，默认20）
 */

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = await validateQueryParams(SearchQuerySchema, searchParams);

    const result = await SearchService.search(query);
    return successResponse(result, "搜索成功");
  } catch (error) {
    console.error("搜索失败:", error);
    return handleValidationError(error);
  }
}
