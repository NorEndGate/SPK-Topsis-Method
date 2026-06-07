# SPK Pemilihan Menu Makanan Sehat Hipertensi

Aplikasi web Sistem Pendukung Keputusan untuk pemilihan menu makanan sehat bagi penderita hipertensi menggunakan metode TOPSIS.

Dokumen ini mencatat status awal pekerjaan berdasarkan PRD dan keputusan klarifikasi.

## Status Pengerjaan

Phase yang sudah dikerjakan:

- Phase 1: Analisis produk.
- Phase 2: Arsitektur dan struktur aplikasi.
- Phase 3: Database dan dokumentasi REST API.
- Phase 4: Engine TOPSIS.
- Phase 5: UI/UX frontend.
- Phase 6: Implementasi kode aplikasi.

Phase berikutnya:

- Phase 7: Testing dan validasi.
- Phase 8: Deployment.

## Dokumen

- [Analisis Produk](docs/phase-1-product-analysis.md)
- [Arsitektur Sistem](docs/architecture.md)
- [Database dan API](docs/api.md)
- [Flow Engine TOPSIS](docs/topsis-flow.md)
- [UI/UX Frontend](docs/ui-ux.md)
- [Implementasi Kode](docs/phase-6-implementation.md)
- [Prisma Schema](prisma/schema.prisma)

## Keputusan Sistem

- Tech stack utama: Next.js 15 App Router, React, TypeScript, TailwindCSS, shadcn/ui, Prisma, PostgreSQL, Better Auth.
- Perhitungan TOPSIS dilakukan di server.
- Kriteria Garam diperlakukan sebagai `BENEFIT` karena skor tinggi berarti kadar garam lebih rendah dan lebih baik untuk penderita hipertensi.
- Seed data awal menggunakan asumsi sementara sampai tabel assessment jurnal lengkap tersedia.
- Ranking result disimpan sebagai snapshot agar laporan historis tetap konsisten.

## Kriteria Awal

| Kriteria | Atribut | Bobot |
| --- | --- | ---: |
| Karbohidrat | BENEFIT | 2 |
| Protein | BENEFIT | 4 |
| Lemak | BENEFIT | 3 |
| Pengolahan | BENEFIT | 5 |
| Garam | BENEFIT | 4 |

## Seed Demo Awal

| Alternatif | Nilai Referensi PRD |
| --- | ---: |
| Kentang Kukus | 0.6654 |
| Bubur Kacang Hijau | 0.6373 |
| Kacang Merah | 0.6013 |

Nilai assessment detail untuk seed awal akan dibuat pada Phase 4 sebagai data sementara dan dapat dikalibrasi ulang setelah tabel jurnal lengkap tersedia.

## Engine TOPSIS

Engine tersedia di `src/lib/topsis` dan menghasilkan:

- Matriks keputusan.
- Denominator normalisasi.
- Matriks ternormalisasi.
- Matriks ternormalisasi terbobot.
- Solusi ideal positif dan negatif.
- Jarak Euclidean.
- Nilai preferensi.
- Ranking akhir.

## UI/UX

Desain frontend tersedia di `docs/ui-ux.md` dan mencakup:

- Layout dashboard.
- Navigasi berbasis role.
- Halaman public dan dashboard.
- Komponen reusable.
- State loading, empty, error, dan success.
- Detail tampilan ranking dan transparansi perhitungan TOPSIS.

## Menjalankan Project

```bash
npm install
npm run prisma:generate
npm run dev
```

Untuk database lokal, salin `.env.example` menjadi `.env` dan isi `DATABASE_URL`.
