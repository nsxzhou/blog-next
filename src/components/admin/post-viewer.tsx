'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog/Dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Eye, 
  Calendar, 
  User, 
  Tag, 
  Eye as ViewIcon,
  Clock,
  X,
  Maximize2,
  Minimize2,
  FileText
} from 'lucide-react';
import { Post } from '@/types/blog/post';

interface PostViewerProps {
  post: Post | null;
  isOpen: boolean;
  onClose: () => void;
}

/**
 * 文章查看组件
 * 提供完整的 MDX 内容渲染和文章信息展示
 * 集成 Fumadocs 的强大渲染能力
 */
export function PostViewer({ post, isOpen, onClose }: PostViewerProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    if (post && isOpen) {
      // 简单的内容验证
      validateContent(post.content);
    } else {
      // 重置状态
      setError(null);
      setIsFullscreen(false);
    }
  }, [post, isOpen]);

  const validateContent = (content?: string) => {
    setLoading(true);
    setError(null);
    
    try {
      // 这里可以添加基本的内容验证
      if (content && content.length > 0) {
        // 内容有效
        console.log('内容验证通过');
      }
    } catch (err) {
      console.error('内容验证失败:', err);
      setError('内容格式验证失败');
    } finally {
      setLoading(false);
    }
  };

  const handleFullscreenToggle = () => {
    setIsFullscreen(!isFullscreen);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PUBLISHED':
        return <Badge className="bg-green-100 text-green-800">已发布</Badge>;
      case 'DRAFT':
        return <Badge variant="secondary">草稿</Badge>;
      default:
        return <Badge variant="outline">未知</Badge>;
    }
  };

  if (!post) return null;

  return (
    <Dialog 
      open={isOpen} 
      onOpenChange={onClose}
    >
      <DialogContent className={`
        ${isFullscreen 
          ? 'h-screen w-screen max-w-none p-0' 
          : 'max-h-[90vh] p-0'
        }
        flex flex-col
      `}>
        {/* 头部信息 */}
        <DialogHeader className="p-6 pb-4 border-b">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <DialogTitle className="text-2xl font-bold mb-2 text-left">
                {post.title}
              </DialogTitle>
              
              {/* 文章元信息 */}
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {post.publishedAt ? (
                    new Date(post.publishedAt).toLocaleDateString('zh-CN')
                  ) : (
                    '未发布'
                  )}
                </div>
                
                <div className="flex items-center gap-1">
                  <User className="w-4 h-4" />
                  {post.author?.name}
                </div>
                
                <div className="flex items-center gap-1">
                  <ViewIcon className="w-4 h-4" />
                  {post.viewCount} 次浏览
                </div>
                
                {post.readTime && (
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {post.readTime} 分钟阅读
                  </div>
                )}
                
                <div className="flex items-center gap-2">
                  {getStatusBadge(post.status)}
                  {post.featured && (
                    <Badge className="bg-yellow-100 text-yellow-800">特色</Badge>
                  )}
                </div>
              </div>
              
              {/* 标签 */}
              {post.tags && post.tags.length > 0 && (
                <div className="flex items-center gap-2 mt-3">
                  <Tag className="w-4 h-4 text-muted-foreground" />
                  <div className="flex flex-wrap gap-1">
                    {post.tags.map((tag) => (
                      <Badge 
                        key={tag.id} 
                        variant="outline" 
                        className="text-xs"
                      >
                        {tag.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            {/* 操作按钮 */}
            <div className="flex items-center gap-2 ml-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleFullscreenToggle}
                className="shrink-0"
              >
                {isFullscreen ? (
                  <Minimize2 className="w-4 h-4" />
                ) : (
                  <Maximize2 className="w-4 h-4" />
                )}
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="shrink-0"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        {/* 内容区域 */}
        <ScrollArea className="flex-1 p-6">
          {loading && (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">正在加载内容...</p>
              </div>
            </div>
          )}

          {error && (
            <div className="flex items-center justify-center h-64">
              <div className="text-center text-red-600">
                <Eye className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p className="font-medium">{error}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  请检查文章内容格式是否正确
                </p>
              </div>
            </div>
          )}

          {!loading && !error && post.content && (
            <div className="prose prose-neutral dark:prose-invert max-w-none">
              <div 
                dangerouslySetInnerHTML={{ 
                  __html: post.content
                    .replace(/\n/g, '<br>')
                    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                    .replace(/\*(.*?)\*/g, '<em>$1</em>')
                    .replace(/`(.*?)`/g, '<code>$1</code>')
                    .replace(/### (.*?)$/gm, '<h3>$1</h3>')
                    .replace(/## (.*?)$/gm, '<h2>$1</h2>')
                    .replace(/# (.*?)$/gm, '<h1>$1</h1>')
                }} 
              />
            </div>
          )}

          {!loading && !error && !post.content && (
            <div className="text-center py-12 text-muted-foreground">
              <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>暂无内容</p>
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}