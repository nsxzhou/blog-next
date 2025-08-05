"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ToastHelper } from "@/lib/utils/toast";

/**
 * 搜索参数处理器组件
 * 
 * 功能：处理 URL 搜索参数中的消息显示
 * 特点：使用 Suspense 边界包装，避免预渲染错误
 */
export function SearchParamsHandler() {
  const searchParams = useSearchParams();
  const [hasShownMessage, setHasShownMessage] = useState(false);

  useEffect(() => {
    if (!hasShownMessage) {
      const message = searchParams.get("message");
      if (message) {
        ToastHelper.info(message);
        setHasShownMessage(true);
      }
    }
  }, [searchParams, hasShownMessage]);

  return null;
}