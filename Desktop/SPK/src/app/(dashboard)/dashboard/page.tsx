import Link from "next/link";
import { Calculator, ClipboardCheck, Trophy, Utensils } from "lucide-react";
import { RankingChart } from "@/components/charts/ranking-chart";
import { PageHeader } from "@/components/shared/page-header";
import { PreferenceBadge } from "@/components/shared/preference-badge";
import { StatCard } from "@/components/shared/stat-card";
import { formatNumber } from "@/lib/utils";
import { calculateActiveDataRanking } from "@/server/services/topsis-service";
import type { TopsisResultItem } from "@/lib/topsis/types";
import NoDataToast from "@/components/shared/no-data-toast";

export default async function DashboardPage() {
  let ranking;
  let isLive = false;
  let noDataMessage: string | null = null;
  try {
    ranking = await calculateActiveDataRanking();
    isLive = true;
  } catch (err: any) {
    noDataMessage = err?.message ?? "Belum ada data aktif untuk perhitungan TOPSIS.";
    ranking = { rankingRunId: "", createdAt: new Date().toISOString(), summary: { totalAlternatives: 0, totalCriteria: 0, bestAlternative: null }, calculation: { criteria: [], alternatives: [], results: [] } } as any;
    isLive = false;
  }

  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Ringkasan data demo, hasil ranking, dan status perhitungan TOPSIS."
        action={
          <Link
            href="/rankings/demo"
            className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
          >
            Detail Perhitungan
          </Link>
        }
      />
      <main className="space-y-6 p-6">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard title="Alternatif" value={ranking.summary.totalAlternatives} icon={<Utensils className="h-5 w-5" />} />
          <StatCard title="Kriteria" value={ranking.summary.totalCriteria} icon={<ClipboardCheck className="h-5 w-5" />} />
          <StatCard title="Terbaik" value={ranking.summary.bestAlternative ?? "-"} icon={<Trophy className="h-5 w-5" />} />
          <StatCard
            title="Mode"
            value={isLive ? "Live" : "Demo"}
            description={isLive ? "Menggunakan data aktif dari database." : "Seed sementara sampai data jurnal lengkap tersedia."}
            icon={<Calculator className="h-5 w-5" />}
          />
        </div>

        <RankingChart
          data={ranking.calculation.results.map((item: TopsisResultItem) => ({
            alternativeName: item.alternativeName,
            preference: item.preference,
          }))}
        />

        <div className="overflow-hidden rounded-lg border bg-card">
          {noDataMessage ? <NoDataToast message={noDataMessage} /> : null}
          <div className="border-b px-4 py-3">
            <h2 className="font-semibold">Top Ranking</h2>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-muted/70 text-left">
              <tr>
                <th className="px-4 py-3">Rank</th>
                <th className="px-4 py-3">Alternatif</th>
                <th className="px-4 py-3">Vi</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {ranking.calculation.results.map((item: TopsisResultItem) => (
                <tr key={item.alternativeId} className="border-t">
                  <td className="px-4 py-3">#{item.rank}</td>
                  <td className="px-4 py-3 font-medium">{item.alternativeName}</td>
                  <td className="px-4 py-3">{formatNumber(item.preference)}</td>
                  <td className="px-4 py-3"><PreferenceBadge value={item.preference} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </>
  );
}
