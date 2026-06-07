import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.role.upsert({
    where: { code: "ADMIN" },
    update: {},
    create: { code: "ADMIN", name: "Admin" },
  });

  await prisma.role.upsert({
    where: { code: "NUTRITIONIST" },
    update: {},
    create: { code: "NUTRITIONIST", name: "Ahli Gizi" },
  });

  await prisma.role.upsert({
    where: { code: "USER" },
    update: {},
    create: { code: "USER", name: "User" },
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
