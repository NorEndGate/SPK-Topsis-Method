import Link from "next/link";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6">
      <div className="w-full max-w-md rounded-lg border bg-card p-6 shadow-sm">
        <div>
          <p className="text-sm text-emerald-600">SPK TOPSIS</p>
          <h1 className="mt-1 text-2xl font-semibold">Masuk ke aplikasi</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Form ini disiapkan untuk integrasi Better Auth pada tahap wiring backend.
          </p>
        </div>
        <form className="mt-6 space-y-4">
          <label className="block">
            <span className="text-sm font-medium">Email</span>
            <input
              type="email"
              defaultValue="admin@demo.local"
              className="mt-1 w-full rounded-md border bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium">Password</span>
            <input
              type="password"
              defaultValue="password"
              className="mt-1 w-full rounded-md border bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </label>
          <Link
            href="/dashboard"
            className="block rounded-md bg-emerald-600 px-4 py-2.5 text-center text-sm font-medium text-white hover:bg-emerald-700"
          >
            Masuk sebagai Admin Demo
          </Link>
        </form>
      </div>
    </main>
  );
}
