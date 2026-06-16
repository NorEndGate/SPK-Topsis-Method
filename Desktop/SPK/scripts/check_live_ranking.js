const { PrismaClient } = require('@prisma/client');
const xlsx = require('xlsx');

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

function calculateTopsis(criteria, alternatives) {
  const matrix = alternatives.map((a) => a.scores);
  const denom = criteria.map((_, j) => Math.sqrt(matrix.reduce((sum, row) => sum + row[j] * row[j], 0)));
  const normalized = matrix.map((row) => row.map((value, j) => value / denom[j]));
  const weighted = normalized.map((row) => row.map((value, j) => value * criteria[j].weight));
  const idealPositive = criteria.map((_, j) => Math.max(...weighted.map((row) => row[j])));
  const idealNegative = criteria.map((_, j) => Math.min(...weighted.map((row) => row[j])));
  const results = alternatives.map((alt, index) => {
    const dp = Math.sqrt(weighted[index].reduce((sum, value, j) => sum + Math.pow(value - idealPositive[j], 2), 0));
    const dn = Math.sqrt(weighted[index].reduce((sum, value, j) => sum + Math.pow(value - idealNegative[j], 2), 0));
    return { name: alt.name, preference: dn / (dn + dp) };
  });
  results.sort((a, b) => b.preference - a.preference || a.name.localeCompare(b.name));
  return results;
}

async function main() {
  const criteriaRows = await prisma.criterion.findMany({
    where: { deletedAt: null, isActive: true },
    orderBy: [{ order: 'asc' }, { name: 'asc' }],
  });
  const alternativesRows = await prisma.alternative.findMany({
    where: { deletedAt: null, isActive: true },
    orderBy: [{ createdAt: 'desc' }, { name: 'asc' }],
  });
  const assessmentRows = await prisma.assessment.findMany({
    where: { deletedAt: null, alternative: { deletedAt: null, isActive: true }, criterion: { deletedAt: null, isActive: true } },
    select: { alternativeId: true, criterionId: true, score: true },
  });

  const criteria = criteriaRows.map((criterion) => ({
    id: criterion.id,
    name: criterion.name,
    weight: criterion.weight,
  }));

  const assessmentMap = new Map();
  for (const row of assessmentRows) {
    const current = assessmentMap.get(row.alternativeId) || {};
    current[row.criterionId] = row.score;
    assessmentMap.set(row.alternativeId, current);
  }

  const alternatives = alternativesRows.map((alternative) => {
    const scores = assessmentMap.get(alternative.id) || {};
    return {
      name: alternative.name,
      scores: criteria.map((criterion) => scores[criterion.id]),
    };
  });

  const ranking = calculateTopsis(criteria, alternatives);
  console.log(ranking.slice(0, 10));
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
