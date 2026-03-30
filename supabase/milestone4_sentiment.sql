-- Add sentiment fields to reviews
alter table public.reviews
  add column if not exists sentiment        text check (sentiment in ('positive', 'neutral', 'negative')),
  add column if not exists sentiment_score  float,   -- -1.0 (very negative) to 1.0 (very positive)
  add column if not exists sentiment_at     timestamptz;
comment on column public.reviews.sentiment       is 'AI-assigned sentiment: positive, neutral, or negative';
comment on column public.reviews.sentiment_score is 'Numeric sentiment score from -1.0 to 1.0';
comment on column public.reviews.sentiment_at    is 'When sentiment was last computed';

-- Index for fast sentiment filtering in reports
create index if not exists idx_reviews_sentiment on public.reviews(user_id, sentiment);
