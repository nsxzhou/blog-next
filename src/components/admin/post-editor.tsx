'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
  ArrowLeft,
  BookOpen, 
  Code, 
  LayoutTemplate,
  ChevronDown,
  Wand2
} from 'lucide-react';
import { Post, PostStatus, Tag } from '@/types/blog/post';
import { 
  getExamplesByCategory, 
  getExampleById 
} from '@/lib/templates/mdx-examples';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from '@/components/ui/dropdown-menu';
import { Editor } from '@toast-ui/react-editor';
import '@toast-ui/editor/dist/toastui-editor.css';
import { toast } from 'sonner';

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
  const editorRef = useRef<any>(null);
  const [tags, setTags] = useState<string[]>(post?.tags?.map(tag => tag.name) || []);
  const [newTag, setNewTag] = useState('');
  const [isFeatured, setIsFeatured] = useState(post?.featured || false);
  const [status, setStatus] = useState<PostStatus>(post?.status || PostStatus.DRAFT);
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);
  const [filteredTags, setFilteredTags] = useState<Tag[]>([]);
  const [showTagSuggestions, setShowTagSuggestions] = useState(false);
  const [isGeneratingExcerpt, setIsGeneratingExcerpt] = useState(false);
  
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

  // 处理示例内容插入
  const handleInsertExample = (exampleId: string) => {
    const example = getExampleById(exampleId);
    if (example && editorRef.current) {
      const editor = editorRef.current.getInstance();
      const currentContent = editor.getMarkdown();
      
      // 如果当前内容为空，直接替换
      if (!currentContent.trim()) {
        editor.setMarkdown(example.content);
      } else {
        // 如果已有内容，询问是否追加
        const userConfirm = confirm(
          '编辑器中已有内容，是否要将示例内容追加到现有内容后面？\n\n点击"确定"追加，点击"取消"替换现有内容。'
        );
        
        if (userConfirm) {
          // 追加内容
          editor.setMarkdown(currentContent + '\n\n' + example.content);
        } else {
          // 替换内容
          editor.setMarkdown(example.content);
        }
      }
    }
  };

  // 清空内容
  const handleClearContent = () => {
    if (editorRef.current) {
      const editor = editorRef.current.getInstance();
      const currentContent = editor.getMarkdown();
      if (currentContent.trim() && confirm('确定要清空编辑器内容吗？')) {
        editor.setMarkdown('');
      }
    }
  };

  // 处理编辑器内容变化
  const handleEditorChange = () => {
    if (editorRef.current) {
      const editor = editorRef.current.getInstance();
      const markdown = editor.getMarkdown();
      setContent(markdown);
    }
  };

  // 生成摘要
  const generateExcerpt = async () => {
    if (!content.trim()) return;
    
    setIsGeneratingExcerpt(true);
    
    try {
      const response = await fetch('/api/coze/execute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          parameters: {
            input: content
          }
        })
      });

      const result = await response.json();
      
      if (result.success && result.data) {
        try {
          console.log('原始返回数据:', result);
          
          // 检查数据结构
          if (result.data.output && result.data.output.data) {
            // coze返回的数据在 result.data.output.data 中，且是JSON字符串
            const cozeData = result.data.output.data;
            console.log('coze数据字符串:', cozeData);
            
            if (typeof cozeData === 'string') {
              const parsedData = JSON.parse(cozeData);
              console.log('解析后的数据:', parsedData);
              
              const generatedExcerpt = parsedData.output;
              console.log('提取的摘要:', generatedExcerpt);
              
              if (generatedExcerpt && typeof generatedExcerpt === 'string' && generatedExcerpt.trim()) {
                setExcerpt(generatedExcerpt);
                toast.success('摘要生成成功');
              } else {
                toast.error('生成的摘要内容为空');
              }
            } else {
              toast.error('返回数据格式错误');
            }
          } else {
            console.error('数据结构不正确:', result.data);
            toast.error('返回数据结构不正确');
          }
        } catch (parseError) {
          console.error('处理返回数据失败:', parseError);
          toast.error('处理生成的摘要失败');
        }
      } else {
        console.error('生成摘要失败:', result.error || '未知错误');
        toast.error(result.error || '生成摘要失败，请重试');
      }
    } catch (error) {
      console.error('调用生成摘要API失败:', error);
      toast.error('生成摘要失败，请检查网络连接');
    } finally {
      setIsGeneratingExcerpt(false);
    }
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
                    <div className="flex items-center justify-between mb-2">
                      <Label htmlFor="excerpt">摘要</Label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-7 px-2 text-xs"
                        disabled={isGeneratingExcerpt || !content.trim()}
                        onClick={generateExcerpt}
                      >
                        <Wand2 className="w-3 h-3 mr-1" />
                        {isGeneratingExcerpt ? '生成中...' : '生成摘要'}
                      </Button>
                    </div>
                    <textarea
                      id="excerpt"
                      value={excerpt}
                      onChange={(e) => setExcerpt(e.target.value)}
                      placeholder="输入文章摘要"
                      className="mt-1 flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      rows={3}
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label htmlFor="content">内容 (Markdown)</Label>
                      <div className="flex items-center gap-2">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm">
                              <LayoutTemplate className="w-4 h-4 mr-2" />
                              插入示例
                              <ChevronDown className="w-4 h-4 ml-2" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-56">
                            <DropdownMenuSub>
                              <DropdownMenuSubTrigger>
                                <BookOpen className="w-4 h-4 mr-2" />
                                基础示例
                              </DropdownMenuSubTrigger>
                              <DropdownMenuSubContent>
                                {getExamplesByCategory('basic').map((example) => (
                                  <DropdownMenuItem
                                    key={example.id}
                                    onClick={() => handleInsertExample(example.id)}
                                  >
                                    <div className="flex flex-col">
                                      <span className="font-medium">{example.name}</span>
                                      <span className="text-xs text-muted-foreground">
                                        {example.description}
                                      </span>
                                    </div>
                                  </DropdownMenuItem>
                                ))}
                              </DropdownMenuSubContent>
                            </DropdownMenuSub>

                            <DropdownMenuSub>
                              <DropdownMenuSubTrigger>
                                <Code className="w-4 h-4 mr-2" />
                                代码示例
                              </DropdownMenuSubTrigger>
                              <DropdownMenuSubContent>
                                {getExamplesByCategory('code').map((example) => (
                                  <DropdownMenuItem
                                    key={example.id}
                                    onClick={() => handleInsertExample(example.id)}
                                  >
                                    <div className="flex flex-col">
                                      <span className="font-medium">{example.name}</span>
                                      <span className="text-xs text-muted-foreground">
                                        {example.description}
                                      </span>
                                    </div>
                                  </DropdownMenuItem>
                                ))}
                              </DropdownMenuSubContent>
                            </DropdownMenuSub>

                            <DropdownMenuSub>
                              <DropdownMenuSubTrigger>
                                <FileText className="w-4 h-4 mr-2" />
                                结构示例
                              </DropdownMenuSubTrigger>
                              <DropdownMenuSubContent>
                                {getExamplesByCategory('structure').map((example) => (
                                  <DropdownMenuItem
                                    key={example.id}
                                    onClick={() => handleInsertExample(example.id)}
                                  >
                                    <div className="flex flex-col">
                                      <span className="font-medium">{example.name}</span>
                                      <span className="text-xs text-muted-foreground">
                                        {example.description}
                                      </span>
                                    </div>
                                  </DropdownMenuItem>
                                ))}
                              </DropdownMenuSubContent>
                            </DropdownMenuSub>

                            <DropdownMenuSub>
                              <DropdownMenuSubTrigger>
                                <LayoutTemplate className="w-4 h-4 mr-2" />
                                高级示例
                              </DropdownMenuSubTrigger>
                              <DropdownMenuSubContent>
                                {getExamplesByCategory('advanced').map((example) => (
                                  <DropdownMenuItem
                                    key={example.id}
                                    onClick={() => handleInsertExample(example.id)}
                                  >
                                    <div className="flex flex-col">
                                      <span className="font-medium">{example.name}</span>
                                      <span className="text-xs text-muted-foreground">
                                        {example.description}
                                      </span>
                                    </div>
                                  </DropdownMenuItem>
                                ))}
                              </DropdownMenuSubContent>
                            </DropdownMenuSub>

                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={handleClearContent}>
                              <span className="text-red-600">清空内容</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                    <div className="relative">
                      <Editor
                        ref={editorRef}
                        initialValue={content || '开始写作...'}
                        previewStyle="vertical"
                        height="400px"
                        initialEditType="markdown"
                        useCommandShortcut={true}
                        usageStatistics={false}
                        onChange={handleEditorChange}
                        placeholder="使用 Markdown 格式编写内容，或点击上方'插入示例'按钮快速开始"
                      />
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                      支持 Markdown 语法和实时预览。使用上方&quot;插入示例&quot;按钮快速添加内容模板。
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
                    <Label htmlFor="featured">设为TOP文章</Label>
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