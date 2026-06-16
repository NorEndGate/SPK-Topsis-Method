# SPK-Topsis-Method - Log Perubahan Hari Ini

Tanggal: 2026-06-16

Dokumen ini merangkum semua perubahan yang dilakukan hari ini pada project SPK-Topsis-Method berdasarkan route dan kode yang benar-benar ada di workspace.

## Ringkasan Perubahan

- Menghapus alur lama yang bergantung pada export PDF/Excel dan menggantinya dengan impor Excel untuk penilaian.
- Menambahkan impor Excel di route `src/app/api/assessments/import/route.ts`.
- Menyesuaikan input assessment agar mendukung nilai desimal dan tetap bisa diedit.
- Menyamakan hasil TOPSIS sistem dengan perhitungan manual dari workbook `docs/spk_topsis_k ALL.xlsx`.
- Menyelaraskan bobot kriteria dan konversi skor workbook ke data live agar ranking sistem sama dengan manual.
- Mengganti tombol detail perhitungan di dashboard dan ranking agar memakai data live, bukan demo.
- Memastikan build project lolos setelah perubahan.

## Detail Perubahan Teknis

### 1. Impor Excel menggantikan export

- Halaman reports sekarang dipakai sebagai titik masuk impor Excel.
- File import membaca worksheet Excel, mengambil judul kriteria pada baris 5, dan memakai data alternatif dari kolom B.
- Nilai pada kolom kriteria diubah ke skor TOPSIS sesuai aturan workbook.

### 2. Penyesuaian scoring assessment

- Input penilaian sekarang menerima angka desimal.
- Validasi assessment disesuaikan agar skor tidak lagi dibatasi integer 1-5.
- Konversi workbook diterapkan untuk data live supaya proses TOPSIS sama dengan manual.

### 3. Paritas TOPSIS dengan workbook manual

- Workbook `docs/spk_topsis_k ALL.xlsx` dipakai sebagai acuan manual.
- Proses yang divalidasi:
	- data clean
	- konversi sub-kriteria ke skor numerik
	- normalisasi
	- pembobotan
	- solusi ideal positif/negatif
	- jarak D+ dan D-
	- nilai preferensi Vi
	- ranking akhir
- Setelah data live disinkronkan, hasil ranking sistem cocok dengan ranking manual workbook.

### 4. Detail perhitungan menggunakan data live

- Tombol detail perhitungan di dashboard sekarang menuju route live `\/rankings\/detail`.
- Tombol detail di halaman ranking juga diarahkan ke route live yang sama.
- Route demo lama tetap ada sebagai redirect agar link lama tidak putus.

### 5. Validasi build

- `npm run build` berhasil dijalankan setelah perubahan terakhir.
- Route baru `\/rankings\/detail` ikut ter-build dengan benar.

## Route Project Yang Relevan Saat Ini

### Halaman

- `/` - landing/public home
- `/login` - login public
- `/dashboard` - ringkasan data live dan ranking
- `/criteria` - manajemen kriteria
- `/alternatives` - manajemen alternatif
- `/assessments` - input penilaian
- `/rankings` - hasil ranking live
- `/rankings/detail` - detail perhitungan live
- `/rankings/demo` - redirect ke detail live
- `/reports` - impor Excel
- `/settings` - profil/pengaturan

### API penting

- `GET /api/rankings/latest` - ranking live
- `POST /api/topsis/calculate` - perhitungan TOPSIS
- `POST /api/assessments/import` - impor Excel
- `POST /api/assessments/bulk` - simpan penilaian massal
- `GET /api/criteria` dan `GET /api/alternatives` - data master

## Catatan

- Dashboard dan ranking sekarang sama-sama memakai data live dari database.
- Detail perhitungan tidak lagi memakai data demo.
- Bila data ranking terasa berbeda lagi, sumber utamanya biasanya ada di isi assessment live atau bobot kriteria yang tersimpan di database.
