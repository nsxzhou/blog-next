'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ExternalLink, Github, Filter, Grid3X3, List, ChevronDown } from 'lucide-react'
import Button from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import Image from 'next/image'
import Link from 'next/link'
// import Select components (using native select instead)

// 项目类型定义
type Project = {
  id: string
  title: string
  description: string
  image: string
  tech: string[]
  links: {
    demo?: string
    github?: string
  }
  featured: boolean
  category: 'web' | 'mobile' | 'tool' | 'other'
  date: string
}

// 模拟项目数据
const mockProjects: Project[] = [
  {
    id: '1',
    title: '思维笔记博客',
    description: '基于 Next.js 15 构建的极简博客系统，融合优雅的设计与流畅的阅读体验',
    image: '/projects/blog.png',
    tech: ['Next.js', 'TypeScript', 'Tailwind CSS', 'Framer Motion'],
    links: {
      demo: 'https://blog.example.com',
      github: 'https://github.com/example/blog'
    },
    featured: true,
    category: 'web',
    date: '2024-01-20'
  },
  {
    id: '2',
    title: '3D 文章宇宙',
    description: '使用 Three.js 创建的交互式文章导航系统，将文章关系可视化为星空',
    image: '/projects/3d-universe.png',
    tech: ['React Three Fiber', 'Three.js', 'WebGL'],
    links: {
      demo: 'https://universe.example.com'
    },
    featured: true,
    category: 'web',
    date: '2024-01-15'
  },
  {
    id: '3',
    title: 'CLI 工具集',
    description: '提升开发效率的命令行工具集合，包含代码生成、项目脚手架等功能',
    image: '/projects/cli-tools.png',
    tech: ['Node.js', 'TypeScript', 'Commander.js'],
    links: {
      github: 'https://github.com/example/cli-tools'
    },
    featured: false,
    category: 'tool',
    date: '2023-12-10'
  },
  {
    id: '4',
    title: '移动端阅读器',
    description: '优雅的移动端阅读应用，支持多种格式和自定义主题',
    image: '/projects/reader-app.png',
    tech: ['React Native', 'TypeScript', 'Redux'],
    links: {
      demo: 'https://reader.example.com'
    },
    featured: false,
    category: 'mobile',
    date: '2023-11-20'
  },
  {
    id: '5',
    title: '数据可视化平台',
    description: '实时数据分析与可视化平台，支持多维度数据展示',
    image: '/projects/data-viz.png',
    tech: ['Vue.js', 'D3.js', 'ECharts', 'WebSocket'],
    links: {
      demo: 'https://viz.example.com',
      github: 'https://github.com/example/data-viz'
    },
    featured: true,
    category: 'web',
    date: '2023-10-15'
  },
  {
    id: '6',
    title: 'AI 写作助手',
    description: '基于大语言模型的智能写作辅助工具，提供创意灵感和文本优化',
    image: '/projects/ai-writer.png',
    tech: ['Python', 'FastAPI', 'OpenAI', 'React'],
    links: {
      demo: 'https://ai-writer.example.com'
    },
    featured: false,
    category: 'tool',
    date: '2023-09-25'
  }
]

// 项目卡片组件
function ProjectCard({ project, index }: { project: Project; index: number }) {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ y: -4 }}
      onClick={() => setIsExpanded(!isExpanded)}
      className="group cursor-pointer overflow-hidden rounded-lg border bg-card hover:shadow-lg transition-all duration-300"
    >
      {/* 项目图片 */}
      <div className="relative h-48 md:h-64 overflow-hidden bg-muted">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/5 z-10" />
        {project.featured && (
          <Badge className="absolute top-4 right-4 z-20" variant="secondary">
            精选
          </Badge>
        )}
        <motion.div
          className="w-full h-full flex items-center justify-center text-4xl font-bold text-muted-foreground/20"
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.3 }}
        >
          {project.title[0]}
        </motion.div>
      </div>

      {/* 项目信息 */}
      <div className="p-6 space-y-4">
        {/* 标题和链接 */}
        <div className="flex items-start justify-between gap-4">
          <h3 className="text-xl font-semibold group-hover:text-primary transition-colors">
            {project.title}
          </h3>
          <div className="flex gap-2 flex-shrink-0">
            {project.links.demo && (
              <Link
                href={project.links.demo}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="p-2 rounded-md hover:bg-accent transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
              </Link>
            )}
            {project.links.github && (
              <Link
                href={project.links.github}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="p-2 rounded-md hover:bg-accent transition-colors"
              >
                <Github className="w-4 h-4" />
              </Link>
            )}
          </div>
        </div>

        {/* 描述 */}
        <p className="text-sm text-muted-foreground line-clamp-2">
          {project.description}
        </p>

        {/* 技术栈 */}
        <div className="flex flex-wrap gap-2">
          {project.tech.slice(0, isExpanded ? undefined : 3).map((tech) => (
            <Badge key={tech} variant="outline" className="text-xs">
              {tech}
            </Badge>
          ))}
          {!isExpanded && project.tech.length > 3 && (
            <Badge variant="outline" className="text-xs">
              +{project.tech.length - 3}
            </Badge>
          )}
        </div>

        {/* 展开的详细信息 */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="pt-4 border-t space-y-2"
            >
              <p className="text-sm text-muted-foreground">
                发布时间：{new Date(project.date).toLocaleDateString('zh-CN')}
              </p>
              <p className="text-sm text-muted-foreground">
                类别：{project.category === 'web' ? '网站' : 
                       project.category === 'mobile' ? '移动应用' : 
                       project.category === 'tool' ? '工具' : '其他'}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.article>
  )
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('all')
  const [sortBy, setSortBy] = useState<'date' | 'name'>('date')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  useEffect(() => {
    // 模拟加载项目数据
    setTimeout(() => {
      setProjects(mockProjects)
      setLoading(false)
    }, 500)
  }, [])

  // 过滤和排序项目
  const filteredProjects = useMemo(() => {
    let filtered = projects

    // 过滤
    if (filter !== 'all') {
      if (filter === 'featured') {
        filtered = filtered.filter(p => p.featured)
      } else {
        filtered = filtered.filter(p => p.category === filter)
      }
    }

    // 排序
    filtered.sort((a, b) => {
      if (sortBy === 'date') {
        return new Date(b.date).getTime() - new Date(a.date).getTime()
      } else {
        return a.title.localeCompare(b.title, 'zh-CN')
      }
    })

    return filtered
  }, [projects, filter, sortBy])

  // 统计各类别数量
  const categoryCount = useMemo(() => {
    const count = {
      all: projects.length,
      featured: projects.filter(p => p.featured).length,
      web: projects.filter(p => p.category === 'web').length,
      mobile: projects.filter(p => p.category === 'mobile').length,
      tool: projects.filter(p => p.category === 'tool').length,
      other: projects.filter(p => p.category === 'other').length,
    }
    return count
  }, [projects])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full"
        />
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen px-6 py-20 md:py-24"
    >
      <div className="max-w-7xl mx-auto">
        {/* 页面标题 */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            项目展示
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            探索我的技术作品集，每个项目都是一次创新的尝试
          </p>
        </motion.div>

        {/* 过滤和控制栏 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-8 space-y-4"
        >
          {/* 类别过滤标签 */}
          <div className="flex flex-wrap gap-2 justify-center">
            {Object.entries(categoryCount).map(([key, count]) => (
              <Button
                key={key}
                variant={filter === key ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => setFilter(key)}
                className="relative"
              >
                {key === 'all' ? '全部' :
                 key === 'featured' ? '精选' :
                 key === 'web' ? '网站' :
                 key === 'mobile' ? '移动应用' :
                 key === 'tool' ? '工具' : '其他'}
                <Badge variant="secondary" className="ml-2 px-1.5 py-0 text-xs">
                  {count}
                </Badge>
              </Button>
            ))}
          </div>

          {/* 排序和视图控制 */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">排序：</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'date' | 'name')}
                className="w-32 px-3 py-1.5 text-sm border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="date">最新发布</option>
                <option value="name">名称排序</option>
              </select>
            </div>

            <div className="flex gap-2">
              <Button
                variant={viewMode === 'grid' ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid3X3 className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </motion.div>

        {/* 项目列表 */}
        <div className={viewMode === 'grid' ? 
          "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : 
          "space-y-6 max-w-4xl mx-auto"
        }>
          {filteredProjects.length === 0 ? (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="col-span-full text-center text-muted-foreground py-12"
            >
              没有找到匹配的项目
            </motion.p>
          ) : (
            filteredProjects.map((project, index) => (
              <ProjectCard key={project.id} project={project} index={index} />
            ))
          )}
        </div>

        {/* 加载更多提示 */}
        {filteredProjects.length > 6 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-center mt-12"
          >
            <p className="text-sm text-muted-foreground">
              已展示全部 {filteredProjects.length} 个项目
            </p>
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}