-- ============================================================
-- NOTIFICATION_PREFERENCES table
-- Configure how users want to be notified for each profile
-- ============================================================
create table if not exists public.notification_preferences (
  id                          uuid        primary key default gen_random_uuid(),
  user_id                     uuid        references public.users(id) on delete cascade not null,
  profile_id                  uuid        references public.profiles(id) on delete cascade not null,
  
  -- Email notifications
  email_enabled               boolean     default true,
  email_on_all_reviews        boolean     default true,
  email_min_rating            integer,        -- only email for reviews with rating <= this (null = no filter)
  email_on_low_ratings_only   boolean     default false,
  
  -- Slack notifications
  slack_enabled               boolean     default false,
  slack_webhook_url           text,           -- encrypted in practice
  slack_on_all_reviews        boolean     default true,
  slack_min_rating            integer,
  
  -- Frequency
  email_digest_frequency      text        default 'instant', -- instant | daily | weekly
  
  created_at                  timestamptz default now() not null,
  updated_at                  timestamptz default now() not null,
  
  last_digest_sent_at         timestamptz,

  unique(user_id, profile_id)
);

comment on table public.notification_preferences is 'User notification settings per profile.';

-- ============================================================
-- Add notification & reply fields to REVIEWS table
-- ============================================================
alter table public.reviews
  add column if not exists reply               text,
  add column if not exists replied_at          timestamptz,
  add column if not exists google_review_name  text,          -- full GBP resource name e.g. accounts/123/locations/456/reviews/789
  add column if not exists reply_synced_to_gbp boolean     default false,
  add column if not exists ai_suggested_reply  text,
  add column if not exists user_accepted_ai    boolean,
  add column if not exists notified_at         timestamptz,
  add column if not exists notification_sent_to text[],     -- ['email', 'slack']
  add column if not exists flagged_by_user     boolean     default false,
  add column if not exists flag_reason         text;

-- ============================================================
-- NOTIFICATION_LOG table
-- Track all notifications sent (for auditing & retry)
-- ============================================================
create table if not exists public.notification_log (
  id                    uuid        primary key default gen_random_uuid(),
  user_id               uuid        references public.users(id) on delete cascade not null,
  profile_id            uuid        references public.profiles(id) on delete cascade not null,
  review_id             uuid        references public.reviews(id) on delete cascade not null,
  
  notification_type     text        not null, -- 'email' | 'slack'
  recipient             text        not null, -- email or slack_channel_id
  
  status                text        default 'pending', -- pending | sent | failed | bounced
  error_message         text,
  
  sent_at               timestamptz,
  attempts              integer     default 0,
  last_attempt_at       timestamptz,
  
  created_at            timestamptz default now() not null
);

comment on table public.notification_log is 'Audit trail of all notifications sent to users.';

-- ============================================================
-- Update PROFILES table for Slack integration
-- ============================================================
alter table public.profiles
  add column if not exists slack_webhook_url  text,
  add column if not exists notifications_enabled boolean default true;

-- ============================================================
-- RLS for new tables
-- ============================================================
alter table public.notification_preferences enable row level security;
alter table public.notification_log enable row level security;

drop policy if exists "Users can manage own notification preferences" on public.notification_preferences;
create policy "Users can manage own notification preferences"
  on public.notification_preferences for all
  using (auth.uid() = user_id);

drop policy if exists "Users can view own notification logs" on public.notification_log;
create policy "Users can view own notification logs"
  on public.notification_log for select
  using (auth.uid() = user_id);

-- ============================================================
-- Trigger: Update reviews.notified_at on notification_log insert
-- ============================================================
create or replace function public.mark_review_notified()
returns trigger
language plpgsql
as $$
begin
  update public.reviews
  set notified_at = now(),
      notification_sent_to = array_append(
        coalesce(notification_sent_to, '{}'::text[]),
        new.notification_type
      )
  where id = new.review_id;
  return new;
end;
$$;

drop trigger if exists trigger_mark_review_notified on public.notification_log;
create trigger trigger_mark_review_notified
  after insert on public.notification_log
  for each row
  execute function public.mark_review_notified();

-- ============================================================
-- Index for performance
-- ============================================================
create index if not exists idx_notification_log_user_id on public.notification_log(user_id);
create index if not exists idx_notification_log_profile_id on public.notification_log(profile_id);
create index if not exists idx_notification_log_review_id on public.notification_log(review_id);
create index if not exists idx_notification_prefs_user_profile on public.notification_preferences(user_id, profile_id);
create index if not exists idx_reviews_notified_at on public.reviews(notified_at);
create index if not exists idx_reviews_replied_at on public.reviews(replied_at);
