"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { EmptyState } from "@/components/shared/empty-state";

type CriterionRecord = {
  id: string;
  code: string;
  name: string;
  description: string | null;
  weight: number;
  attribute: "BENEFIT" | "COST";
  order: number;
  isActive: boolean;
};

type CriteriaManagerProps = {
  initialCriteria: CriterionRecord[];
};

type CriteriaFormState = {
  code: string;
  name: string;
  description: string;
  weight: string;
  attribute: "BENEFIT" | "COST";
  order: string;
  isActive: boolean;
};

const emptyForm: CriteriaFormState = {
  code: "",
  name: "",
  description: "",
  weight: "1",
  attribute: "BENEFIT" as const,
  order: "0",
  isActive: true,
};

export function CriteriaManager({ initialCriteria }: CriteriaManagerProps) {
  const router = useRouter();
  const [criteria, setCriteria] = useState(initialCriteria);
  const [form, setForm] = useState<CriteriaFormState>(emptyForm);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const hasCriteria = useMemo(() => criteria.length > 0, [criteria.length]);

  async function refreshCriteria() {
    const response = await fetch("/api/criteria", { cache: "no-store" });
    const payload = await response.json();
    setCriteria(payload.data ?? []);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setMessage(null);
    setError(null);

    const response = await fetch("/api/criteria", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        code: form.code,
        name: form.name,
        description: form.description.trim() || undefined,
        weight: Number(form.weight),
        attribute: form.attribute,
        order: Number(form.order),
        isActive: form.isActive,
      }),
    });

    const payload = await response.json();

    if (!response.ok) {
      setError(payload?.error?.message ?? "Gagal menyimpan kriteria.");
      setIsSubmitting(false);
      return;
    }

    setForm(emptyForm);
    setMessage("Kriteria berhasil disimpan.");
    await refreshCriteria();
    router.refresh();
    setIsSubmitting(false);
  }

  async function handleDelete(id: string) {
    if (!confirm("Hapus kriteria ini?")) {
      return;
    }

    setPendingId(id);
    setMessage(null);
    setError(null);

    const response = await fetch(`/api/criteria/${id}`, { method: "DELETE" });
    const payload = await response.json();

    if (!response.ok) {
      setError(payload?.error?.message ?? "Gagal menghapus kriteria.");
      setPendingId(null);
      return;
    }

    setMessage("Kriteria dihapus.");
    await refreshCriteria();
    router.refresh();
    setPendingId(null);
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="rounded-lg border bg-card p-5 shadow-sm">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <label className="space-y-2 text-sm">
            <span className="font-medium">Kode</span>
            <input
              value={form.code}
              onChange={(event) => setForm((current) => ({ ...current, code: event.target.value }))}
              className="w-full rounded-md border bg-background px-3 py-2"
              placeholder="SALT"
              required
            />
          </label>
          <label className="space-y-2 text-sm">
            <span className="font-medium">Nama</span>
            <input
              value={form.name}
              onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
              className="w-full rounded-md border bg-background px-3 py-2"
              placeholder="Garam"
              required
            />
          </label>
          <label className="space-y-2 text-sm">
            <span className="font-medium">Bobot</span>
            <input
              type="number"
              min="1"
              max="5"
              step="1"
              value={form.weight}
              onChange={(event) => setForm((current) => ({ ...current, weight: event.target.value }))}
              className="w-full rounded-md border bg-background px-3 py-2"
              required
            />
          </label>
          <label className="space-y-2 text-sm">
            <span className="font-medium">Atribut</span>
            <select
              value={form.attribute}
              onChange={(event) =>
                setForm((current) => ({ ...current, attribute: event.target.value as "BENEFIT" | "COST" }))
              }
              className="w-full rounded-md border bg-background px-3 py-2"
            >
              <option value="BENEFIT">BENEFIT</option>
              <option value="COST">COST</option>
            </select>
          </label>
          <label className="space-y-2 text-sm">
            <span className="font-medium">Urutan</span>
            <input
              type="number"
              min="0"
              step="1"
              value={form.order}
              onChange={(event) => setForm((current) => ({ ...current, order: event.target.value }))}
              className="w-full rounded-md border bg-background px-3 py-2"
            />
          </label>
          <label className="space-y-2 text-sm md:col-span-2 xl:col-span-1">
            <span className="font-medium">Status</span>
            <div className="flex h-10 items-center gap-3 rounded-md border bg-background px-3">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(event) => setForm((current) => ({ ...current, isActive: event.target.checked }))}
              />
              <span>Aktif</span>
            </div>
          </label>
          <label className="space-y-2 text-sm md:col-span-2 xl:col-span-3">
            <span className="font-medium">Deskripsi</span>
            <textarea
              value={form.description}
              onChange={(event) =>
                setForm((current) => ({ ...current, description: event.target.value }))
              }
              className="min-h-24 w-full rounded-md border bg-background px-3 py-2"
              placeholder="Skor tinggi berarti kondisi lebih baik"
            />
          </label>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
          >
            {isSubmitting ? "Menyimpan..." : "Simpan Kriteria"}
          </button>
          {message ? <p className="text-sm text-emerald-700">{message}</p> : null}
          {error ? <p className="text-sm text-rose-700">{error}</p> : null}
        </div>
      </form>

      {hasCriteria ? (
        <div className="overflow-hidden rounded-lg border bg-card shadow-sm">
          <table className="w-full min-w-[860px] text-sm">
            <thead className="bg-muted/70 text-left">
              <tr>
                <th className="px-4 py-3">Kode</th>
                <th className="px-4 py-3">Nama</th>
                <th className="px-4 py-3">Bobot</th>
                <th className="px-4 py-3">Atribut</th>
                <th className="px-4 py-3">Urutan</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {criteria.map((criterion) => (
                <tr key={criterion.id} className="border-t">
                  <td className="px-4 py-3 font-mono text-xs">{criterion.code}</td>
                  <td className="px-4 py-3 font-medium">
                    <div>{criterion.name}</div>
                    {criterion.description ? (
                      <p className="mt-1 max-w-lg text-xs text-muted-foreground">{criterion.description}</p>
                    ) : null}
                  </td>
                  <td className="px-4 py-3">{criterion.weight}</td>
                  <td className="px-4 py-3">{criterion.attribute}</td>
                  <td className="px-4 py-3">{criterion.order}</td>
                  <td className="px-4 py-3">
                    <span className={criterion.isActive ? "rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-medium text-emerald-800" : "rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700"}>
                      {criterion.isActive ? "Aktif" : "Nonaktif"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => void handleDelete(criterion.id)}
                      disabled={pendingId === criterion.id}
                      className="rounded-md border border-rose-200 px-3 py-1.5 text-xs font-medium text-rose-700 disabled:opacity-60"
                    >
                      {pendingId === criterion.id ? "Menghapus..." : "Hapus"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyState
          title="Belum ada kriteria"
          description="Tambahkan kriteria pertama lewat form di atas. Data master sekarang disimpan di database, bukan lagi di seed script."
        />
      )}
    </div>
  );
}