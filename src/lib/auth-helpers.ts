import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function getCurrentUser() {
  const session = await getServerSession(authOptions)
  return session?.user
}

export async function requireAuth() {
  const user = await getCurrentUser()
  if (!user) {
    throw new Error('未授权访问')
  }
  return user
}

export async function requireRole(role: string) {
  const user = await requireAuth()
  if (user.role !== role && user.role !== 'ADMIN') {
    throw new Error('权限不足')
  }
  return user
}

export async function requireOwnership(resourceUserId: string) {
  const user = await requireAuth()
  if (user.role === 'ADMIN') {
    return user
  }
  if (user.id !== resourceUserId) {
    throw new Error('无权操作此资源')
  }
  return user
}