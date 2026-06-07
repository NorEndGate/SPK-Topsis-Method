import { AssessmentManager } from "@/components/assessments/assessment-manager";
import { PageHeader } from "@/components/shared/page-header";
import { prisma } from "@/lib/db/prisma";

export default async function AssessmentsPage() {
  const [criteria, alternatives, assessments] = await Promise.all([
    prisma.criterion.findMany({
      where: { deletedAt: null, isActive: true },
      orderBy: [{ order: "asc" }, { name: "asc" }],
    }),
    prisma.alternative.findMany({
      where: { deletedAt: null, isActive: true },
      orderBy: [{ createdAt: "desc" }, { name: "asc" }],
    }),
    prisma.assessment.findMany({
      where: { deletedAt: null },
      select: { alternativeId: true, criterionId: true, score: true, note: true },
    }),
  ]);

  return (
    <>
      <PageHeader
        title="Input Penilaian"
        description="Input skor 1 sampai 5 untuk setiap alternatif terhadap seluruh kriteria aktif."
      />
      <main className="p-6">
        <AssessmentManager
          initialCriteria={criteria}
          initialAlternatives={alternatives}
          initialAssessments={assessments}
        />
      </main>
    </>
  );
}
