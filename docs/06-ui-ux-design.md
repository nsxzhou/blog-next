# UI/UX 设计实现指南

## 1. 设计系统配置

### 1.1 Tailwind CSS 配置
`tailwind.config.js`:
```javascript
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#f0f9ff",
          100: "#e0f2fe",
          200: "#bae6fd",
          300: "#7dd3fc",
          400: "#38bdf8",
          500: "#0ea5e9",
          600: "#0284c7",
          700: "#0369a1",
          800: "#075985",
          900: "#0c4a6e",
        },
        gray: {
          50: "#f9fafb",
          100: "#f3f4f6",
          200: "#e5e7eb",
          300: "#d1d5db",
          400: "#9ca3af",
          500: "#6b7280",
          600: "#4b5563",
          700: "#374151",
          800: "#1f2937",
          900: "#111827",
        },
      },
      typography: (theme) => ({
        DEFAULT: {
          css: {
            maxWidth: "65ch",
            color: theme("colors.gray.700"),
            a: {
              color: theme("colors.primary.600"),
              "&:hover": {
                color: theme("colors.primary.700"),
              },
            },
            '[class~="lead"]': {
              fontSize: "1.25rem",
              lineHeight: "1.6",
              color: theme("colors.gray.600"),
            },
            h1: {
              fontWeight: "800",
              fontSize: "2.25rem",
              marginTop: "0",
              marginBottom: "0.8888889em",
              lineHeight: "1.1111111",
            },
            h2: {
              fontWeight: "700",
              fontSize: "1.5rem",
              marginTop: "2em",
              marginBottom: "1em",
              lineHeight: "1.3333333",
            },
            code: {
              color: theme("colors.gray.900"),
              fontWeight: "600",
            },
            "code::before": {
              content: '""',
            },
            "code::after": {
              content: '""',
            },
            pre: {
              backgroundColor: theme("colors.gray.800"),
              color: theme("colors.gray.100"),
              overflowX: "auto",
            },
            blockquote: {
              borderLeftColor: theme("colors.primary.500"),
              fontStyle: "italic",
            },
          },
        },
        dark: {
          css: {
            color: theme("colors.gray.300"),
            a: {
              color: theme("colors.primary.400"),
              "&:hover": {
                color: theme("colors.primary.300"),
              },
            },
            h1: {
              color: theme("colors.gray.100"),
            },
            h2: {
              color: theme("colors.gray.100"),
            },
            h3: {
              color: theme("colors.gray.100"),
            },
            h4: {
              color: theme("colors.gray.100"),
            },
            code: {
              color: theme("colors.gray.100"),
              backgroundColor: theme("colors.gray.700"),
            },
            pre: {
              backgroundColor: theme("colors.gray.900"),
            },
            blockquote: {
              color: theme("colors.gray.300"),
              borderLeftColor: theme("colors.primary.500"),
            },
          },
        },
      }),
      fontFamily: {
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          '"Segoe UI"',
          "Roboto",
          '"Helvetica Neue"',
          "Arial",
          '"Noto Sans"',
          "sans-serif",
          '"Apple Color Emoji"',
          '"Segoe UI Emoji"',
          '"Segoe UI Symbol"',
          '"Noto Color Emoji"',
        ],
      },
      boxShadow: {
        soft: "0 2px 15px 0 rgba(0, 0, 0, 0.05)",
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-in-out",
        "slide-up": "slideUp 0.3s ease-out",
        "slide-down": "slideDown 0.3s ease-out",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { transform: "translateY(10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        slideDown: {
          "0%": { transform: "translateY(-10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
      },
    },
  },
  plugins: [
    require("@tailwindcss/typography"),
    require("@tailwindcss/forms"),
    require("@tailwindcss/aspect-ratio"),
  ],
};
```

### 1.2 全局样式
`app/globals.css`:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  /* 自定义滚动条 */
  ::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  ::-webkit-scrollbar-track {
    @apply bg-gray-100;
  }

  ::-webkit-scrollbar-thumb {
    @apply bg-gray-400 rounded-full;
  }

  ::-webkit-scrollbar-thumb:hover {
    @apply bg-gray-500;
  }

  /* 文字选择样式 */
  ::selection {
    @apply bg-primary-200 text-primary-900;
  }

  /* 焦点样式 */
  *:focus {
    @apply outline-none;
  }

  *:focus-visible {
    @apply ring-2 ring-primary-500 ring-offset-2;
  }
}

@layer components {
  /* 按钮基础样式 */
  .btn {
    @apply inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed;
  }

  .btn-primary {
    @apply btn bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500;
  }

  .btn-secondary {
    @apply btn bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500;
  }

  .btn-ghost {
    @apply btn bg-transparent hover:bg-gray-100 focus:ring-gray-500;
  }

  /* 输入框样式 */
  .input {
    @apply w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500 transition-colors;
  }

  /* 卡片样式 */
  .card {
    @apply bg-white rounded-lg shadow-soft overflow-hidden;
  }

  .card-hover {
    @apply card transition-transform hover:scale-[1.02] hover:shadow-lg;
  }

  /* 容器样式 */
  .container-custom {
    @apply max-w-7xl mx-auto px-4 sm:px-6 lg:px-8;
  }
}

@layer utilities {
  /* 文本截断 */
  .line-clamp-2 {
    overflow: hidden;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
  }

  .line-clamp-3 {
    overflow: hidden;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 3;
  }

  /* 动画延迟 */
  .animation-delay-200 {
    animation-delay: 200ms;
  }

  .animation-delay-400 {
    animation-delay: 400ms;
  }
}

/* 暗色模式 */
@media (prefers-color-scheme: dark) {
  :root {
    --foreground-rgb: 255, 255, 255;
    --background-start-rgb: 0, 0, 0;
    --background-end-rgb: 0, 0, 0;
  }

  .dark\:card {
    @apply bg-gray-800 text-white;
  }

  .dark\:input {
    @apply bg-gray-700 border-gray-600 text-white;
  }
}
```

## 2. 核心UI组件

### 2.1 布局组件
`components/layout/Header.tsx`:
```typescript
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { Menu, X, Search, User } from "lucide-react";
import ThemeToggle from "../theme/ThemeToggle";
import SearchModal from "../search/SearchModal";
import UserMenu from "./UserMenu";

const navigation = [
  { name: "首页", href: "/" },
  { name: "博客", href: "/blog" },
  { name: "分类", href: "/categories" },
  { name: "标签", href: "/tags" },
  { name: "关于", href: "/about" },
];

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();
  const { data: session } = useSession();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <header
        className={`sticky top-0 z-40 w-full backdrop-blur transition-all ${
          isScrolled
            ? "bg-white/80 shadow-soft dark:bg-gray-900/80"
            : "bg-white dark:bg-gray-900"
        }`}
      >
        <div className="container-custom">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <div className="flex items-center">
              <Link href="/" className="flex items-center space-x-2">
                <span className="text-2xl font-bold text-primary-600">
                  MyBlog
                </span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`text-sm font-medium transition-colors hover:text-primary-600 ${
                    pathname === item.href
                      ? "text-primary-600"
                      : "text-gray-700 dark:text-gray-200"
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </nav>

            {/* Right Actions */}
            <div className="flex items-center space-x-4">
              {/* Search */}
              <button
                onClick={() => setIsSearchOpen(true)}
                className="p-2 text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
                aria-label="搜索"
              >
                <Search className="h-5 w-5" />
              </button>

              {/* Theme Toggle */}
              <ThemeToggle />

              {/* User Menu */}
              {session ? (
                <UserMenu user={session.user} />
              ) : (
                <Link href="/login" className="btn-primary">
                  登录
                </Link>
              )}

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="md:hidden p-2 text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
                aria-label="菜单"
              >
                {isMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-200 dark:border-gray-700">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`block px-3 py-2 rounded-md text-base font-medium ${
                    pathname === item.href
                      ? "bg-primary-50 text-primary-600 dark:bg-primary-900/20"
                      : "text-gray-700 hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-800"
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              {!session && (
                <Link
                  href="/login"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-800"
                  onClick={() => setIsMenuOpen(false)}
                >
                  登录
                </Link>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Search Modal */}
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
}
```

### 2.2 加载状态组件
`components/ui/LoadingStates.tsx`:
```typescript
// 骨架屏
export function PostSkeleton() {
  return (
    <div className="card p-6 animate-pulse">
      <div className="flex items-center space-x-4 mb-4">
        <div className="h-3 w-20 bg-gray-200 rounded"></div>
        <div className="h-3 w-32 bg-gray-200 rounded"></div>
      </div>
      <div className="h-6 w-3/4 bg-gray-200 rounded mb-3"></div>
      <div className="space-y-2 mb-4">
        <div className="h-4 bg-gray-200 rounded"></div>
        <div className="h-4 bg-gray-200 rounded"></div>
        <div className="h-4 w-5/6 bg-gray-200 rounded"></div>
      </div>
      <div className="flex items-center space-x-4">
        <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
        <div className="flex-1">
          <div className="h-4 w-24 bg-gray-200 rounded mb-1"></div>
          <div className="h-3 w-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    </div>
  );
}

// Loading Spinner
export function LoadingSpinner({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-8 w-8",
    lg: "h-12 w-12",
  };

  return (
    <div className="flex justify-center items-center">
      <div
        className={`${sizeClasses[size]} animate-spin rounded-full border-2 border-gray-300 border-t-primary-600`}
      />
    </div>
  );
}

// 页面加载
export function PageLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <LoadingSpinner size="lg" />
        <p className="mt-4 text-gray-600">加载中...</p>
      </div>
    </div>
  );
}
```

### 2.3 空状态组件
`components/ui/EmptyStates.tsx`:
```typescript
import { FileX, Search, MessageSquare } from "lucide-react";

interface EmptyStateProps {
  type: "posts" | "search" | "comments";
  message?: string;
}

export default function EmptyState({ type, message }: EmptyStateProps) {
  const config = {
    posts: {
      icon: FileX,
      title: "暂无文章",
      description: message || "这里还没有任何文章，请稍后再来查看。",
    },
    search: {
      icon: Search,
      title: "未找到结果",
      description: message || "尝试使用其他关键词进行搜索。",
    },
    comments: {
      icon: MessageSquare,
      title: "暂无评论",
      description: message || "成为第一个发表评论的人吧！",
    },
  };

  const { icon: Icon, title, description } = config[type];

  return (
    <div className="text-center py-12">
      <Icon className="mx-auto h-12 w-12 text-gray-400" />
      <h3 className="mt-2 text-sm font-medium text-gray-900">{title}</h3>
      <p className="mt-1 text-sm text-gray-500">{description}</p>
    </div>
  );
}
```

## 3. 响应式设计

### 3.1 博客卡片组件
`components/blog/PostCard.tsx`:
```typescript
import Image from "next/image";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { zhCN } from "date-fns/locale";
import { Calendar, Clock, Eye, MessageCircle, Heart } from "lucide-react";

interface PostCardProps {
  post: {
    id: string;
    title: string;
    slug: string;
    excerpt?: string;
    featured_image?: string;
    published_at: Date;
    reading_time: number;
    view_count: number;
    author: {
      name: string;
      avatar_url?: string;
    };
    category: {
      name: string;
      slug: string;
    };
    _count: {
      comments: number;
      likes: number;
    };
  };
}

export default function PostCard({ post }: PostCardProps) {
  return (
    <article className="card-hover group">
      <Link href={`/blog/${post.slug}`} className="block">
        {/* 图片区域 */}
        {post.featured_image && (
          <div className="aspect-w-16 aspect-h-9 bg-gray-100">
            <Image
              src={post.featured_image}
              alt={post.title}
              width={640}
              height={360}
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>
        )}

        <div className="p-6">
          {/* 元信息 */}
          <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
            <span className="text-primary-600 font-medium">
              {post.category.name}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {formatDistanceToNow(new Date(post.published_at), {
                locale: zhCN,
                addSuffix: true,
              })}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {post.reading_time} 分钟
            </span>
          </div>

          {/* 标题 */}
          <h3 className="text-xl font-bold text-gray-900 group-hover:text-primary-600 transition-colors mb-2">
            {post.title}
          </h3>

          {/* 摘要 */}
          {post.excerpt && (
            <p className="text-gray-600 line-clamp-2 mb-4">{post.excerpt}</p>
          )}

          {/* 底部信息 */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {post.author.avatar_url && (
                <Image
                  src={post.author.avatar_url}
                  alt={post.author.name}
                  width={32}
                  height={32}
                  className="rounded-full"
                />
              )}
              <span className="text-sm font-medium text-gray-700">
                {post.author.name}
              </span>
            </div>

            <div className="flex items-center gap-4 text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <Eye className="h-4 w-4" />
                {post.view_count}
              </span>
              <span className="flex items-center gap-1">
                <MessageCircle className="h-4 w-4" />
                {post._count.comments}
              </span>
              <span className="flex items-center gap-1">
                <Heart className="h-4 w-4" />
                {post._count.likes}
              </span>
            </div>
          </div>
        </div>
      </Link>
    </article>
  );
}
```

### 3.2 响应式网格布局
`components/blog/PostGrid.tsx`:
```typescript
import PostCard from "./PostCard";
import { PostSkeleton } from "../ui/LoadingStates";

interface PostGridProps {
  posts: any[];
  loading?: boolean;
  columns?: 1 | 2 | 3;
}

export default function PostGrid({
  posts,
  loading = false,
  columns = 3,
}: PostGridProps) {
  const gridClasses = {
    1: "grid-cols-1",
    2: "grid-cols-1 md:grid-cols-2",
    3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
  };

  if (loading) {
    return (
      <div className={`grid ${gridClasses[columns]} gap-6`}>
        {[...Array(6)].map((_, i) => (
          <PostSkeleton key={i} />
        ))}
      </div>
    );
  }

  return (
    <div className={`grid ${gridClasses[columns]} gap-6`}>
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
}
```