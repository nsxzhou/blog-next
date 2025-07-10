# 开发环境搭建指南

## 1. 初始化项目

### 1.1 创建项目（已完成）

```bash
npx create-next-app@latest blog-next --typescript --tailwind --app
cd blog-next
```

### 1.2 安装核心依赖（已完成）

```bash
# 数据库和认证
npm install prisma @prisma/client next-auth
npm install @next-auth/prisma-adapter

# 表单和验证
npm install react-hook-form @hookform/resolvers zod

# UI组件
npm install @tailwindcss/typography lucide-react

# 状态管理和数据获取
npm install zustand @tanstack/react-query

# 工具库
npm install date-fns clsx tailwind-merge

# 开发依赖
npm install -D @types/node
```

### 1.3 配置数据库

```bash
npx prisma init
```

编辑 `.env` 文件：

```env
# 数据库连接
DATABASE_URL="mysql://user:password@localhost:3306/blog_db"

# NextAuth配置
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"

# 邮件服务配置
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
FROM_EMAIL="noreply@yourdomain.com"

# 对象存储配置
COS_SECRET_ID="your-cos-secret-id"
COS_SECRET_KEY="your-cos-secret-key"
COS_BUCKET="your-bucket-name"
COS_REGION="ap-guangzhou"

# 第三方登录（可选）
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
GITHUB_ID=""
GITHUB_SECRET=""
```

### 1.4 Prisma Schema 配置

创建 `prisma/schema.prisma`：

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}

// 在这里添加数据模型
```

## 2. 开发工具配置

### 2.1 ESLint 配置

`.eslintrc.json`:

```json
{
  "extends": ["next/core-web-vitals", "@typescript-eslint/recommended"],
  "rules": {
    "react/no-unescaped-entities": "off",
    "@typescript-eslint/no-unused-vars": "error"
  }
}
```

### 2.2 Prettier 配置

`.prettierrc`:

```json
{
  "semi": false,
  "trailingComma": "es5",
  "singleQuote": true,
  "tabWidth": 2,
  "useTabs": false
}
```

### 2.3 VS Code 配置

`.vscode/settings.json`:

```json
{
  "typescript.preferences.importModuleSpecifier": "relative",
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "emmet.includeLanguages": {
    "typescript": "html"
  }
}
```

### 2.4 Git 配置

`.gitignore`:

```
# dependencies
/node_modules
/.pnp
.pnp.js

# testing
/coverage

# next.js
/.next/
/out/

# production
/build

# misc
.DS_Store
*.pem

# debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# local env files
.env*.local
.env

# vercel
.vercel

# typescript
*.tsbuildinfo
next-env.d.ts

# prisma
prisma/migrations/
```

## 3. 项目脚本配置

### 3.1 package.json 脚本

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "db:push": "prisma db push",
    "db:migrate": "prisma migrate dev",
    "db:studio": "prisma studio",
    "db:seed": "tsx prisma/seed.ts",
    "type-check": "tsc --noEmit"
  }
}
```

### 3.2 TypeScript 配置

`tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "es5",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

## 4. 开发流程

### 4.1 分支管理

```bash
# 功能开发
git checkout -b feature/feature-name

# Bug修复
git checkout -b bugfix/bug-description

# 紧急修复
git checkout -b hotfix/critical-fix
```

### 4.2 提交规范

```bash
# 功能
git commit -m "feat: 添加用户登录功能"

# 修复
git commit -m "fix: 修复登录验证错误"

# 文档
git commit -m "docs: 更新API文档"

# 样式
git commit -m "style: 格式化代码"

# 重构
git commit -m "refactor: 重构认证模块"

# 测试
git commit -m "test: 添加用户服务测试"

# 构建
git commit -m "chore: 更新依赖版本"
```

## 5. 调试技巧

### 5.1 服务端调试

```json
// .vscode/launch.json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Next.js: debug server-side",
      "type": "node-terminal",
      "request": "launch",
      "command": "npm run dev"
    },
    {
      "name": "Next.js: debug client-side",
      "type": "chrome",
      "request": "launch",
      "url": "http://localhost:3000"
    }
  ]
}
```

### 5.2 环境变量管理

```bash
# 开发环境
.env.local

# 生产环境
.env.production

# 测试环境
.env.test
```
