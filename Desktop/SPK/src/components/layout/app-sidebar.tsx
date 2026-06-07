import Link from "next/link";
import {
  ClipboardCheck,
  FileDown,
  History,
  LayoutDashboard,
  Settings,
  SlidersHorizontal,
  Trophy,
  Utensils,
} from "lucide-react";

const navigation = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/criteria", label: "Kriteria", icon: SlidersHorizontal },
  { href: "/alternatives", label: "Alternatif", icon: Utensils },
  { href: "/assessments", label: "Penilaian", icon: ClipboardCheck },
  { href: "/rankings", label: "Ranking", icon: Trophy },
  { href: "/reports", label: "Laporan", icon: FileDown },
  { href: "/audit-logs", label: "Audit Log", icon: History },
  { href: "/settings", label: "Pengaturan", icon: Settings },
];

export function AppSidebar() {
  return (
    <aside className="hidden min-h-screen w-64 border-r bg-slate-950 text-slate-100 lg:block">
      <div className="border-b border-slate-800 px-5 py-5">
        <p className="text-sm text-emerald-300">SPK TOPSIS</p>
        <h1 className="mt-1 text-lg font-semibold">Menu Hipertensi</h1>
      </div>
      <nav className="space-y-1 px-3 py-4">
        {navigation.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-slate-300 hover:bg-slate-900 hover:text-white"
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
