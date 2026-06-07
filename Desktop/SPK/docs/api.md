# PHASE 3 - Database dan API

## 1. Ringkasan

Database menggunakan PostgreSQL dengan Prisma ORM. Desain data memakai relasi eksplisit untuk user, role, kriteria, alternatif makanan, penilaian, ranking run, ranking result, dan audit log. Hasil perhitungan TOPSIS disimpan sebagai snapshot agar laporan lama tetap konsisten walaupun data master berubah.

Semua endpoint mutasi harus:

- Memvalidasi session Better Auth.
- Memvalidasi role melalui RBAC.
- Memvalidasi payload dengan Zod.
- Menulis audit log untuk aksi penting.
- Menggunakan soft delete untuk data operasional.

## 2. Output yang Dihasilkan

Tabel utama:

- `user`
- `session`
- `account`
- `verification`
- `roles`
- `user_roles`
- `criteria`
- `alternatives`
- `assessments`
- `ranking_runs`
- `ranking_results`
- `audit_logs`

Enum:

- `RoleCode`: `ADMIN`, `NUTRITIONIST`, `USER`
- `CriterionAttribute`: `BENEFIT`, `COST`
- `AuditAction`: `CREATE`, `UPDATE`, `DELETE`, `RESTORE`, `LOGIN`, `LOGOUT`, `CALCULATE_TOPSIS`, `EXPORT_REPORT`
- `RankingRunStatus`: `SUCCESS`, `FAILED`

Soft delete:

- `user`, `criteria`, `alternatives`, dan `assessments` menggunakan `deletedAt`.
- Query operasional wajib memfilter `deletedAt = null`.
- `ranking_runs` dan `ranking_results` tidak memakai soft delete karena berfungsi sebagai snapshot historis.

Indexing:

- `criteria(isActive, deletedAt)`
- `alternatives(isActive, deletedAt)`
- `assessments(alternativeId, criterionId)`
- `ranking_results(rankingRunId, rank)`
- `audit_logs(entityType, entityId)`

## REST API

### Auth

Better Auth menangani endpoint auth utama. Route internal aplikasi hanya perlu membaca session dan role.

```http
GET /api/auth/session
```

Response:

```json
{
  "user": {
    "id": "usr_01",
    "name": "Admin",
    "email": "admin@example.com",
    "roles": ["ADMIN"]
  }
}
```

### Criteria

```http
GET /api/criteria?search=garam&page=1&limit=10&sort=order.asc
```

Response:

```json
{
  "data": [
    {
      "id": "cri_salt",
      "code": "SALT",
      "name": "Garam",
      "weight": 4,
      "attribute": "BENEFIT",
      "order": 5,
      "isActive": true
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 1
  }
}
```

```http
POST /api/criteria
```

Access: `ADMIN`

Request:

```json
{
  "code": "SALT",
  "name": "Garam",
  "description": "Skor tinggi berarti kadar garam lebih rendah",
  "weight": 4,
  "attribute": "BENEFIT",
  "order": 5
}
```

Response:

```json
{
  "id": "cri_salt",
  "code": "SALT",
  "name": "Garam",
  "weight": 4,
  "attribute": "BENEFIT",
  "isActive": true
}
```

### Alternatives

```http
GET /api/alternatives?search=kentang&page=1&limit=10
```

Response:

```json
{
  "data": [
    {
      "id": "alt_kentang_kukus",
      "name": "Kentang Kukus",
      "slug": "kentang-kukus",
      "description": "Menu demo validasi jurnal",
      "imageUrl": null,
      "isDemo": true,
      "isActive": true
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 1
  }
}
```

```http
POST /api/alternatives
```

Access: `ADMIN`, `NUTRITIONIST`

Request:

```json
{
  "name": "Kentang Kukus",
  "description": "Menu demo validasi jurnal",
  "imageUrl": null,
  "isDemo": true
}
```

Response:

```json
{
  "id": "alt_kentang_kukus",
  "name": "Kentang Kukus",
  "slug": "kentang-kukus",
  "isDemo": true,
  "isActive": true
}
```

### Assessments

```http
POST /api/assessments/bulk
```

Access: `ADMIN`, `NUTRITIONIST`

Request:

```json
{
  "alternativeId": "alt_kentang_kukus",
  "items": [
    { "criterionId": "cri_carbohydrate", "score": 4, "note": "Seed sementara" },
    { "criterionId": "cri_protein", "score": 3, "note": "Seed sementara" },
    { "criterionId": "cri_fat", "score": 4, "note": "Seed sementara" },
    { "criterionId": "cri_processing", "score": 5, "note": "Dikukus" },
    { "criterionId": "cri_salt", "score": 5, "note": "0-1gr/100gr" }
  ]
}
```

Response:

```json
{
  "message": "Penilaian tersimpan",
  "alternativeId": "alt_kentang_kukus",
  "updatedCount": 5
}
```

### TOPSIS

```http
POST /api/topsis/calculate
```

Access: `ADMIN`, `NUTRITIONIST`

Request:

```json
{
  "mode": "ACTIVE_DATA"
}
```

Response:

```json
{
  "rankingRunId": "run_01",
  "status": "SUCCESS",
  "results": [
    {
      "rank": 1,
      "alternative": {
        "id": "alt_kentang_kukus",
        "name": "Kentang Kukus"
      },
      "dPositive": 0.1234,
      "dNegative": 0.2445,
      "preference": 0.6654
    }
  ]
}
```

### Rankings

```http
GET /api/rankings/latest
```

Access: `ADMIN`, `NUTRITIONIST`, `USER`

Response:

```json
{
  "rankingRunId": "run_01",
  "createdAt": "2026-05-22T00:00:00.000Z",
  "summary": {
    "totalAlternatives": 3,
    "totalCriteria": 5,
    "bestAlternative": "Kentang Kukus"
  },
  "results": [
    {
      "rank": 1,
      "alternativeName": "Kentang Kukus",
      "dPositive": 0.1234,
      "dNegative": 0.2445,
      "preference": 0.6654
    }
  ]
}
```

```http
GET /api/rankings/:id/detail
```

Access: `ADMIN`, `NUTRITIONIST`, `USER`

Response:

```json
{
  "criteriaSnapshot": [],
  "matrixSnapshot": [],
  "normalizedMatrix": [],
  "weightedMatrix": [],
  "idealPositive": {},
  "idealNegative": {},
  "results": []
}
```

### Reports

```http
GET /api/reports/rankings.pdf?rankingRunId=run_01
GET /api/reports/rankings.xlsx?rankingRunId=run_01
```

Access: `ADMIN`, `NUTRITIONIST`

Response:

- `application/pdf`
- `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`

### Audit Logs

```http
GET /api/audit-logs?action=CALCULATE_TOPSIS&page=1&limit=20
```

Access: `ADMIN`

Response:

```json
{
  "data": [
    {
      "id": "aud_01",
      "actorId": "usr_01",
      "action": "CALCULATE_TOPSIS",
      "entityType": "ranking_run",
      "entityId": "run_01",
      "metadata": {},
      "createdAt": "2026-05-22T00:00:00.000Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 1
  }
}
```

Error response standar:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Payload tidak valid",
    "fields": {
      "weight": "Bobot harus berada pada rentang 1 sampai 5"
    }
  }
}
```

## 3. File yang Akan Dibuat

File Phase 3:

- `docs/api.md`
- `prisma/schema.prisma`

File implementasi berikutnya:

- `prisma/seed.ts`
- `src/lib/db/prisma.ts`
- `src/lib/validations/criteria.ts`
- `src/lib/validations/alternative.ts`
- `src/lib/validations/assessment.ts`
- `src/lib/validations/topsis.ts`
- `src/server/repositories/*`
- `src/server/services/*`
- `src/app/api/*`

## 4. Langkah Berikutnya

Phase 4 membangun modul engine TOPSIS yang modular, deterministik, dan dapat diuji dengan seed data sementara serta data jurnal final saat tersedia.

READY FOR NEXT PHASE
