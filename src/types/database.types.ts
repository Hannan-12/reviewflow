export type SubscriptionStatus =
  | 'trialing'
  | 'active'
  | 'canceled'
  | 'past_due'
  | 'incomplete'
  | 'incomplete_expired'
  | 'unpaid'

export type PlanName = 'free' | 'lite' | 'pro' | 'premium'

export interface UserRow {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  stripe_customer_id: string | null
  stripe_subscription_id: string | null
  stripe_price_id: string | null
  subscription_status: SubscriptionStatus
  plan_name: PlanName
  trial_ends_at: string | null
  current_period_end: string | null
  profile_limit: number
  created_at: string
  updated_at: string
}
