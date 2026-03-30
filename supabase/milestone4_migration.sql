-- ============================================================
-- Milestone 4: Reports, Tags & AI Auto-Reply
-- Run in Supabase SQL Editor
-- ============================================================

-- ============================================================
-- REVIEW_TAGS table
-- Predefined + custom tags users apply to reviews
-- ============================================================
create table if not exists public.review_tags (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid references public.users(id) on delete cascade not null,
  name       text not null,
  color      text not null default '#6366f1', -- hex color for the badge
  created_at timestamptz default now() not null,

  unique(user_id, name)
);

comment on table public.review_tags is 'Tags that users create to categorize reviews.';

-- ============================================================
-- REVIEW_TAG_ASSIGNMENTS table
-- Many-to-many: reviews <-> tags
-- ============================================================
create table if not exists public.review_tag_assignments (
  review_id uuid references public.reviews(id) on delete cascade not null,
  tag_id    uuid references public.review_tags(id) on delete cascade not null,
  created_at timestamptz default now() not null,

  primary key (review_id, tag_id)
);

comment on table public.review_tag_assignments is 'Assigns tags to reviews (many-to-many).';

-- ============================================================
-- REPLY_TEMPLATES table
-- Reusable reply templates per user
-- ============================================================
create table if not exists public.reply_templates (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid references public.users(id) on delete cascade not null,
  name       text not null,
  content    text not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

comment on table public.reply_templates is 'Saved reply templates for reuse in the reply panel.';

-- ============================================================
-- AUTO_REPLY_RULES table
-- Per-profile rules for automatic AI replies
-- ============================================================
create table if not exists public.auto_reply_rules (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid references public.users(id) on delete cascade not null,
  profile_id      uuid references public.profiles(id) on delete cascade not null,

  enabled         boolean default false,
  -- Only auto-reply to reviews with rating >= min_rating (null = all)
  min_rating      integer,
  -- Only auto-reply to reviews with rating <= max_rating (null = all)
  max_rating      integer,
  -- Optional custom instruction appended to the AI prompt
  custom_instructions text,

  created_at      timestamptz default now() not null,
  updated_at      timestamptz default now() not null,

  unique(user_id, profile_id)
);

comment on table public.auto_reply_rules is 'Per-profile auto-reply configuration using AI.';

-- ============================================================
-- RLS
-- ============================================================
alter table public.review_tags           enable row level security;
alter table public.review_tag_assignments enable row level security;
alter table public.reply_templates       enable row level security;
alter table public.auto_reply_rules      enable row level security;

drop policy if exists "Users manage own review tags"            on public.review_tags;
drop policy if exists "Users manage own tag assignments"        on public.review_tag_assignments;
drop policy if exists "Users manage own reply templates"        on public.reply_templates;
drop policy if exists "Users manage own auto reply rules"       on public.auto_reply_rules;

create policy "Users manage own review tags"
  on public.review_tags for all using (auth.uid() = user_id);

create policy "Users manage own tag assignments"
  on public.review_tag_assignments for all
  using (
    exists (
      select 1 from public.reviews r
      where r.id = review_id and r.user_id = auth.uid()
    )
  );

create policy "Users manage own reply templates"
  on public.reply_templates for all using (auth.uid() = user_id);

create policy "Users manage own auto reply rules"
  on public.auto_reply_rules for all using (auth.uid() = user_id);

-- ============================================================
-- Trigger: updated_at for new tables
-- ============================================================
create trigger set_reply_templates_updated_at
  before update on public.reply_templates
  for each row execute procedure public.set_updated_at();

create trigger set_auto_reply_rules_updated_at
  before update on public.auto_reply_rules
  for each row execute procedure public.set_updated_at();

-- ============================================================
-- Seed default tags for new users (optional — apply manually)
-- ============================================================
-- Default tags are created per-user on first use via the API.

-- ============================================================
-- Indexes
-- ============================================================
create index if not exists idx_review_tags_user_id             on public.review_tags(user_id);
create index if not exists idx_review_tag_assignments_review   on public.review_tag_assignments(review_id);
create index if not exists idx_review_tag_assignments_tag      on public.review_tag_assignments(tag_id);
create index if not exists idx_reply_templates_user_id         on public.reply_templates(user_id);
create index if not exists idx_auto_reply_rules_profile        on public.auto_reply_rules(profile_id);
