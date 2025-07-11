import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { getAllTags } from '@/lib/tags'
import TagManagementClient from './TagManagementClient'
import { AlertCircle } from 'lucide-react'
import Link from 'next/link'

export default async function TagManagementPage() {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    redirect('/auth/signin')
  }
  
  if (session.user.role !== 'ADMIN') {
    return (
      <div className="container mx-auto max-w-7xl p-6 lg:p-8">
        <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5" />
            <div>
              <h3 className="font-semibold text-amber-800 dark:text-amber-200">权限不足</h3>
              <p className="mt-1 text-sm text-amber-700 dark:text-amber-300">
                只有管理员才能管理标签。如需管理员权限，请联系网站管理员。
              </p>
              <Link 
                href="/dashboard" 
                className="inline-flex items-center gap-2 mt-3 text-sm text-amber-600 dark:text-amber-400 hover:underline"
              >
                ← 返回仪表盘
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }
  
  const tags = await getAllTags()
  
  // 计算统计数据
  const totalPosts = tags.reduce((sum, tag) => sum + tag._count.posts, 0)
  const popularTag = tags.length > 0 ? tags[0] : null // tags已按文章数量排序
  
  return (
    <TagManagementClient 
      initialTags={tags} 
      stats={{
        totalTags: tags.length,
        totalPosts,
        popularTag: popularTag?.name || '-'
      }}
    />
  )
}