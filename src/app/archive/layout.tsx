import { Metadata } from 'next'

export const metadata: Metadata = {
  title: '归档 | 思维笔记',
  description: '所有文章归档，按时间顺序整理',
  openGraph: {
    title: '归档 | 思维笔记',
    description: '所有文章归档，按时间顺序整理',
    type: 'website',
  },
  twitter: {
    title: '归档 | 思维笔记',
    description: '所有文章归档，按时间顺序整理',
    card: 'summary_large_image',
  },
}

export default function ArchiveLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}