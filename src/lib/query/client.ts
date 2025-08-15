import { QueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { PostService } from "@/lib/services/post.service";
import type { PostListQuery } from "@/types/blog/post";

// API 错误类型
interface ApiErrorResponse {
  status?: number;
  message?: string;
  code?: string;
}

// 创建QueryClient实例
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // 5分钟缓存时间
      staleTime: 5 * 60 * 1000,
      // 10分钟垃圾回收时间
      gcTime: 10 * 60 * 1000,
      // 窗口重新聚焦时重新获取
      refetchOnWindowFocus: false,
      // 网络重连时重新获取
      refetchOnReconnect: true,
      // 错误重试配置
      retry: (failureCount, error: ApiErrorResponse) => {
        // 401错误不重试
        if (error?.status === 401) return false;
        // 404错误不重试
        if (error?.status === 404) return false;
        // 最多重试3次
        return failureCount < 3;
      },
      // 重试延迟（指数退避）
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
    mutations: {
      // 变更操作错误处理
      onError: (error: ApiErrorResponse) => {
        console.error("Mutation error:", error);
        // 显示错误提示
        if (error?.message) {
          toast.error(error.message);
        } else {
          toast.error("操作失败，请重试");
        }
      },
      // 变更成功后自动重新获取相关查询
      onSettled: () => {
        // 这里可以添加全局的重新获取逻辑
      },
    },
  },
});

// 预获取工具函数
export const prefetchHelpers = {
  // 预获取文章列表
  prefetchPostList: async (query: PostListQuery = {}) => {
    await queryClient.prefetchQuery({
      queryKey: ["posts", "list", query],
      queryFn: async () => {
        const params = new URLSearchParams();
        Object.entries(query).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== "") {
            params.append(key, String(value));
          }
        });

        const response = await fetch(`/api/posts?${params.toString()}`);
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const result = await response.json();
        if (!result.success) {
          throw new Error(result.error || "获取文章列表失败");
        }

        return result.data;
      },
      staleTime: 2 * 60 * 1000, // 2分钟
    });
  },

  // 预获取文章详情（通过slug）
  prefetchPostBySlug: async (slug: string) => {
    await queryClient.prefetchQuery({
      queryKey: ["posts", "slug", slug],
      queryFn: async () => {
        try {
          const post = await PostService.getPostBySlug(slug);
          return post;
        } catch (error) {
          console.error("预取文章失败:", error);
          // 如果获取失败，返回 null，客户端会处理 404 情况
          return null;
        }
      },
      staleTime: 10 * 60 * 1000, // 10分钟
    });
  },

  // 预获取标签列表
  prefetchTagList: async () => {
    await queryClient.prefetchQuery({
      queryKey: ["tags", "list", {}],
      queryFn: async () => {
        const response = await fetch("/api/tags");
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const result = await response.json();
        if (!result.success) {
          throw new Error(result.error || "获取标签列表失败");
        }

        return result.data;
      },
      staleTime: 30 * 60 * 1000, // 30分钟
    });
  },

  // 预获取统计数据
  prefetchDashboardStats: async () => {
    await queryClient.prefetchQuery({
      queryKey: ["stats", "dashboard"],
      queryFn: async () => {
        const response = await fetch("/api/stats?type=dashboard");
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const result = await response.json();
        if (!result.success) {
          throw new Error(result.error || "获取统计数据失败");
        }

        return result.data;
      },
      staleTime: 30 * 1000, // 30秒
    });
  },
};

// 缓存管理工具函数
export const cacheHelpers = {
  // 清除所有文章相关缓存
  clearPostsCache: () => {
    queryClient.invalidateQueries({ queryKey: ["posts"] });
  },

  // 清除所有标签相关缓存
  clearTagsCache: () => {
    queryClient.invalidateQueries({ queryKey: ["tags"] });
  },

  // 清除所有媒体相关缓存
  clearMediaCache: () => {
    queryClient.invalidateQueries({ queryKey: ["media"] });
  },

  // 清除所有统计数据缓存
  clearStatsCache: () => {
    queryClient.invalidateQueries({ queryKey: ["stats"] });
  },

  // 清除所有缓存
  clearAllCache: () => {
    queryClient.clear();
  },
};

// 全局错误处理
queryClient.setMutationDefaults(["posts"], {
  onError: (error: ApiErrorResponse) => {
    console.error("Post mutation error:", error);
  },
});

queryClient.setMutationDefaults(["tags"], {
  onError: (error: ApiErrorResponse) => {
    console.error("Tag mutation error:", error);
  },
});

queryClient.setMutationDefaults(["media"], {
  onError: (error: ApiErrorResponse) => {
    console.error("Media mutation error:", error);
  },
});

// 获取QueryClient实例的函数
export function getQueryClient() {
  return queryClient;
}

export default queryClient;
