
/**
 * 英雄区域组件
 * 
 * 功能：展示博客核心信息和导航入口
 * 特点：极简设计，居中布局，专注核心内容
 */
export function HeroSection() {
  return (
    <section className="pb-8 md:pb-12">
      <div className="container mx-auto px-4">
        <div className="text-center space-y-6 max-w-2xl mx-auto">
          {/* 主标题 */}
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
            Think & Share 思考与分享
          </h1>
          
          {/* 简短描述 */}
          <p className="text-lg text-muted-foreground leading-relaxed">
            简单记录，深度思考。Life is debugging, and we&apos;re all just trying to fix the bugs.
          </p>

        </div>
      </div>
    </section>
  );
}