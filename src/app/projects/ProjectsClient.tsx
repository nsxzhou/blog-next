'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ExternalLink, Github, Grid3X3, List } from 'lucide-react'
import Button from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import Link from 'next/link'
import { ProjectListItem } from '@/types/project'

// 项目卡片组件
function ProjectCard({ project, index }: { project: ProjectListItem; index: number }) {
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
        {project.coverImage ? (
          <img 
            src={project.coverImage} 
            alt={project.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <motion.div
            className="w-full h-full flex items-center justify-center text-4xl font-bold text-muted-foreground/20"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.3 }}
          >
            {project.title[0]}
          </motion.div>
        )}
      </div>

      {/* 项目信息 */}
      <div className="p-6 space-y-4">
        {/* 标题和链接 */}
        <div className="flex items-start justify-between gap-4">
          <h3 className="text-xl font-semibold group-hover:text-primary transition-colors">
            {project.title}
          </h3>
          <div className="flex gap-2 flex-shrink-0">
            {project.demoUrl && (
              <Link
                href={project.demoUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="p-2 rounded-md hover:bg-accent transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
              </Link>
            )}
            {project.githubUrl && (
              <Link
                href={project.githubUrl}
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
          {project.techStack.slice(0, isExpanded ? undefined : 3).map((tech) => (
            <Badge key={tech} variant="outline" className="text-xs">
              {tech}
            </Badge>
          ))}
          {!isExpanded && project.techStack.length > 3 && (
            <Badge variant="outline" className="text-xs">
              +{project.techStack.length - 3}
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
                发布时间：{project.publishedAt ? new Date(project.publishedAt).toLocaleDateString('zh-CN') : '未发布'}
              </p>
              <Link 
                href={`/projects/${project.slug}`}
                onClick={(e) => e.stopPropagation()}
                className="inline-flex items-center text-sm text-primary hover:underline"
              >
                查看详情 →
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.article>
  )
}

export default function ProjectsClient({ initialProjects }: { initialProjects: ProjectListItem[] }) {
  const [filter, setFilter] = useState<string>('all')
  const [sortBy, setSortBy] = useState<'date' | 'name'>('date')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [searchTerm, setSearchTerm] = useState('')

  // 过滤和排序项目
  const filteredProjects = useMemo(() => {
    let filtered = initialProjects

    // 搜索过滤
    if (searchTerm) {
      filtered = filtered.filter(p => 
        p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.techStack.some(tech => tech.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    }

    // 精选过滤
    if (filter === 'featured') {
      filtered = filtered.filter(p => p.featured)
    }

    // 排序
    filtered = [...filtered].sort((a, b) => {
      if (sortBy === 'date') {
        const dateA = a.publishedAt ? new Date(a.publishedAt).getTime() : 0
        const dateB = b.publishedAt ? new Date(b.publishedAt).getTime() : 0
        return dateB - dateA
      } else {
        return a.title.localeCompare(b.title, 'zh-CN')
      }
    })

    return filtered
  }, [initialProjects, filter, sortBy, searchTerm])

  // 统计数量
  const categoryCount = useMemo(() => {
    const count = {
      all: initialProjects.length,
      featured: initialProjects.filter(p => p.featured).length,
    }
    return count
  }, [initialProjects])

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

        {/* 搜索栏 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.05 }}
          className="mb-6 max-w-md mx-auto"
        >
          <input
            type="text"
            placeholder="搜索项目名称、描述或技术栈..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 text-sm border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring"
          />
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
                {key === 'all' ? '全部' : '精选'}
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