"use client"

import { useSession } from "next-auth/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/forms/Button"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { FileText, File, Tags, Image, Users, Eye, TrendingUp, Plus, ArrowRight } from "lucide-react"
import Link from "next/link"
import { useDashboardStats } from "@/lib/hooks/useStats"

export default function AdminDashboard() {
  const { data: session } = useSession()
  const { data: stats, isLoading, error, isError } = useDashboardStats()

  const formatNumber = (num: number): string => {
    return new Intl.NumberFormat('zh-CN').format(num)
  }

  const getStatusText = (status: string): string => {
    switch (status) {
      case 'PUBLISHED': return '已发布'
      case 'DRAFT': return '草稿'
      case 'ARCHIVED': return '已归档'
      default: return status
    }
  }

  const formatDate = (dateString: string | null): string => {
    if (!dateString) return '未发布'
    return new Date(dateString).toLocaleDateString('zh-CN')
  }

  const statsData = [
    {
      title: "文章总数",
      value: stats ? formatNumber(stats.totalPosts) : "0",
      description: `已发布 ${stats?.publishedPosts || 0} 篇`,
      icon: FileText,
      trend: stats?.publishedPosts && stats.publishedPosts > 0 ? `+${stats.publishedPosts}` : "0",
      trendColor: "text-green-600",
    },
    {
      title: "页面总数",
      value: stats ? formatNumber(stats.totalPages) : "0",
      description: `已发布 ${stats?.publishedPages || 0} 个`,
      icon: File,
      trend: stats?.publishedPages && stats.publishedPages > 0 ? `+${stats.publishedPages}` : "0",
      trendColor: "text-green-600",
    },
    {
      title: "标签总数",
      value: stats ? formatNumber(stats.totalTags) : "0",
      description: "文章标签",
      icon: Tags,
      trend: stats?.totalTags && stats.totalTags > 0 ? `+${stats.totalTags}` : "0",
      trendColor: stats?.totalTags && stats.totalTags > 0 ? "text-green-600" : "text-gray-600",
    },
    {
      title: "媒体文件",
      value: stats ? formatNumber(stats.totalMedia) : "0",
      description: "上传的文件",
      icon: Image,
      trend: stats?.totalMedia && stats.totalMedia > 0 ? `+${stats.totalMedia}` : "0",
      trendColor: stats?.totalMedia && stats.totalMedia > 0 ? "text-green-600" : "text-gray-600",
    },
    {
      title: "用户总数",
      value: stats ? formatNumber(stats.totalUsers) : "0",
      description: `活跃 ${stats?.activeUsers || 0} 人`,
      icon: Users,
      trend: stats?.activeUsers && stats.activeUsers > 0 ? `+${stats.activeUsers}` : "0",
      trendColor: stats?.activeUsers && stats.activeUsers > 0 ? "text-green-600" : "text-gray-600",
    },
    {
      title: "总浏览量",
      value: stats ? formatNumber(stats.totalViews) : "0",
      description: "文章浏览次数",
      icon: Eye,
      trend: stats?.totalViews && stats.totalViews > 0 ? `+${formatNumber(Math.floor(stats.totalViews * 0.1))}` : "0",
      trendColor: "text-green-600",
    },
  ]

  const recentPosts = stats?.recentPosts || []

  const quickActions = [
    {
      title: "新建文章",
      href: "/admin/posts/create",
      icon: FileText,
      description: "创建新的博客文章",
    },
    // {
    //   title: "新建页面",
    //   href: "/admin/pages/new",
    //   icon: File,
    //   description: "创建新的静态页面",
    // },
    {
      title: "上传媒体",
      href: "/admin/media",
      icon: Image,
      description: "上传图片或其他文件",
    },
  ]

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">仪表板</h1>
          <p className="text-muted-foreground">
            欢迎回来，{session?.user?.name || session?.user?.username}
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, index) => (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  <Skeleton className="h-4 w-16" />
                </CardTitle>
                <Skeleton className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  <Skeleton className="h-8 w-12" />
                </div>
                <div className="text-xs text-muted-foreground">
                  <Skeleton className="h-3 w-20 mt-1" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">仪表板</h1>
          <p className="text-muted-foreground">
            欢迎回来，{session?.user?.name || session?.user?.username}
          </p>
        </div>
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error instanceof Error ? error.message : '加载统计数据失败'}
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 欢迎信息 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">仪表板</h1>
          <p className="text-muted-foreground mt-1">
            欢迎回来，{session?.user?.name || session?.user?.username}
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild>
            <Link href="/admin/posts/create">
              <Plus className="mr-2 h-4 w-4" />
              新建文章
            </Link>
          </Button>
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {statsData.map((stat) => (
          <Card key={stat.title} className="transition-shadow hover:shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold">{stat.value}</div>
                {stat.trend !== "0" && (
                  <div className={`flex items-center text-sm ${stat.trendColor}`}>
                    <TrendingUp className="mr-1 h-3 w-3" />
                    {stat.trend}
                  </div>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 主要内容区域 */}
      <div className="grid gap-6 lg:grid-cols-7">
        {/* 最近文章 */}
        <Card className="lg:col-span-4">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>最近文章</CardTitle>
                <CardDescription>
                  查看最新的文章和页面
                </CardDescription>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link href="/admin/posts">
                  查看全部
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentPosts.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  暂无文章
                </div>
              ) : (
                recentPosts.map((post: { id: string; title: string; publishedAt: string | null; viewCount: number; status: "DRAFT" | "PUBLISHED" | "ARCHIVED" }) => (
                  <div key={post.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium leading-none">{post.title}</p>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          post.status === "PUBLISHED"
                            ? "bg-green-100 text-green-800"
                            : post.status === "DRAFT"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-gray-100 text-gray-800"
                        }`}>
                          {getStatusText(post.status)}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(post.publishedAt)}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">{formatNumber(post.viewCount)} 浏览</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* 快速操作 */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>快速操作</CardTitle>
            <CardDescription>
              常用的管理功能
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {quickActions.map((action, index) => (
                <Link
                  key={index}
                  href={action.href}
                  className="flex items-center justify-between rounded-lg border p-4 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <action.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{action.title}</p>
                      <p className="text-xs text-muted-foreground">{action.description}</p>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}