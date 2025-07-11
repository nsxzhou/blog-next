// 项目相关的类型定义
import { Project, ProjectStatus } from '@prisma/client'

// 项目类型
export interface ProjectWithRelations extends Project {
  // 未来可能添加的关联数据
}

// 项目列表项类型
export interface ProjectListItem {
  id: string
  title: string
  slug: string
  description: string
  coverImage: string | null
  demoUrl: string | null
  githubUrl: string | null
  techStack: string[] // JSON解析后的数组
  status: ProjectStatus
  featured: boolean
  order: number
  publishedAt: Date | null
  createdAt: Date
}

// 项目详情类型
export interface ProjectDetail extends ProjectWithRelations {
  // 相关项目
  relatedProjects?: Array<{
    id: string
    title: string
    slug: string
    description: string
    coverImage: string | null
    techStack: string[]
  }>
}

// 创建/更新项目的输入类型
export interface ProjectInput {
  title: string
  slug: string
  description: string
  content: string
  coverImage?: string
  demoUrl?: string
  githubUrl?: string
  techStack: string[]
  status?: ProjectStatus
  featured?: boolean
  order?: number
}

// 项目查询参数
export interface ProjectQueryParams {
  status?: ProjectStatus
  featured?: boolean
  search?: string
  techStack?: string
  page?: number
  limit?: number
  orderBy?: 'order' | 'publishedAt' | 'createdAt'
  order?: 'asc' | 'desc'
}

// 项目统计数据
export interface ProjectStats {
  totalProjects: number
  featuredProjects: number
  projectsByStatus: {
    draft: number
    published: number
    archived: number
  }
  popularTechStack: Array<{
    name: string
    count: number
  }>
}