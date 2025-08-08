"use client"

import { SidebarTrigger } from "@/components/ui/sidebar"

interface AdminHeaderProps {
  title?: string
}

export function AdminHeader({ title }: AdminHeaderProps) {
  return (
    <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center px-6 gap-4">
        <SidebarTrigger />
        <h1 className="text-xl font-semibold text-foreground">{title || "管理后台"}</h1>
      </div>
    </header>
  )
}