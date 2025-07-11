'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

interface SiteTitleProps {
  className?: string
  scrolled?: boolean
  isHomePage?: boolean
}

export default function SiteTitle({ className, scrolled, isHomePage }: SiteTitleProps) {
  const [siteTitle, setSiteTitle] = useState('思维笔记')
  
  useEffect(() => {
    fetch('/api/settings/public')
      .then(res => res.json())
      .then(data => {
        if (data.site?.site_title) {
          setSiteTitle(data.site.site_title)
        }
      })
      .catch(console.error)
  }, [])
  
  return (
    <Link
      href="/"
      className={cn(
        'font-mono text-lg tracking-tight transition-colors',
        scrolled || !isHomePage
          ? 'text-foreground'
          : 'text-foreground/90',
        className
      )}
    >
      {siteTitle}
    </Link>
  )
}