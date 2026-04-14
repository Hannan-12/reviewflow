import { createClient } from '@supabase/supabase-js'
import { getStripe } from './client'
import { getPlanByPriceId, getPlanProfileLimit } from './config'
import type Stripe from 'stripe'

function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export interface UserBillingRow {
  subscription_status: string | null
  trial_ends_at: string | null
  stripe_customer_id: string | null
  plan_name: string | null
  current_period_end: string | null
  stripe_price_id: string | null
  stripe_subscription_id: string | null
}

function isStale(row: UserBillingRow): boolean {
  if (!row.stripe_customer_id) return false
  if (row.subscription_status === 'trialing' && row.trial_ends_at) {
    return new Date(row.trial_ends_at) < new Date()
  }
  return false
}

export async function reconcileUserWithStripe(
  userId: string,
  row: UserBillingRow
): Promise<UserBillingRow> {
  if (!isStale(row)) return row

  const stripe = getStripe()
  const subs = await stripe.subscriptions.list({
    customer: row.stripe_customer_id!,
    status: 'all',
    limit: 1,
  })
  const subscription = subs.data[0]
  if (!subscription) return row

  const priceId = subscription.items.data[0]?.price.id
  const planKey = priceId ? getPlanByPriceId(priceId) : null
  const profileLimit = planKey ? getPlanProfileLimit(planKey) : 0
  const sub = subscription as Stripe.Subscription & { current_period_end?: number }
  const currentPeriodEnd = sub.current_period_end
    ? new Date(sub.current_period_end * 1000).toISOString()
    : null

  const updateData = {
    stripe_subscription_id: subscription.id,
    stripe_price_id: priceId ?? null,
    subscription_status: subscription.status,
    plan_name: planKey ?? 'free',
    profile_limit: profileLimit,
    trial_ends_at: subscription.trial_end
      ? new Date(subscription.trial_end * 1000).toISOString()
      : null,
    current_period_end: currentPeriodEnd,
  }

  await getSupabaseAdmin().from('users').update(updateData).eq('id', userId)

  return { ...row, ...updateData }
}
