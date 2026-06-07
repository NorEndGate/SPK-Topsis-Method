import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth/auth";
import { assertPermission } from "@/lib/rbac/permissions";
import { alternativeSchema } from "@/lib/validations/alternative";

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export async function GET() {
  const user = await getCurrentUser();
  assertPermission(user.roles, "alternatives:read");
  const data = await prisma.alternative.findMany({
    where: { deletedAt: null },
    orderBy: [{ createdAt: "desc" }, { name: "asc" }],
  });

  return NextResponse.json({
    data,
    meta: { page: 1, limit: data.length, total: data.length },
  });
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    assertPermission(user.roles, "alternatives:manage");
    const payload = alternativeSchema.parse(await request.json());
    const slug = slugify(payload.name);
    const existing = await prisma.alternative.findUnique({ where: { slug } });

    if (existing && !existing.deletedAt) {
      return NextResponse.json(
        {
          error: {
            code: "ALTERNATIVE_ALREADY_EXISTS",
            message: "Nama alternatif sudah digunakan.",
          },
        },
        { status: 409 },
      );
    }

    const alternative = existing
      ? await prisma.alternative.update({
          where: { slug },
          data: {
            name: payload.name,
            description: payload.description ?? null,
            imageUrl: payload.imageUrl ?? null,
            isDemo: payload.isDemo,
            isActive: payload.isActive,
            deletedAt: null,
          },
        })
      : await prisma.alternative.create({
          data: {
            name: payload.name,
            slug,
            description: payload.description ?? null,
            imageUrl: payload.imageUrl ?? null,
            isDemo: payload.isDemo,
            isActive: payload.isActive,
          },
        });

    return NextResponse.json(alternative, { status: 201 });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json(
        {
          error: {
            code: "ALTERNATIVE_ALREADY_EXISTS",
            message: "Nama alternatif sudah digunakan.",
          },
        },
        { status: 409 },
      );
    }

    return NextResponse.json(
      {
        error: {
          code: "ALTERNATIVE_CREATE_FAILED",
          message: error instanceof Error ? error.message : "Gagal menyimpan alternatif.",
        },
      },
      { status: 400 },
    );
  }
}
