/**
 * Prisma 数据库客户端单例管理
 * 
 * 这个文件的作用就像小区的"物业管理员"，负责管理整个应用的数据库连接
 * 确保整个应用只有一个数据库连接实例，避免资源浪费和连接数过多的问题
 */

import { PrismaClient } from '@prisma/client'

/**
 * 【方案一：推荐方案】
 * 使用 globalThis 创建全局单例模式
 */

/**
 * 创建一个类型安全的全局对象，用于存储 Prisma 客户端实例
 * 
 * 为什么使用 globalThis：
 * - globalThis 是 ES2020 标准，在浏览器和 Node.js 环境中都可用
 * - 它相当于浏览器中的 window 对象，但在 Node.js 中是全局的
 * - 比直接使用 global 更标准，兼容性更好
 * 
 * 为什么使用类型断言：
 * - TypeScript 默认不知道 globalThis 上有 prisma 属性
 * - 通过类型断言告诉 TypeScript 这个属性的类型
 * - 确保类型安全，避免运行时错误
 */
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

/**
 * 导出 Prisma 客户端实例 - 整个应用的数据库连接入口
 * 
 * 单例模式实现：
 * - 使用空值合并运算符(??)进行条件创建
 * - 如果 globalForPrisma.prisma 已存在，直接使用
 * - 如果不存在（null 或 undefined），创建新的 PrismaClient 实例
 * 
 * 好处：
 * - 避免创建多个数据库连接，节省资源
 * - 防止连接数超过数据库限制
 * - 保证数据一致性
 */
export const prisma = globalForPrisma.prisma ?? new PrismaClient()

/**
 * 开发环境优化：防止热重载时重复创建连接
 * 
 * 开发环境的问题：
 * - Next.js 在开发时会进行热重载（Hot Reload）
 * - 每次代码修改都会重新执行模块
 * - 如果不缓存，每次都会创建新的数据库连接
 * - 最终导致连接数过多，数据库拒绝连接
 * 
 * 解决方案：
 * - 只在开发环境中缓存 Prisma 实例到全局对象
 * - 生产环境不需要缓存，因为不会频繁重载
 */
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

/**
 * 【方案二：备用方案】
 * 使用 global 对象的传统方式
 * 
 * 这种方式需要声明全局类型，相对复杂一些
 * 但在某些环境下可能更兼容
 */

/**
 * 声明全局类型以避免 TypeScript 错误
 * 告诉 TypeScript 全局对象上有 prisma 属性
 */
// declare global {
//   var prisma: PrismaClient | undefined
// }

/**
 * 创建单例模式的 Prisma 客户端
 * 使用逻辑或运算符(||)，如果 global.prisma 不存在就创建新实例
 */
// export const prisma = global.prisma || new PrismaClient()

/**
 * 在开发环境中避免重复创建客户端
 * 将实例缓存到全局对象中
 */
// if (process.env.NODE_ENV !== 'production') {
//   global.prisma = prisma
// }

/**
 * 使用示例：
 * 
 * // 在其他文件中使用
 * import { prisma } from '@/lib/prisma'
 * 
 * // 查询用户
 * const user = await prisma.user.findUnique({
 *   where: { id: userId }
 * })
 * 
 * // 创建文章
 * const post = await prisma.post.create({
 *   data: {
 *     title: '我的文章',
 *     content: '文章内容',
 *     authorId: userId
 *   }
 * })
 */
