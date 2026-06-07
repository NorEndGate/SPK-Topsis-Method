import { NextResponse } from "next/server";
import { calculateActiveDataRanking } from "@/server/services/topsis-service";

export async function GET() {
  return NextResponse.json(await calculateActiveDataRanking());
}
