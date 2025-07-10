# 性能优化与SEO指南

## 1. SEO 优化

### 1.1 动态元数据生成
`app/layout.tsx`:
```typescript
import { Metadata } from "next";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"),
  title: {
    default: "My Blog - 分享技术与生活",
    template: "%s | My Blog",
  },
  description: "一个专注于技术分享和生活感悟的个人博客",
  keywords: ["博客", "技术", "前端", "后端", "生活"],
  authors: [{ name: "Your Name" }],
  creator: "Your Name",
  publisher: "Your Name",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: "My Blog",
    description: "一个专注于技术分享和生活感悟的个人博客",
    url: "/",
    siteName: "My Blog",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "My Blog",
      },
    ],
    locale: "zh_CN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "My Blog",
    description: "一个专注于技术分享和生活感悟的个人博客",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "your-google-verification-code",
    yandex: "your-yandex-verification-code",
  },
};
```

### 1.2 Sitemap 生成
`app/sitemap.ts`:
```typescript
import { MetadataRoute } from "next";
import { prisma } from "@/lib/db";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

  // 获取所有已发布的文章
  const posts = await prisma.post.findMany({
    where: { status: "published" },
    select: {
      slug: true,
      updated_at: true,
    },
  });

  // 获取所有分类
  const categories = await prisma.category.findMany({
    select: {
      slug: true,
    },
  });

  // 获取所有标签
  const tags = await prisma.tag.findMany({
    select: {
      slug: true,
    },
  });

  // 静态页面
  const staticPages = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 1,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/categories`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/tags`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    },
  ];

  // 文章页面
  const postPages = posts.map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: post.updated_at,
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  // 分类页面
  const categoryPages = categories.map((category) => ({
    url: `${baseUrl}/blog/category/${category.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.5,
  }));

  // 标签页面
  const tagPages = tags.map((tag) => ({
    url: `${baseUrl}/blog/tag/${tag.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.5,
  }));

  return [...staticPages, ...postPages, ...categoryPages, ...tagPages];
}
```

### 1.3 Robots.txt
`app/robots.ts`:
```typescript
import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin/", "/api/", "/login", "/register"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
```

### 1.4 结构化数据
`components/seo/JsonLd.tsx`:
```typescript
interface BlogPostingProps {
  title: string;
  description: string;
  datePublished: string;
  dateModified: string;
  author: string;
  image?: string;
  url: string;
}

export function BlogPostingJsonLd({
  title,
  description,
  datePublished,
  dateModified,
  author,
  image,
  url,
}: BlogPostingProps) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: title,
    description,
    image: image || [],
    datePublished,
    dateModified,
    author: {
      "@type": "Person",
      name: author,
    },
    publisher: {
      "@type": "Organization",
      name: "My Blog",
      logo: {
        "@type": "ImageObject",
        url: `${process.env.NEXT_PUBLIC_BASE_URL}/logo.png`,
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": url,
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

interface BreadcrumbProps {
  items: Array<{
    name: string;
    url: string;
  }>;
}

export function BreadcrumbJsonLd({ items }: BreadcrumbProps) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
```

## 2. 性能优化

### 2.1 图片优化
`components/blog/OptimizedImage.tsx`:
```typescript
"use client";

import Image from "next/image";
import { useState } from "react";

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  priority?: boolean;
  className?: string;
}

export default function OptimizedImage({
  src,
  alt,
  width = 800,
  height = 450,
  priority = false,
  className = "",
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  // 生成不同尺寸的图片URL（如果使用CDN）
  const generateSrcSet = () => {
    const sizes = [640, 750, 828, 1080, 1200, 1920, 2048, 3840];
    return sizes
      .map((size) => `${src}?w=${size} ${size}w`)
      .join(", ");
  };

  if (error) {
    return (
      <div className={`bg-gray-200 flex items-center justify-center ${className}`}>
        <span className="text-gray-500">图片加载失败</span>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse" />
      )}
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        priority={priority}
        quality={85}
        placeholder="blur"
        blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAf/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWEREiMxUf/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        className={`
          duration-700 ease-in-out
          ${isLoading ? "scale-110 blur-2xl grayscale" : "scale-100 blur-0 grayscale-0"}
        `}
        onLoad={() => setIsLoading(false)}
        onError={() => setError(true)}
      />
    </div>
  );
}
```

### 2.2 数据缓存策略
`lib/cache.ts`:
```typescript
import { unstable_cache } from "next/cache";
import { prisma } from "./db";

// 缓存热门文章
export const getPopularPosts = unstable_cache(
  async () => {
    return prisma.post.findMany({
      where: { status: "published" },
      orderBy: { view_count: "desc" },
      take: 10,
      select: {
        id: true,
        title: true,
        slug: true,
        view_count: true,
      },
    });
  },
  ["popular-posts"],
  {
    revalidate: 3600, // 1小时
    tags: ["posts"],
  }
);

// 缓存分类
export const getCategories = unstable_cache(
  async () => {
    return prisma.category.findMany({
      include: {
        _count: {
          select: { posts: true },
        },
      },
    });
  },
  ["categories"],
  {
    revalidate: 86400, // 24小时
    tags: ["categories"],
  }
);

// 缓存标签云
export const getTagCloud = unstable_cache(
  async () => {
    return prisma.tag.findMany({
      include: {
        _count: {
          select: { posts: true },
        },
      },
      orderBy: {
        posts: {
          _count: "desc",
        },
      },
      take: 30,
    });
  },
  ["tag-cloud"],
  {
    revalidate: 86400, // 24小时
    tags: ["tags"],
  }
);
```

### 2.3 React Query 配置
`providers/QueryProvider.tsx`:
```typescript
"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useState } from "react";

export default function QueryProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5 * 60 * 1000, // 5分钟
            gcTime: 10 * 60 * 1000, // 10分钟
            retry: 1,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
```

### 2.4 懒加载和代码分割
`components/LazyLoad.tsx`:
```typescript
"use client";

import dynamic from "next/dynamic";
import { LoadingSpinner } from "./ui/LoadingStates";

// 动态导入评论组件
export const CommentSection = dynamic(
  () => import("./blog/CommentSection"),
  {
    loading: () => <LoadingSpinner />,
    ssr: false,
  }
);

// 动态导入编辑器
export const MarkdownEditor = dynamic(
  () => import("./editor/MarkdownEditor"),
  {
    loading: () => <LoadingSpinner />,
    ssr: false,
  }
);

// 无限滚动组件
export function InfiniteScroll({
  children,
  hasMore,
  loadMore,
  loader,
}: {
  children: React.ReactNode;
  hasMore: boolean;
  loadMore: () => void;
  loader: React.ReactNode;
}) {
  const observer = useRef<IntersectionObserver>();
  const lastElementRef = useCallback(
    (node: HTMLDivElement) => {
      if (!hasMore) return;
      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          loadMore();
        }
      });

      if (node) observer.current.observe(node);
    },
    [hasMore, loadMore]
  );

  return (
    <>
      {children}
      <div ref={lastElementRef}>{hasMore && loader}</div>
    </>
  );
}
```

## 3. Web Vitals 监控

### 3.1 性能监控
`app/layout.tsx`:
```typescript
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body>
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
```

### 3.2 自定义性能监控
`lib/monitoring/performance.ts`:
```typescript
export function reportWebVitals({
  id,
  name,
  label,
  value,
}: {
  id: string;
  name: string;
  label: string;
  value: number;
}) {
  // 发送到分析服务
  if (window.gtag) {
    window.gtag("event", name, {
      event_category:
        label === "web-vital" ? "Web Vitals" : "Next.js custom metric",
      value: Math.round(name === "CLS" ? value * 1000 : value),
      event_label: id,
      non_interaction: true,
    });
  }

  // 发送到自定义端点
  fetch("/api/analytics/vitals", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      metric: name,
      value,
      page: window.location.pathname,
      timestamp: Date.now(),
    }),
  });
}
```

## 4. 缓存和CDN配置

### 4.1 静态资源优化
`next.config.js`:
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    domains: ["your-cdn-domain.com"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
  },
  compress: true,
  poweredByHeader: false,
  generateEtags: true,
  httpAgentOptions: {
    keepAlive: true,
  },
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ["lucide-react", "@headlessui/react"],
  },
  headers: async () => [
    {
      source: "/fonts/(.*)",
      headers: [
        {
          key: "Cache-Control",
          value: "public, max-age=31536000, immutable",
        },
      ],
    },
    {
      source: "/_next/static/(.*)",
      headers: [
        {
          key: "Cache-Control",
          value: "public, max-age=31536000, immutable",
        },
      ],
    },
    {
      source: "/images/(.*)",
      headers: [
        {
          key: "Cache-Control",
          value: "public, max-age=86400, must-revalidate",
        },
      ],
    },
  ],
};

module.exports = nextConfig;
```

### 4.2 Redis 缓存
`lib/redis.ts`:
```typescript
import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export async function getCachedData<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl: number = 3600
): Promise<T> {
  // 尝试从缓存获取
  const cached = await redis.get<T>(key);
  if (cached) {
    return cached;
  }

  // 获取新数据
  const data = await fetcher();

  // 存入缓存
  await redis.setex(key, ttl, data);

  return data;
}

export async function invalidateCache(pattern: string) {
  const keys = await redis.keys(pattern);
  if (keys.length > 0) {
    await redis.del(...keys);
  }
}
```