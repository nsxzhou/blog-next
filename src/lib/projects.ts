import { prisma } from '@/lib/prisma'
import { 
  ProjectListItem, 
  ProjectDetail, 
  ProjectQueryParams,
  ProjectStats
} from '@/types/project'
import { ProjectStatus, Prisma } from '@prisma/client'
import { cache } from 'react'

// 获取项目列表
export const getProjects = cache(async (params?: ProjectQueryParams): Promise<ProjectListItem[]> => {
  const {
    status = ProjectStatus.PUBLISHED,
    featured,
    search,
    techStack,
    page = 1,
    limit = 10,
    orderBy = 'order',
    order = 'asc'
  } = params || {}

  // 构建查询条件
  const where: Prisma.ProjectWhereInput = {
    status,
    ...(featured !== undefined && { featured }),
    ...(techStack && {
      techStack: {
        path: '$',
        array_contains: techStack
      }
    }),
    ...(search && {
      OR: [
        { title: { contains: search } },
        { description: { contains: search } }
      ]
    })
  }

  // 构建排序条件
  const orderByClause: Prisma.ProjectOrderByWithRelationInput = {
    [orderBy]: order
  }

  const projects = await prisma.project.findMany({
    where,
    orderBy: orderByClause,
    skip: (page - 1) * limit,
    take: limit
  })

  // 转换techStack从JSON到数组
  return projects.map(project => ({
    ...project,
    techStack: project.techStack as string[]
  }))
})

// 根据slug获取项目详情
export const getProjectBySlug = cache(async (slug: string): Promise<ProjectDetail | null> => {
  const project = await prisma.project.findUnique({
    where: { slug }
  })

  if (!project) return null

  // 获取相关项目（基于技术栈）
  const techStack = project.techStack as string[]
  const relatedProjects = techStack.length > 0 ? await prisma.project.findMany({
    where: {
      status: ProjectStatus.PUBLISHED,
      id: { not: project.id },
      OR: techStack.map(tech => ({
        techStack: {
          path: '$',
          array_contains: tech
        }
      }))
    },
    orderBy: { order: 'asc' },
    take: 3
  }) : []

  return {
    ...project,
    techStack,
    relatedProjects: relatedProjects.map(p => ({
      ...p,
      techStack: p.techStack as string[]
    }))
  }
})

// 获取所有项目的slug（用于静态生成）
export const getAllProjectSlugs = cache(async (): Promise<string[]> => {
  const projects = await prisma.project.findMany({
    where: { status: ProjectStatus.PUBLISHED },
    select: { slug: true }
  })

  return projects.map(project => project.slug)
})

// 获取特色项目
export const getFeaturedProjects = cache(async (limit?: number): Promise<ProjectListItem[]> => {
  return getProjects({
    featured: true,
    limit,
    orderBy: 'order',
    order: 'asc'
  })
})

// 获取项目统计数据
export const getProjectStats = cache(async (): Promise<ProjectStats> => {
  const [totalProjects, featuredCount] = await Promise.all([
    prisma.project.count(),
    prisma.project.count({
      where: { featured: true }
    })
  ])

  const projectsByStatus = await prisma.project.groupBy({
    by: ['status'],
    _count: true
  })

  const statusCounts = {
    draft: 0,
    published: 0,
    archived: 0
  }

  projectsByStatus.forEach(item => {
    if (item.status === ProjectStatus.DRAFT) statusCounts.draft = item._count
    if (item.status === ProjectStatus.PUBLISHED) statusCounts.published = item._count
    if (item.status === ProjectStatus.ARCHIVED) statusCounts.archived = item._count
  })

  // 获取技术栈统计
  const projects = await prisma.project.findMany({
    where: { status: ProjectStatus.PUBLISHED },
    select: { techStack: true }
  })

  const techStackCount: Record<string, number> = {}
  projects.forEach(project => {
    const techs = project.techStack as string[]
    techs.forEach(tech => {
      techStackCount[tech] = (techStackCount[tech] || 0) + 1
    })
  })

  const popularTechStack = Object.entries(techStackCount)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10)

  return {
    totalProjects,
    featuredProjects: featuredCount,
    projectsByStatus: statusCounts,
    popularTechStack
  }
})

// 创建项目
export async function createProject(data: {
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
}) {
  const project = await prisma.project.create({
    data: {
      ...data,
      publishedAt: data.status === ProjectStatus.PUBLISHED ? new Date() : null
    }
  })

  return {
    ...project,
    techStack: project.techStack as string[]
  }
}

// 更新项目
export async function updateProject(
  id: string,
  data: {
    title?: string
    slug?: string
    description?: string
    content?: string
    coverImage?: string
    demoUrl?: string
    githubUrl?: string
    techStack?: string[]
    status?: ProjectStatus
    featured?: boolean
    order?: number
  }
) {
  // 如果项目从草稿变为发布状态，设置发布时间
  let publishedAt
  if (data.status === ProjectStatus.PUBLISHED) {
    const currentProject = await prisma.project.findUnique({
      where: { id },
      select: { status: true, publishedAt: true }
    })
    
    if (currentProject?.status !== ProjectStatus.PUBLISHED && !currentProject?.publishedAt) {
      publishedAt = new Date()
    }
  }

  const project = await prisma.project.update({
    where: { id },
    data: {
      ...data,
      ...(publishedAt && { publishedAt })
    }
  })

  return {
    ...project,
    techStack: project.techStack as string[]
  }
}

// 删除项目
export async function deleteProject(id: string) {
  return prisma.project.delete({
    where: { id }
  })
}

// 更新项目排序
export async function updateProjectOrder(updates: { id: string; order: number }[]) {
  const updatePromises = updates.map(({ id, order }) =>
    prisma.project.update({
      where: { id },
      data: { order }
    })
  )

  return Promise.all(updatePromises)
}