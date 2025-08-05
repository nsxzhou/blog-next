"use client"

import { useSession } from "next-auth/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/forms/Button"
import { FileText, File, Tags, Image, Users, Eye, TrendingUp, Plus, ArrowRight } from "lucide-react"
import Link from "next/link"

export default function AdminDashboard() {
  const { data: session } = useSession()

  const stats = [
    {
      title: "文章总数",
      value: "12",
      description: "已发布文章",
      icon: FileText,
      trend: "+2",
      trendColor: "text-green-600",
    },
    {
      title: "页面总数",
      value: "5",
      description: "静态页面",
      icon: File,
      trend: "+1",
      trendColor: "text-green-600",
    },
    {
      title: "标签总数",
      value: "8",
      description: "文章标签",
      icon: Tags,
      trend: "0",
      trendColor: "text-gray-600",
    },
    {
      title: "媒体文件",
      value: "24",
      description: "上传的文件",
      icon: Image,
      trend: "+5",
      trendColor: "text-green-600",
    },
    {
      title: "用户总数",
      value: "3",
      description: "注册用户",
      icon: Users,
      trend: "+1",
      trendColor: "text-green-600",
    },
    {
      title: "总浏览量",
      value: "1,234",
      description: "文章浏览次数",
      icon: Eye,
      trend: "+123",
      trendColor: "text-green-600",
    },
  ]

  const recentPosts = [
    {
      title: "Hello World",
      date: "2024-01-15",
      views: 123,
      status: "已发布",
    },
    {
      title: "Getting Started",
      date: "2024-01-14",
      views: 89,
      status: "已发布",
    },
    {
      title: "Next.js 15 新特性",
      date: "2024-01-13",
      views: 67,
      status: "草稿",
    },
  ]

  const quickActions = [
    {
      title: "新建文章",
      href: "/admin/posts/new",
      icon: FileText,
      description: "创建新的博客文章",
    },
    {
      title: "新建页面",
      href: "/admin/pages/new",
      icon: File,
      description: "创建新的静态页面",
    },
    {
      title: "上传媒体",
      href: "/admin/media",
      icon: Image,
      description: "上传图片或其他文件",
    },
  ]

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
            <Link href="/admin/posts/new">
              <Plus className="mr-2 h-4 w-4" />
              新建文章
            </Link>
          </Button>
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => (
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
              {recentPosts.map((post, index) => (
                <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium leading-none">{post.title}</p>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        post.status === "已发布" 
                          ? "bg-green-100 text-green-800" 
                          : "bg-yellow-100 text-yellow-800"
                      }`}>
                        {post.status}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {post.date} 发布
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">{post.views} 浏览</div>
                  </div>
                </div>
              ))}
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