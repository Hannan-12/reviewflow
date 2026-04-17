export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getStripe } from '@/lib/stripe/client'
import { PLANS } from '@/lib/stripe/config'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { priceId, skipTrial, quantity = 1 } = await request.json()

    // Validate the priceId is one of our plans (monthly or annual)
    const validPriceIds = Object.values(PLANS).flatMap((p) => [p.priceId, p.priceIdAnnual])
    if (!validPriceIds.includes(priceId)) {
      return NextResponse.json({ error: 'Invalid price' }, { status: 400 })
    }

    // Get or create Stripe customer
    const { data: userData } = await supabase
      .from('users')
      .select('stripe_customer_id, stripe_subscription_id, subscription_status, email, full_name, trial_ends_at')
      .eq('id', user.id)
      .single()

    // Block if user already has an active/trialing subscription
    if (userData?.stripe_subscription_id && (userData.subscription_status === 'active' || userData.subscription_status === 'trialing')) {
      return NextResponse.json(
        { error: 'You already have an active subscription. Use "Manage subscription" to change plans.' },
        { status: 400 }
      )
    }

    let customerId = userData?.stripe_customer_id

    if (!customerId) {
      const customer = await getStripe().customers.create({
        email: user.email,
        name: userData?.full_name ?? undefined,
        metadata: { supabase_user_id: user.id },
      })
      customerId = customer.id

      await supabase
        .from('users')
        .update({ stripe_customer_id: customerId })
        .eq('id', user.id)
    } else {
      // Cancel any existing active subscriptions before creating a new one
      const existingSubs = await getStripe().subscriptions.list({
        customer: customerId,
        status: 'active',
      })
      for (const sub of existingSubs.data) {
        await getStripe().subscriptions.cancel(sub.id)
      }
      // Also cancel trialing subscriptions
      const trialSubs = await getStripe().subscriptions.list({
        customer: customerId,
        status: 'trialing',
      })
      for (const sub of trialSubs.data) {
        await getStripe().subscriptions.cancel(sub.id)
      }
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

    // Use the user's existing trial end date — never grant a second trial
    const trialEnd = userData?.trial_ends_at ? new Date(userData.trial_ends_at) : null
    const trialStillActive = !skipTrial && trialEnd && trialEnd > new Date()
    // Stripe requires trial_end to be at least 48 hours from now
    const minTrialEnd = new Date(Date.now() + 48 * 60 * 60 * 1000)
    const useTrialEnd = trialStillActive && trialEnd! > minTrialEnd
      ? Math.floor(trialEnd!.getTime() / 1000)
      : null

    const session = await getStripe().checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: Math.max(1, quantity) }],
      subscription_data: {
        ...(useTrialEnd ? { trial_end: useTrialEnd } : {}),
        metadata: { supabase_user_id: user.id },
      },
      allow_promotion_codes: true,
      success_url: `${appUrl}/billing?success=true`,
      cancel_url: `${appUrl}/billing`,
    })

    return NextResponse.json({ url: session.url })
  } catch (err) {
    console.error('[stripe/checkout]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
