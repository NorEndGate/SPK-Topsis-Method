"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { EmptyState } from "@/components/shared/empty-state";

type CriterionRecord = {
  id: string;
  code: string;
  name: string;
  weight: number;
  attribute: "BENEFIT" | "COST";
  order: number;
};

type AlternativeRecord = {
  id: string;
  name: string;
  slug: string;
};

type AssessmentRecord = {
  alternativeId: string;
  criterionId: string;
  score: number;
  note: string | null;
};

type CriterionFormState = {
  score: string;
  note: string;
};

type AssessmentMap = Record<string, Record<string, CriterionFormState>>;

type AssessmentManagerProps = {
  initialCriteria: CriterionRecord[];
  initialAlternatives: AlternativeRecord[];
  initialAssessments: AssessmentRecord[];
};

export function AssessmentManager({
  initialCriteria,
  initialAlternatives,
  initialAssessments,
}: AssessmentManagerProps) {
  const router = useRouter();
  const criteria = initialCriteria;
  const alternatives = initialAlternatives;
  const [assessmentMap, setAssessmentMap] = useState<AssessmentMap>(() => buildAssessmentMap(initialAssessments));
  const [selectedAlternativeId, setSelectedAlternativeId] = useState(initialAlternatives[0]?.id ?? "");
  const [formState, setFormState] = useState<Record<string, CriterionFormState>>(
    buildFormState(criteria, assessmentMap, initialAlternatives[0]?.id ?? ""),
  );
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const selectedAlternative = useMemo(
    () => alternatives.find((alternative) => alternative.id === selectedAlternativeId) ?? null,
    [alternatives, selectedAlternativeId],
  );

  const completionStats = useMemo(
    () =>
      alternatives.map((alternative) => {
        const scores = assessmentMap[alternative.id] ?? {};
        const filledCount = criteria.filter((criterion) => scores[criterion.id] !== undefined).length;

        return {
          ...alternative,
          filledCount,
          isComplete: filledCount === criteria.length,
        };
      }),
    [alternatives, assessmentMap, criteria],
  );

  function selectAlternative(alternativeId: string) {
    setSelectedAlternativeId(alternativeId);
    setFormState(buildFormState(criteria, assessmentMap, alternativeId));
    setMessage(null);
    setError(null);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedAlternativeId) {
      setError("Pilih alternatif terlebih dahulu.");
      return;
    }

    setIsSubmitting(true);
    setMessage(null);
    setError(null);

    const response = await fetch("/api/assessments/bulk", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        alternativeId: selectedAlternativeId,
        items: criteria.map((criterion) => ({
          criterionId: criterion.id,
          score: Number(formState[criterion.id]?.score ?? 0),
          note: formState[criterion.id]?.note.trim() || undefined,
        })),
      }),
    });

    const payload = await response.json();

    if (!response.ok) {
      setError(payload?.error?.message ?? "Gagal menyimpan penilaian.");
      setIsSubmitting(false);
      return;
    }

    const nextMap: AssessmentMap = {
      ...assessmentMap,
      [selectedAlternativeId]: Object.fromEntries(
        criteria.map((criterion) => [
          criterion.id,
          {
            score: formState[criterion.id]?.score ?? "1",
            note: formState[criterion.id]?.note ?? "",
          },
        ]),
      ) as Record<string, CriterionFormState>,
    };

    setAssessmentMap(nextMap);
    setMessage("Penilaian tersimpan.");
    router.refresh();
    setIsSubmitting(false);
  }

  async function handleReset() {
    if (!selectedAlternativeId || !confirm("Hapus seluruh penilaian untuk alternatif ini?")) {
      return;
    }

    setIsResetting(true);
    setMessage(null);
    setError(null);

    const response = await fetch(`/api/assessments/${selectedAlternativeId}`, {
      method: "DELETE",
    });

    const payload = await response.json();

    if (!response.ok) {
      setError(payload?.error?.message ?? "Gagal menghapus penilaian.");
      setIsResetting(false);
      return;
    }

    const nextMap: AssessmentMap = { ...assessmentMap };
    delete nextMap[selectedAlternativeId];
    setAssessmentMap(nextMap);
    setFormState(buildFormState(criteria, nextMap, selectedAlternativeId));
    setMessage("Penilaian dihapus.");
    router.refresh();
    setIsResetting(false);
  }

  if (alternatives.length === 0) {
    return (
      <EmptyState
        title="Belum ada alternatif aktif"
        description="Tambahkan alternatif dulu sebelum mengisi assessment."
      />
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
      <aside className="rounded-lg border bg-card p-4 shadow-sm">
        <h2 className="font-semibold">Alternatif</h2>
        <div className="mt-4 space-y-2">
          {completionStats.map((alternative) => (
            <button
              key={alternative.id}
              type="button"
              onClick={() => selectAlternative(alternative.id)}
              className={
                alternative.id === selectedAlternativeId
                  ? "w-full rounded-md border border-emerald-300 bg-emerald-50 px-3 py-2 text-left text-sm"
                  : "w-full rounded-md border px-3 py-2 text-left text-sm hover:bg-muted"
              }
            >
              <div className="flex items-center justify-between gap-3">
                <span className="font-medium">{alternative.name}</span>
                <span
                  className={
                    alternative.isComplete
                      ? "rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-medium text-emerald-800"
                      : "rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-medium text-amber-800"
                  }
                >
                  {alternative.filledCount}/{criteria.length}
                </span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                {alternative.isComplete ? "Lengkap" : "Belum lengkap"}
              </p>
            </button>
          ))}
        </div>
      </aside>

      <section className="rounded-lg border bg-card p-5 shadow-sm">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-xl font-semibold">{selectedAlternative?.name ?? "Pilih alternatif"}</h2>
            <p className="text-sm text-muted-foreground">
              Isi skor desimal bebas untuk setiap kriteria aktif.
            </p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => void handleReset()}
              disabled={isResetting}
              className="rounded-md border border-rose-200 px-4 py-2 text-sm font-medium text-rose-700 disabled:opacity-60"
            >
              {isResetting ? "Menghapus..." : "Hapus Penilaian"}
            </button>
            <button
              form="assessment-form"
              type="submit"
              disabled={isSubmitting}
              className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
            >
              {isSubmitting ? "Menyimpan..." : "Simpan Penilaian"}
            </button>
          </div>
        </div>

        {message ? <p className="mt-4 text-sm text-emerald-700">{message}</p> : null}
        {error ? <p className="mt-4 text-sm text-rose-700">{error}</p> : null}

        <form id="assessment-form" onSubmit={handleSubmit} className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {criteria.map((criterion) => {
            const currentValue = formState[criterion.id] ?? { score: "1", note: "" };

            return (
              <label key={criterion.id} className="rounded-lg border bg-background p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-sm font-semibold">{criterion.name}</span>
                    <p className="mt-1 text-xs text-muted-foreground">{criterion.code}</p>
                  </div>
                  <span className="rounded-full bg-muted px-2 py-1 text-[11px] font-medium uppercase tracking-wide">
                    {criterion.attribute}
                  </span>
                </div>
                <input
                  type="number"
                  step="any"
                  value={currentValue.score}
                  onChange={(event) =>
                    setFormState((current) => ({
                      ...current,
                      [criterion.id]: {
                        ...(current[criterion.id] ?? { score: "1", note: "" }),
                        score: event.target.value,
                      },
                    }))
                  }
                  className="mt-3 w-full rounded-md border bg-card px-3 py-2"
                  required
                />
                <textarea
                  value={currentValue.note}
                  onChange={(event) =>
                    setFormState((current) => ({
                      ...current,
                      [criterion.id]: {
                        ...(current[criterion.id] ?? { score: "1", note: "" }),
                        note: event.target.value,
                      },
                    }))
                  }
                  className="mt-3 min-h-20 w-full rounded-md border bg-card px-3 py-2 text-sm"
                  placeholder="Catatan opsional"
                />
                <span className="mt-2 block text-xs text-muted-foreground">
                  Bobot {criterion.weight} - urutan {criterion.order}
                </span>
              </label>
            );
          })}
        </form>
      </section>
    </div>
  );
}

function buildAssessmentMap(initialAssessments: AssessmentRecord[]) {
  return initialAssessments.reduce<AssessmentMap>(
    (accumulator, assessment) => {
      const altAssessments = accumulator[assessment.alternativeId] ?? {};
      altAssessments[assessment.criterionId] = {
        score: String(assessment.score),
        note: assessment.note ?? "",
      };
      accumulator[assessment.alternativeId] = altAssessments;
      return accumulator;
    },
    {},
  );
}

function buildFormState(
  criteria: CriterionRecord[],
  assessmentMap: AssessmentMap,
  alternativeId: string,
) {
  const currentAssessments = assessmentMap[alternativeId] ?? {};

  return Object.fromEntries(
    criteria.map((criterion) => [
      criterion.id,
      {
        score: currentAssessments[criterion.id]?.score ?? "1",
        note: currentAssessments[criterion.id]?.note ?? "",
      },
    ]),
  ) as Record<string, CriterionFormState>;
}