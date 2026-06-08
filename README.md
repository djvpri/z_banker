# 🏦 Z Banker — Bank Manager Simulator

Game simulasi manajemen bank Indonesia yang dibangun dengan Next.js 14, Supabase, dan NextAuth.

---

## 🚀 Quick Start

### 1. Clone / Copy project
```bash
# Copy folder ini ke lokasi kamu
# Contoh: C:\Users\Anjuv\OneDrive\Documents\zomet\z_banker
```

### 2. Install dependencies
```bash
cd z_banker
npm install
```

### 3. Setup Supabase (project baru)
1. Buka [supabase.com](https://supabase.com) → New Project
2. Nama project: `z-banker`
3. Region: Southeast Asia (Singapore)
4. Setelah dibuat, ke **Settings → Database** → copy connection strings

### 4. Setup Google OAuth
1. Buka [console.cloud.google.com](https://console.cloud.google.com)
2. Create Project → APIs & Services → Credentials
3. Create OAuth 2.0 Client ID (Web application)
4. Authorized redirect URIs: `http://localhost:3000/api/auth/callback/google`
5. Copy Client ID & Secret

### 5. Environment variables
```bash
cp .env.example .env.local
```
Isi `.env.local` dengan nilai dari langkah 3 & 4:
```env
DATABASE_URL="postgresql://postgres.[ref]:[password]@..."
DIRECT_URL="postgresql://postgres.[ref]:[password]@..."
NEXT_PUBLIC_SUPABASE_URL="https://[ref].supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="..."
SUPABASE_SERVICE_ROLE_KEY="..."
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="..."   # jalankan: openssl rand -base64 32
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."
```

### 6. Setup database
```bash
npm run db:push      # Push schema ke Supabase
npm run db:generate  # Generate Prisma client
```

### 7. Jalankan development server
```bash
npm run dev
```
Buka [http://localhost:3000](http://localhost:3000)

---

## 📁 Struktur Project

```
z_banker/
├── prisma/
│   └── schema.prisma        # Database schema (User, GameSave, Leaderboard, DailyChallenge)
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth/        # NextAuth handler
│   │   │   ├── game/save/   # Auto-save endpoint
│   │   │   ├── leaderboard/ # Global leaderboard
│   │   │   └── daily-challenge/ # Daily challenge system
│   │   ├── dashboard/       # Main game page (protected)
│   │   ├── leaderboard/     # Leaderboard page
│   │   ├── auth/            # Sign in page
│   │   └── page.tsx         # Landing page
│   ├── components/
│   │   ├── game/
│   │   │   ├── GameShell.tsx      # Main game wrapper
│   │   │   ├── Tutorial.tsx       # Interactive tutorial
│   │   │   ├── DifficultyModal.tsx# Difficulty selector
│   │   │   └── tabs/              # All game tab components
│   │   │       ├── DashboardTab.tsx
│   │   │       ├── AntrianTab.tsx
│   │   │       ├── PortofolioTab.tsx
│   │   │       ├── ProspekTab.tsx
│   │   │       ├── TimTab.tsx
│   │   │       ├── AnalitikTab.tsx
│   │   │       ├── RegulasiTab.tsx
│   │   │       ├── EkspansiTab.tsx
│   │   │       ├── ProdukTab.tsx
│   │   │       ├── InvestasiTab.tsx
│   │   │       ├── CamelsTab.tsx
│   │   │       ├── AchievementTab.tsx
│   │   │       ├── LaporanTab.tsx
│   │   │       ├── GrafikTab.tsx
│   │   │       ├── CabangTab.tsx
│   │   │       ├── KompetitorTab.tsx
│   │   │       └── BungaTab.tsx
│   │   └── layout/
│   │       ├── LandingPage.tsx
│   │       └── SessionProvider.tsx
│   ├── hooks/
│   │   ├── useAutoSave.ts   # Auto-save to Supabase
│   │   └── useSound.ts      # Web Audio API sound effects
│   ├── lib/
│   │   ├── auth.ts          # NextAuth config
│   │   └── prisma.ts        # Prisma client
│   ├── store/
│   │   └── gameStore.ts     # Zustand game state (with localStorage persist)
│   └── types/
│       └── game.ts          # TypeScript types + difficulty config + tutorial steps
```

---

## 🎮 Fitur Game

| Fitur | Deskripsi |
|-------|-----------|
| 🔐 Login Google | NextAuth dengan Prisma adapter |
| 💾 Auto-Save | Simpan ke Supabase tiap hari berganti |
| 🏆 Leaderboard | Global ranking by total profit |
| 📅 Daily Challenge | Challenge baru tiap hari |
| 🎓 Tutorial | Step-by-step panduan untuk pemula |
| ⚙️ Difficulty | Easy / Normal / Hard dengan config berbeda |
| 🌙 Dark/Light Mode | Toggle tema |
| 🔊 Sound Effects | Web Audio API (no file needed) |
| 🌍 Ekspansi | Buka cabang 6 kota + akuisisi bank |
| ⚖️ Regulasi | LPS, BMPK, Stress Test OJK |
| 📊 CAMELS | Rating kesehatan bank standar BI |
| 🔬 Analitik | Segmentasi, Heatmap, Forecast NPL |

---

## 🚢 Deploy ke Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables di Vercel Dashboard
# Settings → Environment Variables → add semua dari .env.local
```

Untuk production Google OAuth, tambahkan:
```
https://z-banker.vercel.app/api/auth/callback/google
```
ke Authorized redirect URIs di Google Console.

---

## 📝 Cara Konversi Game Logic dari Artifact

Game logic utama ada di artifact `bank-manager-simulator.jsx`. Untuk konversi ke Next.js:

1. Copy semua konstanta (EVENTS, ALL_PRODUCTS, CITIES, dll) ke `src/lib/gameConstants.ts`
2. Copy `advanceDay` logic ke `src/hooks/useAdvanceDay.ts` 
3. Ganti semua `useState` dengan `useGameStore()` dari Zustand
4. Split setiap tab jadi component di `src/components/game/tabs/`
5. Import semua tabs di `GameShell.tsx`

Setiap tab sudah punya struktur yang sama — tinggal potong per tab dari artifact.

---

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Database**: Supabase (PostgreSQL) + Prisma ORM  
- **Auth**: NextAuth.js + Google OAuth
- **State**: Zustand (dengan localStorage persist)
- **Animation**: Framer Motion
- **Sound**: Web Audio API (no files needed)
- **Styling**: Tailwind CSS + inline styles
- **Charts**: Recharts
- **Types**: TypeScript

---

## 💡 Tips Development

```bash
# Lihat database via Prisma Studio
npm run db:studio

# Reset database (hati-hati!)
npx prisma migrate reset

# Generate types setelah ubah schema
npm run db:generate
```
