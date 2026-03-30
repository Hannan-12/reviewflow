-- ReviewFlow — Supabase Database Schema
-- Run this in the Supabase SQL Editor (Dashboard > SQL Editor)
-- Execute once before launching the application

-- ============================================================
-- Extensions
-- ============================================================
create extension if not exists "uuid-ossp";

-- ============================================================
-- USERS table (extends Supabase auth.users)
-- ============================================================
create table public.users (
  id                      uuid references auth.users(id) on delete cascade primary key,
  email                   text not null,
  full_name               text,
  avatar_url              text,

  -- Stripe billing
  stripe_customer_id      text unique,
  stripe_subscription_id  text unique,
  stripe_price_id         text,
  subscription_status     text default 'trialing',   -- trialing | active | canceled | past_due | incomplete | expired
  plan_name               text default 'free',      -- free | lite | pro | premium
  trial_ends_at           timestamptz,
  current_period_end      timestamptz,

  -- Denormalized for fast reads (avoids joining on every request)
  -- 0 = free/no plan, 3 = lite, 10 = pro, -1 = unlimited (premium)
  profile_limit           int default 0,

  created_at              timestamptz default now() not null,
  updated_at              timestamptz default now() not null
);

comment on table public.users is 'Extended user profiles. Mirrors Stripe subscription state.';

-- ============================================================
-- PROFILES table (Google Business Profile locations)
-- Full implementation in Milestone 2, but schema defined now
-- ============================================================
create table public.profiles (
  id            uuid default uuid_generate_v4() primary key,
  user_id       uuid references public.users(id) on delete cascade not null,
  place_id      text not null,        -- Google Place ID (unique per location)
  business_name text not null,
  address       text,
  phone         text,
  website       text,
  is_active     boolean default true,
  last_synced_at timestamptz,
  created_at    timestamptz default now() not null,
  updated_at    timestamptz default now() not null,

  unique(user_id, place_id)
);

comment on table public.profiles is 'Google Business Profile locations connected by each user.';

-- ============================================================
-- Row Level Security (RLS)
-- ============================================================
alter table public.users enable row level security;
alter table public.profiles enable row level security;

-- Users: read and update own record only
create policy "Users can view own record"
  on public.users for select
  using (auth.uid() = id);

create policy "Users can update own record"
  on public.users for update
  using (auth.uid() = id);

-- Profiles: full CRUD on own profiles
create policy "Users can manage own profiles"
  on public.profiles for all
  using (auth.uid() = user_id);

-- ============================================================
-- Trigger: auto-create user row on signup
-- Fires for both email/password and OAuth signups
-- ============================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.users (
    id,
    email,
    full_name,
    avatar_url,
    trial_ends_at
  ) values (
    new.id,
    new.email,
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'avatar_url',
    now() + interval '14 days'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================
-- Trigger: auto-update updated_at timestamps
-- ============================================================
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_users_updated_at
  before update on public.users
  for each row execute procedure public.set_updated_at();

create trigger set_profiles_updated_at
  before update on public.profiles
  for each row execute procedure public.set_updated_at();

-- ============================================================
-- Indexes
-- ============================================================
create index users_stripe_customer_id_idx    on public.users(stripe_customer_id);
create index users_stripe_subscription_id_idx on public.users(stripe_subscription_id);
create index profiles_user_id_idx            on public.profiles(user_id);
create index profiles_place_id_idx           on public.profiles(place_id);
