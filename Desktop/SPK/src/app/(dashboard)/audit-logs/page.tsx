import { PageHeader } from "@/components/shared/page-header";

const demoLogs = [
  {
    id: "audit-1",
    action: "CALCULATE_TOPSIS",
    actor: "Admin Demo",
    entity: "ranking_run",
    createdAt: "2026-05-22 19:00",
  },
  {
    id: "audit-2",
    action: "CREATE",
    actor: "Admin Demo",
    entity: "seed_data",
    createdAt: "2026-05-22 18:59",
  },
];

export default function AuditLogsPage() {
  return (
    <>
      <PageHeader title="Audit Log" description="Jejak aktivitas penting untuk kebutuhan audit sistem." />
      <main className="p-6">
        <div className="overflow-hidden rounded-lg border bg-card">
          <table className="w-full min-w-[720px] text-sm">
            <thead className="bg-muted/70 text-left">
              <tr>
                <th className="px-4 py-3">Waktu</th>
                <th className="px-4 py-3">Actor</th>
                <th className="px-4 py-3">Action</th>
                <th className="px-4 py-3">Entity</th>
              </tr>
            </thead>
            <tbody>
              {demoLogs.map((log) => (
                <tr key={log.id} className="border-t">
                  <td className="px-4 py-3">{log.createdAt}</td>
                  <td className="px-4 py-3">{log.actor}</td>
                  <td className="px-4 py-3 font-mono text-xs">{log.action}</td>
                  <td className="px-4 py-3">{log.entity}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </>
  );
}
