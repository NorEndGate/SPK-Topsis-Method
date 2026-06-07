# PHASE 1 - Analisis Produk

## 1. Ringkasan

Aplikasi ini adalah Sistem Pendukung Keputusan (SPK) berbasis web untuk membantu ahli gizi dan pengguna memilih menu makanan sehat bagi penderita hipertensi. Sistem menggunakan metode TOPSIS untuk menghitung ranking alternatif makanan berdasarkan beberapa kriteria gizi dan keamanan pengolahan.

Tujuan aplikasi:

- Memberikan rekomendasi makanan secara objektif, terukur, dan transparan.
- Membantu ahli gizi membandingkan alternatif makanan menggunakan kriteria yang konsisten.
- Mempercepat pemahaman pengguna melalui seed demo data saat pertama kali masuk.
- Menampilkan proses perhitungan TOPSIS secara lengkap, bukan hanya ranking akhir.

Target user:

- Admin: mengelola user, role, kriteria, alternatif, assessment, laporan, dan audit log.
- Ahli Gizi: mengelola alternatif makanan, input assessment, menjalankan perhitungan, dan mengekspor laporan.
- User: melihat dashboard, rekomendasi makanan, ranking, dan detail perhitungan.

Masalah yang diselesaikan:

- Pemilihan menu hipertensi masih sering manual dan subjektif.
- Banyak faktor gizi harus dibandingkan secara bersamaan.
- Pengguna membutuhkan rekomendasi yang mudah dipahami.
- Ahli gizi membutuhkan sistem yang dapat diaudit dan diuji ulang.

## 2. Output yang Dihasilkan

Fitur wajib:

- Login, logout, session, dan role access.
- Dashboard ringkas dan visual.
- Manajemen kriteria.
- Manajemen alternatif makanan.
- Input penilaian makanan.
- Engine TOPSIS server-side.
- Halaman hasil ranking.
- Detail transparansi perhitungan TOPSIS.
- Laporan PDF dan Excel.
- Seed demo data.
- Audit log.
- Search, filter, sorting, pagination.
- Dark mode.
- Loading state, empty state, dan error state.

Kriteria awal:

| Kode | Nama | Atribut | Bobot | Catatan |
| --- | --- | --- | ---: | --- |
| CARBOHYDRATE | Karbohidrat | BENEFIT | 2 | Sumber energi tubuh |
| PROTEIN | Protein | BENEFIT | 4 | Perbaikan jaringan sel |
| FAT | Lemak | BENEFIT | 3 | Sumber energi tinggi |
| PROCESSING | Pengolahan | BENEFIT | 5 | Faktor keamanan menu |
| SALT | Garam | BENEFIT | 4 | Nilai tinggi berarti kadar garam lebih rendah |

Keputusan klarifikasi:

- Garam menggunakan atribut BENEFIT karena skala input memberi nilai 5 untuk kadar garam paling rendah.
- Better Auth digunakan sebagai authentication provider.
- Seed data awal menggunakan asumsi logis sementara sampai tabel assessment jurnal lengkap tersedia.
- Validasi jurnal final dilakukan setelah data assessment asli tersedia.

Seed alternatif awal:

| Nama Alternatif | Nilai Preferensi Referensi |
| --- | ---: |
| Kentang Kukus | 0.6654 |
| Bubur Kacang Hijau | 0.6373 |
| Kacang Merah | 0.6013 |

## 3. File yang Akan Dibuat

File Phase 1:

- `docs/phase-1-product-analysis.md`

File lanjutan:

- `docs/architecture.md`
- `docs/api.md`
- `prisma/schema.prisma`

## 4. Langkah Berikutnya

Phase 2 mendefinisikan arsitektur sistem, alur data, daftar halaman, endpoint API, struktur folder, dan rancangan role-based access.

Risiko yang harus diperhatikan:

- Hasil seed awal belum bisa dijamin sama 100% dengan jurnal sampai data assessment lengkap tersedia.
- Setiap perubahan bobot atau assessment akan mengubah ranking dan harus tercatat dalam audit log.
- Transparansi perhitungan TOPSIS wajib dijaga agar sistem dapat divalidasi ulang.

READY FOR NEXT PHASE
