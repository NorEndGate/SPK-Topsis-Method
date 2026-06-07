import { PageHeader } from "@/components/shared/page-header";

export default function SettingsPage() {
  return (
    <>
      <PageHeader title="Pengaturan" description="Kelola profil, preferensi tema, dan sesi pengguna." />
      <main className="p-6">
        <section className="max-w-2xl rounded-lg border bg-card p-5">
          <h2 className="font-semibold">Profil Demo</h2>
          <dl className="mt-4 space-y-3 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Nama</dt>
              <dd className="font-medium">Admin Demo</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Email</dt>
              <dd className="font-medium">admin@demo.local</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Role</dt>
              <dd className="font-medium">ADMIN</dd>
            </div>
          </dl>
        </section>
      </main>
    </>
  );
}
