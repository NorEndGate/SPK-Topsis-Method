import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth/auth";
import { assertPermission } from "@/lib/rbac/permissions";
import { criterionSchema } from "@/lib/validations/criteria";

export async function GET() {
  const user = await getCurrentUser();
  assertPermission(user.roles, "criteria:read");
  const data = await prisma.criterion.findMany({
    where: { deletedAt: null },
    orderBy: [{ order: "asc" }, { name: "asc" }],
  });

  return NextResponse.json({
    data,
    meta: { page: 1, limit: data.length, total: data.length },
  });
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    assertPermission(user.roles, "criteria:manage");
    const payload = criterionSchema.parse(await request.json());
    const code = payload.code.trim().toUpperCase();
    const existing = await prisma.criterion.findUnique({ where: { code } });

    if (existing && !existing.deletedAt) {
      return NextResponse.json(
        {
          error: {
            code: "CRITERIA_ALREADY_EXISTS",
            message: "Kode kriteria sudah digunakan.",
          },
        },
        { status: 409 },
      );
    }

    const criterion = existing
      ? await prisma.criterion.update({
          where: { code },
          data: {
            name: payload.name,
            description: payload.description ?? null,
            weight: payload.weight,
            attribute: payload.attribute,
            order: payload.order,
            isActive: payload.isActive,
            deletedAt: null,
          },
        })
      : await prisma.criterion.create({
          data: {
            code,
            name: payload.name,
            description: payload.description ?? null,
            weight: payload.weight,
            attribute: payload.attribute,
            order: payload.order,
            isActive: payload.isActive,
          },
        });

    return NextResponse.json(criterion, { status: 201 });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json(
        {
          error: {
            code: "CRITERIA_ALREADY_EXISTS",
            message: "Kode kriteria sudah digunakan.",
          },
        },
        { status: 409 },
      );
    }

    return NextResponse.json(
      {
        error: {
          code: "CRITERIA_CREATE_FAILED",
          message: error instanceof Error ? error.message : "Gagal menyimpan kriteria.",
        },
      },
      { status: 400 },
    );
  }
}
