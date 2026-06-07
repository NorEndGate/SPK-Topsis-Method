import { TopsisCalculationResult } from "@/lib/topsis";

export function buildRankingCsv(result: TopsisCalculationResult) {
  const header = ["Rank", "Alternatif", "D+", "D-", "Vi"];
  const rows = result.results.map((item) => [
    item.rank,
    item.alternativeName,
    item.dPositive,
    item.dNegative,
    item.preference,
  ]);

  return [header, ...rows].map((row) => row.join(",")).join("\n");
}
