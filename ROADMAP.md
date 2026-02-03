# THE FINITE LIFE — Living Roadmap

> A "Quiet Luxury" Memento Mori PWA (4000 Weeks)
> Last Updated: 2026-02-03

---

## Phase 1: Foundation Setup

- [x] **1.1** Next.js 14 project initialized + Shadcn UI ✓
- [x] **1.2** Dependencies installed + Tailwind luxury theme configured ✓
- [x] **1.3** PWA manifest.ts created (standalone, theme colors) ✓
- [x] **1.4** iOS-specific metadata configured (apple-touch-icon, viewport) ✓

## Phase 2: Database Schema (Supabase)

**Project:** `tracker` (lwwaixrcpfbrifgksuox) — eu-central-2

- [x] **2.1** `user_settings` table migrated ✓
- [x] **2.2** `tasks` table migrated (recursive parent_id) ✓
- [x] **2.3** Row Level Security policies applied ✓

## Phase 3: Core UI Components

- [x] **3.1** File structure established (components/, features/, lib/) ✓
- [x] **3.2** LifeGrid SVG component (4160 `<rect>` elements, 60fps mobile) ✓
  - **Fixed 2026-02-03:** Removed framer-motion from cells, single container fade only
- [x] **3.3** LuxuryWrapper layout (paper texture, Playfair headers) ✓
- [x] **3.4** MinusOneButton with `useOptimistic` (0ms UI latency) ✓
- [x] **3.5** Header component with auth state (Login/Sign Out) ✓
- [x] **3.6** Loading state (`loading.tsx`) with luxury spinner ✓

## Phase 4: Core Logic

- [x] **4.1** Date math utilities (weeks lived, adjusted deadlines) ✓
- [x] **4.2** Server Actions (createTask, updateTask, decrementDeadline) ✓
- [x] **4.3** Optimistic state management + Zod validation ✓

## Phase 4.5: Authentication

- [x] **4.5.1** Middleware for session refresh (`middleware.ts`) ✓
- [x] **4.5.2** Login page with Sign In / Sign Up toggle ✓
- [x] **4.5.3** Magic link support ✓
- [x] **4.5.4** Auth callback route (`/auth/callback`) ✓

## Phase 4.6: User Input & Onboarding

- [x] **4.6.1** Reorder `page.tsx`: Tasks MUST be visible immediately (Productivity first, Philosophy second) ✓
- [x] **4.6.2** Create `CreateTask.tsx`: A clean, high-end input field at the top of the task list ✓
- [x] **4.6.3** Create `SettingsDialog.tsx`: A modal to set `birth_date` (Critical for LifeGrid accuracy) ✓
- [x] **4.6.4** Onboarding Logic: Force-open Settings Dialog if `birth_date` is null ✓

## Phase 5: Polish & Deploy

- [x] **5.1** Framer Motion page transitions ✓
- [ ] **5.2** Offline mode / Service Worker
- [ ] **5.3** Vercel deployment + domain config

---

## Design Tokens

| Token       | Value     | Usage                |
|-------------|-----------|----------------------|
| Sand        | `#F5F5F0` | Background, surfaces |
| Charcoal    | `#1A1A1A` | Text, filled weeks   |
| Header Font | Playfair Display | H1, H2, H3    |
| UI Font     | Inter     | Body, buttons, forms |

---

## Architecture Notes

- **LifeGrid:** Single SVG for performance (not HTML divs)
- **Minus 1 Button:** `useOptimistic` — no loading spinners
- **Data Fetching:** React Server Components + Server Actions
- **Auth:** Supabase Auth with RLS policies

