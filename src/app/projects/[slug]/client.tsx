'use client'

import { motion } from 'framer-motion'
import { ArrowLeft, ExternalLink, Github, Calendar, Code } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Badge } from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import { ProjectDetail } from '@/types/project'
import AnalyticsTracker from '@/components/AnalyticsTracker'

export default function ProjectDetailClient({ project }: { project: ProjectDetail }) {
  const router = useRouter()

  return (
    <>
      {/* 分析追踪器 */}
      <AnalyticsTracker />
      
      <motion.article
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="min-h-screen px-6 py-20 md:py-24"
      >
      <div className="max-w-4xl mx-auto">
        {/* 返回按钮 */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            返回项目列表
          </Button>
        </motion.div>

        {/* 项目头部 */}
        <motion.header
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-12"
        >
          {/* 封面图 */}
          {project.coverImage && (
            <div className="relative h-64 md:h-96 mb-8 rounded-xl overflow-hidden bg-muted">
              <img
                src={project.coverImage}
                alt={project.title}
                className="w-full h-full object-cover"
              />
              {project.featured && (
                <Badge className="absolute top-4 right-4" variant="secondary">
                  精选项目
                </Badge>
              )}
            </div>
          )}

          {/* 标题和描述 */}
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            {project.title}
          </h1>
          <p className="text-lg text-muted-foreground mb-6">
            {project.description}
          </p>

          {/* 项目元信息 */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-6">
            {project.publishedAt && (
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>{new Date(project.publishedAt).toLocaleDateString('zh-CN')}</span>
              </div>
            )}
            <div className="flex items-center gap-1">
              <Code className="w-4 h-4" />
              <span>{project.techStack.length} 项技术</span>
            </div>
          </div>

          {/* 链接按钮 */}
          <div className="flex flex-wrap gap-4">
            {project.demoUrl && (
              <Link
                href={project.demoUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant="primary" size="sm">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  查看演示
                </Button>
              </Link>
            )}
            {project.githubUrl && (
              <Link
                href={project.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant="outline" size="sm">
                  <Github className="w-4 h-4 mr-2" />
                  查看源码
                </Button>
              </Link>
            )}
          </div>
        </motion.header>

        {/* 技术栈 */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-12"
        >
          <h2 className="text-xl font-semibold mb-4">技术栈</h2>
          <div className="flex flex-wrap gap-2">
            {project.techStack.map((tech) => (
              <Badge key={tech} variant="outline">
                {tech}
              </Badge>
            ))}
          </div>
        </motion.section>

        {/* 项目内容 */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="prose prose-sm dark:prose-invert max-w-none"
        >
          <div dangerouslySetInnerHTML={{ __html: project.content }} />
        </motion.section>

        {/* 相关项目 */}
        {project.relatedProjects && project.relatedProjects.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-16 pt-8 border-t"
          >
            <h2 className="text-xl font-semibold mb-6">相关项目</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {project.relatedProjects.map((relatedProject) => (
                <Link
                  key={relatedProject.id}
                  href={`/projects/${relatedProject.slug}`}
                  className="group block p-6 rounded-lg border bg-card hover:shadow-lg transition-all"
                >
                  <h3 className="font-semibold mb-2 group-hover:text-primary transition-colors">
                    {relatedProject.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                    {relatedProject.description}
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {relatedProject.techStack.slice(0, 3).map((tech) => (
                      <Badge key={tech} variant="outline" className="text-xs">
                        {tech}
                      </Badge>
                    ))}
                    {relatedProject.techStack.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{relatedProject.techStack.length - 3}
                      </Badge>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </motion.section>
        )}
      </div>
    </motion.article>
    </>
  )
}