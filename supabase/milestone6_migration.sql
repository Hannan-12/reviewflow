-- ============================================================
-- Milestone 6: Store Google review URI in profiles
-- Run this in Supabase SQL Editor
-- ============================================================

-- Add new_review_uri column to profiles (the direct Google "write a review" link)
alter table public.profiles
  add column if not exists new_review_uri text;

-- Add reply_to_ratings to auto_reply_rules (replaces min/max range with explicit star list)
-- NULL means reply to all ratings (same as existing behavior with null min/max)
alter table public.auto_reply_rules
  add column if not exists reply_to_ratings integer[];
