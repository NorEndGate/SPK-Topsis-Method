# PHASE 6 - Implementasi Kode

## 1. Ringkasan

Phase 6 mengubah rencana produk, arsitektur, database, engine TOPSIS, dan UI/UX menjadi source code awal aplikasi Next.js. Implementasi ini berfokus pada scaffold production-ready dengan demo data end-to-end agar UI, API, engine, dan seed dapat dikembangkan bertahap tanpa menunggu database production.

Status implementasi:

- Next.js 15 App Router scaffold.
- TypeScript, TailwindCSS, dan konfigurasi build.
- Prisma schema dan seed script.
- Better Auth config awal.
- RBAC permission map.
- Engine TOPSIS terintegrasi ke service dan API route.
- Halaman public dan dashboard.
- Halaman criteria, alternatives, assessments, rankings, reports, settings, audit logs.
- Komponen reusable layout, page header, stat card, chart, matrix table, state component, preference badge.
- API demo untuk criteria, alternatives, assessments, rankings, TOPSIS calculate, dan report export.

## 2. Output yang Dihasilkan

File konfigurasi:

- `package.json`
- `next.config.ts`
- `tsconfig.json`
- `tailwind.config.ts`
- `postcss.config.mjs`
- `.env.example`
- `src/app/globals.css`

Auth, database, RBAC, validation:

- `src/lib/auth/auth.ts`
- `src/lib/db/prisma.ts`
- `src/lib/rbac/permissions.ts`
- `src/lib/validations/*`

Backend/API:

- `src/server/services/topsis-service.ts`
- `src/server/repositories/demo-repository.ts`
- `src/app/api/topsis/calculate/route.ts`
- `src/app/api/rankings/latest/route.ts`
- `src/app/api/rankings/demo-detail/route.ts`
- `src/app/api/criteria/route.ts`
- `src/app/api/alternatives/route.ts`
- `src/app/api/assessments/route.ts`
- `src/app/api/assessments/bulk/route.ts`
- `src/app/api/reports/rankings.pdf/route.ts`
- `src/app/api/reports/rankings.xlsx/route.ts`

Frontend:

- `src/app/(public)/page.tsx`
- `src/app/(public)/login/page.tsx`
- `src/app/(dashboard)/layout.tsx`
- `src/app/(dashboard)/dashboard/page.tsx`
- `src/app/(dashboard)/criteria/page.tsx`
- `src/app/(dashboard)/alternatives/page.tsx`
- `src/app/(dashboard)/assessments/page.tsx`
- `src/app/(dashboard)/rankings/page.tsx`
- `src/app/(dashboard)/rankings/demo/page.tsx`
- `src/app/(dashboard)/reports/page.tsx`
- `src/app/(dashboard)/settings/page.tsx`
- `src/app/(dashboard)/audit-logs/page.tsx`

Seed:

- `prisma/seed.ts`

## 3. File yang Akan Dibuat

Phase 6 sudah membuat source code awal. File lanjutan yang akan dibuat pada Phase 7:

- `src/lib/topsis/engine.test.ts`
- test validation untuk schema Zod.
- checklist validasi ranking seed.
- test API route/service jika test runner sudah dipasang.

Keterbatasan Phase 6:

- API mutasi masih mengembalikan response demo dan belum menulis ke database sampai migrasi Prisma dijalankan.
- Better Auth sudah disiapkan, tetapi session middleware penuh belum diaktifkan.
- Export PDF/XLSX masih placeholder berbasis text/CSV sampai package export final dipilih.

## 4. Langkah Berikutnya

Phase 7 akan fokus pada testing dan validasi:

- Unit test engine TOPSIS.
- Edge case input kosong, skor tidak lengkap, bobot tidak valid, dan alternatif identik.
- Validasi hasil ranking seed demo.
- Checklist perbandingan terhadap jurnal setelah assessment asli tersedia.

READY FOR NEXT PHASE
