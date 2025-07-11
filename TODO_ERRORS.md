# 待修复的错误清单

记录时间：2025-07-11

## 1. TypeScript 类型错误

### 1.1 Next.js 15 相关
- `src/app/articles/ArticleListClient.tsx(230,19)`: ref类型不匹配
  ```typescript
  // 错误：Type '(el: HTMLDivElement | null) => HTMLDivElement | null' is not assignable to type 'Ref<HTMLDivElement> | undefined'
  ```

### 1.2 Prisma/数据库相关
- `prisma/seed.ts`: 变量命名冲突
  - 第29行重复声明了 'tags' 变量
  - 需要重命名为不同的变量名

### 1.3 API 路由类型问题
- `src/app/api/projects/route.ts(94,7)`: techStack可能为undefined
  ```typescript
  // 错误：Type 'string[] | undefined' is not assignable to type 'string[]'
  ```

- `src/app/api/settings/route.ts(68,7)`: value属性可选性问题
  ```typescript
  // 错误：Property 'value' is optional but required in type
  ```

### 1.4 媒体库组件
- `src/app/dashboard/media/MediaLibraryClient.tsx`:
  - 第103行：`"AUDIO"` 不是有效的 MediaType（应该使用 "OTHER"）
  - 第423行：formatFileSize 参数可能为null
  - 第501行：`uploadedBy` 应该改为 `uploader`

### 1.5 项目详情页
- `src/app/projects/[slug]/client.tsx`:
  - 第86行：techStack 可能为null，需要类型守卫
  - 第110行："outline" 不是有效的按钮variant
  - 第128行：techStack 需要类型断言为 string[]

### 1.6 通知组件
- `src/components/NotificationCenter.tsx`:
  - 多处引用了不存在的 `link` 属性
  - Notification 模型中已经移除了 link 字段，数据存储在 data 字段中

### 1.7 搜索相关
- `src/components/search/SearchModal.tsx(139,9)`: 
  - 'article' 应该改为 'post'
  
- `src/components/search/SearchResults.tsx`:
  - 第27,41行：'article' 应该改为 'post'
  - 第128,131,134,137行：metadata 字段名不匹配
    - `date` 应该是 `publishedAt`
    - `readTime` 应该是 `readingTime`
  - 第147行：标签渲染类型问题

### 1.8 文章库
- `src/lib/articles.ts(43,38)`: 
  - 搜索查询的 mode 属性在 MySQL 中不支持
  - 需要移除 `mode: 'insensitive'`

### 1.9 上下文和导入
- `src/contexts/NotificationContext.tsx(5,10)`:
  - Notification 名称冲突，需要使用 type-only import
  ```typescript
  import type { Notification } from '@prisma/client'
  ```

## 2. 缺失的依赖

### 2.1 必需但未安装
- `next-themes`: 主题切换功能需要
  ```bash
  npm install next-themes
  ```

### 2.2 UI组件
- `src/components/ui/Badge.example.tsx`: Badge组件没有默认导出
  - 需要使用命名导入：`import { Badge } from ...`

## 3. 功能相关问题

### 3.1 通知系统
- 通知的 link 字段已经从数据库模型中移除
- 需要更新所有引用 notification.link 的地方
- 链接信息应该存储在 notification.data 中

### 3.2 媒体类型
- MediaType 枚举没有 AUDIO 类型
- 音频文件应该归类为 OTHER 类型

### 3.3 搜索结果类型
- SearchResultType 中的 'article' 应该全部改为 'post'
- 保持与数据库模型名称一致

## 4. 建议的修复顺序

1. **高优先级**（影响功能）：
   - 修复 NotificationCenter 中的 link 引用
   - 修复搜索相关的类型匹配
   - 修复 articles.ts 中的查询模式

2. **中优先级**（类型安全）：
   - 修复所有 null/undefined 检查
   - 修复 ref 类型问题
   - 修复按钮 variant 类型

3. **低优先级**（代码质量）：
   - 安装缺失的依赖
   - 修复导入冲突
   - 清理 seed.ts 中的变量命名

## 5. 快速修复脚本

```bash
# 批量替换 'article' 为 'post' 在搜索相关文件中
find src/components/search -name "*.tsx" -exec sed -i '' 's/"article"/"post"/g' {} \;

# 修复 uploadedBy 为 uploader
find src -name "*.tsx" -exec sed -i '' 's/uploadedBy/uploader/g' {} \;

# 安装缺失的依赖
npm install next-themes
```

## 6. 注意事项

1. 修复前请确保已经备份代码
2. 修复后需要重新运行类型检查：`npm run type-check`
3. 某些错误可能需要同时修改多个文件
4. 建议按照优先级逐步修复，每修复一类问题后测试一次

## 7. SettingsClient.tsx 中的 LIKE 问题

在 `/src/app/dashboard/settings/SettingsClient.tsx` 文件中可能存在对通知类型 'LIKE' 的引用。由于我们在 NotificationType 枚举中同时有 'POST_LIKE' 和 'LIKE'（为了兼容），需要确保新代码使用 'POST_LIKE'，而不是 'LIKE'。