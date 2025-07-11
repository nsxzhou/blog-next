'use client'

import React, { useState, useCallback, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft,
  Save,
  Eye,
  Settings,
  Image as ImageIcon,
  Link as LinkIcon,
  Hash,
  Calendar,
  Clock,
  Bold,
  Italic,
  Code,
  List,
  ListOrdered,
  Quote,
  Heading1,
  Heading2,
  Link2,
  ImagePlus,
  ChevronDown,
  Loader2,
  Check
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { PostStatus } from '@prisma/client'
import { useSession } from 'next-auth/react'

interface ArticleForm {
  title: string
  content: string
  excerpt: string
  slug: string
  tags: Array<{ id: string; name: string }>
  featuredImage: string
  status: PostStatus
  metaKeywords: string
  metaDescription: string
  isFeatured: boolean
}

interface Tag {
  id: string
  name: string
  slug: string
}

export default function NewArticlePage() {
  const router = useRouter()
  const { data: session } = useSession()
  const [form, setForm] = useState<ArticleForm>({
    title: '',
    content: '',
    excerpt: '',
    slug: '',
    tags: [],
    featuredImage: '',
    status: PostStatus.DRAFT,
    metaKeywords: '',
    metaDescription: '',
    isFeatured: false
  })
  const [activeTab, setActiveTab] = useState<'write' | 'preview'>('write')
  const [showSettings, setShowSettings] = useState(false)
  const [isAutoSaving, setIsAutoSaving] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [wordCount, setWordCount] = useState(0)
  const [readingTime, setReadingTime] = useState(0)
  const [availableTags, setAvailableTags] = useState<Tag[]>([])
  const [tagInput, setTagInput] = useState('')
  const [showTagDropdown, setShowTagDropdown] = useState(false)

  // 获取可用标签
  useEffect(() => {
    fetch('/api/tags')
      .then(res => res.json())
      .then(data => setAvailableTags(data))
      .catch(console.error)
  }, [])

  // 生成slug
  const generateSlug = useCallback((title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, '-')
      .replace(/^-+|-+$/g, '')
  }, [])

  // 当标题改变时自动生成slug
  useEffect(() => {
    if (form.title && !form.slug) {
      setForm(prev => ({ ...prev, slug: generateSlug(form.title) }))
    }
  }, [form.title, form.slug, generateSlug])

  // 计算字数和阅读时间
  const updateStats = useCallback((content: string) => {
    const words = content.trim().split(/\s+/).filter(word => word.length > 0).length
    const chineseChars = (content.match(/[\u4e00-\u9fa5]/g) || []).length
    const totalWords = words + chineseChars
    setWordCount(totalWords)
    setReadingTime(Math.ceil(totalWords / 200)) // 假设每分钟阅读200字
  }, [])

  // 处理内容变化
  const handleContentChange = (content: string) => {
    setForm(prev => ({ ...prev, content }))
    updateStats(content)
  }

  // 插入markdown格式
  const insertMarkdown = (type: string) => {
    const textarea = document.querySelector('textarea') as HTMLTextAreaElement
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = form.content.substring(start, end)
    let insertion = ''

    switch (type) {
      case 'bold':
        insertion = `**${selectedText || '粗体文字'}**`
        break
      case 'italic':
        insertion = `*${selectedText || '斜体文字'}*`
        break
      case 'code':
        insertion = selectedText.includes('\n') 
          ? `\`\`\`\n${selectedText || '代码块'}\n\`\`\``
          : `\`${selectedText || '代码'}\``
        break
      case 'link':
        insertion = `[${selectedText || '链接文字'}](url)`
        break
      case 'image':
        insertion = `![${selectedText || '图片描述'}](url)`
        break
      case 'h1':
        insertion = `# ${selectedText || '一级标题'}`
        break
      case 'h2':
        insertion = `## ${selectedText || '二级标题'}`
        break
      case 'quote':
        insertion = `> ${selectedText || '引用文字'}`
        break
      case 'ul':
        insertion = `- ${selectedText || '列表项'}`
        break
      case 'ol':
        insertion = `1. ${selectedText || '列表项'}`
        break
    }

    const newContent = form.content.substring(0, start) + insertion + form.content.substring(end)
    handleContentChange(newContent)
    
    // 设置新的光标位置
    setTimeout(() => {
      textarea.selectionStart = start + insertion.length
      textarea.selectionEnd = start + insertion.length
      textarea.focus()
    }, 0)
  }

  // 处理标签选择
  const handleTagSelect = (tag: Tag) => {
    if (!form.tags.find(t => t.id === tag.id)) {
      setForm(prev => ({ ...prev, tags: [...prev.tags, tag] }))
    }
    setTagInput('')
    setShowTagDropdown(false)
  }

  // 创建新标签
  const createNewTag = async () => {
    if (!tagInput.trim()) return

    try {
      const response = await fetch('/api/tags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ names: [tagInput.trim()] })
      })

      if (response.ok) {
        const newTags = await response.json()
        if (newTags.length > 0) {
          handleTagSelect(newTags[0])
          // 更新可用标签列表
          setAvailableTags(prev => [...prev, ...newTags])
        }
      }
    } catch (error) {
      console.error('创建标签失败:', error)
    }
  }

  const removeTag = (tagId: string) => {
    setForm(prev => ({ 
      ...prev, 
      tags: prev.tags.filter(tag => tag.id !== tagId) 
    }))
  }

  // 保存文章
  const saveArticle = async (status: PostStatus) => {
    if (!form.title || !form.content || !form.slug) {
      alert('请填写标题、内容和URL别名')
      return
    }

    setIsSaving(true)
    
    try {
      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          status,
          tagIds: form.tags.map(tag => tag.id)
        })
      })

      if (response.ok) {
        const article = await response.json()
        router.push('/dashboard/articles')
      } else {
        const error = await response.json()
        alert(error.error || '保存失败')
      }
    } catch (error) {
      console.error('保存文章失败:', error)
      alert('保存失败，请重试')
    } finally {
      setIsSaving(false)
    }
  }

  // 过滤标签
  const filteredTags = availableTags.filter(tag => 
    tag.name.toLowerCase().includes(tagInput.toLowerCase()) &&
    !form.tags.find(t => t.id === tag.id)
  )

  if (!session?.user || session.user.role !== 'ADMIN') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">您没有权限访问此页面</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* 顶部工具栏 */}
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-lg border-b border-border/40">
        <div className="container mx-auto max-w-6xl px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/dashboard/articles"
                className="p-2 hover:bg-muted rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-lg font-semibold">新建文章</h1>
                <p className="text-sm text-muted-foreground">
                  {isAutoSaving ? '正在保存...' : '草稿未保存'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowSettings(!showSettings)}
                className={cn(
                  "p-2 rounded-lg transition-colors",
                  showSettings ? "bg-muted" : "hover:bg-muted"
                )}
              >
                <Settings className="w-5 h-5" />
              </button>
              <button
                onClick={() => setActiveTab(activeTab === 'write' ? 'preview' : 'write')}
                className="p-2 hover:bg-muted rounded-lg transition-colors"
              >
                <Eye className="w-5 h-5" />
              </button>
              <button
                onClick={() => saveArticle(PostStatus.DRAFT)}
                disabled={isSaving}
                className="px-4 py-2 bg-muted hover:bg-muted/80 rounded-lg transition-colors flex items-center gap-2"
              >
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                保存草稿
              </button>
              <button
                onClick={() => saveArticle(PostStatus.PUBLISHED)}
                disabled={isSaving}
                className="px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg transition-colors flex items-center gap-2"
              >
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                发布文章
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto max-w-6xl px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 主编辑区 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 标题输入 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <input
                type="text"
                placeholder="文章标题..."
                value={form.title}
                onChange={(e) => setForm(prev => ({ ...prev, title: e.target.value }))}
                className="w-full text-3xl font-bold bg-transparent border-none outline-none placeholder:text-muted-foreground/50"
              />
            </motion.div>

            {/* 编辑器工具栏 */}
            {activeTab === 'write' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-1 p-2 bg-muted/50 rounded-lg"
              >
                <button
                  onClick={() => insertMarkdown('bold')}
                  className="p-2 hover:bg-background rounded transition-colors"
                  title="粗体"
                >
                  <Bold className="w-4 h-4" />
                </button>
                <button
                  onClick={() => insertMarkdown('italic')}
                  className="p-2 hover:bg-background rounded transition-colors"
                  title="斜体"
                >
                  <Italic className="w-4 h-4" />
                </button>
                <div className="w-px h-6 bg-border mx-1" />
                <button
                  onClick={() => insertMarkdown('h1')}
                  className="p-2 hover:bg-background rounded transition-colors"
                  title="一级标题"
                >
                  <Heading1 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => insertMarkdown('h2')}
                  className="p-2 hover:bg-background rounded transition-colors"
                  title="二级标题"
                >
                  <Heading2 className="w-4 h-4" />
                </button>
                <div className="w-px h-6 bg-border mx-1" />
                <button
                  onClick={() => insertMarkdown('ul')}
                  className="p-2 hover:bg-background rounded transition-colors"
                  title="无序列表"
                >
                  <List className="w-4 h-4" />
                </button>
                <button
                  onClick={() => insertMarkdown('ol')}
                  className="p-2 hover:bg-background rounded transition-colors"
                  title="有序列表"
                >
                  <ListOrdered className="w-4 h-4" />
                </button>
                <button
                  onClick={() => insertMarkdown('quote')}
                  className="p-2 hover:bg-background rounded transition-colors"
                  title="引用"
                >
                  <Quote className="w-4 h-4" />
                </button>
                <div className="w-px h-6 bg-border mx-1" />
                <button
                  onClick={() => insertMarkdown('code')}
                  className="p-2 hover:bg-background rounded transition-colors"
                  title="代码"
                >
                  <Code className="w-4 h-4" />
                </button>
                <button
                  onClick={() => insertMarkdown('link')}
                  className="p-2 hover:bg-background rounded transition-colors"
                  title="链接"
                >
                  <Link2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => insertMarkdown('image')}
                  className="p-2 hover:bg-background rounded transition-colors"
                  title="图片"
                >
                  <ImagePlus className="w-4 h-4" />
                </button>
              </motion.div>
            )}

            {/* 内容编辑器 */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="relative"
            >
              {activeTab === 'write' ? (
                <textarea
                  placeholder="开始写作..."
                  value={form.content}
                  onChange={(e) => handleContentChange(e.target.value)}
                  className="w-full min-h-[500px] p-4 bg-muted/30 border border-border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary/50 font-mono text-sm"
                />
              ) : (
                <div className="min-h-[500px] p-8 bg-card border border-border rounded-lg prose prose-sm dark:prose-invert max-w-none">
                  <h1>{form.title || '无标题'}</h1>
                  <div dangerouslySetInnerHTML={{ __html: form.content }} />
                </div>
              )}
            </motion.div>

            {/* 字数统计 */}
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>{wordCount} 字</span>
              <span>预计阅读时间 {readingTime} 分钟</span>
            </div>
          </div>

          {/* 侧边栏设置 */}
          <div className={cn(
            "space-y-6",
            !showSettings && "lg:hidden"
          )}>
            {/* 文章设置 */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-card border border-border rounded-xl p-6 space-y-4"
            >
              <h3 className="font-semibold">文章设置</h3>

              {/* URL别名 */}
              <div className="space-y-2">
                <label className="text-sm font-medium">URL 别名</label>
                <input
                  type="text"
                  placeholder="custom-url-slug"
                  value={form.slug}
                  onChange={(e) => setForm(prev => ({ ...prev, slug: e.target.value }))}
                  className="w-full px-3 py-2 bg-muted/50 border border-border rounded-lg text-sm"
                />
              </div>

              {/* 文章摘要 */}
              <div className="space-y-2">
                <label className="text-sm font-medium">文章摘要</label>
                <textarea
                  placeholder="简短描述文章内容..."
                  value={form.excerpt}
                  onChange={(e) => setForm(prev => ({ ...prev, excerpt: e.target.value }))}
                  className="w-full px-3 py-2 bg-muted/50 border border-border rounded-lg text-sm resize-none h-20"
                />
              </div>

              {/* 封面图 */}
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <ImageIcon className="w-4 h-4" />
                  封面图片
                </label>
                <input
                  type="text"
                  placeholder="图片URL..."
                  value={form.featuredImage}
                  onChange={(e) => setForm(prev => ({ ...prev, featuredImage: e.target.value }))}
                  className="w-full px-3 py-2 bg-muted/50 border border-border rounded-lg text-sm"
                />
              </div>

              {/* 标签 */}
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Hash className="w-4 h-4" />
                  标签
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="输入标签名称..."
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onFocus={() => setShowTagDropdown(true)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        if (filteredTags.length > 0) {
                          handleTagSelect(filteredTags[0])
                        } else {
                          createNewTag()
                        }
                      }
                    }}
                    className="w-full px-3 py-2 bg-muted/50 border border-border rounded-lg text-sm"
                  />
                  
                  {/* 标签下拉框 */}
                  {showTagDropdown && tagInput && (
                    <div className="absolute z-10 w-full mt-1 bg-card border border-border rounded-lg shadow-lg max-h-48 overflow-y-auto">
                      {filteredTags.length > 0 ? (
                        filteredTags.map(tag => (
                          <button
                            key={tag.id}
                            onClick={() => handleTagSelect(tag)}
                            className="w-full px-3 py-2 text-left text-sm hover:bg-muted transition-colors"
                          >
                            {tag.name}
                          </button>
                        ))
                      ) : (
                        <button
                          onClick={createNewTag}
                          className="w-full px-3 py-2 text-left text-sm hover:bg-muted transition-colors"
                        >
                          创建标签 "{tagInput}"
                        </button>
                      )}
                    </div>
                  )}
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {form.tags.map((tag) => (
                    <span
                      key={tag.id}
                      className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary rounded-md text-sm"
                    >
                      {tag.name}
                      <button
                        onClick={() => removeTag(tag.id)}
                        className="hover:text-primary/80"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* 是否精选 */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isFeatured"
                  checked={form.isFeatured}
                  onChange={(e) => setForm(prev => ({ ...prev, isFeatured: e.target.checked }))}
                  className="w-4 h-4"
                />
                <label htmlFor="isFeatured" className="text-sm font-medium">
                  设为精选文章
                </label>
              </div>
            </motion.div>

            {/* SEO 设置 */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-card border border-border rounded-xl p-6 space-y-4"
            >
              <h3 className="font-semibold">SEO 设置</h3>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">SEO 关键词</label>
                <input
                  type="text"
                  placeholder="关键词1, 关键词2..."
                  value={form.metaKeywords}
                  onChange={(e) => setForm(prev => ({ ...prev, metaKeywords: e.target.value }))}
                  className="w-full px-3 py-2 bg-muted/50 border border-border rounded-lg text-sm"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">SEO 描述</label>
                <textarea
                  placeholder="搜索引擎展示的描述..."
                  value={form.metaDescription}
                  onChange={(e) => setForm(prev => ({ ...prev, metaDescription: e.target.value }))}
                  className="w-full px-3 py-2 bg-muted/50 border border-border rounded-lg text-sm resize-none h-20"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}