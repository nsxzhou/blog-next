import { withAuth } from "next-auth/middleware";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token; // 从请求中获取 NextAuth token
    const isAdmin = token?.role === "ADMIN"; // 检查用户角色是否为管理员

    if (req.nextUrl.pathname.startsWith("/admin") && !isAdmin) {
      // 如果访问管理员路径但不是管理员
      const url = new URL("/auth/signin", req.url); // 创建登录页 URL
      url.searchParams.set("callbackUrl", req.url); // 设置回调 URL（当前页面）
      return Response.redirect(url); // 重定向到登录页
    }
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token, // 仅当 token 存在时授权（用户已登录）
    },
  }
);

export const config = {
  matcher: [
    "/admin/:path*", // 匹配所有 /admin 开头的路径
    "/api/posts/:path*", // 匹配所有 /api/posts 开头的路径
    "/api/auth/me", // 精确匹配 /api/auth/me 路径
  ],
};
