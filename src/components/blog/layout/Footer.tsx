import Link from "next/link";

/**
 * 页脚组件
 * 
 * 功能：展示网站底部信息，包括版权、导航链接、社交媒体等
 * 特点：响应式设计，简洁优雅的布局，统一的设计语言
 */
export function Footer() {
  return (
    <footer className="border-t border-border/40 bg-background/50">
      <div className="container mx-auto px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* 网站信息 - 主要内容区域 */}
          <div className="lg:col-span-6 space-y-6">
            <div>
              <h3 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                溺水寻舟
              </h3>
              <p className="text-muted-foreground mt-3 max-w-md leading-relaxed">
                写作即思考，Code is poetry. 记录日常所思，分享技术心得。
              </p>
            </div>
          </div>

          {/* 导航链接 */}
          {/* <div className="lg:col-span-3">
            <h4 className="text-sm font-semibold mb-6 text-foreground">快速链接</h4>
            <ul className="space-y-4">
              <li>
                <Link
                  href="/about"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors duration-200"
                >
                  关于我们
                </Link>
              </li>
              <li>
                <Link
                  href="/archive"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors duration-200"
                >
                  文章归档
                </Link>
              </li>
            </ul>
          </div> */}

          {/* 法律链接 */}
          {/* <div className="lg:col-span-3">
            <h4 className="text-sm font-semibold mb-6 text-foreground">法律信息</h4>
            <ul className="space-y-4">
              <li>
                <Link
                  href="/privacy"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors duration-200"
                >
                  隐私政策
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors duration-200"
                >
                  使用条款
                </Link>
              </li>
            </ul>
          </div> */}
        </div>

        {/* 分隔线和底部信息 */}
        <div className="border-t border-border/40 pt-8 mt-12">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* 版权信息 */}
            <div className="flex items-center space-x-4">
              <p className="text-sm text-muted-foreground">
                © 2025 溺水寻舟. 保留所有权利。
              </p>
            </div>

            {/* 社交媒体和技术标识 */}
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-4">
                <a
                  href="https://github.com/nsxzhou"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors duration-200"
                >
                  GitHub
                </a>
              </div>
              <div className="hidden sm:block w-px h-4 bg-border"></div>
              <p className="text-xs text-muted-foreground flex items-center">
                Built with <span className="ml-1 font-medium">Next.js</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}