# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

这是一个基于 Next.js 15 的现代化博客系统，使用 TypeScript、Prisma ORM 和 MySQL 数据库构建。系统支持文章管理、页面管理、标签系统、媒体管理、用户认证和搜索功能。支持富文本编辑器和 Markdown 内容创作。

## 技术栈

- **框架**: Next.js 15 (App Router) 支持 Turbopack
- **语言**: TypeScript (严格模式)
- **数据库**: MySQL + Prisma ORM
- **认证**: NextAuth.js
- **状态管理**: Zustand
- **样式**: Tailwind CSS 4
- **UI组件**: Radix UI + shadcn/ui (New York 风格)
- **富文本编辑器**: Toast UI Editor
- **Markdown 处理**: react-markdown + remark-gfm
- **表单验证**: Zod
- **通知**: Sonner
- **图标**: Lucide React
- **加密**: bcrypt

## 常用开发命令

### 开发环境
```bash
# 启动开发服务器（支持 Turbopack）
npm run dev

# 使用本地环境配置启动
npm run dev:local
```

### 构建和部署
```bash
# 构建生产版本
npm run build

# 使用生产环境配置构建
npm run build:prod

# 启动生产服务器
npm run start
```

### 代码质量
```bash
# 运行 ESLint 检查
npm run lint
```

### 数据库操作
```bash
# 生成本地 Prisma 客户端
npm run db:generate:local

# 生成生产环境 Prisma 客户端
npm run db:generate:prod

# 推送本地数据库架构更改
npm run db:push:local

# 推送生产环境数据库架构更改
npm run db:push:prod

# 运行本地数据库迁移
npm run db:migrate:local

# 运行生产环境数据库迁移
npm run db:migrate:prod

# 打开本地 Prisma Studio
npm run db:studio:local

# 打开生产环境 Prisma Studio
npm run db:studio:prod

# 填充本地测试数据
npm run db:seed:local

# 填充生产环境测试数据
npm run db:seed:prod
```

## 项目架构

### 目录结构
```
src/
├── app/                    # Next.js App Router 页面
│   ├── (admin)/           # 管理后台路由组
│   ├── (blog)/            # 博客前台路由组
│   ├── api/               # API 路由
│   ├── auth/              # 认证页面
│   └── globals.css        # 全局样式
├── components/            # React 组件
│   ├── admin/             # 管理后台组件
│   ├── auth/              # 认证相关组件
│   ├── blog/              # 博客前台组件
│   ├── theme/             # 主题相关组件
│   └── ui/                # 通用 UI 组件
├── content/               # Markdown 内容文件
├── lib/                   # 工具库和服务
│   ├── services/          # 业务逻辑服务层
│   ├── stores/            # Zustand 状态管理
│   ├── utils/             # 工具函数
│   └── validations/       # Zod 验证模式
└── types/                 # TypeScript 类型定义
```

### 数据模型
系统包含以下主要数据模型：
- **Post**: 博客文章
- **Page**: 静态页面
- **Tag**: 标签
- **Media**: 媒体文件
- **User**: 用户
- **Navigation**: 导航菜单

### 服务层架构
- **Service Classes**: 在 `src/lib/services/` 中，每个数据模型都有对应的服务类
- **API Routes**: 在 `src/app/api/` 中，处理 HTTP 请求
- **Validation**: 使用 Zod 进行请求参数验证
- **Error Handling**: 统一的错误处理和响应格式

### 状态管理
使用 Zustand 进行状态管理，主要 store：
- **searchStore**: 搜索功能状态
- **uiStore**: UI 组件状态
- **themeStore**: 主题切换状态

## 环境配置

项目支持多环境配置：
- `.env.local`: 本地开发环境
- `.env.production`: 生产环境
- `.env.example`: 环境变量示例

关键环境变量：
- `DATABASE_URL`: MySQL 数据库连接字符串
- `NEXTAUTH_URL`: NextAuth.js 回调 URL
- `NEXTAUTH_SECRET`: NextAuth.js 密钥

## 代码规范

### TypeScript 配置
- 严格模式启用
- 路径别名配置：`@/*` 指向 `src/*`
- Prisma 客户端生成在默认位置 `node_modules/.prisma/client`

### ESLint 配置
- 继承 Next.js 核心规则
- 使用 ESLint 9.x
- TypeScript 支持启用

### shadcn/ui 配置
- 使用 New York 风格
- 启用 RSC 和 TypeScript
- CSS 变量模式启用
- 基础颜色：zinc
- 图标库：Lucide React
- 组件别名：`@/components`, `@/lib/utils`, `@/components/ui`

### 富文本编辑器
- 使用 Toast UI Editor (@toast-ui/react-editor)
- 支持 Markdown 编辑和预览
- 自定义样式和主题支持

### 图片配置
- 支持多个外部图片域名：
  - via.placeholder.com
  - images.unsplash.com
  - images.pexels.com
  - source.unsplash.com
- 使用 Next.js Image 优化

## 开发注意事项

1. **数据库操作**: 所有数据库操作都应通过 Prisma 客户端进行
2. **认证**: 使用 NextAuth.js 进行用户认证和授权
3. **API 设计**: 遵循 RESTful 设计原则，使用统一的响应格式
4. **类型安全**: 充分利用 TypeScript 的类型检查
5. **代码生成**: Prisma 客户端生成到默认位置 `node_modules/.prisma/client`
6. **环境隔离**: 使用不同的环境文件进行开发和生产环境配置
7. **富文本编辑**: 使用 Toast UI Editor 进行内容创作，支持 Markdown 语法
8. **组件开发**: 使用函数组件和 React Hooks，优先使用 Server Components，客户端组件使用 `'use client'` 指令

## 服务层架构详解

### 核心服务类
- **PostService**: 文章管理，支持复杂的查询、过滤、分页和全文搜索
- **PageService**: 页面管理，支持模板系统和排序
- **TagService**: 标签管理，支持多对多关系
- **SearchService**: 全文搜索服务，整合多种内容类型的搜索

### API 响应格式
所有 API 返回统一的响应格式：
```typescript
// 成功响应
{
  success: true,
  data: T,
  message?: string
}

// 错误响应
{
  success: false,
  error: string,
  message?: string
}
```

### 数据验证
- 使用 Zod 进行请求参数和响应数据验证
- 验证模式位于 `src/lib/validations/` 目录
- 统一的验证错误处理

### 状态管理
使用 Zustand 进行客户端状态管理：
- **searchStore**: 搜索功能状态，包括查询、过滤器、结果和建议
- **uiStore**: UI 组件状态（如模态框、下拉菜单等）
- **themeStore**: 主题切换状态（明暗模式）

### 内容管理
- 支持 Markdown 格式的文章和页面
- 自动提取纯文本内容用于搜索
- 媒体文件管理与内容关联
- 支持特色内容和排序

## 关键技术细节

### Prisma 配置
- 输出目录：默认 `node_modules/.prisma/client`
- 数据库：MySQL
- 支持复杂的关系查询和事务
- Seed 脚本：`tsx prisma/seed.ts`

### 路由结构
- **(admin)**: 管理后台路由组，需要认证
- **(blog)**: 博客前台路由组
- **api/**: API 路由，遵循 RESTful 设计
- **auth/**: 认证相关页面

### 权限系统
- 基于角色的访问控制（RBAC）
- 支持 ADMIN 和 AUTHOR 角色
- 使用 NextAuth.js 进行会话管理

### 搜索功能
- 支持文章、页面、标签的全文搜索
- 搜索建议功能
- 实时搜索结果过滤

## 最新功能更新

### 编辑器改进
- 已移除 MDX 支持，专注于 Markdown 和富文本编辑
- Toast UI Editor 集成，提供更好的编辑体验
- 支持模板系统和示例内容

### UI 组件更新
- Dialog 组件重构（删除了 Dialog.tsx，使用新的 dialog.tsx）
- 搜索模态框优化
- 文章查看器组件已移除（post-viewer.tsx）

### 统计服务
- 增强的统计服务功能
- 更好的数据分析支持

### 依赖更新
- React 19.1.0
- Next.js 15.4.5
- Prisma 6.13.0
- Zod 4.0.14
- Tailwind CSS 4
- Toast UI Editor 3.2.2