import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth/auth";
import { assertPermission } from "@/lib/rbac/permissions";

export async function GET() {
  const user = await getCurrentUser();
  assertPermission(user.roles, "assessments:read");
  const data = await prisma.assessment.findMany({
    where: {
      deletedAt: null,
      alternative: { deletedAt: null },
      criterion: { deletedAt: null },
    },
    include: {
      alternative: { select: { id: true, name: true, slug: true } },
      criterion: { select: { id: true, name: true, code: true } },
    },
    orderBy: [{ alternative: { name: "asc" } }, { criterion: { order: "asc" } }],
  });

  return NextResponse.json({
    data,
    meta: { page: 1, limit: data.length, total: data.length },
  });
}
