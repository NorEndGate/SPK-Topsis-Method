const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  const criteria = await prisma.criterion.findMany({
    where: { deletedAt: null, isActive: true },
    orderBy: [{ order: 'asc' }, { name: 'asc' }],
    select: { id: true, code: true, name: true, weight: true, attribute: true, order: true },
  });

  const alternatives = await prisma.alternative.findMany({
    where: { deletedAt: null, isActive: true },
    orderBy: [{ createdAt: 'desc' }, { name: 'asc' }],
    take: 8,
    select: { id: true, name: true, slug: true, createdAt: true },
  });

  const assessments = await prisma.assessment.findMany({
    where: { deletedAt: null, alternative: { deletedAt: null, isActive: true }, criterion: { deletedAt: null, isActive: true } },
    select: { alternativeId: true, criterionId: true, score: true, alternative: { select: { name: true } }, criterion: { select: { code: true, name: true } } },
    orderBy: [{ alternativeId: 'asc' }, { criterionId: 'asc' }],
  });

  console.log('CRITERIA');
  console.log(JSON.stringify(criteria, null, 2));
  console.log('ALTERNATIVES');
  console.log(JSON.stringify(alternatives, null, 2));

  const wanted = ['Kwaci', 'Kacang kedelai, goreng', 'Tempe pasar goreng', 'Beras jagung kuning, kering, mentah'];
  console.log('SCORES');
  for (const name of wanted) {
    const rows = assessments.filter((row) => row.alternative.name === name);
    console.log(name, JSON.stringify(rows.map((row) => ({ criterion: row.criterion.code, score: row.score })), null, 2));
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
