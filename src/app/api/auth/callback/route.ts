export const dynamic = 'force-dynamic'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const rawNext = searchParams.get('next') ?? '/dashboard'
  const next = rawNext.startsWith('/') && !rawNext.startsWith('//') ? rawNext : '/dashboard'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      // Ensure public.users row exists — the DB trigger can miss OAuth sign-ins
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const admin = createAdminClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_ROLE_KEY!
        )

        const trialEndsAt = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString()
        const fullName = user.user_metadata?.full_name ?? user.user_metadata?.name ?? null
        const avatarUrl = user.user_metadata?.avatar_url ?? user.user_metadata?.picture ?? null

        const { data: existing } = await admin
          .from('users')
          .select('id, subscription_status, trial_ends_at, stripe_subscription_id')
          .eq('id', user.id)
          .single()

        if (!existing) {
          // Brand new user — create row with trial
          await admin.from('users').insert({
            id: user.id,
            email: user.email!,
            full_name: fullName,
            avatar_url: avatarUrl,
            subscription_status: 'trialing',
            trial_ends_at: trialEndsAt,
            profile_limit: 3,
          })
          // Send new Google OAuth users to plan selection before dashboard
          const isOAuth = user.app_metadata?.provider === 'google'
          if (isOAuth && !user.user_metadata?.intended_plan) {
            return NextResponse.redirect(`${origin}/onboarding`)
          }
        } else if (existing.subscription_status !== 'active') {
          const noTrial = !existing.trial_ends_at
          const trialStillValid = existing.trial_ends_at && new Date(existing.trial_ends_at) > new Date()
          const statusWrong = existing.subscription_status !== 'trialing' && trialStillValid

          if (noTrial && !['active', 'canceled', 'past_due', 'trialing'].includes(existing.subscription_status ?? '')) {
            // User exists but never had a trial and has never subscribed — grant one
            await admin.from('users').update({
              subscription_status: 'trialing',
              trial_ends_at: trialEndsAt,
            }).eq('id', user.id)
          } else if (statusWrong) {
            // Trial date is valid but status is wrong — fix status only, never extend trial
            await admin.from('users').update({
              subscription_status: 'trialing',
            }).eq('id', user.id)
          }
          // If trial expired → do nothing; middleware redirects to /billing
        }

        // After all user setup — redirect to billing checkout if intended_plan is set and not yet subscribed
        const intendedPlan = user.user_metadata?.intended_plan
        const hasSubscription = existing?.stripe_subscription_id || existing?.subscription_status === 'active'
        if (intendedPlan && (intendedPlan === 'lite' || intendedPlan === 'pro') && !hasSubscription) {
          return NextResponse.redirect(`${origin}/billing?checkout=${intendedPlan}`)
        }
      }

      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`)
}
