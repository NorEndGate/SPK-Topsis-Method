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
    const kriteriaSheetName = workbook.SheetNames.find((n) => String(n).toLowerCase().includes("kriteria")) ?? null;

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

    // parse conversion rules (if present) from the 'kriteria & sub' sheet
    const conversionMap = new Map<string, { weight?: number; buckets: Array<{ min?: number; max?: number; greater?: number; rank: number }> }>();
    if (kriteriaSheetName) {
      try {
        const ks = workbook.Sheets[kriteriaSheetName];
        const krows = XLSX.utils.sheet_to_json<SheetRow>(ks, { header: 1, defval: "" }) as SheetRow[];

        // header row with criterion names is around row index 3 in the workbook
        const nameRow = krows[3] ?? [];
        const pctRow = krows[5] ?? [];
        // ranges start at row index 7..11
        const rangeStart = 7;
        const rangeEnd = 11;

        for (let col = 0; col < nameRow.length; col += 2) {
          const rawName = String(nameRow[col] ?? "").trim();
          if (!rawName) continue;
          const key = normalizeText(rawName);
          // parse percentage weight if present (e.g. 'W=10%')
          let weight: number | undefined;
          try {
            const pctCell = String(pctRow[col] ?? "").trim();
            const m = pctCell.match(/(\d+)%?/);
            if (m) weight = Number(m[1]);
          } catch (e) {
            weight = undefined;
          }

          const buckets: Array<{ min?: number; max?: number; greater?: number; rank: number }> = [];
          for (let r = rangeStart; r <= rangeEnd; r++) {
            const rangeCell = String((krows[r] ?? [])[col] ?? "").trim();
            const rankCell = (krows[r] ?? [])[col + 1];
            if (!rangeCell) continue;
            const rank = Number(rankCell);
            if (!Number.isFinite(rank)) continue;

            // parse patterns: 'a-b', 'a - b', '>500', '0-1'
            const gt = rangeCell.match(/^>\s*(\d+(?:\.?\d+)?)$/);
            const dash = rangeCell.match(/^(\d+(?:\.?\d+)?)\s*-\s*(\d+(?:\.?\d+)?)$/);

            if (gt) {
              buckets.push({ greater: Number(gt[1]), rank });
            } else if (dash) {
              buckets.push({ min: Number(dash[1]), max: Number(dash[2]), rank });
            } else {
              // fallback: try numeric exact
              const num = Number(rangeCell);
              if (Number.isFinite(num)) buckets.push({ min: num, max: num, rank });
            }
          }

          conversionMap.set(key, { weight, buckets });
        }
      } catch (e) {
        // ignore conversion parse errors; importer will still try numeric import
      }
    }

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

    const criterionLookup = await synchronizeCriteriaFromWorkbook(sourceCriteria, existingCriteria, conversionMap);
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
          sourceKey: sourceCriteria[criterionIndex]?.key,
        }));

        if (!alternativeName && rawCriterionValues.every(({ value }) => !looksNumeric(value))) {
          continue;
        }

        if (!alternativeName) {
          throw new Error(`Baris ${rowIndex + 1}: nama alternatif pada kolom B wajib diisi.`);
        }

        const scoredItems = rawCriterionValues.map(({ criterion, value, sourceKey }) => {
          const numeric = parseDecimal(value, rowIndex + 1, criterion!.code);
          const convertedScore = convertWorkbookScore(criterion.name, numeric, conversionMap.get(sourceKey ?? ""));
          return { criterionId: criterion.id, score: convertedScore };
        });

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
  conversionMap?: Map<string, { weight?: number; buckets: Array<{ min?: number; max?: number; greater?: number; rank: number }> }>,
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
    const conv = conversionMap?.get(sourceCriterion.key);
    const weight = conv?.weight ?? 1;

    if (existing) {
      await prisma.criterion.update({
        where: { id: existing.id },
        data: {
          name: sourceCriterion.name,
          code: sourceCriterion.code,
          isActive: true,
          deletedAt: null,
          weight,
          attribute: "BENEFIT",
          order: sourceCriterion.order,
        },
      });

      const updated = {
        id: existing.id,
        code: sourceCriterion.code,
        name: sourceCriterion.name,
      };

      lookup.set(normalizeText(sourceCriterion.code), updated);
      lookup.set(normalizeText(sourceCriterion.name), updated);
      lookup.set(sourceCriterion.key, updated);
      continue;
    }

    const created = await prisma.criterion.upsert({
      where: { code: sourceCriterion.code },
      update: {
        name: sourceCriterion.name,
        isActive: true,
        deletedAt: null,
        weight: weight,
        attribute: "BENEFIT",
        order: sourceCriterion.order,
      },
      create: {
        code: sourceCriterion.code,
        name: sourceCriterion.name,
        weight: weight,
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

function convertWorkbookScore(
  criterionName: string,
  numericValue: number,
  conversion?: { weight?: number; buckets: Array<{ min?: number; max?: number; greater?: number; rank: number }> },
) {
  const normalizedName = normalizeText(criterionName);

  if (normalizedName === "protein" || normalizedName === "lemak" || normalizedName === "karbohidrat") {
    if (numericValue <= 1) return 1;
    if (numericValue <= 25) return 2;
    if (numericValue <= 50) return 3;
    if (numericValue <= 75) return 4;
    return 5;
  }

  if (normalizedName === "serat") {
    if (numericValue <= 1) return 1;
    if (numericValue <= 3) return 2;
    if (numericValue <= 5) return 3;
    if (numericValue <= 7) return 4;
    return 5;
  }

  if (normalizedName === "natrium" || normalizedName === "salt" || normalizedName === "garam") {
    if (numericValue > 500) return 1;
    if (numericValue > 350) return 2;
    if (numericValue > 200) return 3;
    if (numericValue > 100) return 4;
    return 5;
  }

  if (conversion?.buckets?.length) {
    for (const bucket of conversion.buckets) {
      if (bucket.greater !== undefined && numericValue > bucket.greater) {
        return bucket.rank;
      }
      if (bucket.min !== undefined && bucket.max !== undefined && numericValue >= bucket.min && numericValue <= bucket.max) {
        return bucket.rank;
      }
    }
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