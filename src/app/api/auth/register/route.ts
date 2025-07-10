/**
 * 用户注册 API 路由
 * 
 * 这个文件就像银行的"开户窗口"，负责处理新用户的注册请求
 * 
 * 主要功能：
 * - 接收用户注册信息（姓名、邮箱、密码）
 * - 验证数据格式和完整性
 * - 检查邮箱是否已被注册
 * - 加密用户密码
 * - 在数据库中创建用户记录
 * - 返回注册结果
 * 
 * 安全措施：
 * - 使用 Zod 进行数据验证
 * - 使用 bcrypt 加密密码
 * - 不返回敏感信息（如密码）
 * - 详细的错误处理
 */

import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

/**
 * 注册数据验证模式
 * 
 * 使用 Zod 库定义数据验证规则，就像银行开户时的"身份验证标准"
 * 
 * 验证规则：
 * - name: 姓名至少2个字符（防止无效姓名）
 * - email: 必须是有效的邮箱格式
 * - password: 密码至少6个字符（基本安全要求）
 * 
 * 为什么使用 Zod：
 * - 类型安全：自动推断 TypeScript 类型
 * - 详细错误：提供具体的错误信息
 * - 链式验证：支持复杂的验证逻辑
 * - 自动转换：可以自动转换数据类型
 */
const registerSchema = z.object({
  name: z.string().min(2, "姓名至少2个字符").max(50, "姓名不能超过50个字符"),
  email: z.string().email("请输入有效的邮箱地址").max(100, "邮箱地址过长"),
  password: z.string()
    .min(8, "密码至少8个字符")
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, 
           "密码必须包含大小写字母、数字和特殊字符"),
})

/**
 * 处理用户注册的 POST 请求
 * 
 * 这个函数就像银行的"开户业务员"，按照标准流程处理每一个开户申请
 * 
 * 处理流程：
 * 1. 解析请求数据
 * 2. 验证数据格式
 * 3. 检查邮箱是否已存在
 * 4. 加密密码
 * 5. 创建用户记录
 * 6. 更新登录时间
 * 7. 返回结果
 * 
 * @param request Next.js 请求对象，包含用户提交的注册信息
 * @returns Promise<NextResponse> 注册结果响应
 */
export async function POST(request: NextRequest) {
  try {
    /**
     * 第一步：解析请求体数据
     * 
     * 从 HTTP 请求中获取 JSON 数据
     * 用户通过前端表单提交的数据会以 JSON 格式发送过来
     */
    let body;
    try {
      const text = await request.text();
      console.log("Raw request body:", text);
      body = JSON.parse(text);
    } catch (parseError: any) {
      console.error("JSON解析错误:", parseError);
      return NextResponse.json(
        { message: "无效的JSON数据" },
        { status: 400 }
      );
    }
    
    /**
     * 第二步：数据验证
     * 
     * 使用 Zod schema 验证用户输入的数据
     * 如果数据不符合规则，会抛出 ZodError 异常
     * 
     * 验证项目：
     * - name: 检查是否为字符串且长度在2-50个字符之间
     * - email: 检查是否为有效邮箱格式且不超过100个字符
     * - password: 检查是否为强密码（8个字符，包含大小写字母、数字和特殊字符）
     */
    const { name, email, password } = registerSchema.parse(body)

    // 使用数据库事务确保数据一致性
    const result = await prisma.$transaction(async (tx) => {
      /**
       * 第三步：检查邮箱是否已被注册
       * 
       * 在数据库中查找是否已有相同邮箱的用户
       * 防止重复注册，确保邮箱的唯一性
       * 
       * 为什么要检查：
       * - 邮箱是用户的唯一标识
       * - 防止恶意注册
       * - 提供友好的错误提示
       */
      const existingUser = await tx.user.findUnique({
        where: { email },
      })

      // 如果找到了已存在的用户，返回错误
      if (existingUser) {
        throw new Error("该邮箱已被注册")
      }

      /**
       * 第四步：密码加密
       * 
       * 使用 bcrypt 对用户密码进行加密
       * 
       * bcrypt 特点：
       * - 单向加密：无法逆向解密
       * - 加盐处理：防止彩虹表攻击
       * - 慢速算法：防止暴力破解
       * 
       * 参数说明：
       * - password: 用户输入的明文密码
       * - 12: 加密强度（salt rounds），提高到12增强安全性
       *   - 12 是更安全的推荐值
       *   - 每增加1，加密时间大约翻倍
       */
      const hashedPassword = await bcrypt.hash(password, 12)

      /**
       * 第五步：创建用户记录
       * 
       * 在数据库中创建新的用户记录，同时设置初始登录时间
       * 
       * 存储的信息：
       * - name: 用户姓名
       * - email: 用户邮箱（唯一标识）
       * - passwordHash: 加密后的密码（不存储明文密码）
       * - role: 用户角色（默认为 "USER"）
       * - lastLoginAt: 注册时间作为最后登录时间
       * 
       * 注意：
       * - 不存储明文密码，只存储加密后的哈希值
       * - 新用户默认角色为普通用户（USER）
       * - 管理员角色需要手动设置
       */
      const user = await tx.user.create({
        data: {
          name,
          email,
          passwordHash: hashedPassword,
          role: "USER", // 默认角色为普通用户
          lastLoginAt: new Date(), // 设置初始登录时间
        },
      })

      return user
    })

    /**
     * 第六步：返回成功响应
     * 
     * 返回注册成功的信息和用户数据
     * 
     * 安全考虑：
     * - 不返回密码哈希等敏感信息
     * - 只返回用户的基本公开信息
     * - 返回的数据可用于前端显示
     */
    return NextResponse.json({
      message: "注册成功",
      user: {
        id: result.id,
        name: result.name,
        email: result.email,
        role: result.role,
      },
    })

  } catch (error) {
    /**
     * 错误处理部分
     * 
     * 处理在注册过程中可能出现的各种错误
     * 提供用户友好的错误信息，同时记录详细的错误日志
     */

    /**
     * 处理 Zod 数据验证错误
     * 
     * 当用户输入的数据不符合验证规则时，Zod 会抛出 ZodError
     * 
     * 错误信息包含：
     * - 哪个字段有问题
     * - 具体的错误原因
     * - 错误的路径（嵌套对象）
     */
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          message: "输入数据无效", 
          errors: error.errors.map(err => ({
            field: err.path.join('.'), // 字段路径，如 "name" 或 "user.email"
            message: err.message       // 错误消息，如 "姓名至少2个字符"
          }))
        },
        { status: 400 } // 400 Bad Request - 客户端输入错误
      )
    }

    /**
     * 处理业务逻辑错误（如邮箱重复）
     */
    if (error instanceof Error) {
      if (error.message === "该邮箱已被注册") {
        return NextResponse.json(
          { message: error.message },
          { status: 400 }
        )
      }
      
      // 处理数据库唯一性约束错误
      if (error.message.includes('Unique constraint')) {
        return NextResponse.json(
          { message: "该邮箱已被注册" },
          { status: 400 }
        )
      }
    }

    /**
     * 记录错误日志
     * 
     * 在生产环境中，只记录错误类型和消息，不记录敏感信息
     * 
     * 在生产环境中，应该使用专业的日志系统：
     * - Winston
     * - Pino
     * - 云服务日志（如 AWS CloudWatch）
     */
    console.error("注册错误:", {
      message: error instanceof Error ? error.message : "未知错误",
      type: error?.constructor?.name,
      // 不记录完整的错误对象以避免泄露敏感信息
    })
    
    /**
     * 返回通用错误响应
     * 
     * 对于未预期的错误，返回通用错误信息
     * 
     * 安全考虑：
     * - 不暴露服务器内部错误详情
     * - 提供用户友好的错误信息
     * - 避免泄露敏感的系统信息
     */
    return NextResponse.json(
      { message: "服务器错误，请稍后重试" },
      { status: 500 } // 500 Internal Server Error - 服务器错误
    )
  }
}

/**
 * API 路由使用示例
 * 
 * 前端如何调用这个 API：
 * 
 * ```javascript
 * // 在前端组件中调用注册 API
 * async function handleRegister(formData) {
 *   try {
 *     const response = await fetch('/api/auth/register', {
 *       method: 'POST',
 *       headers: {
 *         'Content-Type': 'application/json',
 *       },
 *       body: JSON.stringify({
 *         name: formData.name,
 *         email: formData.email,
 *         password: formData.password,
 *       }),
 *     })
 * 
 *     const data = await response.json()
 * 
 *     if (response.ok) {
 *       console.log('注册成功:', data.user)
 *       // 跳转到登录页面或自动登录
 *     } else {
 *       console.error('注册失败:', data.message)
 *       // 显示错误信息给用户
 *     }
 *   } catch (error) {
 *     console.error('网络错误:', error)
 *   }
 * }
 * ```
 */

/**
 * 错误码说明
 * 
 * HTTP 状态码的含义：
 * - 200: 成功
 * - 400: 客户端错误（如数据验证失败、邮箱已存在）
 * - 500: 服务器错误（如数据库连接失败）
 */

/**
 * 安全最佳实践
 * 
 * 1. 数据验证：
 *    - 始终验证用户输入
 *    - 使用白名单而非黑名单
 *    - 验证数据类型和格式
 * 
 * 2. 密码处理：
 *    - 永远不存储明文密码
 *    - 使用强加密算法（bcrypt）
 *    - 设置合适的加密强度
 * 
 * 3. 错误处理：
 *    - 不暴露系统内部信息
 *    - 记录详细的错误日志
 *    - 提供用户友好的错误信息
 * 
 * 4. 防范攻击：
 *    - 防止SQL注入（使用ORM）
 *    - 防止暴力破解（速率限制）
 *    - 防止重复注册（邮箱唯一性）
 */