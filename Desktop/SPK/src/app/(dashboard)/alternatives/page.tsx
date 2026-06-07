import { PageHeader } from "@/components/shared/page-header";
import { prisma } from "@/lib/db/prisma";
import { AlternativesManager } from "@/components/alternatives/alternatives-manager";

export default async function AlternativesPage() {
  const alternatives = await prisma.alternative.findMany({
    where: { deletedAt: null },
    orderBy: [{ createdAt: "desc" }, { name: "asc" }],
  });

  return (
    <>
      <PageHeader
        title="Alternatif Makanan"
        description="Kelola daftar menu makanan dan status kelengkapan assessment."
      />
      <main className="p-6">
        <AlternativesManager initialAlternatives={alternatives} />
      </main>
    </>
  );
}
