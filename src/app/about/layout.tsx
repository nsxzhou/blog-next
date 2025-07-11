import { Metadata } from 'next'

export const metadata: Metadata = {
  title: '关于 | 思维笔记',
  description: '了解更多关于我的信息，技能专长和个人经历',
  openGraph: {
    title: '关于 | 思维笔记',
    description: '了解更多关于我的信息，技能专长和个人经历',
    type: 'profile',
  },
  twitter: {
    title: '关于 | 思维笔记',
    description: '了解更多关于我的信息，技能专长和个人经历',
    card: 'summary_large_image',
  },
}

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}