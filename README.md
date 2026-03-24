# MarshallToday.com

**Local business directory for Marshall, Michigan** — built with Next.js 15, Supabase, and Tailwind CSS.

Part of the `[City]Today.com` network: Marshall → Battle Creek → Kalamazoo → Lansing.

## Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Database:** Supabase (PostgreSQL)
- **Styling:** Tailwind CSS with custom Marshall heritage theme
- **Deployment:** Vercel
- **Domain:** MarshallToday.com (Cloudflare)

## Getting Started

### 1. Clone and install

```bash
git clone https://github.com/YOUR_USERNAME/marshall-today.git
cd marshall-today
npm install
```

### 2. Set up Supabase

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Go to the SQL Editor and run the migration files in order:
   - `supabase/001_initial_schema.sql` — Creates all tables, indexes, and RLS policies
   - `supabase/002_seed_businesses.sql` — Seeds sample Marshall businesses
3. Copy your Supabase URL and anon key

### 3. Configure environment

```bash
cp .env.local.example .env.local
```

Edit `.env.local` with your Supabase credentials:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### 4. Run development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### 5. Deploy to Vercel

1. Push to GitHub
2. Import project in Vercel
3. Add environment variables
4. Connect MarshallToday.com domain via Cloudflare

## Project Structure

```
marshall-today/
├── app/
│   ├── page.tsx              # Homepage (hero, categories, featured)
│   ├── layout.tsx            # Root layout
│   ├── globals.css           # Tailwind + custom styles
│   ├── businesses/
│   │   ├── page.tsx          # Directory listing with search
│   │   └── [slug]/page.tsx   # Individual business page
│   ├── categories/
│   │   ├── page.tsx          # All categories
│   │   └── [slug]/page.tsx   # Category filtered view
│   ├── add/page.tsx          # Add your business form
│   ├── claim/page.tsx        # Claim a listing
│   ├── pricing/page.tsx      # Pricing tiers
│   └── about/page.tsx        # About page
├── components/
│   ├── Header.tsx            # Site header with nav
│   ├── Footer.tsx            # Site footer
│   ├── BusinessCard.tsx      # Business listing card
│   └── BusinessSearch.tsx    # Search + filter component
├── lib/
│   ├── supabase.ts           # Supabase client + data fetchers
│   └── config.ts             # Site config (multi-city ready)
└── supabase/
    ├── 001_initial_schema.sql
    └── 002_seed_businesses.sql
```

## Multi-City Expansion

The codebase is designed for reuse. To launch `BattleCreekToday.com`:

1. Same repo, same Supabase DB
2. Add a `city` filter to queries (or use separate Supabase projects)
3. Update environment variables for the new city
4. Deploy as a new Vercel project with the new domain

## Phase Roadmap

- [x] Phase 1: Directory MVP (listings, search, categories, claim, add)
- [ ] Phase 2: Email automation (claim verification, new listing notifications)
- [ ] Phase 3: Review audit tool (Google Business Profile integration)
- [ ] Phase 4: Stripe integration for premium tiers
- [ ] Phase 5: Multi-city expansion
