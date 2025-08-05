# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

这是一个基于 Next.js 15 的现代化博客应用，采用 App Router 架构，支持完整的博客内容管理、用户认证、搜索和媒体管理功能。

### 核心技术栈

- **框架**: Next.js 15.4.5 with App Router
- **语言**: TypeScript (严格模式启用)
- **数据库**: MySQL + Prisma ORM
- **认证**: NextAuth.js (JWT 会话 + 凭证提供者)
- **样式**: Tailwind CSS v4 + PostCSS
- **UI 组件**: shadcn/ui (New York 风格)
- **图标**: Lucide React
- **表单验证**: Zod schemas
- **状态管理**: Zustand (全局状态) + React Hooks (本地状态)
- **构建工具**: Turbopack (开发环境)

### 开发环境要求

- Node.js 18.17 或更高版本
- MySQL 8.0 或更高版本
- 环境变量配置 (.env.local / .env.production)

## 开发命令

### 核心开发命令
- `npm run dev` - 启动开发服务器 (Turbopack)
- `npm run build` - 构建生产版本
- `npm run start` - 启动生产服务器
- `npm run lint` - 运行 ESLint 代码检查

### 数据库操作命令
- `npm run db:push:local` - 推送 schema 更改到本地数据库
- `npm run db:push:prod` - 推送 schema 更改到生产数据库
- `npm run db:migrate:local` - 运行本地数据库迁移
- `npm run db:migrate:prod` - 运行生产数据库迁移
- `npm run db:generate:local` - 生成本地环境 Prisma 客户端
- `npm run db:generate:prod` - 生成生产环境 Prisma 客户端
- `npm run db:seed:local` - 本地数据库初始化数据
- `npm run db:seed:prod` - 生产数据库初始化数据
- `npm run db:studio:local` - 打开本地数据库管理界面
- `npm run db:studio:prod` - 打开生产数据库管理界面

### 环境特定命令
- `npm run dev:local` - 使用本地环境启动开发服务器
- `npm run build:prod` - 构建生产环境版本

## 项目架构

### 目录结构

```
src/
├── app/                    # Next.js App Router
│   ├── (admin)/           # 管理后台路由组 (需要认证)
│   │   ├── layout.tsx     # 管理后台布局
│   │   ├── media/         # 媒体管理
│   │   ├── pages/         # 页面管理
│   │   ├── posts/         # 文章管理
│   │   └── settings/      # 系统设置
│   ├── (blog)/            # 博客前台路由组
│   │   ├── posts/         # 文章详情页
│   │   ├── search/        # 搜索页面
│   │   └── tags/          # 标签页面
│   ├── api/               # API 路由 (RESTful)
│   │   ├── auth/          # 认证相关 API
│   │   ├── media/         # 媒体管理 API
│   │   ├── pages/         # 页面管理 API
│   │   ├── posts/         # 文章管理 API
│   │   ├── search/        # 搜索 API
│   │   └── tags/          # 标签管理 API
│   ├── auth/              # 认证页面
│   │   ├── signin/        # 登录页面
│   │   └── signup/        # 注册页面
│   ├── layout.tsx         # 根布局 (字体 + 主题提供者)
│   ├── page.tsx           # 首页组件
│   └── globals.css        # 全局样式 (暗色模式支持)
├── components/            # 可复用组件
│   ├── admin/             # 管理后台组件
│   │   ├── dashboard/     # 仪表板组件
│   │   └── editor/        # 编辑器组件
│   ├── auth/              # 认证相关组件
│   ├── blog/              # 博客相关组件
│   │   ├── layout/        # 博客布局组件
│   │   ├── post/          # 文章组件
│   │   ├── search/        # 搜索组件
│   │   └── sections/      # 页面区块组件
│   ├── theme/             # 主题相关组件
│   └── ui/                # shadcn/ui 基础组件
├── content/               # MDX 内容文件
│   ├── pages/             # 静态页面内容
│   └── posts/             # 博客文章内容
├── lib/                   # 工具函数和配置
│   ├── auth.ts            # NextAuth 配置
│   ├── db.ts              # Prisma 客户端配置
│   ├── services/          # 业务逻辑服务层
│   │   ├── page.service.ts    # 页面服务
│   │   ├── post.service.ts    # 文章服务
│   │   ├── searchService.ts   # 搜索服务
│   │   └── tag.service.ts     # 标签服务
│   ├── stores/            # Zustand 状态管理
│   │   ├── searchStore.ts    # 搜索状态 store
│   │   ├── uiStore.ts         # UI 状态 store
│   │   ├── themeStore.ts      # 主题状态 store
│   │   └── index.ts           # Store 导出文件
│   ├── utils/             # 通用工具函数
│   ├── utils/             # 专用工具函数
│   └── validations/       # Zod 验证规则
├── types/                 # TypeScript 类型定义
│   ├── api/               # API 响应类型
│   ├── auth/              # 认证相关类型
│   └── blog/              # 博客相关类型
└── generated/prisma/      # Prisma 生成的客户端
```

### 核心配置

- **TypeScript**: 严格模式启用，路径别名配置 (`@/*` → `./src/*`)
- **Next.js**: 标准配置，支持 App Router
- **ESLint**: 继承 `next/core-web-vitals` 和 `next/typescript`
- **PostCSS**: Tailwind CSS v4 配置
- **shadcn/ui**: New York 风格，zinc 基础色彩，CSS 变量
- **Prisma**: 自定义输出目录 `src/generated/prisma`
- **环境变量**: 通过 dotenv-cli 支持本地和生产环境

## 数据库架构

应用使用 MySQL + Prisma ORM，包含以下核心数据模型：

### 文章系统 (Posts)
- **文章管理**: 支持 Markdown 内容、状态管理、SEO 优化
- **字段**: title, slug, content, excerpt, searchContent, status, publishedAt
- **状态**: DRAFT (草稿)、PUBLISHED (已发布)、ARCHIVED (已归档)
- **功能**: 特色文章、浏览统计、阅读时间预估
- **关联**: 作者 (多对一)、标签 (多对多)、媒体文件 (多对多)

### 页面系统 (Pages)
- **静态页面**: 支持自定义模板和排序
- **字段**: title, slug, content, template, order, featured
- **状态**: DRAFT、PUBLISHED、ARCHIVED
- **功能**: 页面排序、模板定制、特色页面
- **关联**: 作者、媒体文件

### 标签系统 (Tags)
- **灵活标签**: 支持多对多关系
- **字段**: name, slug, description, color
- **功能**: 标签颜色、文章分类、SEO 优化
- **关联**: 通过 PostTag 关联表实现多对多关系

### 媒体管理 (Media)
- **文件上传**: 支持多种文件类型
- **字段**: filename, originalName, path, url, mimeType, size, alt
- **功能**: 文件存储、URL 生成、ALT 文本支持
- **关联**: 通过 ContentMedia 关联表与内容关联

### 导航系统 (Navigation)
- **层级导航**: 支持多级导航菜单
- **字段**: name, slug, url, type, order, parentId
- **类型**: PAGE (页面链接)、TAG (标签链接)、EXTERNAL (外部链接)
- **功能**: 自引用关系实现层级结构、激活状态管理

### 用户系统 (Users)
- **角色权限**: 基于角色的访问控制
- **字段**: username, email, password, name, role, status
- **角色**: ADMIN (管理员)、AUTHOR (作者)
- **状态**: ACTIVE (活跃)、INACTIVE (非活跃)、BANNED (禁用)
- **功能**: 用户名/邮箱登录、密码加密、会话管理

### 关键特性

- **全文搜索**: searchContent 字段存储纯文本内容用于搜索
- **SEO 优化**: slug 字段支持友好的 URL
- **状态管理**: 统一的状态枚举设计
- **时间戳**: 统一的 createdAt/updatedAt 时间管理
- **软删除**: 通过状态字段实现软删除机制
- **关联优化**: 合理的索引设计和关系查询

## 认证系统

### NextAuth.js 配置
- **认证提供者**: Credentials Provider (用户名/邮箱 + 密码)
- **会话策略**: JWT-based 会话管理
- **登录方式**: 支持用户名或邮箱登录
- **密码加密**: 使用 bcrypt 进行密码哈希和验证

### 权限管理
- **用户角色**: 
  - ADMIN (管理员): 完全访问权限
  - AUTHOR (作者): 内容管理权限
- **用户状态**: ACTIVE (活跃)、INACTIVE (非活跃)、BANNED (禁用)
- **权限控制**: 基于角色的访问控制

### 路由保护
- **中间件保护**: `middleware.ts` 保护管理后台路由
- **保护路径**: `/admin/*`、`/api/posts/*`、`/api/auth/me`
- **重定向逻辑**: 未登录用户重定向到登录页面
- **角色验证**: 管理员路径需要 ADMIN 角色

### 会话管理
- **JWT Token**: 包含用户 ID、角色、用户名等信息
- **会话回调**: 自定义 JWT 和会话处理逻辑
- **登录页面**: 自定义登录页面路由 `/auth/signin`

## 服务层架构

### 服务层设计模式
采用面向对象的服务层设计，每个业务实体都有对应的服务类：

#### PostService (文章服务)
- **功能**: 文章的 CRUD 操作、列表查询、搜索
- **特性**: 
  - 支持分页、排序、筛选
  - 标签关联管理
  - Markdown 内容纯文本提取
  - 媒体文件关联
- **位置**: `src/lib/services/post.service.ts`

#### PageService (页面服务)
- **功能**: 页面的 CRUD 操作、列表查询
- **特性**: 页面排序、模板管理、状态控制
- **位置**: `src/lib/services/page.service.ts`

#### TagService (标签服务)
- **功能**: 标签的 CRUD 操作、文章计数
- **特性**: 标签颜色管理、使用统计
- **位置**: `src/lib/services/tag.service.ts`

#### SearchService (搜索服务)
- **功能**: 全文搜索、搜索建议
- **特性**: 
  - 多类型内容搜索 (文章、页面、标签)
  - 相关度计算和排序
  - 搜索建议生成
- **位置**: `src/lib/services/searchService.ts`

### 数据验证
- **Zod Schemas**: 所有输入数据都使用 Zod 进行验证
- **验证规则**: `src/lib/validations/` 目录下的验证文件
- **类型安全**: 验证规则与 TypeScript 类型保持一致

## 状态管理

### Zustand 状态管理

项目使用 Zustand 作为全局状态管理解决方案，替代了原本的 React Hooks 状态管理：

#### Store 架构
- **useSearchStore**: 搜索相关状态和逻辑
  - 状态: searchQuery, activeFilter, searchResults, isLoading, searchSuggestions, searchError
  - 操作: performSearch, loadSearchSuggestions, handleSuggestionClick, handleResultClick
  - 位置: `src/lib/stores/searchStore.ts`

- **useUIStore**: UI 状态管理
  - 状态: isSearchOpen, mounted
  - 操作: setIsSearchOpen, setMounted, toggleSearch
  - 位置: `src/lib/stores/uiStore.ts`

- **useThemeStore**: 主题相关状态
  - 状态: mounted
  - 操作: setMounted
  - 位置: `src/lib/stores/themeStore.ts`

#### 设计原则
- **单一职责**: 每个 store 负责特定的业务领域
- **类型安全**: 完整的 TypeScript 类型定义
- **按需订阅**: 组件只订阅需要的状态，避免不必要的重渲染
- **状态逻辑分离**: 将状态和相关的操作逻辑封装在 store 中

#### 使用模式
```typescript
// 在组件中使用 store
import { useSearchStore } from '@/lib/stores'

function MyComponent() {
  const { searchQuery, setSearchQuery, performSearch } = useSearchStore()
  
  return (
    <input
      value={searchQuery}
      onChange={(e) => setSearchQuery(e.target.value)}
    />
  )
}
```

### 本地状态管理
对于组件内部的状态，仍然使用 React Hooks：
- **useState**: 组件内部状态
- **useEffect**: 副作用处理
- **useCallback**: 性能优化

## UI 组件系统

### shadcn/ui 集成
- **组件风格**: New York 风格，zinc 基础色彩
- **主题系统**: CSS 变量支持，完整的暗色模式
- **图标库**: Lucide React 图标
- **配置文件**: `components.json`

### 主题系统
- **主题提供者**: `ThemeProvider` 组件
- **暗色模式**: 完整的暗色模式支持
- **系统主题**: 自动检测系统主题偏好
- **主题切换**: `ThemeToggle` 切换组件

### 组件分层
- **基础组件**: `src/components/ui/` - shadcn/ui 基础组件
- **业务组件**: `src/components/blog/` - 博客相关组件
- **管理组件**: `src/components/admin/` - 管理后台组件
- **主题组件**: `src/components/theme/` - 主题相关组件

### 样式系统
- **Tailwind CSS v4**: 使用最新的 PostCSS 插件方式
- **字体系统**: Geist Sans + Geist Mono 字体
- **响应式设计**: 移动优先的响应式设计
- **动画效果**: 集成 tw-animate-css 动画库

## 开发指南

### 数据库操作流程

#### Schema 更改流程
1. **修改 Schema**: 编辑 `prisma/schema.prisma` 文件
2. **生成客户端**: 运行 `npm run db:generate:local` 或 `npm run db:generate:prod`
3. **推送更改**: 运行 `npm run db:push:local` 或 `npm run db:push:prod`
4. **验证更改**: 使用 Prisma Studio 检查数据库状态

#### 重要注意事项
- **必须先生成客户端**: 任何 schema 更改后都需要先生成 Prisma 客户端
- **环境隔离**: 本地和生产环境使用不同的数据库配置
- **数据迁移**: 生产环境建议使用 `db:migrate` 而不是 `db:push`
- **种子数据**: 使用 `prisma/seed.ts` 文件初始化基础数据

### 环境配置

#### 必需的环境变量
```bash
# 数据库配置
DATABASE_URL="mysql://username:password@localhost:3306/database_name"

# NextAuth 配置
NEXTAUTH_SECRET="your-secret-key-here"

# 应用配置
NODE_ENV="development" # 或 "production"
```

#### 环境文件
- `.env.local`: 本地开发环境配置
- `.env.production`: 生产环境配置
- **注意**: 环境文件应该包含在 `.gitignore` 中

### 代码规范

#### TypeScript 规范
- **严格模式**: 启用 TypeScript 严格模式
- **类型定义**: 为所有函数、变量添加明确的类型
- **接口设计**: 使用 interface 定义数据结构
- **错误处理**: 使用 try-catch 处理可能的错误

#### 组件开发规范
- **函数组件**: 优先使用函数组件和 Hooks
- **Props 验证**: 使用 TypeScript 接口验证组件 props
- **样式隔离**: 使用 Tailwind CSS 类名，避免全局样式
- **组件复用**: 设计可复用的组件接口

#### API 开发规范
- **RESTful 设计**: 遵循 RESTful API 设计原则
- **状态码**: 使用正确的 HTTP 状态码
- **错误处理**: 统一的错误响应格式
- **数据验证**: 所有输入数据都需要验证

### 文件命名约定

#### 组件文件
- **PascalCase**: `PostCard.tsx`, `BlogLayout.tsx`
- **页面文件**: `page.tsx` (App Router 要求)
- **布局文件**: `layout.tsx`

#### 工具文件
- **kebab-case**: `post.service.ts`, `search.service.ts`
- **类型文件**: `post.types.ts`, `api.response.ts`

#### 测试文件
- **.test.ts**: 单元测试文件
- **.spec.ts**: 集成测试文件

### 开发工作流

#### 新功能开发
1. **需求分析**: 理解功能需求和技术要求
2. **类型定义**: 定义相关的 TypeScript 类型
3. **服务层**: 实现业务逻辑服务类
4. **API 路由**: 创建对应的 API 路由
5. **组件开发**: 实现前端组件
6. **测试验证**: 编写测试用例

#### Bug 修复流程
1. **问题复现**: 确认 bug 的复现步骤
2. **原因分析**: 找出问题的根本原因
3. **修复方案**: 制定修复方案并实施
4. **测试验证**: 确保修复不会引入新问题
5. **代码审查**: 检查代码质量和规范性

### 性能优化

#### 数据库优化
- **索引设计**: 为常用查询字段添加索引
- **查询优化**: 避免 N+1 查询问题
- **分页查询**: 大数据量使用分页查询
- **连接池**: 合理配置数据库连接池

#### 前端优化
- **代码分割**: 使用 Next.js 动态导入
- **图片优化**: 使用 Next.js Image 组件
- **缓存策略**: 合理使用浏览器缓存
- **懒加载**: 对非关键资源使用懒加载

### 部署指南

#### 生产环境部署
1. **环境配置**: 设置生产环境变量
2. **构建项目**: 运行 `npm run build:prod`
3. **数据库迁移**: 运行生产环境数据库迁移
4. **启动服务**: 运行 `npm start`

#### 监控和维护
- **日志监控**: 监控应用日志和错误
- **性能监控**: 监控应用性能指标
- **数据库备份**: 定期备份数据库
- **安全更新**: 及时更新依赖包

### 常见问题

#### 数据库连接问题
- **检查环境变量**: 确保 `DATABASE_URL` 配置正确
- **网络连接**: 确保数据库服务器可访问
- **权限配置**: 确保数据库用户有足够权限

#### 认证问题
- **密钥配置**: 确保 `NEXTAUTH_SECRET` 已设置
- **回调 URL**: 检查认证回调 URL 配置
- **会话过期**: 检查 JWT 会话配置

#### 构建问题
- **内存不足**: 增加构建可用内存
- **依赖冲突**: 检查包版本兼容性
- **类型错误**: 解决 TypeScript 类型错误

---

## 总结

这个 Next.js 博客应用采用了现代化的技术栈和最佳实践，具有完整的博客内容管理、用户认证、搜索和媒体管理功能。通过清晰的架构设计和完善的开发指南，开发者可以快速理解和维护这个项目。

### 关键特性

- **现代化技术栈**: Next.js 15 + TypeScript + Prisma + MySQL
- **完整的博客功能**: 文章、页面、标签、媒体管理
- **用户认证系统**: 基于 NextAuth.js 的 JWT 认证
- **搜索功能**: 全文搜索和搜索建议
- **响应式设计**: 支持暗色模式的现代化 UI
- **开发友好**: 完整的开发指南和最佳实践

### 开发原则

- **KISS**: 保持代码简单直观
- **YAGNI**: 不实现不需要的功能
- **SOLID**: 遵循面向对象设计原则
- **类型安全**: 充分利用 TypeScript 类型系统
- **性能优化**: 数据库查询和前端性能优化

### 维护建议

- 定期更新依赖包以获取安全更新
- 监控应用性能和错误日志
- 备份数据库和重要配置文件
- 遵循代码审查流程保证代码质量

---

*最后更新: 2025-08-05*  
*版本: 2.0*
