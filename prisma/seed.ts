import { PrismaClient } from "../src/generated/prisma";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  console.log("开始数据库初始化...");

  try {
    // 测试数据库连接
    await prisma.$connect();
    console.log("✅ 数据库连接成功");

    // 创建初始管理员用户
    const adminPassword = await bcrypt.hash("admin123", 10);
    const adminUser = await prisma.user.upsert({
      where: { email: "admin@blog.com" },
      update: {},
      create: {
        username: "admin",
        email: "admin@blog.com",
        password: adminPassword,
        name: "管理员",
        role: "ADMIN",
      },
    });
    console.log("✅ 管理员用户创建成功:", adminUser.email);

    // 创建初始作者用户
    const authorPassword = await bcrypt.hash("author123", 10);
    const authorUser = await prisma.user.upsert({
      where: { email: "author@blog.com" },
      update: {},
      create: {
        username: "author",
        email: "author@blog.com",
        password: authorPassword,
        name: "作者",
        role: "AUTHOR",
      },
    });
    console.log("✅ 作者用户创建成功:", authorUser.email);

    // 创建示例标签
    await prisma.tag.upsert({
      where: { name: "技术" },
      update: {},
      create: {
        name: "技术",
        slug: "tech",
        description: "技术相关文章",
        color: "#3B82F6",
      },
    });

    await prisma.tag.upsert({
      where: { name: "生活" },
      update: {},
      create: {
        name: "生活",
        slug: "life",
        description: "生活相关文章",
        color: "#10B981",
      },
    });

    await prisma.tag.upsert({
      where: { name: "教程" },
      update: {},
      create: {
        name: "教程",
        slug: "tutorial",
        description: "教程类文章",
        color: "#F59E0B",
      },
    });
    console.log("✅ 示例标签创建成功");

    console.log("🎉 数据库初始化完成！");
    console.log("管理员账号：admin@blog.com / admin123");
    console.log("作者账号：author@blog.com / author123");

  } catch (error) {
    console.error("❌ 数据库初始化失败:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
