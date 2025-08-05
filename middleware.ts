import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export default async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // 使用 NextAuth 的 getToken 方法进行更可靠的会话验证
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
    cookieName:
      process.env.NODE_ENV === "production"
        ? "__Secure-next-auth.session-token"
        : "next-auth.session-token",
  });

  // 检查是否为管理员页面
  if (pathname.startsWith("/admin")) {
    // 如果没有 token，重定向到登录页面
    if (!token) {
      const url = new URL("/auth/signin", req.url);
      url.searchParams.set("callbackUrl", req.url);
      return NextResponse.redirect(url);
    }

    // 只允许 ADMIN 角色访问后台
    if (token.role !== "ADMIN") {
      const url = new URL("/", req.url);
      url.searchParams.set("message", "作者后台功能暂未开放");
      return NextResponse.redirect(url);
    }
  }

  // 检查是否为受保护的 API 路由
  if (pathname.startsWith("/api/posts") || pathname === "/api/auth/me") {
    // 如果没有 token，返回 401 错误
    if (!token) {
      return new NextResponse(JSON.stringify({ error: "未授权访问" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*", // 匹配所有 /admin 开头的路径
    "/api/posts/:path*", // 匹配所有 /api/posts 开头的路径
    "/api/auth/me", // 精确匹配 /api/auth/me 路径
    "/auth/signin", // 精确匹配登录页面
    "/auth/signup", // 精确匹配注册页面
    "/((?!api|_next/static|_next/image|favicon.ico).*)", // 匹配所有其他路径（除了静态资源）
  ],
};
