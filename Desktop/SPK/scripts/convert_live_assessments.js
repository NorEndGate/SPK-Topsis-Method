const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

function normalizeText(value) {
  return String(value ?? '').trim().toLowerCase();
}

function convertWorkbookScore(criterionName, numericValue) {
  const normalizedName = normalizeText(criterionName);

  if (normalizedName === 'protein' || normalizedName === 'lemak' || normalizedName === 'karbohidrat') {
    if (numericValue <= 1) return 1;
    if (numericValue <= 25) return 2;
    if (numericValue <= 50) return 3;
    if (numericValue <= 75) return 4;
    return 5;
  }

  if (normalizedName === 'serat') {
    if (numericValue <= 1) return 1;
    if (numericValue <= 3) return 2;
    if (numericValue <= 5) return 3;
    if (numericValue <= 7) return 4;
    return 5;
  }

  if (normalizedName === 'natrium' || normalizedName === 'salt' || normalizedName === 'garam') {
    if (numericValue > 500) return 1;
    if (numericValue > 350) return 2;
    if (numericValue > 200) return 3;
    if (numericValue > 100) return 4;
    return 5;
  }

  return numericValue;
}

async function main() {
  const assessments = await prisma.assessment.findMany({
    where: {
      deletedAt: null,
      alternative: { deletedAt: null, isActive: true },
      criterion: { deletedAt: null, isActive: true },
    },
    select: {
      id: true,
      score: true,
      alternative: { select: { name: true } },
      criterion: { select: { name: true } },
    },
  });

  let updated = 0;
  for (const assessment of assessments) {
    const converted = convertWorkbookScore(assessment.criterion.name, assessment.score);
    if (converted !== assessment.score) {
      await prisma.assessment.update({
        where: { id: assessment.id },
        data: { score: converted },
      });
      updated += 1;
    }
  }

  console.log(JSON.stringify({ total: assessments.length, updated }, null, 2));
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
