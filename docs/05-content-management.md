# 内容管理系统实现指南

## 1. 文章管理

### 1.1 文章编辑器组件
`components/editor/MarkdownEditor.tsx`:
```typescript
"use client";

import { useState, useCallback } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import dynamic from "next/dynamic";

// 动态导入编辑器避免SSR问题
const MDEditor = dynamic(
  () => import("@uiw/react-md-editor").then((mod) => mod.default),
  { ssr: false }
);

const postSchema = z.object({
  title: z.string().min(1, "标题不能为空"),
  slug: z.string().min(1, "URL别名不能为空"),
  content: z.string().min(1, "内容不能为空"),
  excerpt: z.string().optional(),
  category_id: z.string().min(1, "请选择分类"),
  tags: z.array(z.string()).optional(),
  featured_image: z.string().optional(),
  status: z.enum(["draft", "published"]),
  meta_keywords: z.string().optional(),
  meta_description: z.string().optional(),
});

type PostFormData = z.infer<typeof postSchema>;

interface MarkdownEditorProps {
  initialData?: Partial<PostFormData>;
  onSubmit: (data: PostFormData) => Promise<void>;
  categories: Array<{ id: string; name: string }>;
  tags: Array<{ id: string; name: string }>;
}

export default function MarkdownEditor({
  initialData,
  onSubmit,
  categories,
  tags,
}: MarkdownEditorProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>(
    initialData?.tags || []
  );

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<PostFormData>({
    resolver: zodResolver(postSchema),
    defaultValues: {
      status: "draft",
      ...initialData,
    },
  });

  const generateSlug = useCallback((title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, "-")
      .replace(/(^-|-$)/g, "");
  }, []);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    setValue("title", title);
    if (!initialData?.slug) {
      setValue("slug", generateSlug(title));
    }
  };

  const handleFormSubmit = async (data: PostFormData) => {
    setIsLoading(true);
    try {
      await onSubmit({ ...data, tags: selectedTags });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          {/* 标题 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              文章标题
            </label>
            <input
              type="text"
              {...register("title")}
              onChange={handleTitleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="输入文章标题"
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
            )}
          </div>

          {/* URL别名 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              URL别名
            </label>
            <input
              type="text"
              {...register("slug")}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="url-slug"
            />
            {errors.slug && (
              <p className="mt-1 text-sm text-red-600">{errors.slug.message}</p>
            )}
          </div>

          {/* 摘要 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              文章摘要
            </label>
            <textarea
              {...register("excerpt")}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="简短描述文章内容..."
            />
          </div>

          {/* Markdown编辑器 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              文章内容
            </label>
            <Controller
              name="content"
              control={control}
              render={({ field }) => (
                <MDEditor
                  value={field.value}
                  onChange={(value) => field.onChange(value || "")}
                  preview="edit"
                  height={400}
                />
              )}
            />
            {errors.content && (
              <p className="mt-1 text-sm text-red-600">
                {errors.content.message}
              </p>
            )}
          </div>

          {/* SEO设置 */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">SEO设置</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Meta关键词
              </label>
              <input
                type="text"
                {...register("meta_keywords")}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="关键词1, 关键词2, 关键词3"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Meta描述
              </label>
              <textarea
                {...register("meta_description")}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="搜索引擎展示的描述文字"
              />
            </div>
          </div>
        </div>

        {/* 侧边栏 */}
        <div className="space-y-6">
          {/* 发布设置 */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900 mb-4">发布设置</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  状态
                </label>
                <select
                  {...register("status")}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="draft">草稿</option>
                  <option value="published">已发布</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  分类
                </label>
                <select
                  {...register("category_id")}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">选择分类</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
                {errors.category_id && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.category_id.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  标签
                </label>
                <div className="space-y-2">
                  {tags.map((tag) => (
                    <label key={tag.id} className="flex items-center">
                      <input
                        type="checkbox"
                        value={tag.id}
                        checked={selectedTags.includes(tag.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedTags([...selectedTags, tag.id]);
                          } else {
                            setSelectedTags(
                              selectedTags.filter((id) => id !== tag.id)
                            );
                          }
                        }}
                        className="mr-2"
                      />
                      {tag.name}
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* 特色图片 */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900 mb-4">特色图片</h3>
            <div className="space-y-4">
              <input
                type="text"
                {...register("featured_image")}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="图片URL"
              />
              {watch("featured_image") && (
                <img
                  src={watch("featured_image")}
                  alt="预览"
                  className="w-full h-32 object-cover rounded"
                />
              )}
            </div>
          </div>

          {/* 提交按钮 */}
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {isLoading ? "保存中..." : "保存文章"}
            </button>
            <button
              type="button"
              className="flex-1 bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              预览
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}
```

### 1.2 文章 API 路由
`app/api/posts/route.ts`:
```typescript
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { z } from "zod";

const postSchema = z.object({
  title: z.string().min(1),
  slug: z.string().min(1),
  content: z.string().min(1),
  excerpt: z.string().optional(),
  category_id: z.string(),
  tags: z.array(z.string()).optional(),
  featured_image: z.string().optional(),
  status: z.enum(["draft", "published"]),
  meta_keywords: z.string().optional(),
  meta_description: z.string().optional(),
});

// 获取文章列表
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "10");
  const status = searchParams.get("status") || "published";
  const category = searchParams.get("category");
  const tag = searchParams.get("tag");
  const search = searchParams.get("search");

  const where: any = { status };

  if (category) {
    where.category = { slug: category };
  }

  if (tag) {
    where.tags = { some: { tag: { slug: tag } } };
  }

  if (search) {
    where.OR = [
      { title: { contains: search } },
      { content: { contains: search } },
      { excerpt: { contains: search } },
    ];
  }

  const [posts, total] = await Promise.all([
    prisma.post.findMany({
      where,
      include: {
        author: { select: { name: true, avatar_url: true } },
        category: { select: { name: true, slug: true } },
        tags: {
          include: {
            tag: { select: { name: true, slug: true } },
          },
        },
        _count: {
          select: { comments: true, likes: true },
        },
      },
      orderBy: { published_at: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.post.count({ where }),
  ]);

  return NextResponse.json({
    success: true,
    data: posts,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
}

// 创建文章
export async function POST(request: NextRequest) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json(
      { success: false, error: "未授权" },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    const data = postSchema.parse(body);

    // 计算阅读时间（每分钟200字）
    const readingTime = Math.ceil(data.content.length / 200);

    const post = await prisma.post.create({
      data: {
        title: data.title,
        slug: data.slug,
        content: data.content,
        excerpt: data.excerpt,
        featured_image: data.featured_image,
        status: data.status,
        meta_keywords: data.meta_keywords,
        meta_description: data.meta_description,
        reading_time: readingTime,
        author_id: session.user.id,
        category_id: data.category_id,
        published_at: data.status === "published" ? new Date() : null,
        tags: data.tags
          ? {
              create: data.tags.map((tagId) => ({
                tag_id: tagId,
              })),
            }
          : undefined,
      },
      include: {
        author: true,
        category: true,
        tags: { include: { tag: true } },
      },
    });

    return NextResponse.json({
      success: true,
      data: post,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: "输入数据无效", details: error.errors },
        { status: 400 }
      );
    }

    console.error("创建文章错误:", error);
    return NextResponse.json(
      { success: false, error: "服务器错误" },
      { status: 500 }
    );
  }
}
```

### 1.3 文章详情页
`app/blog/[slug]/page.tsx`:
```typescript
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { MDXRemote } from "next-mdx-remote/rsc";
import Image from "next/image";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { zhCN } from "date-fns/locale";
import CommentSection from "@/components/blog/CommentSection";
import ShareButtons from "@/components/social/ShareButtons";
import RelatedPosts from "@/components/blog/RelatedPosts";

interface Props {
  params: { slug: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await prisma.post.findUnique({
    where: { slug: params.slug },
    include: { author: true, category: true },
  });

  if (!post) return { title: "文章未找到" };

  return {
    title: post.title,
    description: post.excerpt || post.meta_description,
    keywords: post.meta_keywords,
    openGraph: {
      title: post.title,
      description: post.excerpt || post.meta_description,
      images: post.featured_image ? [post.featured_image] : [],
      type: "article",
      publishedTime: post.published_at?.toISOString(),
      authors: [post.author.name],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt || post.meta_description,
      images: post.featured_image ? [post.featured_image] : [],
    },
  };
}

export default async function BlogPost({ params }: Props) {
  const post = await prisma.post.findUnique({
    where: { slug: params.slug, status: "published" },
    include: {
      author: true,
      category: true,
      tags: { include: { tag: true } },
      _count: { select: { comments: true, likes: true } },
    },
  });

  if (!post) notFound();

  // 增加浏览量
  await prisma.post.update({
    where: { id: post.id },
    data: { view_count: { increment: 1 } },
  });

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    image: post.featured_image,
    datePublished: post.published_at,
    dateModified: post.updated_at,
    author: {
      "@type": "Person",
      name: post.author.name,
    },
    publisher: {
      "@type": "Organization",
      name: "My Blog",
      logo: {
        "@type": "ImageObject",
        url: "/logo.png",
      },
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <article className="max-w-4xl mx-auto px-4 py-8">
        {/* 文章头部 */}
        <header className="mb-8">
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
            <Link
              href={`/blog/category/${post.category.slug}`}
              className="hover:text-blue-600"
            >
              {post.category.name}
            </Link>
            <span>·</span>
            <time>
              {formatDistanceToNow(new Date(post.published_at!), {
                locale: zhCN,
                addSuffix: true,
              })}
            </time>
            <span>·</span>
            <span>{post.reading_time} 分钟阅读</span>
          </div>

          <h1 className="text-4xl font-bold mb-4">{post.title}</h1>

          {post.excerpt && (
            <p className="text-xl text-gray-600 mb-6">{post.excerpt}</p>
          )}

          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              {post.author.avatar_url && (
                <Image
                  src={post.author.avatar_url}
                  alt={post.author.name}
                  width={48}
                  height={48}
                  className="rounded-full"
                />
              )}
              <div>
                <div className="font-medium">{post.author.name}</div>
                <div className="text-sm text-gray-600">
                  {post.view_count} 次浏览 · {post._count.comments} 条评论
                </div>
              </div>
            </div>

            <ShareButtons
              url={`${process.env.NEXT_PUBLIC_BASE_URL}/blog/${post.slug}`}
              title={post.title}
              description={post.excerpt || ""}
            />
          </div>
        </header>

        {/* 特色图片 */}
        {post.featured_image && (
          <div className="mb-8">
            <Image
              src={post.featured_image}
              alt={post.title}
              width={896}
              height={504}
              className="w-full h-auto rounded-lg"
              priority
            />
          </div>
        )}

        {/* 文章内容 */}
        <div className="prose prose-lg max-w-none">
          <MDXRemote source={post.content} />
        </div>

        {/* 标签 */}
        {post.tags.length > 0 && (
          <footer className="mt-8 pt-8 border-t">
            <div className="flex flex-wrap gap-2">
              {post.tags.map(({ tag }) => (
                <Link
                  key={tag.id}
                  href={`/blog/tag/${tag.slug}`}
                  className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200"
                >
                  #{tag.name}
                </Link>
              ))}
            </div>
          </footer>
        )}

        {/* 相关文章 */}
        <RelatedPosts
          categoryId={post.category_id}
          currentPostId={post.id}
          className="mt-12"
        />

        {/* 评论区 */}
        <CommentSection postId={post.id} className="mt-12" />
      </article>
    </>
  );
}
```