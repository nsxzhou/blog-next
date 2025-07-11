import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { getAllTags } from '@/lib/tags'
import TagManagementClient from './TagManagementClient'

export default async function TagManagementPage() {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    redirect('/auth/signin')
  }
  
  if (session.user.role !== 'ADMIN') {
    redirect('/dashboard')
  }
  
  const tags = await getAllTags()
  
  // 计算统计数据
  const totalPosts = tags.reduce((sum, tag) => sum + tag._count.posts, 0)
  const popularTag = tags.length > 0 ? tags[0] : null // tags已按文章数量排序
  
  return (
    <div className="container mx-auto max-w-7xl p-6 lg:p-8 space-y-8">
      {/* 页面标题 */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">标签管理</h1>
          <p className="text-muted-foreground mt-1">
            共有 {tags.length} 个标签
          </p>
        </div>
      </div>
      
      <TagManagementClient 
        initialTags={tags} 
        stats={{
          totalTags: tags.length,
          totalPosts,
          popularTag: popularTag?.name || '-'
        }}
      />
    </div>
  )
}