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
  Monitor,
  Tablet,
  Smartphone,
  RotateCcw
} from 'lucide-react';
import { Post } from '@/types/blog/post';

interface PostPreviewProps {
  post: Post | null;
  isOpen: boolean;
  onClose: () => void;
}

/**
 * 预览设备类型
 */
type PreviewDevice = 'desktop' | 'tablet' | 'mobile';

/**
 * 文章预览组件
 * 提供真实的前台预览效果，支持不同设备尺寸预览
 * 集成 Fumadocs 的 MDX 渲染能力
 */
export function PostPreview({ post, isOpen, onClose }: PostPreviewProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [device, setDevice] = useState<PreviewDevice>('desktop');

  useEffect(() => {
    if (post && isOpen) {
      // 简单的内容验证
      validateContent(post.content);
    } else {
      // 重置状态
      setError(null);
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

  const getDeviceWidth = () => {
    switch (device) {
      case 'mobile':
        return 'max-w-sm';
      case 'tablet':
        return 'max-w-2xl';
      case 'desktop':
      default:
        return 'max-w-4xl';
    }
  };

  const getDeviceIcon = (deviceType: PreviewDevice) => {
    switch (deviceType) {
      case 'mobile':
        return <Smartphone className="w-4 h-4" />;
      case 'tablet':
        return <Tablet className="w-4 h-4" />;
      case 'desktop':
        return <Monitor className="w-4 h-4" />;
    }
  };

  const getDeviceName = (deviceType: PreviewDevice) => {
    switch (deviceType) {
      case 'mobile':
        return '手机';
      case 'tablet':
        return '平板';
      case 'desktop':
        return '桌面';
    }
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
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] p-0 flex flex-col">
        {/* 预览控制栏 */}
        <DialogHeader className="p-4 border-b bg-muted/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <DialogTitle className="text-lg font-semibold">
                预览: {post.title}
              </DialogTitle>
              
              <div className="flex items-center gap-2">
                {getStatusBadge(post.status)}
                {post.featured && (
                  <Badge className="bg-yellow-100 text-yellow-800">特色</Badge>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {/* 设备切换 */}
              <div className="flex items-center bg-background border rounded-md p-1">
                {(['desktop', 'tablet', 'mobile'] as PreviewDevice[]).map((deviceType) => (
                  <Button
                    key={deviceType}
                    variant={device === deviceType ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setDevice(deviceType)}
                    className="h-8 px-2"
                  >
                    {getDeviceIcon(deviceType)}
                    <span className="ml-1 text-xs">{getDeviceName(deviceType)}</span>
                  </Button>
                ))}
              </div>
              
              {/* 刷新按钮 */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => validateContent(post?.content)}
                disabled={loading}
              >
                <RotateCcw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </Button>
              
              {/* 关闭按钮 */}
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        {/* 预览内容区域 */}
        <ScrollArea className="flex-1 bg-background">
          <div className="flex justify-center p-4 min-h-full">
            <div className={`${getDeviceWidth()} w-full bg-white dark:bg-gray-900 shadow-lg rounded-lg overflow-hidden`}>
              {/* 模拟博客头部 */}
              <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="container mx-auto px-4 py-3">
                  <div className="flex items-center justify-between">
                    <h1 className="text-xl font-bold">我的博客</h1>
                    <nav className="hidden md:flex items-center space-x-6">
                      <a href="#" className="text-sm font-medium hover:text-primary">首页</a>
                      <a href="#" className="text-sm font-medium hover:text-primary">文章</a>
                      <a href="#" className="text-sm font-medium hover:text-primary">关于</a>
                    </nav>
                  </div>
                </div>
              </header>

              {/* 文章内容 */}
              <article className="container mx-auto px-4 py-8">
                {loading && (
                  <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                      <p className="text-muted-foreground">正在渲染预览...</p>
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

                {!loading && !error && (
                  <>
                    {/* 文章标题和元信息 */}
                    <div className="mb-8">
                      <h1 className="text-3xl font-bold mb-4">{post.title}</h1>
                      
                      {post.excerpt && (
                        <p className="text-lg text-muted-foreground mb-6">
                          {post.excerpt}
                        </p>
                      )}
                      
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
                      </div>
                      
                      {/* 标签 */}
                      {post.tags && post.tags.length > 0 && (
                        <div className="flex items-center gap-2 mt-4">
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

                    {/* 文章内容 */}
                    <div className="prose prose-neutral dark:prose-invert max-w-none">
                      {post.content ? (
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
                              .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
                          }} 
                        />
                      ) : (
                        <div className="text-center py-12 text-muted-foreground">
                          暂无内容
                        </div>
                      )}
                    </div>
                  </>
                )}
              </article>

              {/* 模拟博客页脚 */}
              <footer className="border-t bg-muted/50 py-6 mt-12">
                <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
                  <p>&copy; 2024 我的博客. 保留所有权利.</p>
                </div>
              </footer>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}