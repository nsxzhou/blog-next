import { DefaultSession, DefaultUser } from "next-auth"; // 导入NextAuth的默认类型定义

declare module "next-auth" {
  // 扩展NextAuth模块的类型声明
  interface Session {
    // 扩展Session接口
    user: {
      // 扩展user对象
      id: string; // 添加用户ID字段
      username: string; // 添加用户名字段
      role: string; // 添加用户角色字段
    } & DefaultSession["user"]; // 合并默认的Session user属性
  }

  interface User extends DefaultUser {
    // 扩展User接口
    role: string; // 添加角色字段
    username: string; // 添加用户名字段
  }
}

declare module "next-auth/jwt" {
  // 扩展JWT模块的类型声明
  interface JWT {
    // 扩展JWT接口
    role: string; // 添加角色字段
    username: string; // 添加用户名字段
  }
}
