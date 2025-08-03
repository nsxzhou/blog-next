import Link from "next/link";
import ThemeToggle from "@/components/theme/theme-toggle";

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center space-x-8">
            <Link href="/" className="text-xl font-bold">
              Blog Next
            </Link>
            <nav className="hidden md:flex items-center space-x-6">
              <Link href="/" className="text-sm font-medium transition-colors hover:text-primary">
                首页
              </Link>
              <Link href="/posts" className="text-sm font-medium transition-colors hover:text-primary">
                文章
              </Link>
              <Link href="/tags" className="text-sm font-medium transition-colors hover:text-primary">
                标签
              </Link>
              <Link href="/about" className="text-sm font-medium transition-colors hover:text-primary">
                关于
              </Link>
            </nav>
          </div>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}