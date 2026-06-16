const xlsx = require('xlsx');

const wb = xlsx.readFile('docs/spk_topsis_k ALL.xlsx', { cellDates: true });
const dataRows = xlsx.utils.sheet_to_json(wb.Sheets['data clean'], { header: 1, defval: '', blankrows: true });

function normalizeText(value) {
  return String(value ?? '').trim().toLowerCase();
}

function parseNumber(value) {
  const numeric = Number(String(value ?? '').trim().replace(',', '.'));
  return Number.isFinite(numeric) ? numeric : null;
}

function scoreFromBucket(value, buckets) {
  for (const bucket of buckets) {
    if (bucket.greater !== undefined) {
      if (value > bucket.greater) return bucket.rank;
    } else if (bucket.min !== undefined && bucket.max !== undefined) {
      if (value >= bucket.min && value <= bucket.max) return bucket.rank;
    }
  }
  return value;
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

function buildConversionMap() {
  const sheet = wb.Sheets['kriteria & sub'];
  const rows = xlsx.utils.sheet_to_json(sheet, { header: 1, defval: '', blankrows: true });
  const map = new Map();
  const names = rows[3] || [];
  const weights = rows[4] || [];
  for (let col = 0; col < names.length; col += 2) {
    const name = String(names[col] ?? '').trim();
    if (!name) continue;
    const key = normalizeText(name);
    const weight = parseNumber(String(weights[col] ?? '').replace('W=', '').replace('%', ''));
    const buckets = [];
    for (let row = 7; row <= 11; row++) {
      const rangeCell = String((rows[row] || [])[col] ?? '').trim();
      const rankCell = parseNumber((rows[row] || [])[col + 1]);
      if (!rangeCell || rankCell == null) continue;
      const gt = rangeCell.match(/^>\s*(\d+(?:\.\d+)?)$/);
      const dash = rangeCell.match(/^(\d+(?:\.\d+)?)\s*-\s*(\d+(?:\.\d+)?)$/);
      if (gt) buckets.push({ greater: Number(gt[1]), rank: rankCell });
      else if (dash) buckets.push({ min: Number(dash[1]), max: Number(dash[2]), rank: rankCell });
    }
    map.set(key, { weight: weight ?? 1, buckets });
  }
  return map;
}

function calculateTopsis(criteria, alternatives) {
  const matrix = alternatives.map((a) => a.scores);
  const denom = criteria.map((_, col) => Math.sqrt(matrix.reduce((sum, row) => sum + row[col] * row[col], 0)) || 1);
  const normalized = matrix.map((row) => row.map((value, col) => value / denom[col]));
  const weights = criteria.map((c) => c.weight);
  const weighted = normalized.map((row) => row.map((value, col) => value * weights[col]));

  const idealPositive = [];
  const idealNegative = [];
  for (let col = 0; col < criteria.length; col++) {
    const values = weighted.map((row) => row[col]);
    idealPositive[col] = Math.max(...values);
    idealNegative[col] = Math.min(...values);
  }

  const distancePositive = weighted.map((row) => Math.sqrt(row.reduce((sum, value, col) => sum + Math.pow(value - idealPositive[col], 2), 0)));
  const distanceNegative = weighted.map((row) => Math.sqrt(row.reduce((sum, value, col) => sum + Math.pow(value - idealNegative[col], 2), 0)));
  const preference = distanceNegative.map((dn, i) => dn / (dn + distancePositive[i] || 1));

  return alternatives.map((alternative, index) => ({
    name: alternative.name,
    value: preference[index],
  })).sort((a, b) => b.value - a.value || a.name.localeCompare(b.name));
}

const conversionMap = buildConversionMap();
const criteria = [
  { name: 'protein', weight: conversionMap.get('protein')?.weight ?? 1 },
  { name: 'lemak', weight: conversionMap.get('lemak')?.weight ?? 1 },
  { name: 'karbohidrat', weight: conversionMap.get('karbohidrat')?.weight ?? 1 },
  { name: 'serat', weight: conversionMap.get('serat')?.weight ?? 1 },
  { name: 'natrium', weight: conversionMap.get('natrium')?.weight ?? 1 },
];

const alternatives = [];
for (let rowIndex = 6; rowIndex < dataRows.length; rowIndex++) {
  const row = dataRows[rowIndex] || [];
  const name = String(row[0] ?? '').trim();
  if (!name) continue;
  const protein = parseNumber(row[1]);
  const fat = parseNumber(row[2]);
  const carb = parseNumber(row[3]);
  const fiber = parseNumber(row[4]);
  const salt = parseNumber(row[5]);
  if ([protein, fat, carb, fiber, salt].some((value) => value == null)) continue;
  const rawByCriterion = {
    karbohidrat: carb,
    lemak: fat,
    protein,
    serat: fiber,
    natrium: salt,
  };
  const converted = criteria.map((criterion) => convertWorkbookScore(criterion.name, rawByCriterion[criterion.name]));
  alternatives.push({ name, scores: converted });
}

const results = calculateTopsis(criteria.map((criterion) => ({ name: criterion.name, weight: criterion.weight })), alternatives);

console.log('TOP 10');
for (const item of results.slice(0, 10)) {
  console.log(item.name, item.value.toFixed(10));
}
