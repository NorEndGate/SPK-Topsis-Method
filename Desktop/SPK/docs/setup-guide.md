# Setup Guide - SPK Menu Hipertensi

Panduan lengkap untuk setup, konfigurasi, dan menjalankan aplikasi Sistem Pendukung Keputusan (SPK) pemilihan menu makanan sehat bagi penderita hipertensi menggunakan metode TOPSIS.

## Table of Contents

- [Overview Proyek](#overview-proyek)
- [Prerequisites](#prerequisites)
- [Instalasi Cepat](#instalasi-cepat)
- [Konfigurasi Environment](#konfigurasi-environment)
- [Setup Database](#setup-database)
- [Struktur Proyek](#struktur-proyek)
- [Development Environment](#development-environment)
- [Tech Stack Detail](#tech-stack-detail)
- [Arsitektur Aplikasi](#arsitektur-aplikasi)
- [Authentication & Authorization](#authentication--authorization)
- [TOPSIS Engine](#topsis-engine)
- [API Endpoints](#api-endpoints)
- [Script Commands](#script-commands)
- [Troubleshooting](#troubleshooting)
- [Next Steps](#next-steps)

---

## Overview Proyek

### Apa itu SPK Menu Hipertensi?

SPK Menu Hipertensi adalah aplikasi web berbasis **Sistem Pendukung Keputusan (SPK)** yang membantu penderita hipertensi dan ahli gizi dalam memilih menu makanan sehat secara sistematis menggunakan metode **TOPSIS (Technique for Order of Preference by Similarity to Ideal Solution)**.

### Tujuan Aplikasi

- Memberikan rekomendasi menu makanan yang terukur dan transparan.
- Mengevaluasi pilihan makanan berdasarkan 5 kriteria gizi utama.
- Mempermudah ahli gizi dalam mengelola data makanan dan penilaian.
- Membantu pengguna membuat keputusan yang lebih baik tentang menu sehari-hari.

### Fase Pengembangan

- ✅ **Phase 1**: Analisis produk
- ✅ **Phase 2**: Arsitektur dan struktur aplikasi
- ✅ **Phase 3**: Database dan dokumentasi REST API
- ✅ **Phase 4**: Engine TOPSIS
- ✅ **Phase 5**: UI/UX frontend
- ✅ **Phase 6**: Implementasi kode aplikasi (current)
- ⏳ **Phase 7**: Testing dan validasi
- ⏳ **Phase 8**: Deployment

---

## Prerequisites

Sebelum memulai, pastikan Anda memiliki:

### Software yang Wajib Diinstal

1. **Node.js** >= 18.17
   - Download dari [nodejs.org](https://nodejs.org/)
   - Verify: `node --version`

2. **npm** >= 9 (biasanya sudah included dengan Node.js)
   - Verify: `npm --version`

3. **Git** (untuk version control)
   - Download dari [git-scm.com](https://git-scm.com/)
   - Verify: `git --version`

4. **PostgreSQL** >= 12 (untuk development lokal)
   - Download dari [postgresql.org](https://www.postgresql.org/download/)
   - Atau gunakan layanan cloud seperti Neon, Supabase, Railway
   - Verify: `psql --version`

### Text Editor / IDE

- **VS Code** (recommended) + Prisma extension
- **WebStorm** / IntelliJ
- **Neovim** dengan LSP setup

### Knowledge Requirements

- Dasar Next.js dan React
- Familiar dengan TypeScript
- Pemahaman tentang REST API
- Basic SQL dan database concepts

---

## Instalasi Cepat

### Langkah 1: Clone Repository

```bash
cd ~/Desktop
git clone <repository-url> SPK
cd SPK
```

### Langkah 2: Install Dependencies

```bash
npm install
```

**Waktu**: Biasanya 2-5 menit tergantung kecepatan internet.

### Langkah 3: Generate Prisma Client

```bash
npm run prisma:generate
```

### Langkah 4: Setup Environment File

```bash
# Copy .env.example ke .env
cp .env.example .env

# Edit .env dan isi DATABASE_URL
# Contoh:
# DATABASE_URL="postgresql://user:password@localhost:5432/spk_dev"
```

### Langkah 5: Setup Database

```bash
# Create database dan migration
npm run prisma:migrate

# Seed roles awal
npm run prisma:seed
```

### Langkah 6: Run Development Server

```bash
npm run dev
```

Aplikasi akan berjalan di `http://localhost:3000`

---

## Konfigurasi Environment

### File .env.example

Buat file `.env` di root project:

```env
# DATABASE
DATABASE_URL="postgresql://user:password@localhost:5432/spk_dev"

# BETTER AUTH
BETTER_AUTH_URL="http://localhost:3000"
BETTER_AUTH_SECRET="your-super-secret-key-min-32-chars-change-in-production"

# NODE ENV
NODE_ENV="development"
```

### Menjelaskan Setiap Variable

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host:5432/db` |
| `BETTER_AUTH_URL` | Base URL aplikasi untuk auth | `http://localhost:3000` |
| `BETTER_AUTH_SECRET` | Secret key untuk signing (min 32 chars) | Auto-generated |
| `NODE_ENV` | Environment mode | `development` / `production` |

### Setup Database URL

**Option 1: PostgreSQL Lokal**

```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/spk_dev"
```

**Option 2: Neon (Cloud PostgreSQL)**

1. Buat akun di [neon.tech](https://neon.tech/)
2. Create project baru
3. Copy connection string

```env
DATABASE_URL="postgresql://user:password@ep-xxx.neon.tech/spk_dev"
```

**Option 3: Supabase**

1. Buat project di [supabase.com](https://supabase.com/)
2. Ambil connection string dari Settings > Database

```env
DATABASE_URL="postgresql://user:password@db.xxx.supabase.co:5432/postgres"
```

---

## Setup Database

### Opsi 1: PostgreSQL Lokal (Windows)

#### Install PostgreSQL

1. Download dari [postgresql.org](https://www.postgresql.org/download/windows/)
2. Install dengan default settings atau custom port
3. Catat username (default: `postgres`) dan password

#### Create Database

```bash
# Buka psql atau pgAdmin
psql -U postgres

# Di dalam psql shell
CREATE DATABASE spk_dev;
\q
```

#### Update .env

```env
DATABASE_URL="postgresql://postgres:your_password@localhost:5432/spk_dev"
```

### Opsi 2: PostgreSQL via Docker (Recommended)

#### Jika Docker sudah terinstal

```bash
# Run PostgreSQL container
docker run --name postgres-spk \
  -e POSTGRES_PASSWORD=postgres_password \
  -e POSTGRES_DB=spk_dev \
  -p 5432:5432 \
  -d postgres:16

# Verify running
docker ps
```

#### Update .env

```env
DATABASE_URL="postgresql://postgres:postgres_password@localhost:5432/spk_dev"
```

### Prisma Migration

```bash
# Generate & apply migrations
npm run prisma:migrate

# Verify schema di database
npx prisma studio
```

### Seed Roles Awal

```bash
# Seed role dasar untuk akses awal aplikasi
npm run prisma:seed
```

**Apa yang di-seed:**

- 3 Roles: `ADMIN`, `NUTRITIONIST`, `USER`

**Catatan:**

- Data master `criteria` dan `alternatives` diinput melalui menu CRUD pada aplikasi.
- Seed tidak lagi membuat kriteria, alternatif, atau assessment demo.

---

## Struktur Proyek

```
SPK/
├── docs/                          # Dokumentasi lengkap
│   ├── phase-1-product-analysis.md
│   ├── phase-6-implementation.md
│   ├── architecture.md
│   ├── api.md
│   ├── topsis-flow.md
│   ├── ui-ux.md
│   └── setup-guide.md (← Anda di sini)
│
├── prisma/                        # Database & ORM
│   ├── schema.prisma              # Database schema
│   ├── seed.ts                    # Seed data script
│   └── migrations/                # Database migrations
│
├── src/
│   ├── app/                       # Next.js App Router
│   │   ├── globals.css
│   │   ├── layout.tsx             # Root layout
│   │   │
│   │   ├── (public)/              # Public pages (no auth)
│   │   │   ├── page.tsx           # Landing page
│   │   │   └── login/
│   │   │       └── page.tsx       # Login page
│   │   │
│   │   ├── (dashboard)/           # Protected dashboard
│   │   │   ├── layout.tsx         # Dashboard layout (sidebar + topbar)
│   │   │   ├── dashboard/         # Home/overview
│   │   │   ├── criteria/          # Manage criteria
│   │   │   ├── alternatives/      # Manage food items
│   │   │   ├── assessments/       # Input scores
│   │   │   ├── rankings/          # View results
│   │   │   ├── reports/           # Export reports
│   │   │   ├── settings/          # Profile & settings
│   │   │   └── audit-logs/        # Activity logs
│   │   │
│   │   └── api/                   # REST API routes
│   │       ├── auth/              # Authentication endpoints
│   │       ├── criteria/          # Criteria CRUD
│   │       ├── alternatives/      # Alternatives CRUD
│   │       ├── assessments/       # Assessments CRUD
│   │       ├── rankings/          # Rankings & history
│   │       ├── topsis/            # TOPSIS calculation
│   │       ├── reports/           # Report export
│   │       └── audit-logs/        # Audit log queries
│   │
│   ├── components/                # Reusable components
│   │   ├── layout/
│   │   │   ├── app-sidebar.tsx   # Navigation sidebar
│   │   │   └── app-topbar.tsx    # Header/topbar
│   │   │
│   │   ├── charts/
│   │   │   └── ranking-chart.tsx # Recharts visualization
│   │   │
│   │   ├── shared/
│   │   │   ├── empty-state.tsx
│   │   │   ├── error-state.tsx
│   │   │   ├── loading-state.tsx
│   │   │   ├── page-header.tsx
│   │   │   ├── stat-card.tsx
│   │   │   └── preference-badge.tsx
│   │   │
│   │   └── topsis/
│   │       └── matrix-table.tsx   # Decision matrix display
│   │
│   ├── lib/
│   │   ├── auth/
│   │   │   └── auth.ts            # Better Auth configuration
│   │   │
│   │   ├── db/
│   │   │   └── prisma.ts          # Prisma singleton
│   │   │
│   │   ├── rbac/
│   │   │   └── permissions.ts     # Role-based access control
│   │   │
│   │   ├── topsis/
│   │   │   ├── engine.ts          # ★ Core TOPSIS algorithm
│   │   │   ├── types.ts           # Type definitions
│   │   │   ├── index.ts           # Exports
│   │   │   └── seed-demo.ts       # Demo data
│   │   │
│   │   ├── validations/
│   │   │   ├── topsis.ts
│   │   │   ├── criteria.ts
│   │   │   ├── alternative.ts
│   │   │   ├── assessment.ts
│   │   │   └── common.ts
│   │   │
│   │   ├── export/
│   │   │   └── report.ts          # Report generation
│   │   │
│   │   └── utils.ts               # Utility functions
│   │
│   ├── server/
│   │   ├── services/
│   │   │   └── topsis-service.ts  # TOPSIS business logic
│   │   │
│   │   └── repositories/
│   │       └── demo-repository.ts # Data access layer
│   │
│   └── types/
│       └── api.ts                 # Shared API types
│
├── scripts/
│   └── check-db.cjs               # Database validation script
│
├── public/                        # Static assets (images, fonts, etc)
│
├── .env.example                   # Environment template
├── .env                           # ⚠️ Local environment (git-ignored)
├── next.config.ts                 # Next.js configuration
├── tsconfig.json                  # TypeScript configuration
├── tailwind.config.ts             # TailwindCSS configuration
├── postcss.config.mjs             # PostCSS configuration
├── package.json                   # Dependencies & scripts
├── package-lock.json              # Locked dependency versions
├── README.md                       # Project overview
├── PRD.md                         # Product requirements document
└── next-env.d.ts                  # Next.js type definitions
```

### File Penting untuk Development

| File | Purpose |
|------|---------|
| `src/lib/topsis/engine.ts` | Logic perhitungan TOPSIS (jantung aplikasi) |
| `src/lib/auth/auth.ts` | Authentication setup menggunakan Better Auth |
| `src/lib/rbac/permissions.ts` | Role-based access control configuration |
| `prisma/schema.prisma` | Database schema definition |
| `src/app/api/topsis/calculate/route.ts` | API endpoint untuk calculate ranking |
| `src/server/services/topsis-service.ts` | Service layer TOPSIS |

---

## Development Environment

### Run Development Server

```bash
npm run dev
```

Output:
```
> spk-menu-hipertensi@0.1.0 dev
> next dev

  ▲ Next.js 15.3.2
  - Local:        http://localhost:3000
  - Network:      http://192.168.x.x:3000

✓ Ready in 2.1s
```

Akses aplikasi: **http://localhost:3000**

### Access Aplikasi

| Route | Description |
|-------|-------------|
| `/` | Landing page |
| `/login` | Login page |
| `/dashboard` | Dashboard overview (protected) |
| `/criteria` | Manage criteria (ADMIN only) |
| `/alternatives` | Manage food items |
| `/assessments` | Input scores |
| `/rankings` | View ranking results |
| `/rankings/demo` | Demo ranking detail |
| `/reports` | Export reports |
| `/settings` | Profile settings |

### Prisma Studio (Visual Database Editor)

```bash
# Open interactive database editor
npx prisma studio

# Akan membuka http://localhost:5555
```

Gunakan Prisma Studio untuk:
- Browse data
- Edit records
- Test queries
- Visualize relationships

### TypeScript Checking

```bash
# Check TypeScript errors (tanpa compile)
npm run typecheck
```

### Linting

```bash
# Run Next.js linting
npm run lint
```

---

## Tech Stack Detail

### Frontend

| Technology | Version | Purpose |
|------------|---------|---------|
| **React** | 19.1.0 | UI library |
| **Next.js** | 15.3.2 | App framework & API routes |
| **TypeScript** | 5.8.3 | Static typing |
| **TailwindCSS** | 3.4.17 | CSS utility-first styling |
| **shadcn/ui** | Latest | Pre-built accessible components |
| **Lucide React** | 0.511.0 | Icon library |
| **Recharts** | 2.15.3 | React charting library |
| **Framer Motion** | 12.12.1 | Animation library |

### Backend

| Technology | Version | Purpose |
|------------|---------|---------|
| **Node.js** | 18+ | JavaScript runtime |
| **Next.js API Routes** | 15.3.2 | Serverless API endpoints |
| **Better Auth** | 1.2.8 | Authentication & sessions |

### Database & ORM

| Technology | Version | Purpose |
|------------|---------|---------|
| **PostgreSQL** | 12+ | Database |
| **Prisma** | 6.8.2 | ORM & migrations |

### Validation & Forms

| Technology | Version | Purpose |
|------------|---------|---------|
| **Zod** | 3.25.28 | Schema validation |
| **React Hook Form** | 7.56.4 | Form state management |

### Build & Dev Tools

| Technology | Version | Purpose |
|------------|---------|---------|
| **TypeScript** | 5.8.3 | Static type checking |
| **PostCSS** | 8.5.3 | CSS processing |
| **Autoprefixer** | 10.4.21 | CSS vendor prefixes |

---

## Arsitektur Aplikasi

### Architecture Diagram

```
┌─────────────────────────────────────────────────┐
│            Browser (User Interface)             │
├─────────────────────────────────────────────────┤
│        Next.js App Router (React Pages)         │
│  (/dashboard, /rankings, /alternatives, etc)    │
├─────────────────────────────────────────────────┤
│    REST API Route Handlers (/api/topsis, etc)   │
│  - Validation (Zod)                             │
│  - Authorization (RBAC)                         │
├─────────────────────────────────────────────────┤
│    Service Layer (Business Logic)               │
│  - topsis-service.ts                            │
│  - calculateTopsis()                            │
├─────────────────────────────────────────────────┤
│    TOPSIS Engine (Core Algorithm)               │
│  - src/lib/topsis/engine.ts                     │
│  - Normalize, Weight, Ideal Solution, Rank      │
├─────────────────────────────────────────────────┤
│  Prisma ORM & Database Layer                    │
│  - Query builder, migrations, seed              │
├─────────────────────────────────────────────────┤
│         PostgreSQL Database                     │
│  (users, criteria, alternatives, assessments)   │
└─────────────────────────────────────────────────┘
```

### Data Flow: TOPSIS Calculation

```
User clicks "Lihat Ranking"
        ↓
Frontend calls POST /api/topsis/calculate
        ↓
API validates user permission (RBAC)
        ↓
Service loads:
  - Active criteria
  - Active alternatives
  - Assessment scores
        ↓
TOPSIS Engine processes:
  1. Build decision matrix
  2. Normalize scores
  3. Apply weights
  4. Calculate ideal solutions (+/-)
  5. Calculate Euclidean distance
  6. Calculate preference (Vi)
  7. Rank alternatives
        ↓
Service returns results
        ↓
API returns JSON response
        ↓
Frontend displays ranking table & charts
```

---

## Authentication & Authorization

### How Authentication Works

1. **User Login**
   - Username: `admin@demo.local`
   - Password: Any (demo mode)

2. **Better Auth Session**
   - Creates session token
   - Stores in secure cookie
   - Returns user data with roles

3. **RBAC (Role-Based Access Control)**
   - Maps roles to permissions
   - Checks permission on each API call
   - Hides UI elements based on role

### Roles & Permissions

#### Role: ADMIN

Permissions: Semua fitur
```typescript
ADMIN: [
  "dashboard:read",
  "users:manage",
  "criteria:manage",
  "alternatives:manage",
  "assessments:manage",
  "topsis:calculate",
  "rankings:read",
  "reports:export",
  "audit:read"
]
```

#### Role: NUTRITIONIST (Ahli Gizi)

Permissions: Manage data, bukan user
```typescript
NUTRITIONIST: [
  "dashboard:read",
  "criteria:read",
  "alternatives:manage",
  "assessments:manage",
  "topsis:calculate",
  "rankings:read",
  "reports:export"
]
```

#### Role: USER (Pengguna Biasa)

Permissions: Read-only access
```typescript
USER: [
  "dashboard:read",
  "criteria:read",
  "alternatives:read",
  "assessments:read",
  "rankings:read"
]
```

### Check Permission di Code

```typescript
import { assertPermission } from "@/lib/rbac/permissions";

// In API route
const user = await getCurrentUser();
assertPermission(user.roles, "topsis:calculate"); // Throws error if not permitted
```

---

## TOPSIS Engine

### Apa itu TOPSIS?

**TOPSIS** = Technique for Order of Preference by Similarity to Ideal Solution

Metode pengambilan keputusan yang mengevaluasi alternatif (makanan) berdasarkan:
- Kedekatannya ke **Solusi Ideal Positif** (pilihan terbaik)
- Kejauhan dari **Solusi Ideal Negatif** (pilihan terburuk)

### Langkah-Langkah Perhitungan

#### 1. Decision Matrix (Matriks Keputusan)

Matriks yang berisi skor setiap alternatif pada setiap kriteria.

```
           Karbohidrat  Protein  Lemak  Pengolahan  Garam
Kentang         4         3       2        5         4
Bubur            3         4       3        4         3
Kacang           3         5       2        3         4
```

#### 2. Normalisasi

Konversi skor ke nilai terstandar 0-1 menggunakan rumus:

```
r_ij = x_ij / √(Σ x_ij²)
```

#### 3. Weighted Normalized Matrix (Matriks Terbobot)

Kalikan setiap nilai ternormalisasi dengan bobot kriteria:

```
v_ij = w_j × r_ij
```

#### 4. Ideal Solutions (Solusi Ideal ± dan -)

- **Ideal Positive (A+)**: nilai maksimal dari setiap kolom
- **Ideal Negative (A-)**: nilai minimal dari setiap kolom

#### 5. Euclidean Distance (Jarak)

Hitung jarak setiap alternatif ke ideal solutions:

```
D_i+ = √(Σ(v_ij - v_j+)²)
D_i- = √(Σ(v_ij - v_j-)²)
```

#### 6. Preference Value (Nilai Preferensi)

Nilai kedekatan ke ideal solution (0-1):

```
V_i = D_i- / (D_i+ + D_i-)
```

Semakin tinggi V_i → semakin baik alternatif

#### 7. Ranking

Sort alternatif berdasarkan V_i descending.

### Example Seed Data

5 Kriteria:
- Karbohidrat (BENEFIT, bobot 2)
- Protein (BENEFIT, bobot 4)
- Lemak (BENEFIT, bobot 3)
- Pengolahan (BENEFIT, bobot 5)
- Garam (BENEFIT, bobot 4)

3 Alternatif:
- Kentang Kukus → V_i = 0.6654 (Rank 1)
- Bubur Kacang Hijau → V_i = 0.6373 (Rank 2)
- Kacang Merah → V_i = 0.6013 (Rank 3)

### Mengakses TOPSIS Engine

```typescript
import { calculateTopsis, roundTopsisResult } from "@/lib/topsis";

const result = calculateTopsis({
  criteria: [
    { id: "1", code: "CARBS", name: "Karbohidrat", weight: 2, attribute: "BENEFIT" },
    // ...
  ],
  alternatives: [
    { id: "alt1", name: "Kentang Kukus", scores: { "1": 4, "2": 3, ... } },
    // ...
  ]
});

// Round hasil ke 4 desimal
const rounded = roundTopsisResult(result, 4);

// Access results
rounded.results.forEach(item => {
  console.log(`${item.alternativeName}: ${item.preference}`);
});
```

---

## API Endpoints

### Authentication

```
POST /api/auth/sign-in
POST /api/auth/sign-out
GET /api/auth/session
```

### Criteria Management

```
GET /api/criteria                  # List all criteria
POST /api/criteria                 # Create criterion
GET /api/criteria/:id              # Get single criterion
PATCH /api/criteria/:id            # Update criterion
DELETE /api/criteria/:id           # Delete criterion
```

### Alternatives Management

```
GET /api/alternatives              # List all alternatives
POST /api/alternatives             # Create alternative
GET /api/alternatives/:id          # Get single alternative
PATCH /api/alternatives/:id        # Update alternative
DELETE /api/alternatives/:id       # Delete alternative
```

### Assessments Input

```
GET /api/assessments               # List assessments
POST /api/assessments              # Create assessment
POST /api/assessments/bulk         # Bulk create assessments
PATCH /api/assessments/:id         # Update assessment
DELETE /api/assessments/:id        # Delete assessment
```

### TOPSIS Calculation ⭐

```
POST /api/topsis/calculate
```

**Request Body:**
```json
{
  "mode": "DEMO"
}
```

**Response:**
```json
{
  "status": "SUCCESS",
  "rankingRunId": "demo-ranking-run",
  "createdAt": "2026-05-22T10:00:00Z",
  "summary": {
    "totalAlternatives": 3,
    "totalCriteria": 5,
    "bestAlternative": "Kentang Kukus"
  },
  "calculation": {
    "criteriaSnapshot": [...],
    "matrixSnapshot": [...],
    "normalizedMatrix": [...],
    "weightedMatrix": [...],
    "idealPositive": {...},
    "idealNegative": {...},
    "results": [
      {
        "alternativeId": "...",
        "alternativeName": "Kentang Kukus",
        "preference": 0.6654,
        "dPositive": 0.1234,
        "dNegative": 0.2345,
        "rank": 1
      },
      ...
    ]
  }
}
```

### Rankings

```
GET /api/rankings                  # List ranking runs
GET /api/rankings/latest           # Get latest ranking
GET /api/rankings/:id              # Get specific ranking
GET /api/rankings/:id/detail       # Get ranking with calculation details
```

### Reports

```
GET /api/reports/rankings.pdf      # Export as PDF
GET /api/reports/rankings.xlsx     # Export as Excel
```

### Audit Logs

```
GET /api/audit-logs                # List all audit logs
```

---

## Script Commands

### Available npm Scripts

```bash
# Development
npm run dev                 # Start development server (http://localhost:3000)

# Building
npm run build               # Build for production
npm start                   # Start production server

# TypeScript
npm run typecheck           # Check TypeScript errors

# Linting
npm run lint                # Run ESLint

# Database
npm run prisma:generate     # Generate Prisma client
npm run prisma:migrate      # Create & apply migrations (dev)
npm run prisma:seed         # Run seed script

# Utilities
npm run check-db            # Verify database connection
```

### Prisma Commands

```bash
# View/edit database
npx prisma studio

# Create new migration
npx prisma migrate dev --name add_new_field

# Reset database (WARNING: loses all data)
npx prisma migrate reset

# View schema in UI
npx prisma generate
```

---

## Troubleshooting

### Common Issues & Solutions

#### 1. "DATABASE_URL not found" error

**Problem**: Environment variable tidak terbaca
```
Error: DATABASE_URL environment variable not found
```

**Solution**:
```bash
# Pastikan .env file ada di root project
ls -la .env

# Verify DATABASE_URL terisi
cat .env | grep DATABASE_URL

# Restart dev server
npm run dev
```

#### 2. "Cannot connect to database"

**Problem**: PostgreSQL service tidak running atau connection string salah
```
Error: Connect ECONNREFUSED 127.0.0.1:5432
```

**Solution**:
```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Start PostgreSQL (jika stopped)
sudo systemctl start postgresql

# Verify connection
psql -U postgres -h localhost

# Test with correct DATABASE_URL
psql "postgresql://postgres:password@localhost:5432/spk_dev"
```

#### 3. "Migration failed"

**Problem**: Schema migration error
```
Error: P3005 - Database does not have a `public` schema
```

**Solution**:
```bash
# Reset database (warning: loses data)
npx prisma migrate reset

# Or manually create schema
psql -U postgres -d spk_dev -c "CREATE SCHEMA public;"
npm run prisma:migrate
```

#### 4. "Module not found" errors

**Problem**: Dependencies tidak terinstall
```
Error: Cannot find module '@prisma/client'
```

**Solution**:
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Generate Prisma client
npm run prisma:generate
```

#### 5. Port 3000 already in use

**Problem**: Port sudah digunakan aplikasi lain
```
Error: listen EADDRINUSE: address already in use :::3000
```

**Solution**:
```bash
# Run on different port
PORT=3001 npm run dev

# Or kill existing process on port 3000
# Linux/Mac:
lsof -ti:3000 | xargs kill -9

# Windows (PowerShell):
Get-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess | Stop-Process
```

#### 6. TypeScript compilation errors

**Problem**: Type checking errors
```
Error: Type 'X' is not assignable to type 'Y'
```

**Solution**:
```bash
# Check errors
npm run typecheck

# Fix errors in code or update types

# If using strict mode, may need to add type annotations
```

#### 7. Prisma Client out of sync

**Problem**: Prisma client tidak match dengan schema
```
Error: @prisma/client did not initialize yet
```

**Solution**:
```bash
# Regenerate Prisma client
npm run prisma:generate

# Or clean & reinstall
rm -rf node_modules/.prisma
npm install
npm run prisma:generate
```

### Debug Mode

```bash
# Run with debug logs
DEBUG=* npm run dev

# Or specific debug namespace
DEBUG=prisma:* npm run dev

# For API debugging, check browser console
# Network tab -> Preview tab untuk lihat response
```

### Check Database Connection

```bash
# Run connection check script
npm run check-db

# Expected output:
# ✓ Database connection successful
# ✓ Tables created: user, session, criteria, alternatives, assessments
```

---

## Next Steps

### Phase 7: Testing & Validasi

Tahap berikutnya akan fokus pada:

1. **Unit Testing**
   - TOPSIS engine logic
   - Zod schema validation
   - Helper functions

2. **Integration Testing**
   - API endpoints
   - Database operations
   - Authentication flow

3. **Validasi Hasil**
   - Seed data validation terhadap jurnal
   - Akurasi perhitungan V_i
   - Edge cases (empty data, invalid scores, etc)

4. **E2E Testing**
   - User workflows
   - Permission checks
   - Error handling

### Setup Testing (Preview)

```bash
# Install testing dependencies
npm install --save-dev @testing-library/react @testing-library/jest-dom jest @types/jest vitest

# Create test files
# src/lib/topsis/engine.test.ts
# src/app/api/topsis/calculate/__tests__/route.test.ts
```

### Phase 8: Deployment

Persiapan production:

1. **Environment Setup**
   - Configure `.env.production`
   - Setup production database (Neon, Railway, Vercel Postgres)
   - Generate new BETTER_AUTH_SECRET

2. **Build & Deploy**
   - `npm run build`
   - Deploy ke Vercel, Railway, atau platform lain
   - Setup CI/CD pipeline

3. **Monitoring**
   - Error tracking (Sentry)
   - Performance monitoring
   - Analytics

### Useful Resources

- **Next.js Docs**: https://nextjs.org/docs
- **Prisma Docs**: https://www.prisma.io/docs
- **TailwindCSS**: https://tailwindcss.com/docs
- **Better Auth**: https://better-auth.com
- **Zod Validation**: https://zod.dev
- **PostgreSQL**: https://www.postgresql.org/docs

---

## Quick Reference

### File `.env` Template

```env
# Database
DATABASE_URL="postgresql://postgres:password@localhost:5432/spk_dev"

# Authentication
BETTER_AUTH_URL="http://localhost:3000"
BETTER_AUTH_SECRET="change-me-to-random-32-character-string"

# Environment
NODE_ENV="development"
```

### Essential Commands Cheat Sheet

```bash
# Setup
npm install
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed

# Development
npm run dev                    # Start server
npm run typecheck             # Check types
npm run lint                  # Run linter

# Database
npx prisma studio            # Visual editor
npx prisma migrate reset      # ⚠️ Reset (loses data)

# Debugging
npm run check-db              # Check DB connection
DEBUG=* npm run dev           # Run with debug logs
```

### Ports

- **3000**: Development server
- **5432**: PostgreSQL default port
- **5555**: Prisma Studio

### Demo Credentials (Phase 6)

- **Username**: `admin@demo.local`
- **Password**: Any (demo mode tidak validate)
- **Role**: ADMIN

---

## Summary

Anda sekarang sudah siap untuk:

1. ✅ Setup development environment
2. ✅ Configure database
3. ✅ Menjalankan aplikasi secara lokal
4. ✅ Memahami arsitektur TOPSIS
5. ✅ Explore API endpoints
6. ✅ Develop new features
7. ✅ Troubleshoot common issues

**Untuk pertanyaan lebih lanjut**, refer ke dokumentasi di `/docs` folder atau check file-file source di `src/` directory.

**Happy coding! 🚀**
