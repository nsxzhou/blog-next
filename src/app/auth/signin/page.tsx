"use client";

import { useState, useEffect, Suspense } from "react";
import { signIn, getSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/forms/Button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ToastHelper } from "@/lib/utils/toast";
import { BlogLayout } from "@/components/blog/layout/BlogLayout";

function SignInContent() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";
  
  // 检查用户是否已经登录
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const session = await getSession();
        if (session) {
          // 如果已经登录，重定向到首页
          router.push("/");
          return;
        }
      } catch (error) {
        console.error("检查认证状态失败:", error);
      } finally {
        setIsCheckingAuth(false);
      }
    };

    checkAuthStatus();
  }, [router]);

  // 从URL参数中读取消息
  useEffect(() => {
    const urlMessage = searchParams.get("message");
    if (urlMessage) {
      setMessage(urlMessage);
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const result = await signIn("credentials", {
        username,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("用户名或密码错误");
        ToastHelper.error("用户名或密码错误");
      } else {
        // 登录成功，跳转到回调URL或首页
        ToastHelper.success("登录成功");
        await getSession(); // 刷新会话
        router.push(callbackUrl);
        router.refresh();
      }
    } catch {
      setError("登录失败，请稍后重试");
      ToastHelper.error("登录失败，请稍后重试");
    } finally {
      setIsLoading(false);
    }
  };

  // 如果正在检查认证状态，显示加载状态
  if (isCheckingAuth) {
    return (
      <BlogLayout>
        <div className="flex items-center justify-center min-h-[calc(100vh-8rem)]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">检查登录状态...</p>
          </div>
        </div>
      </BlogLayout>
    );
  }

  return (
    <BlogLayout>
      <div className="flex items-center justify-center min-h-[calc(100vh-8rem)]">
        <div className="w-full max-w-md">
          <Card className="w-full">
            <CardHeader className="text-center">
              <div className="mx-auto h-16 w-16 rounded-full bg-blue-600 flex items-center justify-center mb-4">
                <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <div className="mb-4">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Blog Next</h1>
                <p className="text-gray-600">A Next.js blog application</p>
              </div>
              <CardTitle className="text-xl">登录</CardTitle>
              <CardDescription>
                请输入您的用户名和密码进行登录
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username">用户名或邮箱</Label>
                  <Input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">密码</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={isLoading}
                  />
                </div>
                {message && (
                  <div className="text-sm text-green-600">
                    {message}
                  </div>
                )}
                {error && (
                  <div className="text-sm text-red-600">
                    {error}
                  </div>
                )}
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? "登录中..." : "登录"}
                </Button>
              </form>
              <div className="mt-4 text-center text-sm">
                <span className="text-gray-600">还没有账号？</span>
                <Link href="/auth/signup" className="text-blue-600 hover:underline ml-1">
                  注册
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </BlogLayout>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={<div>加载中...</div>}>
      <SignInContent />
    </Suspense>
  );
}