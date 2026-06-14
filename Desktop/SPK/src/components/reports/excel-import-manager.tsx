"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { FileSpreadsheet, Upload, CheckCircle2 } from "lucide-react";

type CriterionRecord = {
  id: string;
  code: string;
  name: string;
  weight: number;
  attribute: "BENEFIT" | "COST";
  order: number;
};

type ImportSummary = {
  importedAlternatives: number;
  importedAssessments: number;
  sheetName: string;
};

type ExcelImportManagerProps = {
  criteria: CriterionRecord[];
};

export function ExcelImportManager({ criteria }: ExcelImportManagerProps) {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<ImportSummary | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!file) {
      setError("Pilih file Excel terlebih dahulu.");
      return;
    }

    setIsSubmitting(true);
    setMessage(null);
    setError(null);
    setSummary(null);

    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch("/api/assessments/import", {
      method: "POST",
      body: formData,
    });

    const payload = await response.json();

    if (!response.ok) {
      setError(payload?.error?.message ?? "Gagal mengimpor file Excel.");
      setIsSubmitting(false);
      return;
    }

    setSummary({
      importedAlternatives: payload.importedAlternatives ?? 0,
      importedAssessments: payload.importedAssessments ?? 0,
      sheetName: payload.sheetName ?? "Sheet1",
    });
    setMessage("Impor Excel berhasil.");
    setFile(null);
    router.refresh();
    setIsSubmitting(false);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
      <section className="rounded-lg border bg-card p-5 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="rounded-lg bg-emerald-50 p-3 text-emerald-700">
            <FileSpreadsheet className="h-5 w-5" />
          </div>
          <div>
            <h2 className="font-semibold">Format Excel</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              File sumber di docs/spk_topsis_k.xlsx bisa langsung dipakai. Baris 5 berisi judul kriteria, baris 6 berisi satuan dan diabaikan, kolom B untuk nama alternatif, lalu kolom C dan seterusnya untuk skor.
            </p>
          </div>
        </div>

        <div className="mt-5 rounded-lg border bg-background p-4">
          <p className="text-sm font-medium">Struktur yang dibaca</p>
          <div className="mt-3 space-y-2 text-sm text-muted-foreground">
            <p>Baris 5: judul kolom kriteria.</p>
            <p>Baris 6: satuan kriteria, tidak dihitung sebagai data.</p>
            <p>Kolom B: nama alternatif.</p>
            <p>Kolom C dst: nilai penilaian desimal.</p>
          </div>
        </div>

        <div className="mt-5">
          <p className="text-sm font-medium">Kriteria aktif</p>
          <div className="mt-3 space-y-2">
            {criteria.map((criterion, index) => (
              <div key={criterion.id} className="rounded-md border bg-background px-3 py-2 text-sm">
                <span className="font-medium">{columnLetter(index + 2)}</span> - {criterion.name} ({criterion.code})
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="rounded-lg border bg-card p-5 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold">Unggah File</h2>
              <p className="text-sm text-muted-foreground">
                File akan langsung diimpor dan memperbarui alternatif serta nilai penilaiannya.
              </p>
            </div>
            <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Import
            </span>
          </div>

          <label className="block rounded-lg border border-dashed bg-background p-6 text-sm">
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={(event) => setFile(event.target.files?.[0] ?? null)}
              className="block w-full text-sm file:mr-4 file:rounded-md file:border-0 file:bg-emerald-600 file:px-4 file:py-2 file:text-white"
            />
            <p className="mt-3 text-xs text-muted-foreground">
              Upload file Excel yang mengikuti format template dengan judul kriteria di baris 5.
            </p>
          </label>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="submit"
              disabled={isSubmitting || !file}
              className="inline-flex items-center gap-2 rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
            >
              <Upload className="h-4 w-4" />
              {isSubmitting ? "Mengimpor..." : "Impor Excel"}
            </button>
            {file ? <span className="text-sm text-muted-foreground">{file.name}</span> : null}
          </div>

          {message ? (
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
              <div className="flex items-center gap-2 font-medium">
                <CheckCircle2 className="h-4 w-4" />
                {message}
              </div>
              {summary ? (
                <p className="mt-2 text-emerald-700">
                  {summary.importedAlternatives} alternatif dan {summary.importedAssessments} penilaian diimpor dari
                  {" "}
                  {summary.sheetName}.
                </p>
              ) : null}
            </div>
          ) : null}

          {error ? <p className="text-sm text-rose-700">{error}</p> : null}
        </form>
      </section>
    </div>
  );
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