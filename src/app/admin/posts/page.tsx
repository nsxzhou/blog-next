'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Calendar,
  User,
  Tag,
  FileText,
} from 'lucide-react';
import { Post, PostStatus } from '@/types/blog/post';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

export default function PostsPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<PostStatus | 'all'>('all');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [postToDelete, setPostToDelete] = useState<string | null>(null);
  const router = useRouter();
  const { data: session } = useSession();

  const fetchPosts = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: '1',
        pageSize: '20',
      });

      if (searchTerm) {
        params.append('search', searchTerm);
      }

      if (statusFilter !== 'all') {
        params.append('status', statusFilter);
      }

      const response = await fetch(`/api/posts?${params.toString()}`);
      if (!response.ok) {
        throw new Error('获取文章列表失败');
      }

      const result = await response.json();
      if (result.success) {
        setPosts(result.data.posts);
      } else {
        throw new Error(result.error || '获取文章列表失败');
      }
    } catch (error) {
      console.error('获取文章列表失败:', error);
      toast.error('获取文章列表失败');
    } finally {
      setLoading(false);
    }
  }, [searchTerm, statusFilter]);

  useEffect(() => {
    fetchPosts();
  }, [searchTerm, statusFilter, fetchPosts]);

  const handleDeletePost = async (postId: string) => {
    setPostToDelete(postId);
    setDeleteDialogOpen(true);
  };


  const confirmDeletePost = async () => {
    if (!postToDelete) return;

    try {
      const response = await fetch(`/api/posts/${postToDelete}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('删除文章失败');
      }

      const result = await response.json();
      if (result.success) {
        await fetchPosts();
        toast.success('文章删除成功');
        setDeleteDialogOpen(false);
        setPostToDelete(null);
      } else {
        throw new Error(result.error || '删除文章失败');
      }
    } catch (error) {
      console.error('删除文章失败:', error);
      toast.error('删除文章失败，请重试');
    }
  };

  const cancelDeletePost = () => {
    setDeleteDialogOpen(false);
    setPostToDelete(null);
  };

  const getStatusBadge = (status: PostStatus) => {
    switch (status) {
      case PostStatus.PUBLISHED:
        return <Badge className="bg-green-100 text-green-800">已发布</Badge>;
      case PostStatus.DRAFT:
        return <Badge variant="secondary">草稿</Badge>;
      default:
        return <Badge variant="outline">未知</Badge>;
    }
  };

  const filteredPosts = posts.filter(post => {
    const matchesSearch = !searchTerm ||
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.excerpt?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || post.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (!session) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">请先登录</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">文章管理</h1>
          <p className="text-muted-foreground">
            管理您的博客文章
          </p>
        </div>
        <Button onClick={() => router.push('/admin/posts/create')}>
          <Plus className="w-4 h-4 mr-2" />
          创建文章
        </Button>
      </div>

      {/* 搜索和过滤 */}
      <Card>
        <CardContent className="pt-2">
          <div className="flex gap-4 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="搜索文章标题或内容..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <Filter className="w-4 h-4 mr-2" />
                  {statusFilter === 'all' ? '所有状态' :
                    statusFilter === PostStatus.PUBLISHED ? '已发布' : '草稿'}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setStatusFilter('all')}>
                  所有状态
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter(PostStatus.PUBLISHED)}>
                  已发布
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter(PostStatus.DRAFT)}>
                  草稿
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardContent>
      </Card>

      {/* 文章列表 */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-8">
            <div className="text-muted-foreground">加载中...</div>
          </div>
        ) : filteredPosts.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">暂无文章</h3>
                <p className="text-muted-foreground mb-4">
                  {searchTerm || statusFilter !== 'all' ? '没有找到匹配的文章' : '开始创建您的第一篇文章'}
                </p>
                {!searchTerm && statusFilter === 'all' && (
                  <Button onClick={() => router.push('/admin/posts/create')}>
                    <Plus className="w-4 h-4 mr-2" />
                    创建文章
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          filteredPosts.map((post) => (
            <Card key={post.id}>
              <CardContent className="pt-2">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-medium">{post.title}</h3>
                      {getStatusBadge(post.status)}
                      {post.featured && (
                        <Badge className="bg-yellow-100 text-yellow-800">特色</Badge>
                      )}
                    </div>

                    {post.excerpt && (
                      <p className="text-muted-foreground mb-3 line-clamp-2">
                        {post.excerpt}
                      </p>
                    )}

                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
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
                        <Eye className="w-4 h-4" />
                        {post.viewCount} 次浏览
                      </div>
                      {post.tags && post.tags.length > 0 && (
                        <div className="flex items-center gap-1">
                          <Tag className="w-4 h-4" />
                          {post.tags.map(tag => tag.name).join(', ')}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => router.push(`/admin/posts/${post.id}/edit`)}
                      title="编辑文章"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => window.open(`/posts/${post.slug}`, '_blank')}>
                          <Eye className="w-4 h-4 mr-2" />
                          在新窗口打开
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => router.push(`/admin/posts/${post.id}/edit`)}>
                          <Edit className="w-4 h-4 mr-2" />
                          编辑文章
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDeletePost(post.id)}
                          className="text-red-600"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          删除文章
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* 删除确认对话框 */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除文章</AlertDialogTitle>
            <AlertDialogDescription>
              您确定要删除这篇文章吗？此操作不可撤销，文章将被永久删除。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={cancelDeletePost}>
              取消
            </AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeletePost} className="bg-red-600 hover:bg-red-700">
              删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  );
}