import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getProjectBySlug } from '@/lib/projects'
import ProjectDetailClient from './client'

interface ProjectPageProps {
  params: Promise<{
    slug: string
  }>
}

export async function generateMetadata(
  { params }: ProjectPageProps
): Promise<Metadata> {
  const { slug } = await params
  const project = await getProjectBySlug(slug)
  
  if (!project) {
    return {
      title: '项目未找到',
    }
  }
  
  return {
    title: project.title,
    description: project.description,
    openGraph: {
      title: project.title,
      description: project.description,
      images: project.coverImage ? [project.coverImage] : [],
    },
  }
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { slug } = await params
  const project = await getProjectBySlug(slug)
  
  if (!project) {
    notFound()
  }
  
  return <ProjectDetailClient project={project} />
}