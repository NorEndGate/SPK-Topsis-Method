import { NextResponse } from "next/server";
import { buildRankingCsv } from "@/lib/export/report";
import { calculateDemoRanking } from "@/server/services/topsis-service";

export async function GET() {
  const ranking = await calculateDemoRanking();
  const csv = buildRankingCsv(ranking.calculation);

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": "attachment; filename=ranking-topsis.csv",
    },
  });
}
