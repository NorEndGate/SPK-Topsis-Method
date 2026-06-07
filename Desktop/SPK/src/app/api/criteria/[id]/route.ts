import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth/auth";
import { assertPermission } from "@/lib/rbac/permissions";
import { idParamSchema } from "@/lib/validations/common";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await getCurrentUser();
    assertPermission(user.roles, "criteria:manage");

    const { id } = idParamSchema.parse(await params);
    const criterion = await prisma.criterion.findUnique({ where: { id } });

    if (!criterion || criterion.deletedAt) {
      return NextResponse.json(
        {
          error: {
            code: "CRITERIA_NOT_FOUND",
            message: "Kriteria tidak ditemukan.",
          },
        },
        { status: 404 },
      );
    }

    await prisma.criterion.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        isActive: false,
      },
    });

    return NextResponse.json({ message: "Kriteria dihapus" });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return NextResponse.json(
        {
          error: {
            code: "CRITERIA_NOT_FOUND",
            message: "Kriteria tidak ditemukan.",
          },
        },
        { status: 404 },
      );
    }

    return NextResponse.json(
      {
        error: {
          code: "CRITERIA_DELETE_FAILED",
          message: error instanceof Error ? error.message : "Gagal menghapus kriteria.",
        },
      },
      { status: 400 },
    );
  }
}