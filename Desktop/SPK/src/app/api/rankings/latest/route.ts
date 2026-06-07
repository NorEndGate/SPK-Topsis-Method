import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/auth";
import { assertPermission } from "@/lib/rbac/permissions";
import { calculateActiveDataRanking } from "@/server/services/topsis-service";

export async function GET() {
  try {
    const user = await getCurrentUser();
    assertPermission(user.roles, "rankings:read");

    return NextResponse.json(await calculateActiveDataRanking());
  } catch (error) {
    return NextResponse.json(
      {
        error: {
          code: "RANKING_READ_FAILED",
          message: error instanceof Error ? error.message : "Gagal membaca ranking.",
        },
      },
      { status: 400 },
    );
  }
}
