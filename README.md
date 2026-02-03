# The Finite Life

> A "Quiet Luxury" Memento Mori PWA — 4000 weeks. Make them count.

![Life Grid](https://img.shields.io/badge/Weeks-4000-1A1A1A?style=flat-square)
![Next.js](https://img.shields.io/badge/Next.js-16-000?style=flat-square)
![Supabase](https://img.shields.io/badge/Supabase-Postgres-3ECF8E?style=flat-square)

## Philosophy

Inspired by Oliver Burkeman's *Four Thousand Weeks*, this app visualizes your finite life as a grid of weeks. The "Minus 1 Day" button on every task deadline creates psychological pressure—a gentle reminder that procrastination has a cost.

## Features

- **Life Grid** — 4160 weeks (80 years) rendered as a single SVG for 60fps mobile performance
- **Minus 1 Day** — Each click shortens your task deadline by one day, with instant optimistic UI
- **Luxury Design** — Sand (#F5F5F0) and Charcoal (#1A1A1A) palette with Playfair Display serif
- **PWA** — Install on iOS/Android home screen with standalone display
- **Server Actions** — Next.js 16 Server Actions with Zod validation
- **RLS Security** — Row Level Security on all Supabase tables

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Styling:** Tailwind CSS v4 + Shadcn/UI
- **Animation:** Framer Motion
- **Database:** Supabase (PostgreSQL)
- **Validation:** Zod
- **Deployment:** Vercel

## Getting Started

```bash
# Clone the repo
git clone https://github.com/oncorphinchus/the-finite-life.git
cd the-finite-life

# Install dependencies
npm install

# Set up environment variables
cp .env.local.example .env.local
# Edit .env.local with your Supabase credentials

# Run development server
npm run dev
```

## Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

## Database Schema

The app uses two tables with RLS enabled:

- `user_settings` — Birth date, life expectancy, theme preference
- `tasks` — Recursive task hierarchy with deadline and minus_one_count

## Design System

| Token | Value | Usage |
|-------|-------|-------|
| Sand | `#F5F5F0` | Background, surfaces |
| Charcoal | `#1A1A1A` | Text, filled weeks |
| Header Font | Playfair Display | H1, H2, H3 |
| UI Font | Inter | Body, buttons, forms |

## License

MIT

---

*"The days are long, but the years are short."*
