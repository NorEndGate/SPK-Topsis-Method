const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const wanted = [
    'kwaci',
    'kacang kedelai, goreng',
    'tempe pasar goreng',
    'beras jagung kuning, kering, mentah',
    'kerupuk cumi goreng',
  ];

  const assessments = await prisma.assessment.findMany({
    where: {
      deletedAt: null,
      alternative: { deletedAt: null, isActive: true },
      criterion: { deletedAt: null, isActive: true },
    },
    select: {
      score: true,
      alternative: { select: { name: true } },
      criterion: { select: { code: true, name: true } },
    },
  });

  for (const name of wanted) {
    const rows = assessments.filter((row) => row.alternative.name === name);
    console.log('ALT', name);
    console.log(JSON.stringify(rows.map((row) => ({ criterion: row.criterion.name, code: row.criterion.code, score: row.score })), null, 2));
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
