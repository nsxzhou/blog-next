# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

这是一个基于 Next.js 15 的现代化博客系统，使用 TypeScript、Prisma ORM 和 MySQL 数据库构建。系统支持文章管理、页面管理、标签系统、媒体管理、用户认证和搜索功能。

## 技术栈

- **框架**: Next.js 15 (App Router)
- **语言**: TypeScript
- **数据库**: MySQL + Prisma ORM
- **认证**: NextAuth.js
- **状态管理**: Zustand
- **样式**: Tailwind CSS 4
- **UI组件**: Radix UI + shadcn/ui
- **表单验证**: Zod
- **通知**: Sonner

## 常用开发命令

### 开发环境
```bash
# 启动开发服务器
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
- 生成的 Prisma 客户端在 `src/generated/prisma/`

### ESLint 配置
- 继承 Next.js 核心规则
- 忽略生成的 Prisma 客户端文件
- 放宽一些 TypeScript 警告规则

### 组件开发
- 使用函数组件和 React Hooks
- 优先使用 Server Components
- 客户端组件使用 `'use client'` 指令
- 遵循 shadcn/ui 组件规范

## 开发注意事项

1. **数据库操作**: 所有数据库操作都应通过 Prisma 客户端进行
2. **认证**: 使用 NextAuth.js 进行用户认证和授权
3. **API 设计**: 遵循 RESTful 设计原则，使用统一的响应格式
4. **类型安全**: 充分利用 TypeScript 的类型检查
5. **代码生成**: Prisma 客户端生成到 `src/generated/prisma/` 目录
6. **环境隔离**: 使用不同的环境文件进行开发和生产环境配置