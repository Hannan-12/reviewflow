import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getStripe } from '@/lib/stripe/client'
import { getPlanByPriceId, getPlanProfileLimit } from '@/lib/stripe/config'
import type Stripe from 'stripe'

export const dynamic = 'force-dynamic'

function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

async function syncSubscriptionToSupabase(subscription: Stripe.Subscription, customerId: string) {
  const supabaseAdmin = getSupabaseAdmin()
  const priceId = subscription.items.data[0]?.price.id

  if (!priceId) {
    console.error('[webhook] No priceId on subscription', subscription.id)
    return
  }

  const planKey = getPlanByPriceId(priceId)
  console.log(`[webhook] priceId=${priceId}, planKey=${planKey}`)

  const profileLimit = planKey ? getPlanProfileLimit(planKey) : 0

  const sub = subscription as Stripe.Subscription & { current_period_end?: number }
  const currentPeriodEnd = sub.current_period_end
    ? new Date(sub.current_period_end * 1000).toISOString()
    : null

  const updateData = {
    stripe_subscription_id: subscription.id,
    stripe_price_id: priceId,
    subscription_status: subscription.status,
    plan_name: planKey ?? 'free',
    profile_limit: profileLimit,
    trial_ends_at: subscription.trial_end
      ? new Date(subscription.trial_end * 1000).toISOString()
      : null,
    current_period_end: currentPeriodEnd,
  }

  console.log(`[webhook] Updating user with stripe_customer_id=${customerId}:`, JSON.stringify(updateData))

  const { error, count } = await supabaseAdmin
    .from('users')
    .update(updateData)
    .eq('stripe_customer_id', customerId)

  if (error) {
    console.error('[webhook] DB update error:', error)
  } else {
    console.log(`[webhook] Updated ${count} user(s) for customer ${customerId}`)
  }
}

export async function POST(request: NextRequest) {
  console.log('[webhook] Received POST request')

  const rawBody = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature) {
    console.error('[webhook] Missing stripe-signature header')
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    event = getStripe().webhooks.constructEvent(
      rawBody,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    console.error('[webhook] Signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  console.log(`[webhook] Event: ${event.type} (${event.id})`)

  const supabaseAdmin = getSupabaseAdmin()

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        console.log(`[webhook] checkout.session.completed — mode=${session.mode}, subscription=${session.subscription}, customer=${session.customer}`)

        if (session.mode !== 'subscription' || !session.subscription) break

        const subscription = await getStripe().subscriptions.retrieve(
          session.subscription as string
        )

        // Find the user — check subscription metadata, then session metadata
        const userId =
          subscription.metadata?.supabase_user_id ||
          session.metadata?.supabase_user_id

        const customerId = session.customer as string

        console.log(`[webhook] userId from metadata: ${userId}, customerId: ${customerId}`)

        if (userId) {
          // Link stripe customer to supabase user
          const { error } = await supabaseAdmin
            .from('users')
            .update({ stripe_customer_id: customerId })
            .eq('id', userId)

          if (error) {
            console.error('[webhook] Failed to set stripe_customer_id:', error)
          } else {
            console.log(`[webhook] Linked stripe_customer_id=${customerId} to user=${userId}`)
          }
        } else {
          console.warn('[webhook] No supabase_user_id found in metadata — cannot link user')
        }

        await syncSubscriptionToSupabase(subscription, customerId)
        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        const customerId = subscription.customer as string
        console.log(`[webhook] subscription.updated — customer=${customerId}, status=${subscription.status}`)
        await syncSubscriptionToSupabase(subscription, customerId)
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        console.log(`[webhook] subscription.deleted — customer=${subscription.customer}`)
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
        console.log(`[webhook] invoice.payment_failed — customer=${invoice.customer}`)
        await supabaseAdmin
          .from('users')
          .update({ subscription_status: 'past_due' })
          .eq('stripe_customer_id', invoice.customer as string)
        break
      }

      default:
        console.log(`[webhook] Unhandled event: ${event.type}`)
        break
    }
  } catch (err) {
    console.error(`[webhook] Error handling ${event.type}:`, err)
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}
