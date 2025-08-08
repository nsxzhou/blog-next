import { notFound } from 'next/navigation';
import { PostService } from '@/lib/services/post.service';
import { BlogLayout } from '@/components/blog/layout/BlogLayout';
import { TableOfContents } from '@/components/blog/TableOfContents';
import { PostContent } from '@/components/blog/PostContent';
import { ViewTracker } from '@/components/blog/ViewTracker';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar, User, Eye, Tag } from 'lucide-react';

interface PostPageProps {
  params: Promise<{ slug: string }>;
}

export default async function PostPage({ params }: PostPageProps) {
  const { slug } = await params;
  
  // 通过 slug 获取文章
  const post = await PostService.getPostBySlug(slug);
  
  if (!post) {
    notFound();
  }

  return (
    <BlogLayout>
      {/* 浏览量追踪组件 - 遵循 SRP 原则，独立处理浏览量逻辑 */}
      <ViewTracker postId={post.id} />
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* 主内容区域 */}
        <div className="lg:col-span-3">
          <article className="max-w-none">
            {/* 文章头部信息 */}
            <header className="mb-8 space-y-6">
              <h1 className="text-4xl lg:text-5xl font-bold tracking-tight text-foreground leading-tight">
                {post.title}
              </h1>
        
              {/* 文章元信息 */}
              <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>
                    {post.publishedAt ? (
                      new Date(post.publishedAt).toLocaleDateString('zh-CN', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })
                    ) : (
                      '未发布'
                    )}
                  </span>
                </div>
          
                {post.author && (
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    <span>{post.author.name}</span>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4" />
                  <span>{post.viewCount} 次浏览</span>
                </div>
              </div>
        
              {/* 状态和特色标识 */}
              <div className="flex flex-wrap gap-3">
                <Badge 
                  variant={post.status === 'PUBLISHED' ? 'default' : 'secondary'}
                  className={post.status === 'PUBLISHED' 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                    : ''
                  }
                >
                  {post.status === 'PUBLISHED' ? '已发布' : '草稿'}
                </Badge>

                {post.featured && (
                  <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                    特色
                  </Badge>
                )}
              </div>
        
              {/* 标签 */}
              {post.tags && post.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {post.tags.map((tag) => (
                    <Badge 
                      key={tag.id} 
                      variant="outline" 
                      className="flex items-center gap-1.5 hover:bg-muted/50 transition-colors"
                    >
                      <Tag className="w-3 h-3" />
                      {tag.name}
                    </Badge>
                  ))}
                </div>
              )}
            </header>

            {/* 文章摘要 */}
            {post.excerpt && (
              <Card className="mb-8 border-l-4 border-l-primary/30">
                <CardContent className="py-6">
                  <p className="text-muted-foreground italic text-lg leading-relaxed">
                    {post.excerpt}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* 文章内容 */}
            <div className="mt-8">
              <PostContent content={post.content || ''} />
            </div>
          </article>
        </div>

        {/* 右侧目录 */}
        <div className="lg:col-span-1">
          <div className="lg:sticky lg:top-24">
            {post.content && (
              <TableOfContents 
                content={post.content} 
                className="hidden lg:block"
              />
            )}
          </div>
        </div>
      </div>
    </BlogLayout>
  );
}