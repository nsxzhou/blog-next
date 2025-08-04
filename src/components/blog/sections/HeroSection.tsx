import Link from "next/link";

export function HeroSection() {
  return (
    <section className="relative py-20 md:py-32 bg-gradient-to-br from-background via-background to-secondary/20">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          {/* 主标题 */}
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-foreground">
            欢迎来到我的博客
          </h1>
          
          {/* 副标题描述 */}
          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            这是一个基于 Next.js 和 Tailwind CSS 构建的现代化博客平台，
            专注于内容创作和优雅的阅读体验。
          </p>
          
          {/* 行动按钮 */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link 
              href="/posts" 
              className="w-full sm:w-auto px-8 py-4 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors shadow-lg hover:shadow-xl"
            >
              浏览文章
            </Link>
            <Link 
              href="/about" 
              className="w-full sm:w-auto px-8 py-4 border border-border bg-background hover:bg-accent rounded-lg font-medium transition-colors"
            >
              了解更多
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}