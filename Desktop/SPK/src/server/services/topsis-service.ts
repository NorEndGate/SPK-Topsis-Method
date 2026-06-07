import {
  calculateDemoTopsis,
  calculateTopsis,
  demoAlternatives,
  demoCriteria,
  roundTopsisResult,
  TopsisCalculationResult,
  TopsisAlternative,
  TopsisCriterion,
} from "@/lib/topsis";
import { prisma } from "@/lib/db/prisma";

export type RankingSummary = {
  totalAlternatives: number;
  totalCriteria: number;
  bestAlternative: string | null;
};

export type RankingResponse = {
  rankingRunId: string;
  createdAt: string;
  summary: RankingSummary;
  calculation: TopsisCalculationResult;
};

export async function calculateDemoRanking(): Promise<RankingResponse> {
  const calculation = roundTopsisResult(calculateDemoTopsis(), 4);

  return {
    rankingRunId: "demo-ranking-run",
    createdAt: new Date().toISOString(),
    summary: {
      totalAlternatives: demoAlternatives.length,
      totalCriteria: demoCriteria.length,
      bestAlternative: calculation.results[0]?.alternativeName ?? null,
    },
    calculation,
  };
}

export async function calculateActiveDataRanking(): Promise<RankingResponse> {
  const input = await loadActiveTopsisInput();
  const calculation = roundTopsisResult(calculateTopsis(input), 4);

  return {
    rankingRunId: `live-${Date.now()}`,
    createdAt: new Date().toISOString(),
    summary: {
      totalAlternatives: input.alternatives.length,
      totalCriteria: input.criteria.length,
      bestAlternative: calculation.results[0]?.alternativeName ?? null,
    },
    calculation,
  };
}

async function loadActiveTopsisInput() {
  const [criteriaRows, alternativeRows, assessmentRows] = await Promise.all([
    prisma.criterion.findMany({
      where: { deletedAt: null, isActive: true },
      orderBy: [{ order: "asc" }, { name: "asc" }],
    }),
    prisma.alternative.findMany({
      where: { deletedAt: null, isActive: true },
      orderBy: [{ createdAt: "desc" }, { name: "asc" }],
    }),
    prisma.assessment.findMany({
      where: {
        deletedAt: null,
        alternative: { deletedAt: null, isActive: true },
        criterion: { deletedAt: null, isActive: true },
      },
      select: {
        alternativeId: true,
        criterionId: true,
        score: true,
      },
    }),
  ]);

  if (criteriaRows.length === 0) {
    throw new Error("Belum ada kriteria aktif untuk perhitungan TOPSIS.");
  }

  if (alternativeRows.length === 0) {
    throw new Error("Belum ada alternatif aktif untuk perhitungan TOPSIS.");
  }

  const criteria: TopsisCriterion[] = criteriaRows.map((criterion) => ({
    id: criterion.id,
    code: criterion.code,
    name: criterion.name,
    weight: criterion.weight,
    attribute: criterion.attribute,
  }));

  const assessmentMap = new Map<string, Record<string, number>>();
  for (const assessment of assessmentRows) {
    const scores = assessmentMap.get(assessment.alternativeId) ?? {};
    scores[assessment.criterionId] = assessment.score;
    assessmentMap.set(assessment.alternativeId, scores);
  }

  const alternatives: TopsisAlternative[] = alternativeRows.map((alternative) => {
    const scores = assessmentMap.get(alternative.id) ?? {};

    for (const criterion of criteriaRows) {
      if (scores[criterion.id] === undefined) {
        throw new Error(
          `Alternatif ${alternative.name} belum memiliki penilaian untuk kriteria ${criterion.name}.`,
        );
      }
    }

    return {
      id: alternative.id,
      name: alternative.name,
      scores: Object.fromEntries(
        criteriaRows.map((criterion) => [criterion.id, scores[criterion.id]]),
      ),
    };
  });

  return {
    criteria,
    alternatives,
  };
}
