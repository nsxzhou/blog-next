'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { PostEditor } from '@/components/admin/post-editor';
import { Post, PostStatus, Tag } from '@/types/blog/post';
import { toast } from 'sonner';

export default function CreatePostPage() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { data: session } = useSession();

  const handleSave = async (postData: Partial<Post>) => {
    try {
      setIsLoading(true);
      
      if (!session?.user?.id) {
        toast.error('请先登录');
        return;
      }

      // 确保 publishedAt 格式正确
      const publishedAt = postData.publishedAt 
        ? postData.publishedAt.toISOString()
        : undefined;

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

      const requestBody: {
        title: string;
        slug: string;
        content: string;
        excerpt?: string;
        status: PostStatus;
        featured: boolean;
        readTime?: number;
        tagIds: string[];
        publishedAt?: string;
      } = {
        title: postData.title!,
        slug: postData.slug!,
        content: postData.content!,
        excerpt: postData.excerpt,
        status: postData.status || PostStatus.DRAFT,
        featured: postData.featured || false,
        readTime: postData.readTime,
        tagIds: tagIds,
      };

      // 只有在 publishedAt 有值时才包含该字段
      if (publishedAt) {
        requestBody.publishedAt = publishedAt;
      }

      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || '创建文章失败');
      }

      toast.success('文章创建成功！');
      router.push('/admin/posts');
    } catch (error) {
      console.error('创建文章失败:', error);
      toast.error(error instanceof Error ? error.message : '创建文章失败，请重试');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePreview = () => {
    toast.info('预览功能正在开发中');
  };

  const handleCancel = () => {
    router.push('/admin/posts');
  };

  if (!session) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">请先登录</div>
      </div>
    );
  }

  return (
    <PostEditor
      onSave={handleSave}
      onPreview={handlePreview}
      onCancel={handleCancel}
      isLoading={isLoading}
    />
  );
}