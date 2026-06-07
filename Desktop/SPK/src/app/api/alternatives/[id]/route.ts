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
    assertPermission(user.roles, "alternatives:manage");

    const { id } = idParamSchema.parse(await params);
    const alternative = await prisma.alternative.findUnique({ where: { id } });

    if (!alternative || alternative.deletedAt) {
      return NextResponse.json(
        {
          error: {
            code: "ALTERNATIVE_NOT_FOUND",
            message: "Alternatif tidak ditemukan.",
          },
        },
        { status: 404 },
      );
    }

    await prisma.alternative.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        isActive: false,
      },
    });

    return NextResponse.json({ message: "Alternatif dihapus" });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return NextResponse.json(
        {
          error: {
            code: "ALTERNATIVE_NOT_FOUND",
            message: "Alternatif tidak ditemukan.",
          },
        },
        { status: 404 },
      );
    }

    return NextResponse.json(
      {
        error: {
          code: "ALTERNATIVE_DELETE_FAILED",
          message: error instanceof Error ? error.message : "Gagal menghapus alternatif.",
        },
      },
      { status: 400 },
    );
  }
}