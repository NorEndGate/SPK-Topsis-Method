import Link from "next/link";
import { LogOut, Search } from "lucide-react";

export function AppTopbar() {
  return (
    <header className="flex h-16 items-center justify-between border-b bg-card px-6">
      <div className="flex w-full max-w-md items-center gap-2 rounded-md border bg-background px-3 py-2 text-sm text-muted-foreground">
        <Search className="h-4 w-4" />
        <span>Search, filter, sorting tersedia pada tabel data</span>
      </div>
      <div className="flex items-center gap-3">
        <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-800">
          Admin Demo
        </span>
        <Link
          href="/login"
          className="inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm hover:bg-muted"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </Link>
      </div>
    </header>
  );
}
