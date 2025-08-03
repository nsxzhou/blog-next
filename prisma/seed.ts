import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("数据库连接测试...");

  try {
    // 测试数据库连接
    await prisma.$connect();
    console.log("✅ 数据库连接成功");

    // 测试查询
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    console.log("✅ 数据库查询正常");
  } catch (error) {
    console.error("❌ 数据库连接失败:", error);
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
