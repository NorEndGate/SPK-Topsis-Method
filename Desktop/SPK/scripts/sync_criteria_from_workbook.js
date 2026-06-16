const { PrismaClient } = require('@prisma/client');
const xlsx = require('xlsx');

const prisma = new PrismaClient();
const workbook = xlsx.readFile('docs/spk_topsis_k ALL.xlsx');
const rows = xlsx.utils.sheet_to_json(workbook.Sheets['kriteria & sub'], { header: 1, defval: '', blankrows: true });

function normalizeText(value) {
  return String(value ?? '').trim().toLowerCase();
}

function extractWeight(cell) {
  const match = String(cell ?? '').match(/(\d+)%?/);
  return match ? Number(match[1]) : null;
}

function aliasSet(name) {
  const normalized = normalizeText(name);
  const aliases = new Set([normalized]);
  if (normalized.includes('natrium') || normalized.includes('garam') || normalized.includes('salt')) {
    aliases.add('natrium');
    aliases.add('garam');
    aliases.add('salt');
    aliases.add('natrium_na');
  }
  if (normalized.includes('karbohidrat')) aliases.add('karbohidrat');
  if (normalized.includes('protein')) aliases.add('protein');
  if (normalized.includes('lemak')) aliases.add('lemak');
  if (normalized.includes('serat')) aliases.add('serat');
  return [...aliases];
}

async function main() {
  const criteriaRow = rows[3] || [];
  const weightRow = rows[4] || [];
  const updates = [];

  const dbCriteria = await prisma.criterion.findMany({
    where: { deletedAt: null, isActive: true },
    orderBy: [{ order: 'asc' }, { name: 'asc' }],
  });

  for (let col = 0; col < criteriaRow.length; col += 2) {
    const sourceName = String(criteriaRow[col] ?? '').trim();
    if (!sourceName) continue;
    const weight = extractWeight(weightRow[col]) ?? 1;
    const aliases = aliasSet(sourceName);
    const existing = dbCriteria.find((criterion) => {
      const code = normalizeText(criterion.code);
      const name = normalizeText(criterion.name);
      return aliases.includes(code) || aliases.includes(name);
    });

    if (!existing) {
      updates.push({ sourceName, weight, matched: null });
      continue;
    }

    await prisma.criterion.update({
      where: { id: existing.id },
      data: {
        name: sourceName,
        weight,
        attribute: 'BENEFIT',
        isActive: true,
        deletedAt: null,
        order: Math.floor(col / 2),
      },
    });

    updates.push({ sourceName, weight, matched: existing.code });
  }

  console.log(JSON.stringify(updates, null, 2));
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
