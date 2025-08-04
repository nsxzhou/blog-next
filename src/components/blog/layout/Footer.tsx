import Link from "next/link";

/**
 * 页脚组件
 * 
 * 功能：展示网站底部信息，包括版权、导航链接、社交媒体等
 * 特点：响应式设计，多栏布局，清晰的链接组织
 */
export function Footer() {
  return (
    <footer className="border-t bg-background">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* 网站信息 */}
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-lg font-semibold mb-4">Blog Next</h3>
            <p className="text-muted-foreground mb-4 max-w-md">
              一个基于 Next.js 和 Tailwind CSS 构建的现代化博客平台，
              专注于内容创作和优雅的阅读体验。
            </p>
            <p className="text-sm text-muted-foreground">
              © 2024 Blog Next. 保留所有权利。
            </p>
          </div>
          
          {/* 快速链接 */}
          <div>
            <h4 className="text-sm font-semibold mb-4">快速链接</h4>
            <ul className="space-y-2">
              <li>
                <Link 
                  href="/posts" 
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  文章
                </Link>
              </li>
              <li>
                <Link 
                  href="/tags" 
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  标签
                </Link>
              </li>
              <li>
                <Link 
                  href="/about" 
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  关于
                </Link>
              </li>
              <li>
                <Link 
                  href="/search" 
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  搜索
                </Link>
              </li>
            </ul>
          </div>
          
          {/* 其他链接 */}
          <div>
            <h4 className="text-sm font-semibold mb-4">其他</h4>
            <ul className="space-y-2">
              <li>
                <Link 
                  href="/privacy" 
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  隐私政策
                </Link>
              </li>
              <li>
                <Link 
                  href="/terms" 
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  使用条款
                </Link>
              </li>
              <li>
                <Link 
                  href="/contact" 
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  联系我们
                </Link>
              </li>
              <li>
                <Link 
                  href="/rss" 
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  RSS 订阅
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        {/* 社交媒体链接 */}
        <div className="border-t pt-8 mt-8">
          <div className="flex flex-col sm:flex-row items-center justify-between">
            <div className="flex items-center space-x-4 mb-4 sm:mb-0">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                GitHub
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                Twitter
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                LinkedIn
              </a>
            </div>
            <p className="text-sm text-muted-foreground">
              Made with ❤️ using Next.js
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}