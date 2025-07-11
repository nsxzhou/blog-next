'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X, Search, Command } from 'lucide-react'
import ThemeToggle from '@/components/theme/ThemeToggle'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import UserMenu from './UserMenu'
import { useSession } from 'next-auth/react'
import SearchModal from '@/components/search/SearchModal'
import { useSearchModal } from '@/hooks/useSearchModal'
import NotificationCenter from '@/components/NotificationCenter'
import SiteTitle from './SiteTitle'

const navigation = [
  { name: '首页', href: '/' },
  { name: '文章', href: '/articles' },
  { name: '项目', href: '/projects' },
  { name: '归档', href: '/archive' },
  { name: '关于', href: '/about' },
]

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [hidden, setHidden] = useState(false)
  const [lastScrollY, setLastScrollY] = useState(0)
  const { data: session } = useSession()
  const pathname = usePathname()
  const { isOpen: isSearchOpen, openSearch, closeSearch } = useSearchModal()

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY

      // 判断滚动方向和状态
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        // 向下滚动且超过100px，隐藏导航栏
        setHidden(true)
      } else {
        // 向上滚动或在顶部附近，显示导航栏
        setHidden(false)
      }

      // 判断是否已滚动
      setScrolled(currentScrollY > 10)
      setLastScrollY(currentScrollY)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [lastScrollY])

  // 判断是否在首页
  const isHomePage = pathname === '/'

  return (
    <>
      <motion.header
        initial={{ y: 0 }}
        animate={{ y: hidden ? -100 : 0 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className={cn(
          'fixed top-0 left-0 right-0 z-40 transition-all duration-300',
          scrolled
            ? 'bg-background/80 backdrop-blur-md border-b border-border/50'
            : isHomePage
            ? 'bg-transparent'
            : 'bg-background/50 backdrop-blur-sm'
        )}
      >
        <nav className="container mx-auto px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo - 极简设计 */}
            <SiteTitle scrolled={scrolled} isHomePage={isHomePage} />

            {/* Desktop Navigation - 居中 */}
            <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 items-center space-x-8">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'relative text-sm font-light transition-all duration-200',
                    pathname === item.href
                      ? 'text-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  {item.name}
                  {/* 下划线动画 */}
                  {pathname === item.href && (
                    <motion.div
                      layoutId="nav-underline"
                      className="absolute -bottom-[1px] left-0 right-0 h-[1px] bg-foreground"
                      transition={{
                        type: 'spring',
                        stiffness: 300,
                        damping: 30,
                      }}
                    />
                  )}
                </Link>
              ))}
            </div>

            {/* Right Actions */}
            <div className="flex items-center space-x-3">
              {/* Search Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={openSearch}
                className={cn(
                  'relative p-2 rounded-md transition-colors',
                  'hover:bg-accent/50',
                  'text-muted-foreground hover:text-foreground',
                  'group'
                )}
                aria-label="搜索"
                title="搜索 (⌘K)"
              >
                <Search className="w-5 h-5" />
                {/* 键盘快捷键提示 */}
                <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-2 py-1 text-xs bg-background border border-border rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  <kbd className="px-1 py-0.5 bg-muted rounded text-xs mr-0.5">⌘</kbd>
                  <kbd className="px-1 py-0.5 bg-muted rounded text-xs">K</kbd>
                </span>
              </motion.button>
              
              {/* Theme Toggle */}
              <ThemeToggle />
              
              {/* Notification Center - 只在用户登录时显示 */}
              {session && <NotificationCenter />}

              {/* User Menu */}
              {session ? (
                <UserMenu user={session.user} />
              ) : (
                <Link href="/login" className="btn btn-primary">
                  登录
                </Link>
              )}
              {/* Mobile Menu Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className={cn(
                  'md:hidden p-2 rounded-md transition-colors',
                  'hover:bg-accent/50',
                  'text-muted-foreground hover:text-foreground'
                )}
                aria-label="菜单"
              >
                <div className="relative w-5 h-5">
                  <motion.span
                    animate={{
                      rotate: isMenuOpen ? 45 : 0,
                      y: isMenuOpen ? 6 : 0,
                    }}
                    className="absolute top-0 left-0 w-5 h-0.5 bg-current"
                  />
                  <motion.span
                    animate={{
                      opacity: isMenuOpen ? 0 : 1,
                    }}
                    className="absolute top-2 left-0 w-5 h-0.5 bg-current"
                  />
                  <motion.span
                    animate={{
                      rotate: isMenuOpen ? -45 : 0,
                      y: isMenuOpen ? -6 : 0,
                    }}
                    className="absolute top-4 left-0 w-5 h-0.5 bg-current"
                  />
                </div>
              </motion.button>
            </div>
          </div>
        </nav>

        {/* Mobile Navigation - 全屏展开 */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: '100vh' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="md:hidden fixed inset-0 top-16 bg-background/95 backdrop-blur-lg"
            >
              <nav className="flex flex-col items-center justify-center h-full space-y-8">
                {navigation.map((item, index) => (
                  <motion.div
                    key={item.name}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Link
                      href={item.href}
                      className={cn(
                        'text-2xl font-light transition-colors',
                        pathname === item.href
                          ? 'text-foreground'
                          : 'text-muted-foreground hover:text-foreground'
                      )}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {item.name}
                    </Link>
                  </motion.div>
                ))}
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      {/* 占位元素，防止内容被固定导航栏遮挡 */}
      {!isHomePage && <div className="h-16" />}
      
      {/* 搜索模态框 */}
      <SearchModal isOpen={isSearchOpen} onClose={closeSearch} />
    </>
  )
}
