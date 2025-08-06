'use client';

import { useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Eye, 
  Save, 
  Plus, 
  X, 
  Tag as TagIcon,
  FileText,
  ArrowLeft
} from 'lucide-react';
import { Post, PostStatus, Tag } from '@/types/blog/post';

interface PostEditorProps {
  post?: Post;
  onSave: (post: Partial<Post>) => Promise<void>;
  onPreview?: () => void;
  onCancel?: () => void;
  isLoading?: boolean;
}

export function PostEditor({ 
  post, 
  onSave, 
  onPreview,
  onCancel,
  isLoading = false 
}: PostEditorProps) {
  const [title, setTitle] = useState(post?.title || '');
  const [slug, setSlug] = useState(post?.slug || '');
  const [excerpt, setExcerpt] = useState(post?.excerpt || '');
  const [content, setContent] = useState(post?.content || '');
  const [tags, setTags] = useState<string[]>(post?.tags?.map(tag => tag.name) || []);
  const [newTag, setNewTag] = useState('');
  const [isFeatured, setIsFeatured] = useState(post?.featured || false);
  const [status, setStatus] = useState<PostStatus>(post?.status || PostStatus.DRAFT);
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);
  const [filteredTags, setFilteredTags] = useState<Tag[]>([]);
  const [showTagSuggestions, setShowTagSuggestions] = useState(false);
  
  // 生成 slug
  const generateSlug = useCallback((text: string) => {
    const baseSlug = text
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
    
    // 添加时间戳确保唯一性
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 7);
    
    return `${baseSlug}-${timestamp}-${random}`;
  }, []);

  // 获取现有标签
  useEffect(() => {
    const fetchTags = async () => {
      try {
        const response = await fetch('/api/tags');
        if (response.ok) {
          const result = await response.json();
          if (result.success) {
            setAvailableTags(result.data.tags);
          }
        }
      } catch (error) {
        console.error('获取标签失败:', error);
      }
    };

    fetchTags();
  }, []);

  // 过滤标签建议
  useEffect(() => {
    if (newTag.trim()) {
      const filtered = availableTags.filter(tag => 
        tag.name.toLowerCase().includes(newTag.toLowerCase()) &&
        !tags.includes(tag.name)
      );
      setFilteredTags(filtered);
      setShowTagSuggestions(filtered.length > 0);
    } else {
      setShowTagSuggestions(false);
    }
  }, [newTag, availableTags, tags]);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    // 只有当标题不为空且 slug 为空时才自动生成
    if (newTitle.trim() && !slug) {
      setSlug(generateSlug(newTitle));
    }
  };

  const handleAddTag = (tagName?: string) => {
    const tagToAdd = (tagName || newTag).trim();
    if (tagToAdd && !tags.includes(tagToAdd)) {
      setTags([...tags, tagToAdd]);
      setNewTag('');
      setShowTagSuggestions(false);
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleTagSuggestionClick = (tagName: string) => {
    handleAddTag(tagName);
  };

  const handleSave = async () => {
    const postData: Partial<Post> = {
      title,
      slug,
      excerpt,
      content,
      tags: tags.map(tagName => ({ 
        name: tagName, 
        slug: generateSlug(tagName),
        id: '', // 临时值，后端会生成
        createdAt: new Date(),
      })),
      featured: isFeatured,
      status,
      publishedAt: status === PostStatus.PUBLISHED ? new Date() : undefined,
    };

    await onSave(postData);
  };

  const handlePublish = () => {
    setStatus(PostStatus.PUBLISHED);
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">
            {post ? '编辑文章' : '创建文章'}
          </h1>
          <p className="text-muted-foreground mt-1">
            {post ? '编辑文章内容' : '创建新的文章'}
          </p>
        </div>
        <div className="flex gap-2">
          {onCancel && (
            <Button 
              variant="outline" 
              onClick={onCancel}
              disabled={isLoading}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              返回
            </Button>
          )}
          {onPreview && (
            <Button 
              variant="outline" 
              onClick={onPreview}
              disabled={isLoading}
            >
              <Eye className="w-4 h-4 mr-2" />
              预览
            </Button>
          )}
          <Button 
            onClick={handleSave}
            disabled={isLoading}
          >
            <Save className="w-4 h-4 mr-2" />
            {isLoading ? '保存中...' : '保存'}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="edit" className="space-y-4">
        <TabsList>
          <TabsTrigger value="edit">编辑</TabsTrigger>
        </TabsList>

        <TabsContent value="edit" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* 主要编辑区域 */}
            <div className="lg:col-span-2 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    文章内容
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="title">标题</Label>
                    <Input
                      id="title"
                      value={title}
                      onChange={handleTitleChange}
                      placeholder="输入文章标题"
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="excerpt">摘要</Label>
                    <Textarea
                      id="excerpt"
                      value={excerpt}
                      onChange={(e) => setExcerpt(e.target.value)}
                      placeholder="输入文章摘要"
                      className="mt-1"
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label htmlFor="content">内容 (MDX)</Label>
                    <Textarea
                      id="content"
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      placeholder="使用 Markdown/MDX 格式编写内容"
                      className="mt-1 font-mono text-sm"
                      rows={15}
                    />
                    <p className="text-sm text-muted-foreground mt-2">
                      支持 Markdown 语法和 MDX 组件
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* 侧边栏 */}
            <div className="space-y-4">
              {/* 基础设置 */}
              <Card>
                <CardHeader>
                  <CardTitle>基础设置</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="slug">URL 别名</Label>
                    <Input
                      id="slug"
                      value={slug}
                      onChange={(e) => setSlug(e.target.value)}
                      placeholder="url-slug"
                      className="mt-1"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      将从标题自动生成，可手动修改
                    </p>
                  </div>

                  
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="featured"
                      checked={isFeatured}
                      onChange={(e) => setIsFeatured(e.target.checked)}
                      className="rounded"
                    />
                    <Label htmlFor="featured">设为特色文章</Label>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <Label>当前状态</Label>
                    <Badge variant={status === PostStatus.PUBLISHED ? 'default' : 'secondary'}>
                      {status === PostStatus.PUBLISHED ? '已发布' : '草稿'}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              {/* 标签管理 */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TagIcon className="w-5 h-5" />
                    标签
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="relative">
                    <div className="flex gap-2">
                      <Input
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        placeholder="添加标签"
                        onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        onClick={() => handleAddTag()}
                        size="sm"
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                    
                    {/* 标签建议 */}
                    {showTagSuggestions && (
                      <div className="absolute z-10 w-full mt-1 bg-background border rounded-md shadow-md">
                        {filteredTags.map((tag) => (
                          <div
                            key={tag.id}
                            className="px-3 py-2 cursor-pointer hover:bg-accent"
                            onClick={() => handleTagSuggestionClick(tag.name)}
                          >
                            <div className="flex items-center gap-2">
                              <span>{tag.name}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                        {tag}
                        <X 
                          className="w-3 h-3 cursor-pointer" 
                          onClick={() => handleRemoveTag(tag)}
                        />
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* 快速操作 */}
              <Card>
                <CardHeader>
                  <CardTitle>快速操作</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button
                    variant={status === PostStatus.DRAFT ? 'default' : 'outline'}
                    className="w-full"
                    onClick={() => setStatus(PostStatus.DRAFT)}
                  >
                    保存为草稿
                  </Button>
                  <Button
                    variant={status === PostStatus.PUBLISHED ? 'default' : 'outline'}
                    className="w-full"
                    onClick={handlePublish}
                  >
                    发布文章
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}