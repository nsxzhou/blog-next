import { motion } from 'framer-motion'

export default function ArchiveLoading() {
  return (
    <div className="min-h-screen px-6 py-20 md:py-24">
      <div className="max-w-3xl mx-auto">
        {/* 标题骨架 */}
        <div className="h-12 w-32 bg-muted/20 rounded-md mb-12 animate-pulse" />
        
        {/* 搜索框骨架 */}
        <div className="mb-12 space-y-4">
          <div className="h-10 bg-muted/20 rounded-md animate-pulse" />
          <div className="flex justify-between">
            <div className="h-5 w-24 bg-muted/20 rounded-md animate-pulse" />
            <div className="h-8 w-20 bg-muted/20 rounded-md animate-pulse" />
          </div>
        </div>
        
        {/* 文章列表骨架 */}
        <div className="space-y-12">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-4">
              <div className="h-8 w-32 bg-muted/20 rounded-md animate-pulse" />
              <div className="space-y-3 pl-7">
                {[1, 2, 3, 4].map((j) => (
                  <div key={j} className="flex gap-4">
                    <div className="h-5 w-12 bg-muted/20 rounded-md animate-pulse" />
                    <div className="h-5 flex-1 bg-muted/20 rounded-md animate-pulse" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}