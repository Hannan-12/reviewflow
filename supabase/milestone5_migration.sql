-- ============================================================
-- Milestone 5: Embeddable Widget & Review Collection Links
-- Run this in Supabase SQL Editor
-- ============================================================

-- Widget configurations (one per profile)
create table if not exists public.widget_configs (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid references auth.users(id) on delete cascade not null,
  profile_id   uuid references public.profiles(id) on delete cascade not null,
  theme        text default 'light' check (theme in ('light', 'dark')),
  max_reviews  int  default 6,
  min_rating   int  default 1 check (min_rating between 1 and 5),
  show_dates   bool default true,
  accent_color text default '#6366f1',
  created_at   timestamptz default now(),
  updated_at   timestamptz default now(),
  unique(profile_id)
);

alter table public.widget_configs enable row level security;

create policy "widget_configs_owner" on public.widget_configs
  for all using (auth.uid() = user_id);

-- Review collection links (magic links to collect reviews)
create table if not exists public.review_collection_links (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid references auth.users(id) on delete cascade not null,
  profile_id        uuid references public.profiles(id) on delete cascade not null,
  slug              text unique not null,
  title             text not null default 'Leave us a review!',
  message           text,
  google_review_url text,
  is_active         bool default true,
  click_count       int  default 0,
  created_at        timestamptz default now()
);

alter table public.review_collection_links enable row level security;

create policy "collection_links_owner" on public.review_collection_links
  for all using (auth.uid() = user_id);

-- Index for fast slug lookup (public page)
create index if not exists idx_collection_links_slug
  on public.review_collection_links(slug)
  where is_active = true;
