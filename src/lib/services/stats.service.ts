import prisma from '@/lib/db'
import { PostStatus, PageStatus, UserRole, UserStatus } from '@/generated/prisma'

export interface DashboardStats {
  totalPosts: number
  publishedPosts: number
  draftPosts: number
  archivedPosts: number
  totalPages: number
  publishedPages: number
  draftPages: number
  archivedPages: number
  totalTags: number
  totalMedia: number
  totalUsers: number
  activeUsers: number
  totalViews: number
  recentPosts: Array<{
    id: string
    title: string
    publishedAt: Date | null
    viewCount: number
    status: PostStatus
  }>
}

export interface PostStats {
  total: number
  published: number
  draft: number
  archived: number
  featured: number
  totalViews: number
  averageReadTime: number
}

export interface PageStats {
  total: number
  published: number
  draft: number
  archived: number
  featured: number
}

export interface UserStats {
  total: number
  active: number
  inactive: number
  banned: number
  admins: number
  authors: number
}

export class StatsService {
  static async getDashboardStats(): Promise<DashboardStats> {
    // 串行化查询以减少并发连接
    const postStats = await this.getPostStats()
    const pageStats = await this.getPageStats()
    const tagCount = await this.getTagCount()
    const mediaCount = await this.getMediaCount()
    const userStats = await this.getUserStats()
    const recentPosts = await this.getRecentPosts(5)

    const result: DashboardStats = {
      totalPosts: postStats.total,
      publishedPosts: postStats.published,
      draftPosts: postStats.draft,
      archivedPosts: postStats.archived,
      totalPages: pageStats.total,
      publishedPages: pageStats.published,
      draftPages: pageStats.draft,
      archivedPages: pageStats.archived,
      totalTags: tagCount,
      totalMedia: mediaCount,
      totalUsers: userStats.total,
      activeUsers: userStats.active,
      totalViews: postStats.totalViews,
      recentPosts
    }
    
    return result
  }

  static async getPostStats(): Promise<PostStats> {
    // 减少并发查询，分批执行
    const basicCounts = await Promise.all([
      prisma.post.count(),
      prisma.post.count({ where: { status: PostStatus.PUBLISHED } }),
      prisma.post.count({ where: { status: PostStatus.DRAFT } }),
      prisma.post.count({ where: { status: PostStatus.ARCHIVED } })
    ])

    const [featuredCount, viewsAggregate] = await Promise.all([
      prisma.post.count({ where: { featured: true } }),
      prisma.post.aggregate({ _sum: { viewCount: true } })
    ])

    const readTimeAggregate = await prisma.post.aggregate({
      where: { status: PostStatus.PUBLISHED, readTime: { not: null } },
      _avg: { readTime: true }
    })

    return {
      total: basicCounts[0],
      published: basicCounts[1],
      draft: basicCounts[2],
      archived: basicCounts[3],
      featured: featuredCount,
      totalViews: viewsAggregate._sum.viewCount || 0,
      averageReadTime: Math.round(readTimeAggregate._avg.readTime || 0)
    }
  }

  static async getPageStats(): Promise<PageStats> {
    // 分批查询减少并发连接
    const basicCounts = await Promise.all([
      prisma.page.count(),
      prisma.page.count({ where: { status: PageStatus.PUBLISHED } }),
      prisma.page.count({ where: { status: PageStatus.DRAFT } })
    ])

    const [archivedCount, featuredCount] = await Promise.all([
      prisma.page.count({ where: { status: PageStatus.ARCHIVED } }),
      prisma.page.count({ where: { featured: true } })
    ])

    return {
      total: basicCounts[0],
      published: basicCounts[1],
      draft: basicCounts[2],
      archived: archivedCount,
      featured: featuredCount
    }
  }

  static async getTagCount(): Promise<number> {
    return prisma.tag.count()
  }

  static async getMediaCount(): Promise<number> {
    return prisma.media.count()
  }

  static async getUserStats(): Promise<UserStats> {
    // 分批查询减少并发连接
    const basicCounts = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { status: UserStatus.ACTIVE } }),
      prisma.user.count({ where: { status: UserStatus.INACTIVE } })
    ])

    const [bannedCount, adminCount, authorCount] = await Promise.all([
      prisma.user.count({ where: { status: UserStatus.BANNED } }),
      prisma.user.count({ where: { role: UserRole.ADMIN } }),
      prisma.user.count({ where: { role: UserRole.AUTHOR } })
    ])

    return {
      total: basicCounts[0],
      active: basicCounts[1],
      inactive: basicCounts[2],
      banned: bannedCount,
      admins: adminCount,
      authors: authorCount
    }
  }

  static async getRecentPosts(limit: number = 5): Promise<Array<{
    id: string
    title: string
    publishedAt: Date | null
    viewCount: number
    status: PostStatus
  }>> {
    return prisma.post.findMany({
      where: {
        status: { in: [PostStatus.PUBLISHED, PostStatus.DRAFT] }
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      select: {
        id: true,
        title: true,
        publishedAt: true,
        viewCount: true,
        status: true
      }
    })
  }

  static async getMonthlyStats(year: number = new Date().getFullYear()) {
    const monthlyStats = await prisma.$queryRaw`
      SELECT 
        MONTH(publishedAt) as month,
        COUNT(*) as posts,
        SUM(viewCount) as views
      FROM posts 
      WHERE YEAR(publishedAt) = ${year}
        AND status = 'PUBLISHED'
      GROUP BY MONTH(publishedAt)
      ORDER BY month
    ` as Array<{ month: number; posts: number; views: number }>

    const result = Array(12).fill(null).map((_, index) => ({
      month: index + 1,
      posts: 0,
      views: 0
    }))

    monthlyStats.forEach(stat => {
      result[stat.month - 1] = stat
    })

    return result
  }

  static async getTopTags(limit: number = 10): Promise<Array<{
    id: string
    name: string
    postCount: number
  }>> {
    const tags = await prisma.tag.findMany({
      include: {
        _count: {
          select: { posts: true }
        }
      },
      orderBy: {
        posts: {
          _count: 'desc'
        }
      },
      take: limit
    })

    return tags.map((tag: any) => ({
      id: tag.id,
      name: tag.name,
      postCount: tag._count.posts
    }))
  }

  static async getPopularPosts(limit: number = 10): Promise<Array<{
    id: string
    title: string
    viewCount: number
    publishedAt: Date | null
  }>> {
    return prisma.post.findMany({
      where: { status: PostStatus.PUBLISHED },
      orderBy: { viewCount: 'desc' },
      take: limit,
      select: {
        id: true,
        title: true,
        viewCount: true,
        publishedAt: true
      }
    })
  }
}