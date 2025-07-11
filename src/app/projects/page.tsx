import { Suspense } from 'react'
import { getProjects } from '@/lib/projects'
import ProjectsClient from './ProjectsClient'
import { Loader2 } from 'lucide-react'

export default async function ProjectsPage() {
  // 从数据库获取所有已发布的项目
  const projects = await getProjects({
    status: 'PUBLISHED',
    orderBy: 'order',
    order: 'asc',
    limit: 100 // 获取所有项目
  })

  return (
    <Suspense 
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      }
    >
      <ProjectsClient initialProjects={projects} />
    </Suspense>
  )
}
