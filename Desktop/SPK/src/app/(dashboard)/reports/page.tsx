import { PageHeader } from "@/components/shared/page-header";
import { prisma } from "@/lib/db/prisma";
import { ExcelImportManager } from "@/components/reports/excel-import-manager";

export default async function ReportsPage() {
  const criteria = await prisma.criterion.findMany({
    where: { deletedAt: null, isActive: true },
    orderBy: [{ order: "asc" }, { name: "asc" }],
  });

  return (
    <>
      <PageHeader
        title="Impor Excel"
        description="Unggah file Excel untuk memasukkan alternatif dan penilaian secara langsung."
      />
      <main className="p-6">
        <ExcelImportManager criteria={criteria} />
      </main>
    </>
  );
}
