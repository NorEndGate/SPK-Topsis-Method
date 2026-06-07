"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { EmptyState } from "@/components/shared/empty-state";

type AlternativeRecord = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  isDemo: boolean;
  isActive: boolean;
};

type AlternativesManagerProps = {
  initialAlternatives: AlternativeRecord[];
};

const emptyForm = {
  name: "",
  description: "",
  imageUrl: "",
  isDemo: false,
  isActive: true,
};

export function AlternativesManager({ initialAlternatives }: AlternativesManagerProps) {
  const router = useRouter();
  const [alternatives, setAlternatives] = useState(initialAlternatives);
  const [form, setForm] = useState(emptyForm);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const hasAlternatives = useMemo(() => alternatives.length > 0, [alternatives.length]);

  async function refreshAlternatives() {
    const response = await fetch("/api/alternatives", { cache: "no-store" });
    const payload = await response.json();
    setAlternatives(payload.data ?? []);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setMessage(null);
    setError(null);

    const response = await fetch("/api/alternatives", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.name,
        description: form.description.trim() || undefined,
        imageUrl: form.imageUrl.trim() || undefined,
        isDemo: form.isDemo,
        isActive: form.isActive,
      }),
    });

    const payload = await response.json();

    if (!response.ok) {
      setError(payload?.error?.message ?? "Gagal menyimpan alternatif.");
      setIsSubmitting(false);
      return;
    }

    setForm(emptyForm);
    setMessage("Alternatif berhasil disimpan.");
    await refreshAlternatives();
    router.refresh();
    setIsSubmitting(false);
  }

  async function handleDelete(id: string) {
    if (!confirm("Hapus alternatif ini?")) {
      return;
    }

    setPendingId(id);
    setMessage(null);
    setError(null);

    const response = await fetch(`/api/alternatives/${id}`, { method: "DELETE" });
    const payload = await response.json();

    if (!response.ok) {
      setError(payload?.error?.message ?? "Gagal menghapus alternatif.");
      setPendingId(null);
      return;
    }

    setMessage("Alternatif dihapus.");
    await refreshAlternatives();
    router.refresh();
    setPendingId(null);
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="rounded-lg border bg-card p-5 shadow-sm">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <label className="space-y-2 text-sm md:col-span-2 xl:col-span-1">
            <span className="font-medium">Nama</span>
            <input
              value={form.name}
              onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
              className="w-full rounded-md border bg-background px-3 py-2"
              placeholder="Kentang Kukus"
              required
            />
          </label>
          <label className="space-y-2 text-sm md:col-span-2 xl:col-span-2">
            <span className="font-medium">URL Gambar</span>
            <input
              value={form.imageUrl}
              onChange={(event) => setForm((current) => ({ ...current, imageUrl: event.target.value }))}
              className="w-full rounded-md border bg-background px-3 py-2"
              placeholder="https://..."
            />
          </label>
          <label className="space-y-2 text-sm md:col-span-2 xl:col-span-3">
            <span className="font-medium">Deskripsi</span>
            <textarea
              value={form.description}
              onChange={(event) =>
                setForm((current) => ({ ...current, description: event.target.value }))
              }
              className="min-h-24 w-full rounded-md border bg-background px-3 py-2"
              placeholder="Menu makanan sehat yang bisa dinilai TOPSIS"
            />
          </label>
          <label className="space-y-2 text-sm">
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
          <label className="space-y-2 text-sm">
            <span className="font-medium">Demo Seed</span>
            <div className="flex h-10 items-center gap-3 rounded-md border bg-background px-3">
              <input
                type="checkbox"
                checked={form.isDemo}
                onChange={(event) => setForm((current) => ({ ...current, isDemo: event.target.checked }))}
              />
              <span>Ya</span>
            </div>
          </label>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
          >
            {isSubmitting ? "Menyimpan..." : "Simpan Alternatif"}
          </button>
          {message ? <p className="text-sm text-emerald-700">{message}</p> : null}
          {error ? <p className="text-sm text-rose-700">{error}</p> : null}
        </div>
      </form>

      {hasAlternatives ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {alternatives.map((alternative) => (
            <article key={alternative.id} className="rounded-lg border bg-card p-4 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">{alternative.slug}</p>
                  <h2 className="mt-1 font-semibold">{alternative.name}</h2>
                </div>
                <span
                  className={alternative.isActive ? "rounded-full bg-sky-100 px-2.5 py-1 text-xs font-medium text-sky-800" : "rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700"}
                >
                  {alternative.isActive ? "Aktif" : "Nonaktif"}
                </span>
              </div>

              {alternative.description ? (
                <p className="mt-3 text-sm text-muted-foreground">{alternative.description}</p>
              ) : null}

              <dl className="mt-4 grid grid-cols-1 gap-3 text-sm">
                <div className="rounded-md bg-muted p-3">
                  <dt className="text-xs text-muted-foreground">Image URL</dt>
                  <dd className="mt-1 break-all font-semibold">{alternative.imageUrl ?? "-"}</dd>
                </div>
                <div className="rounded-md bg-muted p-3">
                  <dt className="text-xs text-muted-foreground">Sumber</dt>
                  <dd className="mt-1 font-semibold">{alternative.isDemo ? "Demo" : "Input manual"}</dd>
                </div>
              </dl>

              <div className="mt-4 flex justify-end">
                <button
                  type="button"
                  onClick={() => void handleDelete(alternative.id)}
                  disabled={pendingId === alternative.id}
                  className="rounded-md border border-rose-200 px-3 py-1.5 text-xs font-medium text-rose-700 disabled:opacity-60"
                >
                  {pendingId === alternative.id ? "Menghapus..." : "Hapus"}
                </button>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <EmptyState
          title="Belum ada alternatif"
          description="Tambahkan menu makanan pertama lewat form di atas. Data sekarang disimpan langsung ke database, bukan seed script."
        />
      )}
    </div>
  );
}