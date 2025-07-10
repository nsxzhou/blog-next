import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // 创建默认分类
  const categories = await prisma.category.createMany({
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

  // 创建默认标签
  const tags = await prisma.tag.createMany({
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
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@example.com',
      name: 'Admin',
      passwordHash: '$2b$12$example-hash', // 实际使用时需要加密
      role: 'ADMIN',
      emailVerified: true
    }
  })

  console.log('数据库种子数据创建成功!')
  console.log('分类数量:', categories.count)
  console.log('标签数量:', tags.count)
  console.log('管理员用户:', adminUser.email)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })