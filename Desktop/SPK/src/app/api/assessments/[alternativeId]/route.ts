import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth/auth";
import { assertPermission } from "@/lib/rbac/permissions";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ alternativeId: string }> },
) {
  try {
    const user = await getCurrentUser();
    assertPermission(user.roles, "assessments:manage");
    const { alternativeId } = await params;

    const result = await prisma.assessment.deleteMany({
      where: {
        alternativeId,
        deletedAt: null,
      },
    });

    return NextResponse.json({
      message: "Penilaian dihapus",
      alternativeId,
      deletedCount: result.count,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: {
          code: "ASSESSMENT_DELETE_FAILED",
          message: error instanceof Error ? error.message : "Gagal menghapus penilaian.",
        },
      },
      { status: 400 },
    );
  }
}
