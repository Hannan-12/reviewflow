-- Milestone 7: Agency custom review limit
-- Run this in Supabase SQL editor

-- Add review_limit column to users table
-- NULL means "not set yet" (agency users awaiting quote)
-- Set by admin after a custom plan is agreed via contact form
alter table public.users
  add column if not exists review_limit integer default null;

-- Comment for clarity
comment on column public.users.review_limit is
  'Custom review limit for agency users, set by admin after quote. NULL = limit not yet assigned.';
