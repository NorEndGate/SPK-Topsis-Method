import { demoAlternatives, demoCriteria } from "@/lib/topsis";

export function listDemoCriteria() {
  return demoCriteria.map((criterion, index) => ({
    ...criterion,
    order: index + 1,
    isActive: true,
  }));
}

export function listDemoAlternatives() {
  return demoAlternatives.map((alternative) => ({
    ...alternative,
    slug: alternative.id,
    description: "Seed demo sementara untuk validasi alur aplikasi.",
    imageUrl: null,
    isDemo: true,
    isActive: true,
  }));
}

export function listDemoAssessments() {
  return demoAlternatives.flatMap((alternative) =>
    Object.entries(alternative.scores).map(([criterionId, score]) => ({
      id: `${alternative.id}-${criterionId}`,
      alternativeId: alternative.id,
      criterionId,
      score,
      note: "Seed sementara Phase 6",
    })),
  );
}
