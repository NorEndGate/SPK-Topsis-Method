# PHASE 5 - UI/UX Frontend

## 1. Ringkasan

UI dirancang sebagai aplikasi dashboard operasional untuk Admin, Ahli Gizi, dan User. Fokus desain adalah transparansi perhitungan TOPSIS, kemudahan input data, dan akses cepat ke hasil ranking makanan sehat bagi penderita hipertensi.

Karakter visual:

- Bersih, klinis, dan profesional.
- Layout padat tetapi tetap mudah dipindai.
- Warna utama netral dengan aksen hijau kesehatan dan biru informasi.
- Tidak menggunakan gaya landing page marketing berlebihan.
- Semua halaman dashboard memiliki loading, empty, dan error state.

Prinsip UX:

- User harus langsung melihat rekomendasi demo setelah login.
- Ahli Gizi harus mudah memeriksa kelengkapan assessment setiap makanan.
- Admin harus jelas membedakan data master, calculation result, report, dan audit log.
- Detail perhitungan wajib mudah ditelusuri dari ranking akhir ke matriks awal.

## 2. Output yang Dihasilkan

### Design System

Tech UI:

- TailwindCSS untuk styling.
- shadcn/ui untuk komponen dasar.
- lucide-react untuk icon.
- Framer Motion untuk transisi ringan.
- Recharts untuk grafik ranking dan distribusi skor.
- React Hook Form dan Zod untuk form validation.

Token desain:

| Token | Nilai |
| --- | --- |
| Radius | `0.5rem` atau 8px |
| Background light | `slate-50` |
| Surface light | `white` |
| Text utama | `slate-950` |
| Text sekunder | `slate-500` |
| Accent health | `emerald-600` |
| Accent info | `sky-600` |
| Danger | `rose-600` |
| Warning | `amber-500` |
| Border | `slate-200` |
| Dark background | `slate-950` |
| Dark surface | `slate-900` |

Komponen reusable:

| Komponen | Fungsi |
| --- | --- |
| `AppSidebar` | Navigasi utama sesuai role |
| `AppTopbar` | Breadcrumb, search, theme toggle, user menu |
| `PageHeader` | Judul, deskripsi singkat, primary action |
| `StatCard` | Ringkasan dashboard |
| `DataTable` | Table dengan search, filter, sort, pagination |
| `EmptyState` | Tampilan ketika data kosong |
| `ErrorState` | Tampilan error dengan retry |
| `LoadingState` | Skeleton loading |
| `ConfirmDialog` | Konfirmasi delete/restore |
| `RoleGuard` | Menyembunyikan action berdasarkan role |
| `ScoreBadge` | Label skor 1-5 |
| `PreferenceBadge` | Label nilai Vi |
| `RankingChart` | Visualisasi ranking TOPSIS |
| `MatrixTable` | Tabel matriks keputusan dan hasil transformasi |
| `ExportButton` | Export PDF/Excel |

### Layout Global

Dashboard layout:

```text
+------------------------------------------------------+
| Sidebar | Topbar                                      |
|         |---------------------------------------------|
|         | Page Header                                 |
|         | Content Area                                |
|         | Tables / Charts / Forms / Detail Panels     |
+------------------------------------------------------+
```

Responsive behavior:

- Desktop: sidebar permanen, content maksimal penuh.
- Tablet: sidebar collapsible.
- Mobile: sidebar menjadi drawer, table memakai horizontal scroll, action utama tetap terlihat di header.

Navigasi sidebar:

| Menu | Icon | Akses |
| --- | --- | --- |
| Dashboard | LayoutDashboard | ADMIN, NUTRITIONIST, USER |
| Kriteria | SlidersHorizontal | ADMIN |
| Alternatif Makanan | Utensils | ADMIN, NUTRITIONIST, USER read-only |
| Penilaian | ClipboardCheck | ADMIN, NUTRITIONIST |
| Ranking | Trophy | ADMIN, NUTRITIONIST, USER |
| Laporan | FileDown | ADMIN, NUTRITIONIST |
| Audit Log | History | ADMIN |
| Pengaturan | Settings | ADMIN, NUTRITIONIST, USER |

### Halaman Public

#### Landing Page `/`

Tujuan:

- Menjelaskan aplikasi secara singkat.
- Memberi akses login.
- Menampilkan preview ranking demo.

Struktur:

- Hero sederhana dengan nama aplikasi dan ringkasan manfaat.
- Preview ranking 3 makanan seed.
- Ringkasan metode TOPSIS dalam 4 step.
- CTA login.

Konten utama:

- Judul: `SPK Menu Sehat Hipertensi`
- Subtitle: `Rekomendasi makanan berbasis TOPSIS untuk membantu pemilihan menu yang lebih terukur.`

#### Login `/login`

Tujuan:

- Login aman menggunakan Better Auth.

Struktur:

- Form email dan password.
- Error message jika kredensial salah.
- Loading state saat submit.

Validasi:

- Email wajib valid.
- Password wajib diisi.

### Dashboard `/dashboard`

Tujuan:

- Memberi overview cepat setelah login.
- Menampilkan demo ranking atau hasil ranking terbaru.

Konten:

- Stat cards: total alternatif, total kriteria, ranking run terakhir, alternatif terbaik.
- Chart ranking nilai preferensi.
- Tabel top 5 makanan.
- Panel status data: jumlah alternatif yang assessment-nya lengkap atau belum lengkap.

Primary action:

- Admin/Ahli Gizi: `Hitung Ulang TOPSIS`.
- User: `Lihat Detail Ranking`.

States:

- Empty: tampilkan seed demo jika belum ada ranking run.
- Error: tampilkan retry dan pesan gagal memuat ranking.

### Criteria Management `/criteria`

Akses:

- ADMIN only.

Tujuan:

- Mengelola kriteria dan bobot TOPSIS.

Table columns:

- Nama kriteria.
- Kode.
- Bobot.
- Atribut.
- Status.
- Updated at.
- Actions.

Form fields:

- `code`
- `name`
- `description`
- `weight`
- `attribute`
- `order`
- `isActive`

UX rules:

- Weight menggunakan number input atau slider 1-5.
- Attribute menggunakan segmented control `BENEFIT` / `COST`.
- Untuk seed awal, Garam tampil sebagai `BENEFIT` dengan note bisnis.

### Alternative Management `/alternatives`

Akses:

- ADMIN dan NUTRITIONIST dapat CRUD.
- USER read-only.

Tujuan:

- Mengelola daftar menu makanan.

Table columns:

- Gambar.
- Nama makanan.
- Deskripsi singkat.
- Demo data.
- Status assessment.
- Status aktif.
- Actions.

Form fields:

- `name`
- `description`
- `imageUrl`
- `isDemo`
- `isActive`

Filter:

- Search nama.
- Demo/non-demo.
- Active/inactive.
- Assessment complete/incomplete.

### Assessment Page `/assessments`

Akses:

- ADMIN dan NUTRITIONIST.

Tujuan:

- Input skor 1-5 untuk setiap alternatif terhadap seluruh kriteria aktif.

Layout:

- Pilih alternatif di panel kiri atau combobox.
- Form skor kriteria di panel kanan.
- Status kelengkapan assessment di bagian atas.

Fields:

- Karbohidrat score 1-5.
- Protein score 1-5.
- Lemak score 1-5.
- Pengolahan score 1-5.
- Garam score 1-5.
- Note opsional per kriteria.

Helper text:

- Pengolahan: 1 Digoreng, 2 Dibakar, 3 Ditumis, 4 Direbus, 5 Dikukus.
- Garam: 1 = 4-5gr/100gr, 2 = 3-4gr/100gr, 3 = 2-3gr/100gr, 4 = 1-2gr/100gr, 5 = 0-1gr/100gr.

### Ranking Page `/rankings`

Akses:

- ADMIN, NUTRITIONIST, USER.

Tujuan:

- Menampilkan ranking makanan berdasarkan nilai preferensi TOPSIS.

Konten:

- Summary ranking run.
- Chart bar nilai `Vi`.
- Ranking table.
- Tombol detail perhitungan.
- Tombol export untuk Admin/Ahli Gizi.

Table columns:

- Rank.
- Nama makanan.
- `D+`.
- `D-`.
- `Vi`.
- Status rekomendasi.
- Actions.

Status rekomendasi:

- `Vi >= 0.65`: Sangat Direkomendasikan.
- `0.45 <= Vi < 0.65`: Direkomendasikan Terbatas.
- `Vi < 0.45`: Perlu Pertimbangan.

Catatan:

- Status rekomendasi hanya label UI berbasis skor, bukan diagnosis medis.

### Calculation Detail `/rankings/[id]`

Akses:

- ADMIN, NUTRITIONIST, USER.

Tujuan:

- Menampilkan transparansi penuh perhitungan TOPSIS.

Struktur:

- Header ranking run dan waktu hitung.
- Tabs:
  - Matriks Keputusan.
  - Normalisasi.
  - Terbobot.
  - Solusi Ideal.
  - Jarak.
  - Ranking.

Komponen:

- `MatrixTable` untuk tiap matriks.
- `RankingChart` untuk hasil akhir.
- Panel formula singkat sesuai step aktif.

UX rule:

- Angka tampil 4 desimal.
- Raw precision tetap berasal dari API.
- User dapat menyalin tabel atau export laporan.

### Reports `/reports`

Akses:

- ADMIN dan NUTRITIONIST.

Tujuan:

- Mengunduh laporan ranking.

Konten:

- Filter ranking run.
- Preview summary.
- Tombol export PDF.
- Tombol export Excel.

Fields:

- Ranking run date.
- Format export.
- Include calculation details.

### Settings/Profile `/settings`

Akses:

- ADMIN, NUTRITIONIST, USER.

Tujuan:

- Mengelola profil user dan preferensi UI.

Konten:

- Profile information.
- Theme toggle.
- Session information.
- Logout.

Admin tambahan:

- Role user tidak diedit di halaman settings; role dikelola dari user management pada phase lanjutan bila dibutuhkan.

### Audit Logs `/audit-logs`

Akses:

- ADMIN.

Tujuan:

- Melihat jejak aktivitas penting.

Table columns:

- Waktu.
- Actor.
- Action.
- Entity.
- Metadata preview.
- IP address.

Filter:

- Action.
- Entity type.
- Date range.
- Actor.

### State Design

Loading:

- Skeleton untuk cards dan table.
- Button submit menampilkan spinner.

Empty:

- Data master kosong: tampilkan CTA sesuai role.
- Ranking kosong: tampilkan CTA hitung TOPSIS untuk Admin/Ahli Gizi atau pesan menunggu data untuk User.

Error:

- Error fetch: tampilkan retry.
- Error validation: tampilkan field message.
- Error permission: tampilkan halaman akses ditolak.

Success feedback:

- Toast setelah create/update/delete/export/calculate.
- Setelah calculate TOPSIS berhasil, redirect ke detail ranking run terbaru.

## 3. File yang Akan Dibuat

File Phase 5:

- `docs/ui-ux.md`

File yang akan dibuat pada Phase 6:

- `src/app/(public)/page.tsx`
- `src/app/(public)/login/page.tsx`
- `src/app/(dashboard)/layout.tsx`
- `src/app/(dashboard)/dashboard/page.tsx`
- `src/app/(dashboard)/criteria/page.tsx`
- `src/app/(dashboard)/alternatives/page.tsx`
- `src/app/(dashboard)/assessments/page.tsx`
- `src/app/(dashboard)/rankings/page.tsx`
- `src/app/(dashboard)/rankings/[id]/page.tsx`
- `src/app/(dashboard)/reports/page.tsx`
- `src/app/(dashboard)/settings/page.tsx`
- `src/components/layout/app-sidebar.tsx`
- `src/components/layout/app-topbar.tsx`
- `src/components/shared/page-header.tsx`
- `src/components/shared/data-table.tsx`
- `src/components/shared/empty-state.tsx`
- `src/components/shared/error-state.tsx`
- `src/components/shared/loading-state.tsx`
- `src/components/charts/ranking-chart.tsx`
- `src/components/topsis/matrix-table.tsx`

## 4. Langkah Berikutnya

Phase 6 akan mulai implementasi kode bertahap berdasarkan desain ini:

- Setup Next.js, TypeScript, TailwindCSS, shadcn/ui.
- Setup Better Auth, Prisma, dan PostgreSQL config.
- Implementasi layout, API route, service, components, pages, TOPSIS integration, export, dan seed.

READY FOR NEXT PHASE
