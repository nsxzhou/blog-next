import NextAuth, { AuthOptions } from "next-auth"; // 导入NextAuth核心功能和AuthOptions类型
import CredentialsProvider from "next-auth/providers/credentials"; // 导入基于凭证的认证提供者
import bcrypt from "bcrypt"; // 导入bcrypt用于密码哈希验证
import prisma from "@/lib/db"; // 导入Prisma数据库客户端
import { CredentialsSchema } from "@/lib/validations/auth"; // 导入凭证验证规则

const authOptions: AuthOptions = {
  // 定义认证配置选项
  providers: [
    // 配置认证提供者列表
    CredentialsProvider({
      // 使用基于用户名/密码的凭证认证
      name: "credentials", // 提供者名称
      credentials: {
        // 定义凭证输入字段
        username: { label: "用户名", type: "text" }, // 用户名字段
        password: { label: "密码", type: "password" }, // 密码字段
      },
      async authorize(credentials) {
        // 自定义认证逻辑
        try {
          // 验证凭证格式
          const validatedCredentials = CredentialsSchema.parse(credentials);
          
          const user = await prisma.user.findFirst({
            // 在数据库中查找用户
            where: {
              OR: [
                // 支持用户名或邮箱登录
                { username: validatedCredentials.username },
                { email: validatedCredentials.username },
              ],
              status: "ACTIVE", // 只查找状态为活跃的用户
            },
          });

          if (!user) {
            // 用户不存在
            return null;
          }

          const isPasswordValid = await bcrypt.compare(
            validatedCredentials.password,
            user.password
          ); // 验证密码
          if (!isPasswordValid) {
            // 密码不匹配
            return null;
          }

          return {
            // 认证成功，返回用户信息
            id: user.id,
            username: user.username,
            email: user.email,
            name: user.name,
            role: user.role,
          };
        } catch (error) {
          // 处理数据库错误
          console.error("认证错误:", error);
          return null;
        }
      },
    }),
  ],
  session: {
    // 会话配置
    strategy: "jwt", // 使用JWT作为会话存储策略
  },
  callbacks: {
    // 自定义回调函数
    async jwt({ token, user }) {
      // 在JWT创建/更新时执行
      if (user) {
        // 首次登录时
        token.role = user.role; // 将用户角色添加到JWT
        token.username = user.username; // 将用户名添加到JWT
      }
      return token; // 返回更新后的JWT
    },
    async session({ session, token }) {
      // 在访问会话时执行
      if (token) {
        // 当JWT存在时
        session.user.id = token.sub!; // 将用户ID添加到会话
        session.user.role = token.role as string; // 将角色添加到会话
        session.user.username = token.username as string; // 将用户名添加到会话
      }
      return session; // 返回更新后的会话
    },
  },
  pages: {
    // 自定义页面路由
    signIn: "/auth/signin", // 登录页面路径
  },
  secret: process.env.NEXTAUTH_SECRET, // 使用环境变量作为签名密钥
};

const handler = NextAuth(authOptions); // 创建NextAuth处理函数

export { handler as GET, handler as POST, authOptions }; // 导出API路由处理函数和配置
