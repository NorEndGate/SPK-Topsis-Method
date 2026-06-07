"use client";

import { useState } from "react";
import Link from "next/link";
import { X } from "lucide-react";

export default function NoDataToast({ message }: { message: string }) {
  const [open, setOpen] = useState(true);

  if (!open) return null;

  return (
    <div className="fixed right-4 top-4 z-50 w-80 rounded-md border bg-yellow-50 p-4 shadow">
      <div className="flex items-start gap-3">
        <div className="flex-1">
          <p className="font-semibold">Informasi</p>
          <p className="mt-1 text-sm text-muted-foreground">{message}</p>
          <div className="mt-3 flex gap-2">
            <Link
              href="/criteria"
              className="rounded-md bg-emerald-600 px-3 py-1 text-sm font-medium text-white"
            >
              Tambah Kriteria
            </Link>
            <Link
              href="/alternatives"
              className="rounded-md border px-3 py-1 text-sm font-medium"
            >
              Tambah Alternatif
            </Link>
          </div>
        </div>
        <button
          aria-label="Close"
          onClick={() => setOpen(false)}
          className="text-muted-foreground"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
