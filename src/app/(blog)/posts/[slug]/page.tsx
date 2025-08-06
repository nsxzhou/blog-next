import { notFound } from 'next/navigation';
import { PostService } from '@/lib/services/post.service';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar, User, Eye, Tag } from 'lucide-react';
import ReactMarkdown, { Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';

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
    <article className="container mx-auto px-4 py-8 max-w-4xl">
      {/* 文章头部信息 */}
      <header className="mb-8 space-y-4">
        <h1 className="text-4xl font-bold tracking-tight text-foreground">
          {post.title}
        </h1>
        
        {/* 文章元信息 */}
        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
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
            <div className="flex items-center gap-1">
              <User className="w-4 h-4" />
              <span>{post.author.name}</span>
            </div>
          )}
          
          <div className="flex items-center gap-1">
            <Eye className="w-4 h-4" />
            <span>{post.viewCount} 次浏览</span>
          </div>
        </div>
        
        {/* 状态和特色标识 */}
        <div className="flex flex-wrap gap-2">
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
          <div className="flex flex-wrap gap-2 pt-2">
            {post.tags.map((tag) => (
              <Badge 
                key={tag.id} 
                variant="outline" 
                className="flex items-center gap-1"
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
        <Card className="mb-8">
          <CardContent className="pl-6">
            <p className="text-muted-foreground italic text-lg leading-relaxed">
              {post.excerpt}
            </p>
          </CardContent>
        </Card>
      )}

      {/* 文章内容 - 使用专业的Markdown渲染器 */}
      <div className="mt-8">
        {post.content ? (
          <div className="prose prose-neutral dark:prose-invert max-w-none prose-headings:font-bold prose-h1:text-3xl prose-h2:text-2xl prose-h3:text-xl prose-p:leading-relaxed prose-blockquote:border-l-4 prose-blockquote:border-primary/30 prose-blockquote:pl-4 prose-blockquote:italic prose-code:bg-muted prose-code:px-2 prose-code:py-1 prose-code:rounded prose-pre:bg-muted prose-pre:p-4 prose-pre:rounded-lg prose-pre:overflow-x-auto">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                pre: ({ ...props }) => (
                  <Card className="my-6">
                    <CardContent className="p-4">
                      <pre {...props} className="text-sm overflow-x-auto" />
                    </CardContent>
                  </Card>
                ),
                code: ({ className, children, ...props }) => {
                  const isInline = !className;
                  if (isInline) {
                    return (
                      <code className="bg-muted px-2 py-1 rounded text-sm" {...props}>
                        {children}
                      </code>
                    );
                  }
                  return (
                    <code className={className} {...props}>
                      {children}
                    </code>
                  );
                },
              } as Components}
            >
              {post.content}
            </ReactMarkdown>
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <p>暂无内容</p>
          </div>
        )}
      </div>
    </article>
  );
}