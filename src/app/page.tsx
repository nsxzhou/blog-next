import { BlogLayout } from "@/components/blog/layout/BlogLayout";

export default function Home() {
  return (
    <BlogLayout>
      <div className="text-center space-y-8">
        <h1 className="text-4xl font-bold tracking-tight">
          欢迎来到我的博客
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          这是一个基于 Next.js 和 Tailwind CSS 构建的现代化博客平台。
        </p>
        <div className="flex justify-center space-x-4">
          <a 
            href="/posts" 
            className="px-6 py-3 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            浏览文章
          </a>
          <a 
            href="/about" 
            className="px-6 py-3 border border-border rounded-md hover:bg-accent transition-colors"
          >
            了解更多
          </a>
        </div>
      </div>
    </BlogLayout>
  );
}
