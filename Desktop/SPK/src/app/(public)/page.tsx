import Link from "next/link";
import { Activity, ArrowRight, Calculator, ShieldCheck } from "lucide-react";
import { calculateActiveDataRanking } from "@/server/services/topsis-service";
import type { TopsisResultItem } from "@/lib/topsis/types";
import NoDataToast from "@/components/shared/no-data-toast";
import { formatNumber } from "@/lib/utils";

export default async function LandingPage() {
  let ranking;
  let noDataMessage: string | null = null;
  try {
    ranking = await calculateActiveDataRanking();
  } catch (err: any) {
    noDataMessage = err?.message ?? "Belum ada data aktif untuk perhitungan TOPSIS.";
    ranking = { rankingRunId: "", createdAt: new Date().toISOString(), summary: { totalAlternatives: 0, totalCriteria: 0, bestAlternative: null }, calculation: { criteria: [], alternatives: [], results: [] } } as any;
  }

  return (
    <main className="min-h-screen bg-background">
      <section className="mx-auto grid min-h-screen max-w-6xl items-center gap-10 px-6 py-12 lg:grid-cols-[1.05fr_0.95fr]">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border bg-card px-3 py-1 text-sm text-muted-foreground">
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
            Decision support berbasis TOPSIS
          </div>
          <h1 className="mt-6 max-w-3xl text-4xl font-semibold tracking-normal md:text-6xl">
            SPK Menu Sehat Hipertensi
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-muted-foreground">
            Rekomendasi makanan berbasis perhitungan TOPSIS untuk membantu ahli gizi dan
            pengguna memilih menu yang lebih terukur, transparan, dan mudah divalidasi.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 rounded-md bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-emerald-700"
            >
              Masuk Aplikasi
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/rankings"
              className="inline-flex items-center gap-2 rounded-md border bg-card px-4 py-2.5 text-sm font-medium hover:bg-muted"
            >
              Lihat Ranking
            </Link>
          </div>
          <div className="mt-10 grid gap-3 sm:grid-cols-3">
            {[
              { icon: Activity, label: "5 Kriteria Gizi" },
              { icon: Calculator, label: "TOPSIS Transparan" },
              { icon: ShieldCheck, label: "RBAC dan Audit" },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.label} className="rounded-lg border bg-card p-4">
                  <Icon className="h-5 w-5 text-emerald-600" />
                  <p className="mt-3 text-sm font-medium">{item.label}</p>
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-lg border bg-card p-5 shadow-sm">
          <div className="mb-4">
            <p className="text-sm text-muted-foreground">Preview Ranking Aktif</p>
            <h2 className="text-xl font-semibold">Ranking Rekomendasi</h2>
          </div>
          <div className="space-y-3">
            {ranking.calculation.results.length === 0 ? (
              <div className="rounded-md border p-4">
                <p className="text-sm text-muted-foreground">Belum ada ranking aktif.</p>
                <p className="mt-2 text-sm">Silakan tambahkan kriteria dan alternatif lalu lakukan penilaian.</p>
              </div>
              ) : (
              ranking.calculation.results.map((item: TopsisResultItem) => (
                <div key={item.alternativeId} className="rounded-md border p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Rank #{item.rank}</p>
                      <p className="font-semibold">{item.alternativeName}</p>
                    </div>
                    <p className="text-2xl font-semibold text-emerald-600">
                      {formatNumber(item.preference)}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
        {noDataMessage ? <NoDataToast message={noDataMessage} /> : null}
      </section>
    </main>
  );
}
