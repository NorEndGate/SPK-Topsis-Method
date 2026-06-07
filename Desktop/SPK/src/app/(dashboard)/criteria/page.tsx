import { PageHeader } from "@/components/shared/page-header";
import { prisma } from "@/lib/db/prisma";
import { CriteriaManager } from "@/components/criteria/criteria-manager";

export default async function CriteriaPage() {
  const criteria = await prisma.criterion.findMany({
    where: { deletedAt: null },
    orderBy: [{ order: "asc" }, { name: "asc" }],
  });

  return (
    <>
      <PageHeader
        title="Manajemen Kriteria"
        description="Kelola kriteria, bobot, atribut, dan status aktif untuk perhitungan TOPSIS."
      />
      <main className="p-6">
        <CriteriaManager initialCriteria={criteria} />
      </main>
    </>
  );
}
