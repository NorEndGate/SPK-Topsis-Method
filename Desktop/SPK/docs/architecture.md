# PHASE 2 - Arsitektur dan Struktur

## 1. Ringkasan

Sistem dibangun sebagai aplikasi Next.js 15 App Router dengan backend REST API di dalam codebase yang sama. UI mengonsumsi API route handler, API memvalidasi session Better Auth, lalu mengambil data dari PostgreSQL melalui Prisma. Engine TOPSIS berjalan di server sebagai modul TypeScript murni agar deterministik dan mudah diuji.

Arsitektur utama:

```text
Browser
  -> Next.js App Router UI
  -> REST API Route Handlers
  -> Better Auth Session + RBAC
  -> Service Layer
  -> Prisma ORM
  -> PostgreSQL / Neon
  -> TOPSIS Engine
```

## 2. Output yang Dihasilkan

Alur data rekomendasi:

```text
User membuka halaman ranking
  -> UI meminta latest ranking atau trigger calculate
  -> API memvalidasi session dan role
  -> Service mengambil criteria, alternatives, assessments aktif
  -> Engine TOPSIS membangun matriks keputusan
  -> Engine menghitung normalisasi, bobot, solusi ideal, jarak, preferensi
  -> Service menyimpan ranking run dan ranking result
  -> API mengembalikan ranking dan detail perhitungan
  -> UI menampilkan tabel, chart, dan calculation details
```

Daftar halaman:

| Halaman | Route | Akses |
| --- | --- | --- |
| Landing | `/` | Public |
| Login | `/login` | Public |
| Dashboard | `/dashboard` | ADMIN, NUTRITIONIST, USER |
| Criteria Management | `/criteria` | ADMIN |
| Alternative Management | `/alternatives` | ADMIN, NUTRITIONIST |
| Assessment Input | `/assessments` | ADMIN, NUTRITIONIST |
| Ranking Result | `/rankings` | ADMIN, NUTRITIONIST, USER |
| Calculation Detail | `/rankings/[id]` | ADMIN, NUTRITIONIST, USER |
| Reports | `/reports` | ADMIN, NUTRITIONIST |
| Audit Logs | `/audit-logs` | ADMIN |
| Settings/Profile | `/settings` | ADMIN, NUTRITIONIST, USER |

Daftar endpoint:

| Domain | Endpoint |
| --- | --- |
| Auth | `POST /api/auth/sign-in`, `POST /api/auth/sign-out`, `GET /api/auth/session` |
| Users | `GET /api/users`, `POST /api/users`, `PATCH /api/users/:id`, `DELETE /api/users/:id` |
| Criteria | `GET /api/criteria`, `POST /api/criteria`, `GET /api/criteria/:id`, `PATCH /api/criteria/:id`, `DELETE /api/criteria/:id` |
| Alternatives | `GET /api/alternatives`, `POST /api/alternatives`, `GET /api/alternatives/:id`, `PATCH /api/alternatives/:id`, `DELETE /api/alternatives/:id` |
| Assessments | `GET /api/assessments`, `POST /api/assessments`, `POST /api/assessments/bulk`, `PATCH /api/assessments/:id`, `DELETE /api/assessments/:id` |
| TOPSIS | `POST /api/topsis/calculate` |
| Rankings | `GET /api/rankings`, `GET /api/rankings/latest`, `GET /api/rankings/:id`, `GET /api/rankings/:id/detail` |
| Reports | `GET /api/reports/rankings.pdf`, `GET /api/reports/rankings.xlsx` |
| Audit Logs | `GET /api/audit-logs` |

Struktur folder target:

```text
src/
  app/
    (public)/
      page.tsx
      login/
        page.tsx
    (dashboard)/
      layout.tsx
      dashboard/
      criteria/
      alternatives/
      assessments/
      rankings/
      reports/
      audit-logs/
      settings/
    api/
      criteria/
      alternatives/
      assessments/
      topsis/
      rankings/
      reports/
      audit-logs/
  components/
    layout/
    ui/
    forms/
    charts/
    tables/
    states/
  features/
    auth/
    criteria/
    alternatives/
    assessments/
    rankings/
    reports/
  lib/
    auth/
    db/
    topsis/
    validations/
    rbac/
    audit/
    export/
  server/
    repositories/
    services/
  types/
prisma/
  schema.prisma
  seed.ts
docs/
  phase-1-product-analysis.md
  architecture.md
  api.md
```

Rancangan RBAC:

| Resource | ADMIN | NUTRITIONIST | USER |
| --- | ---: | ---: | ---: |
| Dashboard | Read | Read | Read |
| Users | CRUD | None | None |
| Criteria | CRUD | Read | Read |
| Alternatives | CRUD | CRUD | Read |
| Assessments | CRUD | CRUD | Read |
| Calculate TOPSIS | Execute | Execute | Read latest |
| Rankings | Read | Read | Read |
| Reports | Export | Export | None |
| Audit Logs | Read | None | None |
| Profile | Own update | Own update | Own update |

## 3. File yang Akan Dibuat

File Phase 2:

- `docs/architecture.md`

File implementasi arsitektur pada phase berikutnya:

- `src/lib/rbac/permissions.ts`
- `src/lib/auth/auth.ts`
- `src/lib/db/prisma.ts`
- `src/app/(dashboard)/layout.tsx`
- `src/components/layout/sidebar.tsx`
- `src/components/layout/topbar.tsx`

## 4. Langkah Berikutnya

Phase 3 menetapkan desain database, Prisma schema, enum, index, soft delete, dan dokumentasi endpoint REST API dengan contoh request/response.

READY FOR NEXT PHASE
