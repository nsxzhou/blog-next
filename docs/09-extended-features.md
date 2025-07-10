# 扩展功能实现指南

## 1. 评论系统

### 1.1 评论组件
`components/blog/CommentSection.tsx`:
```typescript
"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { zhCN } from "date-fns/locale";
import { MessageCircle, Send, Heart, Flag } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const commentSchema = z.object({
  content: z.string().min(1, "评论内容不能为空").max(500, "评论内容不能超过500字"),
});

type CommentFormData = z.infer<typeof commentSchema>;

interface Comment {
  id: string;
  content: string;
  created_at: Date;
  author: {
    id: string;
    name: string;
    avatar_url?: string;
  };
  replies?: Comment[];
  _count?: {
    likes: number;
  };
  isLiked?: boolean;
}

interface CommentSectionProps {
  postId: string;
  className?: string;
}

export default function CommentSection({ postId, className = "" }: CommentSectionProps) {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const [replyTo, setReplyTo] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CommentFormData>({
    resolver: zodResolver(commentSchema),
  });

  // 获取评论列表
  const { data: comments, isLoading } = useQuery({
    queryKey: ["comments", postId],
    queryFn: async () => {
      const response = await fetch(`/api/posts/${postId}/comments`);
      if (!response.ok) throw new Error("Failed to fetch comments");
      return response.json();
    },
  });

  // 发表评论
  const submitComment = useMutation({
    mutationFn: async (data: CommentFormData & { parent_id?: string }) => {
      const response = await fetch(`/api/posts/${postId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to submit comment");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", postId] });
      reset();
      setReplyTo(null);
    },
  });

  // 点赞评论
  const toggleLike = useMutation({
    mutationFn: async (commentId: string) => {
      const response = await fetch(`/api/comments/${commentId}/like`, {
        method: "POST",
      });
      if (!response.ok) throw new Error("Failed to toggle like");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", postId] });
    },
  });

  const onSubmit = (data: CommentFormData) => {
    if (!session) {
      alert("请先登录后再评论");
      return;
    }

    submitComment.mutate({
      ...data,
      parent_id: replyTo || undefined,
    });
  };

  const CommentItem = ({ comment, level = 0 }: { comment: Comment; level?: number }) => {
    const isReply = level > 0;

    return (
      <div className={`${isReply ? "ml-12" : ""}`}>
        <div className="flex gap-4">
          <img
            src={comment.author.avatar_url || "/default-avatar.png"}
            alt={comment.author.name}
            className="w-10 h-10 rounded-full"
          />

          <div className="flex-1">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-900">
                    {comment.author.name}
                  </span>
                  <span className="text-sm text-gray-500">
                    {formatDistanceToNow(new Date(comment.created_at), {
                      locale: zhCN,
                      addSuffix: true,
                    })}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleLike.mutate(comment.id)}
                    className={`flex items-center gap-1 text-sm ${
                      comment.isLiked ? "text-red-500" : "text-gray-500"
                    } hover:text-red-500`}
                    disabled={!session}
                  >
                    <Heart
                      className={`w-4 h-4 ${comment.isLiked ? "fill-current" : ""}`}
                    />
                    {comment._count?.likes || 0}
                  </button>

                  <button className="text-gray-500 hover:text-gray-700">
                    <Flag className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <p className="text-gray-700 whitespace-pre-wrap">{comment.content}</p>

              {!isReply && (
                <button
                  onClick={() => setReplyTo(comment.id)}
                  className="mt-2 text-sm text-primary-600 hover:text-primary-700"
                >
                  回复
                </button>
              )}
            </div>

            {/* 回复表单 */}
            {replyTo === comment.id && (
              <form onSubmit={handleSubmit(onSubmit)} className="mt-4">
                <div className="flex gap-2">
                  <input
                    {...register("content")}
                    placeholder="写下你的回复..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                  <button
                    type="submit"
                    disabled={submitComment.isPending}
                    className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50"
                  >
                    发送
                  </button>
                  <button
                    type="button"
                    onClick={() => setReplyTo(null)}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800"
                  >
                    取消
                  </button>
                </div>
                {errors.content && (
                  <p className="mt-1 text-sm text-red-600">{errors.content.message}</p>
                )}
              </form>
            )}

            {/* 子评论 */}
            {comment.replies && comment.replies.length > 0 && (
              <div className="mt-4 space-y-4">
                {comment.replies.map((reply) => (
                  <CommentItem key={reply.id} comment={reply} level={level + 1} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={className}>
      <div className="flex items-center gap-2 mb-6">
        <MessageCircle className="w-5 h-5" />
        <h2 className="text-xl font-bold">
          评论 ({comments?.length || 0})
        </h2>
      </div>

      {/* 评论表单 */}
      {session ? (
        <form onSubmit={handleSubmit(onSubmit)} className="mb-8">
          <div className="flex gap-4">
            <img
              src={session.user.image || "/default-avatar.png"}
              alt={session.user.name || ""}
              className="w-10 h-10 rounded-full"
            />
            <div className="flex-1">
              <textarea
                {...register("content")}
                rows={3}
                placeholder="写下你的评论..."
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              {errors.content && (
                <p className="mt-1 text-sm text-red-600">{errors.content.message}</p>
              )}
              <div className="mt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={submitComment.isPending}
                  className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  发表评论
                </button>
              </div>
            </div>
          </div>
        </form>
      ) : (
        <div className="mb-8 p-4 bg-gray-50 rounded-lg text-center">
          <p className="text-gray-600">
            请{" "}
            <a href="/login" className="text-primary-600 hover:text-primary-700">
              登录
            </a>{" "}
            后发表评论
          </p>
        </div>
      )}

      {/* 评论列表 */}
      {isLoading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="flex gap-4">
                <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-20 bg-gray-200 rounded-lg"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : comments && comments.length > 0 ? (
        <div className="space-y-6">
          {comments.map((comment: Comment) => (
            <CommentItem key={comment.id} comment={comment} />
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          暂无评论，快来发表第一个评论吧！
        </div>
      )}
    </div>
  );
}
```

## 2. 搜索功能

### 2.1 搜索模态框
`components/search/SearchModal.tsx`:
```typescript
"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, X, FileText, Tag, Folder, Clock } from "lucide-react";
import { useDebounce } from "@/hooks/useDebounce";

interface SearchResult {
  type: "post" | "category" | "tag";
  id: string;
  title: string;
  slug: string;
  description?: string;
  highlight?: string;
}

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const debouncedQuery = useDebounce(query, 300);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    if (debouncedQuery.length < 2) {
      setResults([]);
      return;
    }

    const searchContent = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `/api/search?q=${encodeURIComponent(debouncedQuery)}`
        );
        if (response.ok) {
          const data = await response.json();
          setResults(data.results);
        }
      } catch (error) {
        console.error("Search error:", error);
      } finally {
        setLoading(false);
      }
    };

    searchContent();
  }, [debouncedQuery]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % results.length);
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + results.length) % results.length);
        break;
      case "Enter":
        e.preventDefault();
        if (results[selectedIndex]) {
          handleResultClick(results[selectedIndex]);
        }
        break;
      case "Escape":
        onClose();
        break;
    }
  };

  const handleResultClick = (result: SearchResult) => {
    const url =
      result.type === "post"
        ? `/blog/${result.slug}`
        : result.type === "category"
        ? `/blog/category/${result.slug}`
        : `/blog/tag/${result.slug}`;

    router.push(url);
    onClose();
    setQuery("");
    setResults([]);
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "post":
        return <FileText className="w-4 h-4" />;
      case "category":
        return <Folder className="w-4 h-4" />;
      case "tag":
        return <Tag className="w-4 h-4" />;
      default:
        return null;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="min-h-screen px-4 text-center">
        {/* 背景遮罩 */}
        <div
          className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
          onClick={onClose}
        />

        {/* 搜索框容器 */}
        <div className="inline-block w-full max-w-2xl my-8 text-left align-middle transition-all transform bg-white shadow-xl rounded-lg">
          {/* 搜索输入 */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="搜索文章、分类或标签..."
              className="w-full pl-12 pr-12 py-4 text-lg border-b border-gray-200 focus:outline-none"
            />
            <button
              onClick={onClose}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* 搜索结果 */}
          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="p-8 text-center text-gray-500">
                <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
              </div>
            ) : results.length > 0 ? (
              <ul className="py-2">
                {results.map((result, index) => (
                  <li key={`${result.type}-${result.id}`}>
                    <button
                      onClick={() => handleResultClick(result)}
                      className={`w-full px-4 py-3 flex items-start gap-3 hover:bg-gray-50 transition-colors ${
                        index === selectedIndex ? "bg-gray-50" : ""
                      }`}
                    >
                      <span className="text-gray-400 mt-0.5">
                        {getIcon(result.type)}
                      </span>
                      <div className="flex-1 text-left">
                        <div className="font-medium text-gray-900">
                          {result.title}
                        </div>
                        {result.description && (
                          <div className="text-sm text-gray-500 mt-1">
                            {result.description}
                          </div>
                        )}
                        {result.highlight && (
                          <div
                            className="text-sm text-gray-600 mt-1"
                            dangerouslySetInnerHTML={{ __html: result.highlight }}
                          />
                        )}
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            ) : query.length >= 2 ? (
              <div className="p-8 text-center text-gray-500">
                未找到相关结果
              </div>
            ) : (
              <div className="p-8">
                <div className="text-sm text-gray-500 mb-4">快捷搜索</div>
                <div className="space-y-2">
                  <QuickSearchItem
                    icon={<Clock className="w-4 h-4" />}
                    text="最近发布"
                    onClick={() => {
                      router.push("/blog?sort=latest");
                      onClose();
                    }}
                  />
                  <QuickSearchItem
                    icon={<Tag className="w-4 h-4" />}
                    text="热门标签"
                    onClick={() => {
                      router.push("/tags");
                      onClose();
                    }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* 搜索提示 */}
          <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 text-xs text-gray-500">
            <span className="inline-flex items-center gap-2">
              <kbd className="px-1.5 py-0.5 bg-white border border-gray-300 rounded">
                ↑↓
              </kbd>
              导航
            </span>
            <span className="inline-flex items-center gap-2 ml-4">
              <kbd className="px-1.5 py-0.5 bg-white border border-gray-300 rounded">
                Enter
              </kbd>
              选择
            </span>
            <span className="inline-flex items-center gap-2 ml-4">
              <kbd className="px-1.5 py-0.5 bg-white border border-gray-300 rounded">
                Esc
              </kbd>
              关闭
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function QuickSearchItem({
  icon,
  text,
  onClick,
}: {
  icon: React.ReactNode;
  text: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full px-3 py-2 flex items-center gap-3 text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
    >
      <span className="text-gray-400">{icon}</span>
      <span>{text}</span>
    </button>
  );
}
```

### 2.2 搜索 API
`app/api/search/route.ts`:
```typescript
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get("q") || "";

  if (query.length < 2) {
    return NextResponse.json({ results: [] });
  }

  try {
    // 搜索文章
    const posts = await prisma.post.findMany({
      where: {
        AND: [
          { status: "published" },
          {
            OR: [
              { title: { contains: query } },
              { content: { contains: query } },
              { excerpt: { contains: query } },
            ],
          },
        ],
      },
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        content: true,
      },
      take: 5,
    });

    // 搜索分类
    const categories = await prisma.category.findMany({
      where: {
        OR: [
          { name: { contains: query } },
          { description: { contains: query } },
        ],
      },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
      },
      take: 3,
    });

    // 搜索标签
    const tags = await prisma.tag.findMany({
      where: {
        name: { contains: query },
      },
      select: {
        id: true,
        name: true,
        slug: true,
      },
      take: 3,
    });

    // 格式化结果
    const results = [
      ...posts.map((post) => ({
        type: "post" as const,
        id: post.id,
        title: post.title,
        slug: post.slug,
        description: post.excerpt,
        highlight: highlightText(post.content, query, 150),
      })),
      ...categories.map((category) => ({
        type: "category" as const,
        id: category.id,
        title: category.name,
        slug: category.slug,
        description: category.description,
      })),
      ...tags.map((tag) => ({
        type: "tag" as const,
        id: tag.id,
        title: tag.name,
        slug: tag.slug,
      })),
    ];

    return NextResponse.json({ results });
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json(
      { error: "Search failed" },
      { status: 500 }
    );
  }
}

function highlightText(text: string, query: string, maxLength: number): string {
  const index = text.toLowerCase().indexOf(query.toLowerCase());
  if (index === -1) return "";

  const start = Math.max(0, index - 50);
  const end = Math.min(text.length, index + query.length + maxLength);
  
  let excerpt = text.slice(start, end);
  if (start > 0) excerpt = "..." + excerpt;
  if (end < text.length) excerpt = excerpt + "...";

  // 高亮匹配文本
  const regex = new RegExp(`(${query})`, "gi");
  return excerpt.replace(regex, "<mark>$1</mark>");
}
```

## 3. 社交分享

### 3.1 分享组件
`components/social/ShareButtons.tsx`:
```typescript
"use client";

import { useState } from "react";
import {
  Twitter,
  Facebook,
  Linkedin,
  Link2,
  Check,
  Share2,
} from "lucide-react";

interface ShareButtonsProps {
  url: string;
  title: string;
  description: string;
}

export default function ShareButtons({
  url,
  title,
  description,
}: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const shareLinks = {
    twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(
      url
    )}&text=${encodeURIComponent(title)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
      url
    )}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
      url
    )}`,
    weibo: `https://service.weibo.com/share/share.php?url=${encodeURIComponent(
      url
    )}&title=${encodeURIComponent(title)}`,
    email: `mailto:?subject=${encodeURIComponent(
      title
    )}&body=${encodeURIComponent(description + "\n\n" + url)}`,
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: description,
          url,
        });
      } catch (err) {
        console.log("Share cancelled or failed:", err);
      }
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
      >
        <Share2 className="w-4 h-4" />
        分享
      </button>

      {showDropdown && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setShowDropdown(false)}
          />
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-20">
            {/* Native Share (如果支持) */}
            {navigator.share && (
              <button
                onClick={handleNativeShare}
                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3"
              >
                <Share2 className="w-4 h-4" />
                分享到...
              </button>
            )}

            {/* 社交平台 */}
            <a
              href={shareLinks.twitter}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3"
            >
              <Twitter className="w-4 h-4" />
              Twitter
            </a>

            <a
              href={shareLinks.facebook}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3"
            >
              <Facebook className="w-4 h-4" />
              Facebook
            </a>

            <a
              href={shareLinks.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3"
            >
              <Linkedin className="w-4 h-4" />
              LinkedIn
            </a>

            <a
              href={shareLinks.weibo}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19.235 9.42c.2-.63.235-1.94-.57-3.15-.805-1.21-2.115-1.61-3.005-1.54-.89.07-1.58.375-1.58.375s.805-3.31-1.045-3.74c-1.85-.43-3.525 2.58-4.37 3.98-.845 1.4-1.075 2.24-1.075 2.24s-3.915-.56-6.68 2.17C-1.855 12.44.815 16.42 4.34 17.58c3.525 1.16 7.76-.42 9.61-2.59 1.85-2.17 1.82-3.78 1.82-3.78s2.665.4 3.065-.21c.4-.61-.2-1.15 0-1.58zm-6.91 4.86c-2.745 1.96-6.095 1.61-7.485-.77-1.39-2.38-.43-5.34 2.315-7.3 2.745-1.96 6.32-1.75 7.71.63 1.39 2.38.205 5.48-2.54 7.44z" />
              </svg>
              微博
            </a>

            <div className="border-t border-gray-200 my-2"></div>

            {/* 复制链接 */}
            <button
              onClick={copyToClipboard}
              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-green-600" />
                  <span className="text-green-600">已复制</span>
                </>
              ) : (
                <>
                  <Link2 className="w-4 h-4" />
                  复制链接
                </>
              )}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
```