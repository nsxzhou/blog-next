'use client'

import { motion } from 'framer-motion'

export default function ArticlesLoading() {
  return (
    <div className="min-h-screen">
      {/* 页面标题区域骨架屏 */}
      <section className="pt-24 pb-12 sm:pt-32 sm:pb-16 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4"
          >
            <div className="h-12 w-32 bg-muted/50 rounded-lg animate-pulse" />
            <div className="h-6 w-96 bg-muted/30 rounded-lg animate-pulse" />
            <div className="flex gap-4 mt-8">
              <div className="h-10 w-32 bg-muted/30 rounded-lg animate-pulse" />
              <div className="h-10 w-24 bg-muted/30 rounded-lg animate-pulse" />
              <div className="h-10 w-24 bg-muted/30 rounded-lg animate-pulse" />
            </div>
          </motion.div>
        </div>
      </section>
      
      {/* 文章列表骨架屏 */}
      <section className="pb-20">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="divide-y divide-border/30">
            {[1, 2, 3].map((i) => (
              <div key={i} className="py-16 sm:py-20 lg:py-24">
                <div className="max-w-4xl mx-auto space-y-4">
                  <div className="flex gap-4">
                    <div className="h-5 w-24 bg-muted/30 rounded-lg animate-pulse" />
                    <div className="h-5 w-20 bg-muted/30 rounded-lg animate-pulse" />
                  </div>
                  <div className="h-10 w-3/4 bg-muted/40 rounded-lg animate-pulse" />
                  <div className="space-y-2">
                    <div className="h-4 w-full bg-muted/20 rounded-lg animate-pulse" />
                    <div className="h-4 w-5/6 bg-muted/20 rounded-lg animate-pulse" />
                    <div className="h-4 w-4/6 bg-muted/20 rounded-lg animate-pulse" />
                  </div>
                  <div className="flex gap-2 pt-4">
                    <div className="h-8 w-20 bg-muted/30 rounded-full animate-pulse" />
                    <div className="h-8 w-24 bg-muted/30 rounded-full animate-pulse" />
                    <div className="h-8 w-20 bg-muted/30 rounded-full animate-pulse" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}