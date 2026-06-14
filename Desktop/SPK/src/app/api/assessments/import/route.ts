import { NextResponse } from "next/server";
import * as XLSX from "xlsx";
import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth/auth";
import { assertPermission } from "@/lib/rbac/permissions";

export const runtime = "nodejs";

type SheetRow = Array<unknown>;

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    assertPermission(user.roles, "assessments:manage");

    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json(
        {
          error: {
            code: "FILE_REQUIRED",
            message: "File Excel wajib dilampirkan.",
          },
        },
        { status: 400 },
      );
    }

    const workbook = XLSX.read(await file.arrayBuffer(), { type: "array" });
    const sheetName = workbook.SheetNames[0];

    if (!sheetName) {
      return NextResponse.json(
        {
          error: {
            code: "SHEET_NOT_FOUND",
            message: "File Excel tidak memiliki worksheet.",
          },
        },
        { status: 400 },
      );
    }

    const worksheet = workbook.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json<SheetRow>(worksheet, {
      header: 1,
      blankrows: true,
      defval: "",
    }) as SheetRow[];

    const headerRow = rows[4] ?? [];
    const sourceCriteria = extractSourceCriteria(headerRow);

    if (sourceCriteria.length === 0) {
      return NextResponse.json(
        {
          error: {
            code: "TEMPLATE_INVALID",
            message: "Judul kriteria tidak ditemukan pada baris 5 file Excel.",
          },
        },
        { status: 400 },
      );
    }

    const existingCriteria = await prisma.criterion.findMany({
      where: { deletedAt: null },
      orderBy: [{ order: "asc" }, { name: "asc" }],
      select: { id: true, code: true, name: true, attribute: true, weight: true, order: true },
    });

    const criterionLookup = await synchronizeCriteriaFromWorkbook(sourceCriteria, existingCriteria);
    const activeCriteria = sourceCriteria.map((sourceCriterion) => criterionLookup.get(sourceCriterion.key));

    if (activeCriteria.some((criterion) => !criterion)) {
      return NextResponse.json(
        {
          error: {
            code: "CRITERIA_SYNC_FAILED",
            message: "Sebagian kriteria pada file Excel tidak bisa diselaraskan ke database.",
          },
        },
        { status: 400 },
      );
    }

    for (const [index, sourceCriterion] of sourceCriteria.entries()) {
      const criterion = activeCriteria[index]!;
      const headerValue = normalizeText(headerRow[index + 2]);
      const expectedValues = buildCriterionAliases(sourceCriterion.name, sourceCriterion.code);

      if (!headerValue) {
        return NextResponse.json(
          {
            error: {
              code: "TEMPLATE_INVALID",
              message: `Judul kriteria di baris 5 kolom ${columnLetter(index + 3)} tidak boleh kosong.`,
            },
          },
          { status: 400 },
        );
      }

      if (!expectedValues.includes(headerValue)) {
        return NextResponse.json(
          {
            error: {
              code: "TEMPLATE_INVALID",
              message: `Kolom ${columnLetter(index + 3)} harus berisi ${criterion.name} (${criterion.code}) pada baris 5.`,
            },
          },
          { status: 400 },
        );
      }
    }

    let importedAlternatives = 0;
    let importedAssessments = 0;

    await prisma.$transaction(async (tx) => {
      for (let rowIndex = 5; rowIndex < rows.length; rowIndex += 1) {
        const row = rows[rowIndex] ?? [];
        const alternativeName = normalizeText(row[1]);
        const rawCriterionValues = activeCriteria.map((criterion, criterionIndex) => ({
          criterion: criterion!,
          value: row[criterionIndex + 2],
        }));

        if (!alternativeName && rawCriterionValues.every(({ value }) => !looksNumeric(value))) {
          continue;
        }

        if (!alternativeName) {
          throw new Error(`Baris ${rowIndex + 1}: nama alternatif pada kolom B wajib diisi.`);
        }

        const scoredItems = rawCriterionValues.map(({ criterion, value }) => ({
          criterionId: criterion.id,
          score: parseDecimal(value, rowIndex + 1, criterion!.code),
        }));

        const alternativeSlug = slugify(alternativeName);
        const alternative = await tx.alternative.upsert({
          where: { slug: alternativeSlug },
          update: {
            name: alternativeName,
            isActive: true,
            deletedAt: null,
          },
          create: {
            name: alternativeName,
            slug: alternativeSlug,
            isActive: true,
            deletedAt: null,
          },
          select: { id: true },
        });

        for (const item of scoredItems) {
          await tx.assessment.upsert({
            where: {
              alternativeId_criterionId: {
                alternativeId: alternative.id,
                criterionId: item.criterionId,
              },
            },
            update: {
              score: item.score,
              note: null,
              deletedAt: null,
            },
            create: {
              alternativeId: alternative.id,
              criterionId: item.criterionId,
              score: item.score,
              note: null,
            },
          });
          importedAssessments += 1;
        }

        importedAlternatives += 1;
      }
    });

    return NextResponse.json({
      message: "Impor Excel berhasil.",
      sheetName,
      importedAlternatives,
      importedAssessments,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: {
          code: "EXCEL_IMPORT_FAILED",
          message: error instanceof Error ? error.message : "Gagal mengimpor file Excel.",
        },
      },
      { status: 400 },
    );
  }
}

function normalizeText(value: unknown) {
  return String(value ?? "").trim().toLowerCase();
}

function looksNumeric(value: unknown) {
  const normalized = String(value ?? "").trim().replace(",", ".");
  if (!normalized) {
    return false;
  }

  return Number.isFinite(Number(normalized));
}

function buildCriterionAliases(name: string, code: string) {
  const aliases = new Set<string>([code, name].map(normalizeText));
  const normalizedCode = normalizeText(code);
  const normalizedName = normalizeText(name);

  if (normalizedCode === "salt" || normalizedName === "garam" || normalizedName === "natrium") {
    aliases.add("garam");
    aliases.add("natrium");
  }

  return [...aliases];
}

type SourceCriterion = {
  key: string;
  code: string;
  name: string;
  order: number;
};

function extractSourceCriteria(headerRow: SheetRow) {
  return headerRow
    .slice(2)
    .map((value, index) => {
      const rawName = String(value ?? "").trim();

      if (!rawName) {
        return null;
      }

      const code = normalizeCode(rawName);
      return {
        key: normalizeText(rawName),
        code,
        name: rawName,
        order: index,
      } satisfies SourceCriterion;
    })
    .filter((criterion): criterion is SourceCriterion => criterion !== null);
}

async function synchronizeCriteriaFromWorkbook(
  sourceCriteria: SourceCriterion[],
  existingCriteria: Array<{ id: string; code: string; name: string; attribute: string; weight: number; order: number }>,
) {
  const lookup = new Map<string, { id: string; code: string; name: string }>();

  for (const criterion of existingCriteria) {
    const keyByCode = normalizeText(criterion.code);
    const keyByName = normalizeText(criterion.name);
    lookup.set(keyByCode, { id: criterion.id, code: criterion.code, name: criterion.name });
    lookup.set(keyByName, { id: criterion.id, code: criterion.code, name: criterion.name });
  }

  for (const sourceCriterion of sourceCriteria) {
    const existing = lookup.get(sourceCriterion.key);

    if (existing) {
      lookup.set(sourceCriterion.key, existing);
      continue;
    }

    const created = await prisma.criterion.upsert({
      where: { code: sourceCriterion.code },
      update: {
        name: sourceCriterion.name,
        isActive: true,
        deletedAt: null,
        weight: 1,
        attribute: "BENEFIT",
        order: sourceCriterion.order,
      },
      create: {
        code: sourceCriterion.code,
        name: sourceCriterion.name,
        weight: 1,
        attribute: "BENEFIT",
        order: sourceCriterion.order,
        isActive: true,
        deletedAt: null,
      },
    });

    const syncedCriterion = {
      id: created.id,
      code: created.code,
      name: created.name,
    };

    lookup.set(normalizeText(created.code), syncedCriterion);
    lookup.set(normalizeText(created.name), syncedCriterion);
    lookup.set(sourceCriterion.key, syncedCriterion);
  }

  return lookup;
}

function normalizeCode(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function parseDecimal(value: unknown, rowNumber: number, columnCode: string) {
  const normalized = String(value ?? "").trim();

  if (!normalized) {
    throw new Error(`Baris ${rowNumber}: nilai untuk kriteria ${columnCode} wajib diisi.`);
  }

  const numericValue = Number(normalized.replace(",", "."));

  if (!Number.isFinite(numericValue)) {
    throw new Error(`Baris ${rowNumber}: nilai untuk kriteria ${columnCode} harus berupa angka desimal.`);
  }

  return numericValue;
}

function slugify(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function columnLetter(index: number) {
  let value = index;
  let result = "";

  while (value > 0) {
    const remainder = (value - 1) % 26;
    result = String.fromCharCode(65 + remainder) + result;
    value = Math.floor((value - 1) / 26);
  }

  return result;
}