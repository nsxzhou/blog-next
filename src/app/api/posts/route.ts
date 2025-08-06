import { NextRequest } from "next/server";
import { successResponse, errorResponse } from "@/lib/utils/api/response";
import { PostService } from "@/lib/services/post.service";
import {
  validateQueryParams,
  validateRequest,
  handleValidationError,
} from "@/lib/utils/validation";
import { PostListQuerySchema, CreatePostSchema } from "@/lib/validations/post";
import { requireAuth } from "@/lib/auth-helpers";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = await validateQueryParams(PostListQuerySchema, searchParams);

    const result = await PostService.getPostList(query);
    return successResponse(result, "获取文章列表成功");
  } catch (error) {
    console.error("获取文章列表失败:", error);
    return handleValidationError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await request.json();
    const validatedData = await validateRequest(CreatePostSchema, body);
    console.log(user);
    const postData = {
      ...validatedData,
      authorId: user.id,
    };

    const result = await PostService.createPost(postData);
    return successResponse(result, "创建文章成功", 201);
  } catch (error) {
    if (error instanceof Error && error.message === "未授权访问") {
      return errorResponse("UNAUTHORIZED", "请先登录", 401);
    }
    console.error("创建文章失败:", error);
    return handleValidationError(error);
  }
}
