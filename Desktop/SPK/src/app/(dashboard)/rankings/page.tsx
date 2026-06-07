import Link from "next/link";
import { RankingChart } from "@/components/charts/ranking-chart";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { PageHeader } from "@/components/shared/page-header";
import { PreferenceBadge } from "@/components/shared/preference-badge";
import { formatNumber } from "@/lib/utils";
import { calculateActiveDataRanking } from "@/server/services/topsis-service";

export default async function RankingsPage() {
  try {
    const ranking = await calculateActiveDataRanking();

    return (
      <>
        <PageHeader
          title="Ranking Makanan"
          description="Hasil rekomendasi makanan berdasarkan nilai preferensi TOPSIS."
          action={
            <Link
              href="/rankings/demo"
              className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
            >
              Lihat Detail
            </Link>
          }
        />
        <main className="space-y-6 p-6">
          <RankingChart
            data={ranking.calculation.results.map((item) => ({
              alternativeName: item.alternativeName,
              preference: item.preference,
            }))}
          />
          <div className="overflow-hidden rounded-lg border bg-card">
            <table className="w-full min-w-[760px] text-sm">
              <thead className="bg-muted/70 text-left">
                <tr>
                  <th className="px-4 py-3">Rank</th>
                  <th className="px-4 py-3">Makanan</th>
                  <th className="px-4 py-3">D+</th>
                  <th className="px-4 py-3">D-</th>
                  <th className="px-4 py-3">Vi</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {ranking.calculation.results.map((item) => (
                  <tr key={item.alternativeId} className="border-t">
                    <td className="px-4 py-3">#{item.rank}</td>
                    <td className="px-4 py-3 font-medium">{item.alternativeName}</td>
                    <td className="px-4 py-3">{formatNumber(item.dPositive)}</td>
                    <td className="px-4 py-3">{formatNumber(item.dNegative)}</td>
                    <td className="px-4 py-3 font-semibold text-emerald-700">{formatNumber(item.preference)}</td>
                    <td className="px-4 py-3"><PreferenceBadge value={item.preference} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </main>
      </>
    );
  } catch (error) {
    return (
      <>
        <PageHeader title="Ranking Makanan" description="Hasil rekomendasi makanan berdasarkan nilai preferensi TOPSIS." />
        <main className="p-6">
          {error instanceof Error && error.message.includes("Belum ada") ? (
            <EmptyState
              title="Ranking belum bisa dihitung"
              description={error.message}
            />
          ) : (
            <ErrorState
              title="Ranking gagal dimuat"
              description={error instanceof Error ? error.message : "Coba cek data assessment dan kriteria."}
            />
          )}
        </main>
      </>
    );
  }
}
