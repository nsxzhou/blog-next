import { notFound } from 'next/navigation';
import { PostService } from '@/lib/services/post.service';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar, User, Eye, Tag } from 'lucide-react';

interface PostPageProps {
  params: Promise<{ slug: string }>;
}

export default async function PostPage({ params }: PostPageProps) {
  const { slug } = await params;
  
  // 直接通过 slug 获取文章
  const post = await PostService.getPostBySlug(slug);
  
  if (!post) {
    notFound();
  }

  // 简单的 MDX 渲染
  const renderMDXContent = (content: string) => {
    return (
      <div 
        className="prose prose-gray max-w-none dark:prose-invert"
        dangerouslySetInnerHTML={{ __html: content }}
      />
    );
  };

  return (
    <article className="container mx-auto px-4 py-8 max-w-4xl">
      <header className="mb-8">
        <h1 className="text-4xl font-bold mb-4">{post.title}</h1>
        
        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-4">
          <div className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            {post.publishedAt ? (
              new Date(post.publishedAt).toLocaleDateString('zh-CN', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })
            ) : (
              '未发布'
            )}
          </div>
          
          {post.author && (
            <div className="flex items-center gap-1">
              <User className="w-4 h-4" />
              {post.author.name}
            </div>
          )}
          
          <div className="flex items-center gap-1">
            <Eye className="w-4 h-4" />
            {post.viewCount} 次浏览
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2 mb-4">
          <Badge variant={post.status === 'PUBLISHED' ? 'default' : 'secondary'}>
            {post.status === 'PUBLISHED' ? '已发布' : '草稿'}
          </Badge>
          {post.featured && (
            <Badge className="bg-yellow-100 text-yellow-800">特色</Badge>
          )}
        </div>
        
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <Badge key={tag.id} variant="outline" className="flex items-center gap-1">
                <Tag className="w-3 h-3" />
                {tag.name}
              </Badge>
            ))}
          </div>
        )}
      </header>

      {post.excerpt && (
        <div className="mb-8">
          <Card>
            <CardContent>
              <p className="text-muted-foreground italic">{post.excerpt}</p>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="prose prose-gray max-w-none dark:prose-invert">
        {renderMDXContent(post.content)}
      </div>
    </article>
  );
}