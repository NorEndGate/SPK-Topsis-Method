import { FileDown } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";

export default function ReportsPage() {
  return (
    <>
      <PageHeader
        title="Laporan"
        description="Export hasil ranking dan detail perhitungan TOPSIS ke PDF atau Excel."
      />
      <main className="grid gap-4 p-6 md:grid-cols-2">
        <div className="rounded-lg border bg-card p-5">
          <FileDown className="h-6 w-6 text-emerald-600" />
          <h2 className="mt-4 font-semibold">Export PDF</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Laporan PDF akan memuat ranking, nilai D+, D-, Vi, dan ringkasan metode.
          </p>
          <button className="mt-5 rounded-md border px-4 py-2 text-sm hover:bg-muted">Download PDF</button>
        </div>
        <div className="rounded-lg border bg-card p-5">
          <FileDown className="h-6 w-6 text-sky-600" />
          <h2 className="mt-4 font-semibold">Export Excel</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Laporan Excel disiapkan untuk audit, validasi, dan pengolahan data lanjutan.
          </p>
          <button className="mt-5 rounded-md border px-4 py-2 text-sm hover:bg-muted">Download Excel</button>
        </div>
      </main>
    </>
  );
}
