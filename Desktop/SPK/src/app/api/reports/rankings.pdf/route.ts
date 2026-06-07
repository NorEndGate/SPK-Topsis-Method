import { NextResponse } from "next/server";
import { calculateDemoRanking } from "@/server/services/topsis-service";

export async function GET() {
  const ranking = await calculateDemoRanking();
  const lines = [
    "Laporan Ranking TOPSIS",
    `Ranking Run: ${ranking.rankingRunId}`,
    `Alternatif Terbaik: ${ranking.summary.bestAlternative}`,
    "",
    ...ranking.calculation.results.map(
      (item) =>
        `${item.rank}. ${item.alternativeName} - D+: ${item.dPositive}, D-: ${item.dNegative}, Vi: ${item.preference}`,
    ),
  ];

  return new NextResponse(lines.join("\n"), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Content-Disposition": "attachment; filename=ranking-topsis.txt",
    },
  });
}
