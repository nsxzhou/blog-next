import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // 创建默认标签
  const defaultTags = await prisma.tag.createMany({
    data: [
      {
        name: '技术分享',
        slug: 'tech',
        description: '技术相关的文章和教程'
      },
      {
        name: '生活随笔',
        slug: 'life',
        description: '生活感悟和随笔'
      },
      {
        name: '项目经验',
        slug: 'project',
        description: '项目开发经验分享'
      }
    ],
    skipDuplicates: true
  })

  // 创建技术标签
  const techTags = await prisma.tag.createMany({
    data: [
      { name: 'JavaScript', slug: 'javascript' },
      { name: 'TypeScript', slug: 'typescript' },
      { name: 'React', slug: 'react' },
      { name: 'Next.js', slug: 'nextjs' },
      { name: 'Node.js', slug: 'nodejs' },
      { name: 'Database', slug: 'database' },
      { name: 'Web Development', slug: 'web-development' }
    ],
    skipDuplicates: true
  })

  // 创建默认管理员用户
  const defaultPassword = 'admin123456' // 默认密码
  const passwordHash = await bcrypt.hash(defaultPassword, 12)
  
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      name: 'Admin',
      passwordHash: passwordHash,
      role: 'ADMIN',
      emailVerified: true
    }
  })

  console.log('数据库种子数据创建成功!')
  console.log('创建默认标签:', defaultTags.count)
  console.log('创建技术标签:', techTags.count)
  console.log('管理员用户:', adminUser.email)
  console.log('管理员密码:', defaultPassword)
  console.log('请登录后立即修改密码！')
  
  // 创建测试普通用户（可选）
  const testUserPassword = 'user123456'
  const testUserPasswordHash = await bcrypt.hash(testUserPassword, 12)
  
  const testUser = await prisma.user.upsert({
    where: { email: 'user@example.com' },
    update: {},
    create: {
      email: 'user@example.com',
      name: 'Test User',
      passwordHash: testUserPasswordHash,
      role: 'USER',
      emailVerified: true
    }
  })
  
  console.log('\n测试用户:', testUser.email)
  console.log('测试用户密码:', testUserPassword)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })