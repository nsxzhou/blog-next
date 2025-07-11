import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import MediaLibraryClient from './MediaLibraryClient'

export default async function MediaLibraryPage() {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    redirect('/auth/signin')
  }
  
  return (
    <div className="container mx-auto max-w-7xl p-6 lg:p-8 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">媒体库</h1>
          <p className="text-muted-foreground mt-1">
            管理您的图片、视频和文件
          </p>
        </div>
      </div>
      
      <MediaLibraryClient />
    </div>
  )
}