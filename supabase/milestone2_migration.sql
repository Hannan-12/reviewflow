-- ReviewFlow — Milestone 2 Migration
-- Run in Supabase SQL Editor after the initial schema.sql

-- ============================================================
-- Add Google OAuth token fields to users
-- ============================================================
alter table public.users
  add column if not exists google_access_token  text,
  add column if not exists google_refresh_token text,
  add column if not exists google_token_expiry  timestamptz;

-- ============================================================
-- Update profiles table for GBP API identifiers
-- ============================================================
alter table public.profiles
  add column if not exists location_name text,   -- GBP resource name e.g. accounts/123/locations/456
  add column if not exists account_id    text;   -- GBP account ID e.g. accounts/123456789

-- Make place_id nullable (it was NOT NULL in original schema)
alter table public.profiles alter column place_id drop not null;

-- ============================================================
-- REVIEWS table
-- ============================================================
create table if not exists public.reviews (
  id                uuid        primary key default gen_random_uuid(),
  profile_id        uuid        references public.profiles(id) on delete cascade not null,
  user_id           uuid        references public.users(id)    on delete cascade not null,
  google_review_id  text        not null,
  reviewer_name     text,
  reviewer_photo_url text,
  rating            integer     not null check (rating >= 1 and rating <= 5),
  comment           text,
  reply             text,
  replied_at        timestamptz,
  review_date       timestamptz not null,
  created_at        timestamptz default now() not null,
  updated_at        timestamptz default now() not null,

  unique (profile_id, google_review_id)
);

comment on table public.reviews is 'Google Business Profile reviews synced via the GBP API.';

-- RLS
alter table public.reviews enable row level security;

create policy "Users can view own reviews"
  on public.reviews for select
  using (auth.uid() = user_id);

create policy "Users can insert own reviews"
  on public.reviews for insert
  with check (auth.uid() = user_id);

create policy "Users can update own reviews"
  on public.reviews for update
  using (auth.uid() = user_id);

create policy "Users can delete own reviews"
  on public.reviews for delete
  using (auth.uid() = user_id);

-- Indexes
create index if not exists reviews_profile_id_idx   on public.reviews(profile_id);
create index if not exists reviews_user_id_idx      on public.reviews(user_id);
create index if not exists reviews_review_date_idx  on public.reviews(review_date desc);
create index if not exists reviews_rating_idx       on public.reviews(rating);

-- updated_at trigger
create trigger set_reviews_updated_at
  before update on public.reviews
  for each row execute procedure public.set_updated_at();
