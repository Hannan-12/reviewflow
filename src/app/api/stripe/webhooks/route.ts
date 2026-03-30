import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { stripe } from '@/lib/stripe/client'
import { getPlanByPriceId, getPlanProfileLimit } from '@/lib/stripe/config'
import type Stripe from 'stripe'

export const dynamic = 'force-dynamic'

// Lazy-initialized admin client — bypasses RLS for server-to-server webhook sync
function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

async function syncSubscriptionToSupabase(subscription: Stripe.Subscription) {
  const supabaseAdmin = getSupabaseAdmin()
  const priceId = subscription.items.data[0]?.price.id
  if (!priceId) {
    console.error('[webhook] syncSubscription: no priceId on subscription', subscription.id)
    return
  }

  const planKey = getPlanByPriceId(priceId)
  const profileLimit = planKey ? getPlanProfileLimit(planKey) : 0

  // current_period_end exists at runtime — cast to access it across API versions
  const sub = subscription as Stripe.Subscription & { current_period_end?: number }
  const currentPeriodEnd = sub.current_period_end
    ? new Date(sub.current_period_end * 1000).toISOString()
    : null

  await supabaseAdmin
    .from('users')
    .update({
      stripe_subscription_id: subscription.id,
      stripe_price_id: priceId,
      subscription_status: subscription.status,
      plan_name: planKey ?? 'free',
      profile_limit: profileLimit,
      trial_ends_at: subscription.trial_end
        ? new Date(subscription.trial_end * 1000).toISOString()
        : null,
      current_period_end: currentPeriodEnd,
    })
    .eq('stripe_customer_id', subscription.customer as string)
}

export async function POST(request: NextRequest) {
  // Must use raw text body — request.json() corrupts the signature
  const rawBody = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    console.error('[webhook] Signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const supabaseAdmin = getSupabaseAdmin()

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        if (session.mode !== 'subscription' || !session.subscription) break

        const subscription = await stripe.subscriptions.retrieve(
          session.subscription as string
        )

        // On first checkout, look up by supabase_user_id from metadata
        const userId =
          session.metadata?.supabase_user_id ||
          subscription.metadata?.supabase_user_id

        if (userId) {
          await supabaseAdmin
            .from('users')
            .update({ stripe_customer_id: session.customer as string })
            .eq('id', userId)
        }

        await syncSubscriptionToSupabase(subscription)
        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        await syncSubscriptionToSupabase(subscription)
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        await supabaseAdmin
          .from('users')
          .update({
            stripe_subscription_id: null,
            stripe_price_id: null,
            subscription_status: 'canceled',
            plan_name: 'free',
            profile_limit: 0,
            current_period_end: null,
          })
          .eq('stripe_customer_id', subscription.customer as string)
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        if (!invoice.customer) break
        await supabaseAdmin
          .from('users')
          .update({ subscription_status: 'past_due' })
          .eq('stripe_customer_id', invoice.customer as string)
        break
      }

      default:
        // Unhandled event — return 200 so Stripe doesn't retry
        break
    }
  } catch (err) {
    console.error(`[webhook] Error handling ${event.type}:`, err)
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}
