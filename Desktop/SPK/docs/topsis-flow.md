# PHASE 4 - Engine TOPSIS

## 1. Ringkasan

Engine TOPSIS dibuat sebagai modul TypeScript murni di `src/lib/topsis`. Modul ini tidak bergantung pada database, API, session, atau UI sehingga dapat dipakai oleh route handler, unit test, seed script, dan halaman detail perhitungan.

Keputusan algoritma:

- Semua kriteria seed awal menggunakan atribut `BENEFIT`, termasuk Garam.
- Bobot digunakan langsung sesuai PRD, yaitu skala 1 sampai 5.
- Nilai score alternatif harus lengkap untuk semua kriteria aktif.
- Jika semua jarak ideal bernilai 0 pada kasus alternatif identik, nilai preferensi memakai nilai netral `0.5`.
- Hasil utama disimpan full precision; pembulatan hanya untuk presentasi.

## 2. Output yang Dihasilkan

File engine:

- `src/lib/topsis/types.ts`
- `src/lib/topsis/engine.ts`
- `src/lib/topsis/seed-demo.ts`
- `src/lib/topsis/index.ts`

Input engine:

```ts
type TopsisInput = {
  criteria: TopsisCriterion[];
  alternatives: TopsisAlternative[];
};
```

Contoh kriteria:

```ts
{
  id: "salt",
  code: "SALT",
  name: "Garam",
  weight: 4,
  attribute: "BENEFIT"
}
```

Contoh alternatif:

```ts
{
  id: "kentang-kukus",
  name: "Kentang Kukus",
  scores: {
    carbohydrate: 4,
    protein: 3,
    fat: 4,
    processing: 5,
    salt: 5
  }
}
```

Tahapan perhitungan:

1. Membangun matriks keputusan dari score alternatif terhadap kriteria.
2. Menghitung denominator tiap kriteria:

```text
sqrt(sum(xij^2))
```

3. Normalisasi matriks keputusan:

```text
rij = xij / sqrt(sum(xij^2))
```

4. Membuat matriks ternormalisasi terbobot:

```text
yij = wj * rij
```

5. Menentukan solusi ideal positif:

```text
BENEFIT = max(yij)
COST    = min(yij)
```

6. Menentukan solusi ideal negatif:

```text
BENEFIT = min(yij)
COST    = max(yij)
```

7. Menghitung jarak Euclidean:

```text
D+ = sqrt(sum((yij - A+j)^2))
D- = sqrt(sum((yij - A-j)^2))
```

8. Menghitung nilai preferensi:

```text
Vi = D- / (D+ + D-)
```

9. Ranking diurutkan dari `Vi` tertinggi.

Output engine:

```ts
type TopsisCalculationResult = {
  criteriaSnapshot: TopsisCriterion[];
  matrixSnapshot: TopsisMatrixRow[];
  denominator: Record<string, number>;
  normalizedMatrix: TopsisMatrixRow[];
  weightedMatrix: TopsisMatrixRow[];
  idealPositive: Record<string, number>;
  idealNegative: Record<string, number>;
  results: TopsisResultItem[];
};
```

Contoh output demo sementara dari seed asumsi:

| Rank | Alternatif | D+ | D- | Vi |
| ---: | --- | ---: | ---: | ---: |
| 1 | Kentang Kukus | 0.6247 | 1.4495 | 0.6988 |
| 2 | Bubur Kacang Hijau | 1.0682 | 0.8428 | 0.4410 |
| 3 | Kacang Merah | 1.4495 | 0.6247 | 0.3012 |

Catatan validasi jurnal:

- Nilai referensi PRD adalah Kentang Kukus `0.6654`, Bubur Kacang Hijau `0.6373`, dan Kacang Merah `0.6013`.
- Karena tabel assessment jurnal lengkap belum tersedia, output demo sementara tidak diklaim identik dengan jurnal.
- Setelah tabel assessment asli tersedia, cukup mengganti score seed; engine tidak perlu diubah.

## 3. File yang Akan Dibuat

File Phase 4:

- `docs/topsis-flow.md`
- `src/lib/topsis/types.ts`
- `src/lib/topsis/engine.ts`
- `src/lib/topsis/seed-demo.ts`
- `src/lib/topsis/index.ts`

File lanjutan untuk Phase 6 dan Phase 7:

- `src/app/api/topsis/calculate/route.ts`
- `src/server/services/topsis-service.ts`
- `src/lib/topsis/engine.test.ts`
- `prisma/seed.ts`

## 4. Langkah Berikutnya

Phase 5 akan merancang UI/UX frontend untuk landing page, login, dashboard, criteria management, alternative management, assessment page, calculation detail page, ranking page, reports, dan settings/profile.

READY FOR NEXT PHASE
