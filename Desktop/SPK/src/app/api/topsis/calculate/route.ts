import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/auth";
import { assertPermission } from "@/lib/rbac/permissions";
import { topsisCalculateSchema } from "@/lib/validations/topsis";
import { calculateActiveDataRanking, calculateDemoRanking } from "@/server/services/topsis-service";

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    assertPermission(user.roles, "topsis:calculate");

    const payload = topsisCalculateSchema.parse(await request.json().catch(() => ({})));
    const response =
      payload.mode === "ACTIVE_DATA"
        ? await calculateActiveDataRanking()
        : await calculateDemoRanking();

    return NextResponse.json({
      status: "SUCCESS",
      ...response,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: {
          code: "TOPSIS_CALCULATION_FAILED",
          message: error instanceof Error ? error.message : "Perhitungan TOPSIS gagal.",
        },
      },
      { status: 400 },
    );
  }
}
