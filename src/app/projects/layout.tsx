import { Metadata } from 'next'

export const metadata: Metadata = {
  title: '项目展示 | 思维笔记',
  description: '探索我的技术作品集，每个项目都是一次创新的尝试',
  openGraph: {
    title: '项目展示 | 思维笔记',
    description: '探索我的技术作品集，每个项目都是一次创新的尝试',
    type: 'website',
  },
  twitter: {
    title: '项目展示 | 思维笔记',
    description: '探索我的技术作品集，每个项目都是一次创新的尝试',
    card: 'summary_large_image',
  },
}

export default function ProjectsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}