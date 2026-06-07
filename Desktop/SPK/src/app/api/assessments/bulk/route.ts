import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth/auth";
import { assertPermission } from "@/lib/rbac/permissions";
import { assessmentBulkSchema } from "@/lib/validations/assessment";

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    assertPermission(user.roles, "assessments:manage");
    const payload = assessmentBulkSchema.parse(await request.json());

    const alternative = await prisma.alternative.findFirst({
      where: { id: payload.alternativeId, deletedAt: null, isActive: true },
    });

    if (!alternative) {
      return NextResponse.json(
        {
          error: {
            code: "ALTERNATIVE_NOT_FOUND",
            message: "Alternatif tidak ditemukan atau tidak aktif.",
          },
        },
        { status: 404 },
      );
    }

    const activeCriteria = await prisma.criterion.findMany({
      where: { deletedAt: null, isActive: true },
      select: { id: true },
      orderBy: [{ order: "asc" }, { name: "asc" }],
    });

    const requiredCriterionIds = new Set(activeCriteria.map((criterion) => criterion.id));
    const submittedCriterionIds = new Set(payload.items.map((item) => item.criterionId));

    if (activeCriteria.length === 0) {
      return NextResponse.json(
        {
          error: {
            code: "CRITERIA_EMPTY",
            message: "Belum ada kriteria aktif untuk diisi.",
          },
        },
        { status: 400 },
      );
    }

    if (submittedCriterionIds.size !== requiredCriterionIds.size) {
      return NextResponse.json(
        {
          error: {
            code: "ASSESSMENT_INCOMPLETE",
            message: "Semua kriteria aktif harus diisi sebelum disimpan.",
          },
        },
        { status: 400 },
      );
    }

    for (const criterionId of requiredCriterionIds) {
      if (!submittedCriterionIds.has(criterionId)) {
        return NextResponse.json(
          {
            error: {
              code: "ASSESSMENT_INCOMPLETE",
              message: "Semua kriteria aktif harus diisi sebelum disimpan.",
            },
          },
          { status: 400 },
        );
      }
    }

    await prisma.$transaction(
      payload.items.map((item) =>
        prisma.assessment.upsert({
          where: {
            alternativeId_criterionId: {
              alternativeId: payload.alternativeId,
              criterionId: item.criterionId,
            },
          },
          update: {
            score: item.score,
            note: item.note ?? null,
            deletedAt: null,
          },
          create: {
            alternativeId: payload.alternativeId,
            criterionId: item.criterionId,
            score: item.score,
            note: item.note ?? null,
          },
        }),
      ),
    );

    return NextResponse.json({
      message: "Penilaian tersimpan",
      alternativeId: payload.alternativeId,
      updatedCount: payload.items.length,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: {
          code: "ASSESSMENT_SAVE_FAILED",
          message: error instanceof Error ? error.message : "Gagal menyimpan penilaian.",
        },
      },
      { status: 400 },
    );
  }
}
