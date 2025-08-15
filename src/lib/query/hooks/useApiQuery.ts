import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { UseQueryOptions } from "../../../types/api/common";

// API错误响应类型
interface ApiErrorResponse {
  status?: number;
  message?: string;
  code?: string;
}

// API查询选项
interface ApiQueryOptions extends UseQueryOptions {
  enabled?: boolean;
  refetchOnMount?: boolean;
  refetchOnWindowFocus?: boolean;
  staleTime?: number;
  gcTime?: number;
}

// API变更选项
interface ApiMutationOptions<T = unknown> {
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
  onSettled?: (data: T | undefined, error: Error | undefined) => void;
  retry?: number;
  invalidateQueries?: string[][];
  successMessage?: string;
}

/**
 * 通用的API查询Hook
 * @param queryKey 查询键
 * @param queryFn 查询函数
 * @param options 查询选项
 */
export function useApiQuery<T = unknown>(
  queryKey: readonly unknown[],
  queryFn: () => Promise<T>,
  options: ApiQueryOptions = {}
) {
  const {
    enabled = true,
    refetchOnMount = true,
    refetchOnWindowFocus = false,
    staleTime = 5 * 60 * 1000, // 5分钟
    gcTime = 10 * 60 * 1000, // 10分钟
  } = options;

  return useQuery({
    queryKey,
    queryFn,
    enabled,
    refetchOnMount,
    refetchOnWindowFocus,
    staleTime,
    gcTime,
    retry: (failureCount, error: ApiErrorResponse) => {
      // 401和404错误不重试
      if (error?.status === 401 || error?.status === 404) return false;
      return failureCount < 3;
    },
  });
}

/**
 * 通用的API变更Hook
 * @param mutationFn 变更函数
 * @param options 变更选项
 */
export function useApiMutation<T = unknown, V = unknown>(
  mutationFn: (variables: V) => Promise<T>,
  options: ApiMutationOptions<T> = {}
) {
  const queryClient = useQueryClient();
  const {
    onSuccess,
    onError,
    onSettled,
    invalidateQueries = [],
    successMessage,
  } = options;

  return useMutation({
    mutationFn: async (variables: V) => {
      const result = await mutationFn(variables);
      return result;
    },
    onSuccess: (data) => {
      // 使相关查询失效
      invalidateQueries.forEach((queryKey) => {
        queryClient.invalidateQueries({ queryKey: queryKey as string[] });
      });

      // 显示成功消息
      if (successMessage) {
        toast.success(successMessage);
      }

      // 调用自定义成功回调
      onSuccess?.(data);
    },
    onError: (error: Error) => {
      console.error("Mutation error:", error);
      // 调用自定义错误回调
      onError?.(error);
    },
    onSettled: (data, error) => {
      // 调用自定义settled回调
      onSettled?.(data, error || undefined);
    },
  });
}
