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

    // 创建示例页面
    await prisma.page.upsert({
      where: { slug: "about" },
      update: {},
      create: {
        title: "关于我们",
        slug: "about",
        content: "# 关于我们\n\n欢迎来到我的博客！这里分享技术、生活和教程相关的内容。\n\n## 联系方式\n- 邮箱：admin@blog.com\n- GitHub：https://github.com/username",
        excerpt: "关于我们页面的简介",
        status: "PUBLISHED",
        publishedAt: new Date(),
        authorId: adminUser.id,
        order: 1,
      },
    });

    await prisma.page.upsert({
      where: { slug: "contact" },
      update: {},
      create: {
        title: "联系我们",
        slug: "contact",
        content: "# 联系我们\n\n如果您有任何问题或建议，请通过以下方式联系我们：\n\n- 邮箱：admin@blog.com\n- 微信：blog_admin\n\n我们会在24小时内回复您。",
        excerpt: "联系我们页面的简介",
        status: "PUBLISHED",
        publishedAt: new Date(),
        authorId: adminUser.id,
        order: 2,
      },
    });
    console.log("✅ 示例页面创建成功");

    // 创建示例导航
    await prisma.navigation.upsert({
      where: { slug: "home" },
      update: {},
      create: {
        name: "首页",
        slug: "home",
        type: "EXTERNAL",
        url: "/",
        order: 1,
      },
    });

    await prisma.navigation.upsert({
      where: { slug: "about" },
      update: {},
      create: {
        name: "关于",
        slug: "about",
        type: "PAGE",
        order: 2,
      },
    });

    await prisma.navigation.upsert({
      where: { slug: "contact" },
      update: {},
      create: {
        name: "联系",
        slug: "contact",
        type: "PAGE",
        order: 3,
      },
    });

    await prisma.navigation.upsert({
      where: { slug: "tech" },
      update: {},
      create: {
        name: "技术",
        slug: "tech",
        type: "TAG",
        order: 4,
      },
    });
    console.log("✅ 示例导航创建成功");

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
