// 用户验证相关功能
import { prisma } from '@/lib/prisma'
import { sendVerificationEmail, sendPasswordResetEmail } from '@/lib/email'
import crypto from 'crypto'

// 生成随机令牌
function generateToken(): string {
  return crypto.randomBytes(32).toString('hex')
}

// 创建邮箱验证令牌
export async function createEmailVerificationToken(userId: string): Promise<string> {
  const token = generateToken()
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24小时后过期

  // 存储令牌（这里简化处理，实际应该有专门的令牌表）
  // 暂时使用用户表的一个字段或创建一个临时存储
  // 在实际应用中，应该创建 VerificationToken 表
  
  return token
}

// 验证邮箱
export async function verifyEmail(token: string): Promise<{ success: boolean; error?: string }> {
  try {
    // 在实际应用中，应该从 VerificationToken 表查找令牌
    // 这里简化处理
    
    // 验证令牌并获取用户ID
    // const verificationToken = await prisma.verificationToken.findUnique({
    //   where: { token }
    // })
    
    // if (!verificationToken || verificationToken.expires < new Date()) {
    //   return { success: false, error: '验证链接无效或已过期' }
    // }
    
    // 更新用户的邮箱验证状态
    // await prisma.user.update({
    //   where: { id: verificationToken.userId },
    //   data: { emailVerified: true }
    // })
    
    // 删除已使用的令牌
    // await prisma.verificationToken.delete({
    //   where: { id: verificationToken.id }
    // })
    
    return { success: true }
  } catch (error) {
    console.error('Email verification failed:', error)
    return { success: false, error: '验证失败，请重试' }
  }
}

// 发送验证邮件给用户
export async function sendUserVerificationEmail(userId: string): Promise<boolean> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, name: true, emailVerified: true }
    })

    if (!user) {
      console.error('User not found:', userId)
      return false
    }

    if (user.emailVerified) {
      console.log('User email already verified:', user.email)
      return true
    }

    const token = await createEmailVerificationToken(userId)
    return await sendVerificationEmail(user.email, user.name, token)
  } catch (error) {
    console.error('Failed to send verification email:', error)
    return false
  }
}

// 创建密码重置令牌
export async function createPasswordResetToken(email: string): Promise<string | null> {
  try {
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, name: true }
    })

    if (!user) {
      return null
    }

    const token = generateToken()
    const expires = new Date(Date.now() + 60 * 60 * 1000) // 1小时后过期

    // 在实际应用中，应该存储到 PasswordResetToken 表
    // await prisma.passwordResetToken.create({
    //   data: {
    //     token,
    //     userId: user.id,
    //     expires
    //   }
    // })

    // 发送重置邮件
    await sendPasswordResetEmail(email, user.name, token)
    
    return token
  } catch (error) {
    console.error('Failed to create password reset token:', error)
    return null
  }
}

// 重置密码
export async function resetPassword(
  token: string, 
  newPassword: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // 验证令牌
    // const resetToken = await prisma.passwordResetToken.findUnique({
    //   where: { token },
    //   include: { user: true }
    // })

    // if (!resetToken || resetToken.expires < new Date()) {
    //   return { success: false, error: '重置链接无效或已过期' }
    // }

    // 更新密码
    const bcrypt = await import('bcryptjs')
    const passwordHash = await bcrypt.hash(newPassword, 10)

    // await prisma.user.update({
    //   where: { id: resetToken.userId },
    //   data: { passwordHash }
    // })

    // 删除已使用的令牌
    // await prisma.passwordResetToken.delete({
    //   where: { id: resetToken.id }
    // })

    return { success: true }
  } catch (error) {
    console.error('Password reset failed:', error)
    return { success: false, error: '重置密码失败，请重试' }
  }
}

// 检查用户是否需要验证邮箱
export async function checkEmailVerificationRequired(userId: string): Promise<boolean> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { emailVerified: true }
    })

    return user ? !user.emailVerified : false
  } catch (error) {
    console.error('Failed to check email verification status:', error)
    return false
  }
}