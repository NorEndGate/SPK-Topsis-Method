import { MatrixTable } from "@/components/topsis/matrix-table";
import { PageHeader } from "@/components/shared/page-header";
import { formatNumber } from "@/lib/utils";
import { calculateActiveDataRanking } from "@/server/services/topsis-service";

export default async function RankingDemoDetailPage() {
  const ranking = await calculateActiveDataRanking();
  const calculation = ranking.calculation;

  return (
    <>
      <PageHeader
        title="Detail Perhitungan TOPSIS"
        description="Transparansi matriks keputusan, normalisasi, bobot, solusi ideal, jarak, dan ranking."
      />
      <main className="space-y-6 p-6">
        <MatrixTable
          title="Matriks Keputusan"
          criteria={calculation.criteriaSnapshot}
          rows={calculation.matrixSnapshot}
        />
        <MatrixTable
          title="Matriks Normalisasi"
          criteria={calculation.criteriaSnapshot}
          rows={calculation.normalizedMatrix}
        />
        <MatrixTable
          title="Matriks Ternormalisasi Terbobot"
          criteria={calculation.criteriaSnapshot}
          rows={calculation.weightedMatrix}
        />

        <div className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-lg border bg-card p-4">
            <h2 className="font-semibold">Solusi Ideal Positif</h2>
            <dl className="mt-3 space-y-2 text-sm">
              {calculation.criteriaSnapshot.map((criterion) => (
                <div key={criterion.id} className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">{criterion.name}</dt>
                  <dd className="font-medium">{formatNumber(calculation.idealPositive[criterion.id])}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div className="rounded-lg border bg-card p-4">
            <h2 className="font-semibold">Solusi Ideal Negatif</h2>
            <dl className="mt-3 space-y-2 text-sm">
              {calculation.criteriaSnapshot.map((criterion) => (
                <div key={criterion.id} className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">{criterion.name}</dt>
                  <dd className="font-medium">{formatNumber(calculation.idealNegative[criterion.id])}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>

        <div className="overflow-hidden rounded-lg border bg-card">
          <div className="border-b px-4 py-3">
            <h2 className="font-semibold">Jarak dan Ranking Akhir</h2>
          </div>
          <table className="w-full min-w-[720px] text-sm">
            <thead className="bg-muted/70 text-left">
              <tr>
                <th className="px-4 py-3">Rank</th>
                <th className="px-4 py-3">Alternatif</th>
                <th className="px-4 py-3">D+</th>
                <th className="px-4 py-3">D-</th>
                <th className="px-4 py-3">Vi</th>
              </tr>
            </thead>
            <tbody>
              {calculation.results.map((item) => (
                <tr key={item.alternativeId} className="border-t">
                  <td className="px-4 py-3">#{item.rank}</td>
                  <td className="px-4 py-3 font-medium">{item.alternativeName}</td>
                  <td className="px-4 py-3">{formatNumber(item.dPositive)}</td>
                  <td className="px-4 py-3">{formatNumber(item.dNegative)}</td>
                  <td className="px-4 py-3 font-semibold text-emerald-700">{formatNumber(item.preference)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </>
  );
}
