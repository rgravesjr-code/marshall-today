-- ============================================================
-- MarshallToday.com — Database Schema
-- Run this in Supabase SQL Editor
-- ============================================================

-- Enable UUID generation
create extension if not exists "uuid-ossp";

-- ============================================================
-- CATEGORIES
-- ============================================================
create table public.categories (
  id uuid primary key default uuid_generate_v4(),
  name text not null unique,
  slug text not null unique,
  icon text, -- emoji or icon class
  description text,
  display_order int default 0,
  created_at timestamptz default now()
);

-- ============================================================
-- BUSINESSES
-- ============================================================
create table public.businesses (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  slug text not null unique,
  description text,
  short_description text, -- for card previews
  address text,
  city text default 'Marshall',
  state text default 'MI',
  zip text,
  phone text,
  email text,
  website text,
  google_business_url text,
  facebook_url text,
  logo_url text,
  cover_image_url text,
  latitude double precision,
  longitude double precision,
  is_claimed boolean default false,
  is_featured boolean default false,
  is_published boolean default true,
  plan_tier text default 'free' check (plan_tier in ('free', 'spotlight', 'ultimate')),
  stripe_customer_id text,
  hours jsonb, -- {"mon": "9am-5pm", "tue": "9am-5pm", ...}
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================================
-- BUSINESS <-> CATEGORY (many-to-many)
-- ============================================================
create table public.business_categories (
  id uuid primary key default uuid_generate_v4(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  category_id uuid not null references public.categories(id) on delete cascade,
  unique(business_id, category_id)
);

-- ============================================================
-- BUSINESS IMAGES (gallery)
-- ============================================================
create table public.business_images (
  id uuid primary key default uuid_generate_v4(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  url text not null,
  alt_text text,
  display_order int default 0,
  created_at timestamptz default now()
);

-- ============================================================
-- CLAIMS — when a business owner claims their listing
-- ============================================================
create table public.claims (
  id uuid primary key default uuid_generate_v4(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  owner_name text not null,
  owner_email text not null,
  owner_phone text,
  message text,
  status text default 'pending' check (status in ('pending', 'verified', 'rejected')),
  created_at timestamptz default now()
);

-- ============================================================
-- REVIEWS AUDIT — internal tracking for review cleanup service
-- ============================================================
create table public.reviews_audit (
  id uuid primary key default uuid_generate_v4(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  total_reviews int default 0,
  responded_reviews int default 0,
  unresponded_reviews int default 0,
  average_rating numeric(2,1),
  notes text,
  last_audited_at timestamptz default now(),
  created_at timestamptz default now()
);

-- ============================================================
-- CONTACT LOG — track outreach to businesses
-- ============================================================
create table public.contact_log (
  id uuid primary key default uuid_generate_v4(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  contact_type text not null check (contact_type in ('email', 'phone', 'follow_up', 'note')),
  subject text,
  notes text,
  created_at timestamptz default now()
);

-- ============================================================
-- INDEXES
-- ============================================================
create index idx_businesses_slug on public.businesses(slug);
create index idx_businesses_city on public.businesses(city);
create index idx_businesses_plan on public.businesses(plan_tier);
create index idx_businesses_featured on public.businesses(is_featured) where is_featured = true;
create index idx_businesses_published on public.businesses(is_published) where is_published = true;
create index idx_categories_slug on public.categories(slug);
create index idx_business_categories_business on public.business_categories(business_id);
create index idx_business_categories_category on public.business_categories(category_id);
create index idx_claims_business on public.claims(business_id);
create index idx_claims_status on public.claims(status);
create index idx_reviews_audit_business on public.reviews_audit(business_id);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

-- Businesses: public read, authenticated write
alter table public.businesses enable row level security;
create policy "Businesses are viewable by everyone"
  on public.businesses for select using (is_published = true);
create policy "Authenticated users can insert businesses"
  on public.businesses for insert with check (auth.role() = 'authenticated');
create policy "Authenticated users can update businesses"
  on public.businesses for update using (auth.role() = 'authenticated');

-- Categories: public read
alter table public.categories enable row level security;
create policy "Categories are viewable by everyone"
  on public.categories for select using (true);

-- Business Categories: public read
alter table public.business_categories enable row level security;
create policy "Business categories are viewable by everyone"
  on public.business_categories for select using (true);

-- Business Images: public read
alter table public.business_images enable row level security;
create policy "Business images are viewable by everyone"
  on public.business_images for select using (true);

-- Claims: anyone can submit, only auth can read
alter table public.claims enable row level security;
create policy "Anyone can submit a claim"
  on public.claims for insert with check (true);
create policy "Only authenticated users can view claims"
  on public.claims for select using (auth.role() = 'authenticated');

-- Reviews Audit: auth only
alter table public.reviews_audit enable row level security;
create policy "Only authenticated users can manage audits"
  on public.reviews_audit for all using (auth.role() = 'authenticated');

-- Contact Log: auth only
alter table public.contact_log enable row level security;
create policy "Only authenticated users can manage contact log"
  on public.contact_log for all using (auth.role() = 'authenticated');

-- ============================================================
-- UPDATED_AT TRIGGER
-- ============================================================
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger on_businesses_updated
  before update on public.businesses
  for each row execute function public.handle_updated_at();

-- ============================================================
-- SEED CATEGORIES (Marshall-appropriate)
-- ============================================================
insert into public.categories (name, slug, icon, description, display_order) values
  ('Restaurants & Dining', 'restaurants', '🍽️', 'Restaurants, cafes, bakeries, and bars', 1),
  ('Shopping & Retail', 'shopping', '🛍️', 'Boutiques, antiques, gift shops, and retail stores', 2),
  ('Home Services', 'home-services', '🔧', 'Plumbing, electrical, HVAC, landscaping, and handyman', 3),
  ('Auto & Transportation', 'auto', '🚗', 'Auto repair, dealers, towing, and detailing', 4),
  ('Health & Wellness', 'health', '💊', 'Doctors, dentists, chiropractors, and fitness', 5),
  ('Beauty & Personal Care', 'beauty', '💇', 'Salons, barbershops, spas, and nail care', 6),
  ('Professional Services', 'professional', '💼', 'Lawyers, accountants, insurance, and financial advisors', 7),
  ('Arts & Entertainment', 'entertainment', '🎭', 'Theaters, galleries, music venues, and recreation', 8),
  ('Hotels & Lodging', 'lodging', '🏨', 'Hotels, B&Bs, vacation rentals, and campgrounds', 9),
  ('Education & Childcare', 'education', '📚', 'Schools, tutors, daycare, and learning centers', 10),
  ('Real Estate', 'real-estate', '🏠', 'Realtors, property management, and builders', 11),
  ('Faith & Community', 'faith-community', '⛪', 'Churches, nonprofits, and community organizations', 12),
  ('Agriculture & Farm', 'agriculture', '🌾', 'Farms, feed stores, and agricultural services', 13),
  ('Technology & IT', 'technology', '💻', 'Computer repair, web design, and IT services', 14),
  ('Pets & Animals', 'pets', '🐾', 'Vets, groomers, pet stores, and boarding', 15);
