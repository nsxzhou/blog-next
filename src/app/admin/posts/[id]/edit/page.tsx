'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { PostEditor } from '@/components/admin/post-editor';
import { Post, Tag } from '@/types/blog/post';
import { toast } from 'sonner';

export default function EditPostPage() {
  const [post, setPost] = useState<Post | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const postId = params.id as string;

  useEffect(() => {
    const fetchPost = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/posts/${postId}`);
        if (!response.ok) {
          throw new Error('文章不存在');
        }
        const result = await response.json();
        if (result.success) {
          setPost(result.data);
        } else {
          throw new Error(result.error || '获取文章失败');
        }
      } catch (error) {
        console.error('获取文章失败:', error);
        toast.error('获取文章失败');
        router.push('/admin/posts');
      } finally {
        setIsLoading(false);
      }
    };

    if (postId) {
      fetchPost();
    }
  }, [postId, router]);

  const handleSave = async (postData: Partial<Post>) => {
    try {
      setIsSaving(true);
      
      // 处理标签 - 查找或创建现有标签
      let tagIds: string[] = [];
      
      if (postData.tags && postData.tags.length > 0) {
        const tagResponse = await fetch('/api/tags', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            tags: postData.tags.map(tag => ({
              name: tag.name,
              slug: tag.slug,
            }))
          }),
        });
        
        if (tagResponse.ok) {
          const tagResult = await tagResponse.json();
          if (tagResult.success && tagResult.data) {
            tagIds = tagResult.data.map((tag: Tag) => tag.id);
          }
        }
      }

      const updateData = {
        title: postData.title,
        slug: postData.slug,
        content: postData.content,
        excerpt: postData.excerpt,
        status: postData.status,
        publishedAt: postData.publishedAt,
        featured: postData.featured,
        readTime: postData.readTime,
        tagIds: tagIds,
      };

      const response = await fetch(`/api/posts/${postId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        throw new Error('更新文章失败');
      }

      toast.success('文章更新成功！');
      router.push('/admin/posts');
    } catch (error) {
      console.error('更新文章失败:', error);
      toast.error('更新文章失败，请重试');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePreview = () => {
    if (post) {
      window.open(`/blog/posts/${post.slug}`, '_blank');
    }
  };

  if (!session) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">请先登录</div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">加载中...</div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">文章不存在</div>
      </div>
    );
  }

  const handleCancel = () => {
    router.push('/admin/posts');
  };

  return (
    <PostEditor
      post={post}
      onSave={handleSave}
      onPreview={handlePreview}
      onCancel={handleCancel}
      isLoading={isSaving}
    />
  );
}